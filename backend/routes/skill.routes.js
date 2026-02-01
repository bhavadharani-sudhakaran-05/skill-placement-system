const express = require('express');
const Skill = require('../models/Skill');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/skills
 * @desc    Get all skills
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, trending } = req.query;

    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { name: 1 };
    if (trending) {
      sortOption = { 'industryDemand.score': -1 };
    }

    const skills = await Skill.find(query)
      .sort(sortOption)
      .limit(100);

    res.json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/skills/categories
 * @desc    Get skill categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Skill.distinct('category');
    
    const categoryCounts = await Skill.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: categoryCounts.map(c => ({
        name: c._id,
        count: c.count
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/skills/trending
 * @desc    Get trending skills
 * @access  Public
 */
router.get('/trending', async (req, res) => {
  try {
    const skills = await Skill.find({
      isActive: true,
      'industryDemand.trend': { $in: ['rising', 'stable'] }
    })
    .sort({ 'industryDemand.score': -1 })
    .limit(20)
    .select('name category industryDemand');

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending skills',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/skills/:id
 * @desc    Get skill by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('relatedSkills.skillId', 'name category');

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/skills
 * @desc    Create a new skill
 * @access  Private (Admin)
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const skill = await Skill.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create skill',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/skills/:id
 * @desc    Update a skill
 * @access  Private (Admin)
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update skill',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/skills/seed
 * @desc    Seed initial skills data
 * @access  Private (Admin)
 */
router.post('/seed', protect, authorize('admin'), async (req, res) => {
  try {
    const initialSkills = [
      { name: 'JavaScript', category: 'programming-language', industryDemand: { score: 95, trend: 'stable' }, keywords: ['js', 'es6', 'ecmascript'] },
      { name: 'Python', category: 'programming-language', industryDemand: { score: 98, trend: 'rising' }, keywords: ['python3', 'py'] },
      { name: 'Java', category: 'programming-language', industryDemand: { score: 85, trend: 'stable' }, keywords: ['java8', 'java11', 'jdk'] },
      { name: 'React', category: 'framework', industryDemand: { score: 92, trend: 'rising' }, keywords: ['reactjs', 'react.js'] },
      { name: 'Node.js', category: 'framework', industryDemand: { score: 88, trend: 'stable' }, keywords: ['nodejs', 'node'] },
      { name: 'MongoDB', category: 'database', industryDemand: { score: 80, trend: 'stable' }, keywords: ['mongo', 'nosql'] },
      { name: 'SQL', category: 'database', industryDemand: { score: 85, trend: 'stable' }, keywords: ['mysql', 'postgresql', 'database'] },
      { name: 'AWS', category: 'cloud', industryDemand: { score: 90, trend: 'rising' }, keywords: ['amazon web services', 'ec2', 's3'] },
      { name: 'Docker', category: 'devops', industryDemand: { score: 85, trend: 'rising' }, keywords: ['container', 'containerization'] },
      { name: 'Machine Learning', category: 'data-science', industryDemand: { score: 95, trend: 'rising' }, keywords: ['ml', 'ai', 'deep learning'] },
      { name: 'TypeScript', category: 'programming-language', industryDemand: { score: 88, trend: 'rising' }, keywords: ['ts'] },
      { name: 'Git', category: 'tools', industryDemand: { score: 90, trend: 'stable' }, keywords: ['github', 'version control'] },
      { name: 'Communication', category: 'soft-skills', industryDemand: { score: 85, trend: 'stable' }, keywords: ['verbal', 'written'] },
      { name: 'Problem Solving', category: 'soft-skills', industryDemand: { score: 90, trend: 'stable' }, keywords: ['analytical', 'critical thinking'] },
      { name: 'Leadership', category: 'soft-skills', industryDemand: { score: 80, trend: 'stable' }, keywords: ['team lead', 'management'] }
    ];

    await Skill.insertMany(initialSkills, { ordered: false }).catch(() => {});

    res.json({
      success: true,
      message: 'Skills seeded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed skills',
      error: error.message
    });
  }
});

module.exports = router;
