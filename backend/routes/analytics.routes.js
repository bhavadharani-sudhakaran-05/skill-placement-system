const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const AnalyticsService = require('../services/analytics.service');

const router = express.Router();

/**
 * @route   GET /api/analytics/college
 * @desc    Get college analytics dashboard
 * @access  Private (College Admin)
 */
router.get('/college', protect, authorize('college', 'admin'), async (req, res) => {
  try {
    const collegeId = req.user.collegeProfile?.collegeName || req.query.collegeId;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID is required'
      });
    }

    const analytics = await AnalyticsService.getCollegeDashboard(collegeId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/recruiter
 * @desc    Get recruiter analytics dashboard
 * @access  Private (Recruiter)
 */
router.get('/recruiter', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const analytics = await AnalyticsService.getRecruiterDashboard(req.user.id);

    res.json({
      success: true,
      data: analytics
    });
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
router.get('/skill-trends', protect, authorize('admin', 'college'), async (req, res) => {
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
router.get('/placement-probability', protect, authorize('admin', 'college'), async (req, res) => {
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
router.get('/course-effectiveness', protect, authorize('admin', 'college'), async (req, res) => {
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
