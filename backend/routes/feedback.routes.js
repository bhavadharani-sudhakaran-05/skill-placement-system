const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const FeedbackLoopService = require('../services/feedbackLoop.service');

const router = express.Router();

/**
 * @route   POST /api/feedback/placement
 * @desc    Record placement outcome feedback
 * @access  Private
 */
router.post('/placement', protect, async (req, res) => {
  try {
    const feedback = await FeedbackLoopService.recordPlacementOutcome({
      userId: req.user.id,
      ...req.body
    });

    res.json({
      success: true,
      message: 'Placement feedback recorded',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/feedback/course
 * @desc    Record course effectiveness feedback
 * @access  Private
 */
router.post('/course', protect, async (req, res) => {
  try {
    const feedback = await FeedbackLoopService.recordCourseEffectiveness({
      userId: req.user.id,
      ...req.body
    });

    res.json({
      success: true,
      message: 'Course feedback recorded',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/feedback/recommendation
 * @desc    Record recommendation accuracy feedback
 * @access  Private
 */
router.post('/recommendation', protect, async (req, res) => {
  try {
    const feedback = await FeedbackLoopService.recordRecommendationFeedback({
      userId: req.user.id,
      ...req.body
    });

    res.json({
      success: true,
      message: 'Recommendation feedback recorded',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/feedback/insights
 * @desc    Get analytics insights from feedback loop
 * @access  Private (Admin)
 */
router.get('/insights', protect, authorize('admin'), async (req, res) => {
  try {
    const insights = await FeedbackLoopService.getAnalyticsInsights();

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insights',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/feedback/update-model
 * @desc    Manually trigger model update
 * @access  Private (Admin)
 */
router.post('/update-model', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await FeedbackLoopService.updateRecommendationModel();

    res.json({
      success: true,
      message: 'Model updated successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update model',
      error: error.message
    });
  }
});

module.exports = router;
