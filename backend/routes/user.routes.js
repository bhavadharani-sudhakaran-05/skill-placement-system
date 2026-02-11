const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth.middleware');
const SkillGapService = require('../services/skillGap.service');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('activeLearningPath.pathId');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'avatar', 'phone', 'location', 'profile',
      'education', 'experience', 'studentProfile', 'interests', 
      'careerPreferences', 'recruiterProfile', 'collegeProfile'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/users/skills
 * @desc    Update user skills
 * @access  Private
 */
router.put('/skills', protect, async (req, res) => {
  try {
    const { skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { skills } },
      { new: true }
    );

    // Recalculate skill readiness score
    await user.updateSkillReadinessScore();

    res.json({
      success: true,
      message: 'Skills updated successfully',
      data: {
        skills: user.skills,
        skillReadinessScore: user.skillReadinessScore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update skills',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/skill-readiness
 * @desc    Get skill readiness score
 * @access  Private
 */
router.get('/skill-readiness', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Recalculate if stale
    const lastUpdated = user.skillReadinessScore?.lastUpdated;
    const isStale = !lastUpdated || 
      (Date.now() - new Date(lastUpdated).getTime()) > 24 * 60 * 60 * 1000;

    if (isStale) {
      await user.updateSkillReadinessScore();
    }

    res.json({
      success: true,
      data: user.skillReadinessScore
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill readiness',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/dashboard
 * @desc    Get student dashboard data
 * @access  Private (Student)
 */
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('activeLearningPath.pathId', 'title totalModules stages');

    const dashboard = {
      profile: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        college: user.studentProfile?.college,
        department: user.studentProfile?.department
      },
      skillReadiness: user.skillReadinessScore,
      skillsCount: user.skills?.length || 0,
      topSkills: user.skills?.slice(0, 5).map(s => ({
        name: s.name,
        level: s.proficiencyLevel
      })),
      learningPath: user.activeLearningPath?.pathId ? {
        title: user.activeLearningPath.pathId.title,
        currentStage: user.activeLearningPath.currentStage,
        completedModules: user.activeLearningPath.completedModules?.length || 0,
        totalModules: user.activeLearningPath.pathId.totalModules
      } : null,
      recentApplications: user.applicationHistory?.slice(-5).reverse(),
      courseProgress: user.courseProgress?.slice(-3),
      resumeScore: user.resumeData?.atsScore || 0
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/applications
 * @desc    Get user's job applications
 * @access  Private
 */
router.get('/applications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('applicationHistory.jobId', 'title company location');

    res.json({
      success: true,
      data: user.applicationHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/all
 * @desc    Get all students (Admin/Recruiter)
 * @access  Private (Admin/Recruiter)
 */
router.get('/all', protect, authorize('admin', 'recruiter', 'college'), async (req, res) => {
  try {
    const { page = 1, limit = 20, department, minScore } = req.query;

    const query = { role: 'student' };
    if (department) query['studentProfile.department'] = department;
    if (minScore) query['skillReadinessScore.overall'] = { $gte: parseInt(minScore) };

    const students = await User.find(query)
      .select('name email studentProfile skills skillReadinessScore')
      .sort({ 'skillReadinessScore.overall': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/users/sync-progress
 * @desc    Sync course and assessment progress from frontend
 * @access  Private
 */
router.post('/sync-progress', protect, async (req, res) => {
  try {
    const { courseProgress, assessmentData } = req.body;
    const user = await User.findById(req.user.id);

    // Sync course progress
    if (courseProgress && typeof courseProgress === 'object') {
      const courseProgressArray = Object.entries(courseProgress).map(([courseId, data]) => ({
        courseId: parseInt(courseId),
        courseTitle: data.courseTitle || '',
        progress: data.progress || 0,
        status: data.status || 'enrolled',
        videosWatched: data.videosWatched || [],
        completedWeeks: data.completedWeeks || [],
        enrolledAt: data.enrolledAt ? new Date(data.enrolledAt) : new Date(),
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
      }));

      // Merge with existing progress (update existing, add new)
      courseProgressArray.forEach(newProgress => {
        const existingIndex = user.courseProgress.findIndex(
          cp => cp.courseId === newProgress.courseId
        );
        if (existingIndex >= 0) {
          user.courseProgress[existingIndex] = newProgress;
        } else {
          user.courseProgress.push(newProgress);
        }
      });
    }

    // Sync assessment data
    if (assessmentData) {
      if (assessmentData.completedAssessments) {
        assessmentData.completedAssessments.forEach(newAssessment => {
          const existingIndex = user.assessmentHistory.findIndex(
            a => a.title === newAssessment.title
          );
          const assessmentRecord = {
            title: newAssessment.title,
            score: newAssessment.score || 0,
            correctAnswers: newAssessment.correctAnswers || 0,
            totalQuestions: newAssessment.totalQuestions || 0,
            timeTaken: newAssessment.timeTaken || '',
            badge: newAssessment.badge || '',
            status: newAssessment.status || 'completed',
            terminationReason: newAssessment.terminationReason || '',
            takenAt: newAssessment.completedAt ? new Date(newAssessment.completedAt) : new Date()
          };
          
          if (existingIndex >= 0) {
            user.assessmentHistory[existingIndex] = assessmentRecord;
          } else {
            user.assessmentHistory.push(assessmentRecord);
          }
        });
      }

      if (assessmentData.badgesEarned) {
        assessmentData.badgesEarned.forEach(newBadge => {
          const exists = user.badges.find(b => b.name === newBadge.name);
          if (!exists) {
            user.badges.push({
              name: newBadge.name,
              earnedFor: newBadge.earnedFor,
              earnedAt: newBadge.earnedAt ? new Date(newBadge.earnedAt) : new Date(),
              score: newBadge.score || 0
            });
          }
        });
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Progress synced successfully'
    });
  } catch (error) {
    console.error('Sync progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync progress',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/get-progress
 * @desc    Get all user progress data for frontend
 * @access  Private
 */
router.get('/get-progress', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Convert courseProgress array to object format for frontend
    const courseProgressObj = {};
    (user.courseProgress || []).forEach(cp => {
      courseProgressObj[cp.courseId] = {
        courseTitle: cp.courseTitle,
        progress: cp.progress,
        status: cp.status,
        videosWatched: cp.videosWatched || [],
        completedWeeks: cp.completedWeeks || [],
        enrolledAt: cp.enrolledAt?.toISOString(),
        startedAt: cp.startedAt?.toISOString(),
        completedAt: cp.completedAt?.toISOString(),
        updatedAt: cp.updatedAt?.toISOString()
      };
    });

    // Format assessment data for frontend
    const completedAssessments = (user.assessmentHistory || []).map(a => ({
      id: a._id,
      title: a.title,
      score: a.score,
      correctAnswers: a.correctAnswers,
      totalQuestions: a.totalQuestions,
      timeTaken: a.timeTaken,
      badge: a.badge,
      status: a.status,
      terminationReason: a.terminationReason,
      completedAt: a.takenAt?.toISOString()
    }));

    const badgesEarned = (user.badges || []).map(b => ({
      name: b.name,
      earnedFor: b.earnedFor,
      earnedAt: b.earnedAt?.toISOString(),
      score: b.score
    }));

    // Calculate stats
    const completed = completedAssessments.filter(a => a.status === 'completed');
    const totalScore = completed.reduce((sum, a) => sum + (a.score || 0), 0);
    const averageScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;

    res.json({
      success: true,
      data: {
        courseProgress: courseProgressObj,
        assessmentData: {
          completedAssessments,
          badgesEarned,
          totalScore,
          averageScore
        }
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress',
      error: error.message
    });
  }
});

module.exports = router;
