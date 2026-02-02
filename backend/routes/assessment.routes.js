const express = require('express');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/assessments
 * @desc    Get all available assessments
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { skill, type, difficulty } = req.query;

    let query = { isActive: true };
    if (skill) query['skillsAssessed.name'] = new RegExp(skill, 'i');
    if (type) query.type = type;
    if (difficulty) query['difficulty.overall'] = difficulty;

    const assessments = await Assessment.find(query)
      .select('title type skillsAssessed settings.duration difficulty statistics')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessments',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assessments/:id
 * @desc    Get assessment details (without answers)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .select('-questions.correctAnswer -questions.explanation -questions.options.isCorrect');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/assessments/:id/start
 * @desc    Start an assessment attempt
 * @access  Private
 */
router.post('/:id/start', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check for existing incomplete attempt
    const existingAttempt = await AssessmentAttempt.findOne({
      assessmentId: req.params.id,
      userId: req.user.id,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.json({
        success: true,
        message: 'Resuming existing attempt',
        data: {
          attemptId: existingAttempt._id,
          startedAt: existingAttempt.startedAt,
          questions: assessment.questions.map(q => ({
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options.map(o => ({ optionId: o.optionId, text: o.text })),
            points: q.points
          }))
        }
      });
    }

    // Check attempt limits
    const attemptCount = await AssessmentAttempt.countDocuments({
      assessmentId: req.params.id,
      userId: req.user.id
    });

    if (attemptCount >= (assessment.settings.maxAttempts || 3)) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached for this assessment'
      });
    }

    // Create new attempt
    const attempt = await AssessmentAttempt.create({
      assessmentId: req.params.id,
      userId: req.user.id,
      attemptNumber: attemptCount + 1
    });

    // Return questions without correct answers
    const questions = assessment.questions.map(q => ({
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options.map(o => ({ optionId: o.optionId, text: o.text })),
      points: q.points,
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        duration: assessment.settings.duration,
        totalQuestions: questions.length,
        questions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start assessment',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/assessments/:id/submit
 * @desc    Submit assessment answers
 * @access  Private
 */
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await AssessmentAttempt.findOne({
      _id: attemptId,
      userId: req.user.id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Assessment attempt not found or already submitted'
      });
    }

    const assessment = await Assessment.findById(req.params.id);

    // Evaluate answers
    let totalScore = 0;
    let correctAnswers = 0;
    const evaluatedAnswers = [];
    const skillScores = {};

    for (const answer of answers) {
      const question = assessment.questions.find(q => q.questionNumber === answer.questionNumber);
      
      if (question) {
        let isCorrect = false;
        let pointsEarned = 0;

        if (question.questionType === 'mcq' || question.questionType === 'true-false') {
          const correctOption = question.options.find(o => o.isCorrect);
          isCorrect = correctOption && correctOption.optionId === answer.selectedOption;
        } else if (question.questionType === 'multiple-select') {
          const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.optionId);
          const selectedOptions = answer.selectedOptions || [];
          isCorrect = correctOptions.length === selectedOptions.length &&
            correctOptions.every(o => selectedOptions.includes(o));
        }

        if (isCorrect) {
          pointsEarned = question.points;
          correctAnswers++;
        } else if (assessment.settings.negativeMarking) {
          pointsEarned = -assessment.settings.negativeMarkValue;
        }

        totalScore += pointsEarned;

        // Track skill-wise scores
        const skill = question.skillTested || 'general';
        if (!skillScores[skill]) {
          skillScores[skill] = { score: 0, maxScore: 0 };
        }
        skillScores[skill].score += pointsEarned;
        skillScores[skill].maxScore += question.points;

        evaluatedAnswers.push({
          questionNumber: answer.questionNumber,
          selectedOption: answer.selectedOption,
          selectedOptions: answer.selectedOptions,
          isCorrect,
          pointsEarned
        });
      }
    }

    const totalPossible = assessment.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (totalScore / totalPossible) * 100;
    const passed = percentage >= assessment.settings.passingScore;

    // Update attempt
    attempt.submittedAt = new Date();
    attempt.timeSpent = Math.floor((new Date() - attempt.startedAt) / 1000);
    attempt.answers = evaluatedAnswers;
    attempt.results = {
      totalScore,
      percentage: Math.round(percentage * 10) / 10,
      passed,
      correctAnswers,
      incorrectAnswers: answers.length - correctAnswers,
      unanswered: assessment.questions.length - answers.length,
      skillWiseScore: Object.entries(skillScores).map(([skill, data]) => ({
        skill,
        score: data.score,
        maxScore: data.maxScore
      }))
    };
    attempt.status = 'evaluated';
    await attempt.save();

    // Update assessment statistics
    assessment.statistics.totalAttempts++;
    assessment.statistics.averageScore = 
      ((assessment.statistics.averageScore * (assessment.statistics.totalAttempts - 1)) + percentage) /
      assessment.statistics.totalAttempts;
    if (percentage > assessment.statistics.highestScore) {
      assessment.statistics.highestScore = percentage;
    }
    await assessment.save();

    // Update user's assessment history and skill readiness
    const user = await User.findById(req.user.id);
    user.assessmentHistory.push({
      assessmentId: assessment._id,
      takenAt: new Date(),
      score: percentage,
      skillsAssessed: assessment.skillsAssessed.map(s => s.name)
    });

    // Update skills based on assessment performance
    if (passed) {
      for (const [skillName, data] of Object.entries(skillScores)) {
        const skillPercentage = (data.score / data.maxScore) * 100;
        const existingSkill = user.skills.find(s => 
          s.name.toLowerCase() === skillName.toLowerCase()
        );

        if (existingSkill) {
          existingSkill.proficiencyScore = Math.max(existingSkill.proficiencyScore, skillPercentage);
          existingSkill.verifiedBy = 'test';
          existingSkill.lastAssessed = new Date();
        }
      }
    }

    await user.updateSkillReadinessScore();

    res.json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        score: totalScore,
        percentage: Math.round(percentage * 10) / 10,
        passed,
        correctAnswers,
        totalQuestions: assessment.questions.length,
        skillWiseScore: attempt.results.skillWiseScore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assessments/my/history
 * @desc    Get user's assessment history
 * @access  Private
 */
router.get('/my/history', protect, async (req, res) => {
  try {
    const attempts = await AssessmentAttempt.find({ userId: req.user.id })
      .populate('assessmentId', 'title type skillsAssessed')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment history',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/assessments/save-result
 * @desc    Save assessment result (from frontend local assessments)
 * @access  Private
 */
router.post('/save-result', protect, async (req, res) => {
  try {
    const { title, score, correctAnswers, totalQuestions, timeTaken, badge, status, terminationReason } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add to user's assessment history
    const assessmentResult = {
      title,
      score: score || 0,
      correctAnswers: correctAnswers || 0,
      totalQuestions: totalQuestions || 0,
      timeTaken: timeTaken || '0 mins',
      badge: badge || null,
      status: status || 'completed',
      terminationReason: terminationReason || null,
      takenAt: new Date(),
      skillsAssessed: []
    };
    
    // Initialize assessmentHistory if not exists
    if (!user.assessmentHistory) {
      user.assessmentHistory = [];
    }
    
    user.assessmentHistory.push(assessmentResult);
    
    // Update skill readiness score based on completed assessments
    if (status === 'completed' && score >= 0) {
      // Calculate new skill readiness score
      const completedAssessments = user.assessmentHistory.filter(a => a.status === 'completed');
      const totalScore = completedAssessments.reduce((sum, a) => sum + (a.score || 0), 0);
      const avgScore = completedAssessments.length > 0 ? totalScore / completedAssessments.length : 0;
      
      // Initialize metrics if not exists
      if (!user.metrics) {
        user.metrics = {};
      }
      
      // Update user's skill readiness score in metrics
      user.metrics.skillReadinessScore = Math.round(avgScore);
      user.metrics.assessmentsTaken = completedAssessments.length;
      
      // Add badge to user skills if earned
      if (badge && score >= 70) {
        // Initialize badges array if not exists
        if (!user.badges) {
          user.badges = [];
        }
        
        // Check if badge already exists
        const existingBadge = user.badges.find(b => b.name === badge);
        if (!existingBadge) {
          user.badges.push({
            name: badge,
            earnedFor: title,
            earnedAt: new Date(),
            score: score
          });
        }
        
        // Also update corresponding skill if exists
        const skillName = title.split(' ')[0]; // Get first word as skill hint
        const userSkill = user.skills?.find(s => 
          s.name?.toLowerCase().includes(skillName.toLowerCase()) ||
          title.toLowerCase().includes(s.name?.toLowerCase())
        );
        if (userSkill) {
          userSkill.level = Math.max(userSkill.level || 0, score);
          userSkill.verified = score >= 70;
          userSkill.verifiedAt = new Date();
        }
      }
    }
    
    await user.save();
    
    // Emit real-time update event (for future WebSocket implementation)
    // io.to(req.user.id).emit('assessment-completed', assessmentResult);
    
    res.json({
      success: true,
      message: 'Assessment result saved successfully',
      data: assessmentResult
    });
  } catch (error) {
    console.error('Save assessment result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save assessment result',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assessments/my
 * @desc    Get current user's assessment history
 * @access  Private
 */
router.get('/my', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const assessments = user.assessmentHistory || [];
    
    res.json({
      success: true,
      data: assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assessments/my/stats
 * @desc    Get current user's assessment statistics
 * @access  Private
 */
router.get('/my/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const assessments = user.assessmentHistory || [];
    const completed = assessments.filter(a => a.status === 'completed');
    const terminated = assessments.filter(a => a.status === 'terminated');
    
    const totalScore = completed.reduce((sum, a) => sum + (a.score || 0), 0);
    const averageScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
    
    const badges = completed
      .filter(a => a.badge && a.score >= 70)
      .map(a => a.badge);
    
    res.json({
      success: true,
      data: {
        totalAttempts: assessments.length,
        completedCount: completed.length,
        terminatedCount: terminated.length,
        averageScore,
        badgesEarned: badges,
        recentAssessments: completed.slice(-5).reverse()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment stats',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/assessments
 * @desc    Create a new assessment
 * @access  Private (Admin/Recruiter)
 */
router.post('/', protect, authorize('admin', 'recruiter'), async (req, res) => {
  try {
    const assessment = await Assessment.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment',
      error: error.message
    });
  }
});

module.exports = router;
