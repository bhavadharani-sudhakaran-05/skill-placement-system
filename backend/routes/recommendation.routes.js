const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const RecommendationService = require('../services/recommendation.service');
const SkillGapService = require('../services/skillGap.service');

const router = express.Router();

/**
 * @route   GET /api/recommendations/jobs
 * @desc    Get personalized job recommendations
 * @access  Private
 */
router.get('/jobs', protect, async (req, res) => {
  try {
    const { limit = 10, includeInternships = true } = req.query;

    const recommendations = await RecommendationService.getJobRecommendations(
      req.user.id,
      { limit: parseInt(limit), includeInternships: includeInternships === 'true' }
    );

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get job recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/courses
 * @desc    Get personalized course recommendations
 * @access  Private
 */
router.get('/courses', protect, async (req, res) => {
  try {
    const { limit = 10, focusOnGaps = true } = req.query;

    const recommendations = await RecommendationService.getCourseRecommendations(
      req.user.id,
      { limit: parseInt(limit), focusOnGaps: focusOnGaps === 'true' }
    );

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get course recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/skills
 * @desc    Get skill recommendations (what to learn next)
 * @access  Private
 */
router.get('/skills', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await RecommendationService.getSkillRecommendations(
      req.user.id,
      { limit: parseInt(limit) }
    );

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get skill recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/skill-gap/:jobId
 * @desc    Get skill gap analysis for a specific job
 * @access  Private
 */
router.get('/skill-gap/:jobId', protect, async (req, res) => {
  try {
    const analysis = await SkillGapService.analyzeGap(req.user.id, req.params.jobId);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze skill gap',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/all
 * @desc    Get all recommendations in one call
 * @access  Private
 */
router.get('/all', protect, async (req, res) => {
  try {
    const [jobs, courses, skills] = await Promise.all([
      RecommendationService.getJobRecommendations(req.user.id, { limit: 5 }),
      RecommendationService.getCourseRecommendations(req.user.id, { limit: 5 }),
      RecommendationService.getSkillRecommendations(req.user.id, { limit: 5 })
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        courses,
        skills
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending skills in industry
 * @access  Public
 */
router.get('/trending', async (req, res) => {
  try {
    const trends = await SkillGapService.getSkillTrends();

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get skill trends',
      error: error.message
    });
  }
});

module.exports = router;
