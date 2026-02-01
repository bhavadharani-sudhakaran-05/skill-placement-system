const express = require('express');
const LearningPath = require('../models/LearningPath');
const { protect, authorize } = require('../middleware/auth.middleware');
const LearningPathService = require('../services/learningPath.service');

const router = express.Router();

/**
 * @route   GET /api/learning-paths
 * @desc    Get available learning path templates
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { targetRole, category } = req.query;

    let query = { isPublic: true, isActive: true, isPersonalized: false };
    if (targetRole) query.targetRole = new RegExp(targetRole, 'i');
    if (category) query.category = category;

    const paths = await LearningPath.find(query)
      .select('title description targetRole totalDuration totalModules difficulty successMetrics')
      .sort({ 'successMetrics.completions': -1 });

    res.json({
      success: true,
      data: paths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning paths',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/learning-paths/roles
 * @desc    Get available target roles
 * @access  Public
 */
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      { id: 'frontend-developer', name: 'Frontend Developer', icon: '💻' },
      { id: 'backend-developer', name: 'Backend Developer', icon: '⚙️' },
      { id: 'full-stack-developer', name: 'Full Stack Developer', icon: '🔄' },
      { id: 'data-scientist', name: 'Data Scientist', icon: '📊' },
      { id: 'devops-engineer', name: 'DevOps Engineer', icon: '🚀' },
      { id: 'mobile-developer', name: 'Mobile Developer', icon: '📱' },
      { id: 'cloud-architect', name: 'Cloud Architect', icon: '☁️' },
      { id: 'ml-engineer', name: 'ML Engineer', icon: '🤖' }
    ];

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/learning-paths/generate
 * @desc    Generate personalized learning path
 * @access  Private
 */
router.post('/generate', protect, async (req, res) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }

    const learningPath = await LearningPathService.generatePersonalizedPath(
      req.user.id,
      targetRole
    );

    res.json({
      success: true,
      message: 'Personalized learning path generated',
      data: learningPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate learning path',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/learning-paths/my
 * @desc    Get user's active learning path
 * @access  Private
 */
router.get('/my', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id)
      .populate('activeLearningPath.pathId');

    if (!user.activeLearningPath?.pathId) {
      return res.status(404).json({
        success: false,
        message: 'No active learning path found'
      });
    }

    const path = user.activeLearningPath.pathId;
    const progress = {
      currentStage: user.activeLearningPath.currentStage,
      completedModules: user.activeLearningPath.completedModules?.length || 0,
      totalModules: path.totalModules,
      progressPercentage: Math.round(
        ((user.activeLearningPath.completedModules?.length || 0) / path.totalModules) * 100
      ),
      estimatedCompletionDate: user.activeLearningPath.estimatedCompletionDate
    };

    res.json({
      success: true,
      data: {
        path,
        progress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning path',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/learning-paths/my/progress
 * @desc    Update progress on learning path
 * @access  Private
 */
router.put('/my/progress', protect, async (req, res) => {
  try {
    const { moduleId, score } = req.body;

    const progress = await LearningPathService.updateProgress(
      req.user.id,
      moduleId,
      score
    );

    res.json({
      success: true,
      message: 'Progress updated',
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/learning-paths/:id
 * @desc    Get learning path by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    res.json({
      success: true,
      data: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning path',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/learning-paths/:id/enroll
 * @desc    Enroll in a public learning path
 * @access  Private
 */
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      activeLearningPath: {
        pathId: path._id,
        startedAt: new Date(),
        currentStage: 0,
        completedModules: [],
        estimatedCompletionDate: new Date(Date.now() + path.totalDuration * 60 * 60 * 1000)
      }
    });

    // Update enrollment count
    path.successMetrics.enrollments++;
    await path.save();

    res.json({
      success: true,
      message: 'Enrolled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enroll',
      error: error.message
    });
  }
});

module.exports = router;
