const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const AnalyticsService = require('../services/analytics.service');

const router = express.Router();

} catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recruiter analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/admin
 * @desc    Get admin overview analytics
 * @access  Private (Admin)
 */
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const analytics = await AnalyticsService.getAdminOverview();

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/skill-trends
 * @desc    Get skill trends across platform
 * @access  Private (Admin/College)
 */
router.get('/skill-trends', protect, authorize('admin', 'college', 'college_admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const students = await User.find({ role: 'student' }).select('_id');
    const studentIds = students.map(s => s._id);

    const trends = await AnalyticsService.getSkillTrends(studentIds);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill trends',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/placement-probability
 * @desc    Get placement probability by score ranges
 * @access  Private (Admin/College)
 */
router.get('/placement-probability', protect, authorize('admin', 'college', 'college_admin'), async (req, res) => {
  try {
    const probability = await AnalyticsService.getPlacementProbability();

    res.json({
      success: true,
      data: probability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch placement probability',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/course-effectiveness
 * @desc    Get course effectiveness rankings
 * @access  Private (Admin/College)
 */
router.get('/course-effectiveness', protect, authorize('admin', 'college', 'college_admin'), async (req, res) => {
  try {
    const effectiveness = await AnalyticsService.getCourseEffectiveness();

    res.json({
      success: true,
      data: effectiveness
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course effectiveness',
      error: error.message
    });
  }
});

module.exports = router;
