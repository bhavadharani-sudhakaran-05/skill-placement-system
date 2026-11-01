const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const Assessment = require('../models/Assessment');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes in this router require admin role
router.use(protect, authorize('admin'));

/**
 * @route   GET /api/admin/overview
 * @desc    Get comprehensive admin overview metrics
 * @access  Private (Admin)
 */
router.get('/overview', async (req, res) => {
  try {
    const [
      totalStudents,
      totalAdmins,
      totalJobs,
      activeJobs,
      totalCourses,
          totalAssessments,
totalAssessments,
      recentUsers,
      recentJobs
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Course.countDocuments({ isActive: true }),
      Assessment.countDocuments(),
      User.find()
        .select('name email role createdAt metrics.skillReadinessScore')
        .sort({ createdAt: -1 })
        .limit(6),
      Job.find()
        .select('title company type location status createdAt applicants')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    const totalUsers = totalStudents + totalAdmins;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalAdmins,
          totalJobs,
          activeJobs,
          totalCourses,
          totalAssessments,
},
        recentUsers,
        recentJobs: recentJobs.map(j => ({
          _id: j._id,
          title: j.title,
          company: j.company?.name || 'Company',
          type: j.type,
          status: j.status,
          applicantsCount: (j.applicants || []).length,
          createdAt: j.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin overview',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    List all platform users with filtering and search
 * @access  Private (Admin)
 */
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email role createdAt phone location company college metrics skills')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a user with specified role
 * @access  Private (Admin)
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, companyName, collegeName } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const userData = {
      name,
      email,
      password,
      role
    };

    if (role === 'recruiter') {
      userData.company = { name: companyName || 'Company' };
    } else if (role === 'college_admin') {
      userData.college = { name: collegeName || 'College' };
    }

    const newUser = await User.create(userData);

    res.status(201).json({
      success: true,
      message: `User created successfully with role ${role}`,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Change user role
 * @access  Private (Admin)
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['student', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}`
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role away from admin
    if (targetUser._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote your own administrator account'
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private (Admin)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all jobs across the platform
 * @access  Private (Admin)
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Admin get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/jobs
 * @desc    Post a job directly as admin
 * @access  Private (Admin)
 */
router.post('/jobs', async (req, res) => {
  try {
    const {
      title,
      companyName,
      companyWebsite,
      locationCity,
      type,
      mode,
      description,
      requiredSkills,
      salaryMin,
      salaryMax
    } = req.body;

    if (!title || !companyName || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, company name, and description are required'
      });
    }

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : (requiredSkills || '').split(',').map(s => ({
          name: s.trim(),
          importance: 'required',
          minLevel: 60
        })).filter(s => s.name);

    const newJob = await Job.create({
      title,
      company: {
        name: companyName,
        website: companyWebsite || ''
      },
      location: {
        city: locationCity || 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        remote: mode === 'remote'
      },
      type: type || 'full-time',
      mode: mode || 'hybrid',
      description,
      skills: skillsArray,
      salary: {
        min: salaryMin ? parseInt(salaryMin) : 500000,
        max: salaryMax ? parseInt(salaryMax) : 1000000,
        currency: 'INR'
      },
      postedBy: req.user._id,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: newJob
    });
  } catch (error) {
    console.error('Admin post job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post job',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/jobs/:id/status
 * @desc    Toggle job status
 * @access  Private (Admin)
 */
router.put('/jobs/:id/status', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.status = job.status === 'active' ? 'closed' : 'active';
    await job.save();

    res.json({
      success: true,
      message: `Job status changed to ${job.status}`,
      data: job
    });
  } catch (error) {
    console.error('Admin update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Delete a job
 * @access  Private (Admin)
 */
router.delete('/jobs/:id', async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses for admin
 * @access  Private (Admin)
 */
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Admin get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/courses
 * @desc    Create a course
 * @access  Private (Admin)
 */
router.post('/courses', async (req, res) => {
  try {
    const { title, description, category, provider, level, duration } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      provider: {
        name: provider || 'SkillForge Academy'
      },
      level: level || 'beginner',
      duration: {
        totalHours: duration ? parseInt(duration) : 20
      },
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Admin create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/courses/:id
 * @desc    Delete a course
 * @access  Private (Admin)
 */
router.delete('/courses/:id', async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/colleges
 * @desc    Get all colleges and their placement statistics
 * @access  Private (Admin)
 */
router.get('/colleges', async (req, res) => {
  try {
    const collegeAdmins = await User.find({ role: 'college_admin' })
      .select('name email college createdAt');

    // Aggregate students by college name
    const students = await User.find({ role: 'student' })
      .select('name email education metrics skills');

    const collegeStatsMap = {};

    collegeAdmins.forEach(ca => {
      const cName = ca.college?.name || ca.name;
      collegeStatsMap[cName] = {
        _id: ca._id,
        name: cName,
        location: ca.college?.location || 'Tamil Nadu, India',
        website: ca.college?.website || 'https://apex-tech.edu',
        placementCell: ca.college?.placementCell || 'Directorate of Placements',
        adminEmail: ca.email,
        adminName: ca.name,
        enrolledStudents: 0,
        avgSkillScore: 0,
        totalScoreSum: 0,
        placedCount: 0,
        createdAt: ca.createdAt
      };
    });

    students.forEach(s => {
      const studentInst = s.education?.[0]?.institution || 'General Student Pool';
      if (!collegeStatsMap[studentInst]) {
        collegeStatsMap[studentInst] = {
          _id: `inst-${studentInst}`,
          name: studentInst,
          location: 'India',
          website: '',
          placementCell: 'Placement Cell',
          adminEmail: 'placement@' + studentInst.toLowerCase().replace(/[^a-z0-9]/g, '') + '.edu',
          adminName: 'College Officer',
          enrolledStudents: 0,
          avgSkillScore: 0,
          totalScoreSum: 0,
          placedCount: 0,
          createdAt: new Date()
        };
      }
      collegeStatsMap[studentInst].enrolledStudents++;
      const score = s.metrics?.skillReadinessScore || 70;
      collegeStatsMap[studentInst].totalScoreSum += score;
      if (score >= 75) {
        collegeStatsMap[studentInst].placedCount++;
      }
    });

    const colleges = Object.values(collegeStatsMap).map(c => ({
      ...c,
      avgSkillScore: c.enrolledStudents > 0 ? Math.round(c.totalScoreSum / c.enrolledStudents) : 75,
      placementRate: c.enrolledStudents > 0 ? Math.round((c.placedCount / c.enrolledStudents) * 100) : 80
    }));

    res.json({
      success: true,
      data: colleges
    });
  } catch (error) {
    console.error('Admin get colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/colleges
 * @desc    Register a new college / placement cell
 * @access  Private (Admin)
 */
router.post('/colleges', async (req, res) => {
  try {
    const { name, email, password, location, website, placementCell } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'College name, admin email, and password are required'
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const collegeUser = await User.create({
      name: `${name} Placement Cell`,
      email,
      password,
      role: 'college_admin',
      college: {
        name,
        location: location || 'Tamil Nadu, India',
        website: website || '',
        placementCell: placementCell || 'Placement & Training Directorate'
      }
    });

    res.status(201).json({
      success: true,
      message: 'College registered successfully',
      data: collegeUser
    });
  } catch (error) {
    console.error('Admin register college error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register college',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/assessments
 * @desc    Get all assessments
 * @access  Private (Admin)
 */
router.get('/assessments', async (req, res) => {
  try {
    const assessments = await Assessment.find().populate('skill', 'name category');
    res.json({
      success: true,
      data: assessments
    });
  } catch (error) {
    console.error('Admin get assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessments',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/assessments
 * @desc    Create a new assessment
 * @access  Private (Admin)
 */
router.post('/assessments', async (req, res) => {
  try {
    const { title, description, skillName, category, difficulty, duration, questions } = req.body;

    if (!title || !skillName) {
      return res.status(400).json({
        success: false,
        message: 'Title and skillName are required'
      });
    }

    let skill = await Skill.findOne({ name: skillName });
    if (!skill) {
      skill = await Skill.create({
        name: skillName,
        category: category || 'technical',
        demandLevel: 'high'
      });
    }

    const assessment = await Assessment.create({
      title,
      description: description || `Assess proficiency in ${skillName}`,
      skill: skill._id,
      skillName,
      category: category || 'technical',
      difficulty: difficulty || 'intermediate',
      duration: duration || 20,
      questions: questions || [
        {
          question: `Which of the following is true about ${skillName}?`,
          options: ['Standard practice', 'Deprecated', 'Not supported', 'None of the above'],
          correctAnswer: 'Standard practice',
          points: 1
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Admin create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/skills
 * @desc    Get all skills
 * @access  Private (Admin)
 */
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ demandLevel: -1, name: 1 });
    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('Admin get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/skills
 * @desc    Add a new skill
 * @access  Private (Admin)
 */
router.post('/skills', async (req, res) => {
  try {
    const { name, category, demandLevel, growthTrend, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Skill name and category are required'
      });
    }

    const existing = await Skill.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists in taxonomy'
      });
    }

    const newSkill = await Skill.create({
      name,
      category,
      demandLevel: demandLevel || 'high',
      growthTrend: growthTrend || 'rising',
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Skill added to platform taxonomy',
      data: newSkill
    });
  } catch (error) {
    console.error('Admin add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add skill',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/system-health
 * @desc    Get system diagnostics and environment summary
 * @access  Private (Admin)
 */
router.get(['/system-health', '/settings'], async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const os = require('os');

    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbName = mongoose.connection.name || 'sps';

    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      data: {
        nodeVersion: process.version,
        platform: process.platform,
        serverUptime: Math.round(process.uptime()),
        database: {
          status: dbStatus,
          name: dbName,
          host: mongoose.connection.host || 'localhost'
        },
        aiModel: {
          configured: Boolean(process.env.GEMINI_API_KEY),
          model: process.env.RESUME_AI_MODEL || 'gemini-3.8-flash'
        },
        memory: {
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024)
        },
        systemLoad: os.loadavg ? os.loadavg() : [0, 0, 0]
      }
    });
  } catch (error) {
    console.error('Admin system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system diagnostics',
      error: error.message
    });
  }
});

module.exports = router;
