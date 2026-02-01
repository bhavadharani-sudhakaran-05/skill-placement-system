const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/courses
 * @desc    Get all courses
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      difficulty, 
      skill,
      free,
      sortBy = 'rating'
    } = req.query;

    let query = { isActive: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (skill) query['skillsTaught.name'] = new RegExp(skill, 'i');
    if (free === 'true') query['pricing.isFree'] = true;

    let sortOption = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { 'ratings.average': -1 };
        break;
      case 'popular':
        sortOption = { 'enrollments.total': -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'effectiveness':
        sortOption = { 'effectiveness.placementSuccessRate': -1 };
        break;
      default:
        sortOption = { 'ratings.average': -1 };
    }

    const courses = await Course.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
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
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/courses/categories
 * @desc    Get course categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(c => ({ name: c._id, count: c.count }))
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
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Admin)
 */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll in a course
 * @access  Private
 */
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const user = await User.findById(req.user.id);
    const alreadyEnrolled = user.courseProgress.some(
      cp => cp.courseId.toString() === req.params.id
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Add to user's course progress
    user.courseProgress.push({
      courseId: course._id,
      startedAt: new Date(),
      progress: 0
    });
    await user.save();

    // Update course enrollment count
    course.enrollments.total++;
    await course.save();

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

/**
 * @route   PUT /api/courses/:id/progress
 * @desc    Update course progress
 * @access  Private
 */
router.put('/:id/progress', protect, async (req, res) => {
  try {
    const { progress, completedModules } = req.body;

    const user = await User.findById(req.user.id);
    const courseProgress = user.courseProgress.find(
      cp => cp.courseId.toString() === req.params.id
    );

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    courseProgress.progress = progress;
    
    if (progress === 100 && !courseProgress.completedAt) {
      courseProgress.completedAt = new Date();
      
      // Update course completion count
      await Course.findByIdAndUpdate(req.params.id, {
        $inc: { 'enrollments.completions': 1 }
      });

      // Update user's skill readiness score
      await user.updateSkillReadinessScore();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Progress updated',
      data: courseProgress
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
 * @route   POST /api/courses/:id/review
 * @desc    Add a review to a course
 * @access  Private
 */
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already reviewed
    const existingReview = course.reviews.find(
      r => r.userId.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Already reviewed this course'
      });
    }

    course.reviews.push({
      userId: req.user.id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.ratings.average = totalRating / course.reviews.length;
    course.ratings.count = course.reviews.length;

    await course.save();

    res.json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/courses/my/enrolled
 * @desc    Get user's enrolled courses
 * @access  Private
 */
router.get('/my/enrolled', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('courseProgress.courseId');

    res.json({
      success: true,
      data: user.courseProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/courses/seed
 * @desc    Seed initial courses
 * @access  Private (Admin)
 */
router.post('/seed', protect, authorize('admin'), async (req, res) => {
  try {
    const courses = [
      {
        title: 'Complete JavaScript Mastery',
        description: 'Learn JavaScript from basics to advanced concepts including ES6+, async programming, and more.',
        provider: { name: 'Udemy', website: 'https://udemy.com' },
        skillsTaught: [{ name: 'JavaScript', proficiencyGain: 'intermediate' }],
        difficulty: 'beginner',
        duration: { total: 40, perWeek: 5 },
        category: 'Web Development',
        pricing: { isFree: false, price: 499 },
        ratings: { average: 4.5, count: 1200 }
      },
      {
        title: 'React - The Complete Guide',
        description: 'Master React including Hooks, Redux, React Router and Next.js.',
        provider: { name: 'Coursera', website: 'https://coursera.org' },
        skillsTaught: [{ name: 'React', proficiencyGain: 'advanced' }],
        prerequisites: [{ name: 'JavaScript', minimumProficiency: 'intermediate' }],
        difficulty: 'intermediate',
        duration: { total: 60, perWeek: 8 },
        category: 'Web Development',
        pricing: { isFree: false, price: 999 },
        ratings: { average: 4.8, count: 2500 }
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming with focus on data analysis, pandas, numpy, and visualization.',
        provider: { name: 'edX', website: 'https://edx.org' },
        skillsTaught: [
          { name: 'Python', proficiencyGain: 'intermediate' },
          { name: 'Pandas', proficiencyGain: 'intermediate' }
        ],
        difficulty: 'beginner',
        duration: { total: 50, perWeek: 6 },
        category: 'Data Science',
        pricing: { isFree: true },
        ratings: { average: 4.6, count: 3000 }
      },
      {
        title: 'Machine Learning A-Z',
        description: 'Complete machine learning course covering supervised, unsupervised learning and deep learning.',
        provider: { name: 'Udemy', website: 'https://udemy.com' },
        skillsTaught: [{ name: 'Machine Learning', proficiencyGain: 'intermediate' }],
        prerequisites: [{ name: 'Python', minimumProficiency: 'intermediate' }],
        difficulty: 'intermediate',
        duration: { total: 80, perWeek: 10 },
        category: 'AI/ML',
        pricing: { isFree: false, price: 1499 },
        ratings: { average: 4.7, count: 5000 }
      },
      {
        title: 'AWS Certified Solutions Architect',
        description: 'Prepare for AWS Solutions Architect certification with hands-on labs.',
        provider: { name: 'AWS', website: 'https://aws.amazon.com' },
        skillsTaught: [{ name: 'AWS', proficiencyGain: 'advanced' }],
        difficulty: 'advanced',
        duration: { total: 40, perWeek: 5 },
        category: 'Cloud Computing',
        pricing: { isFree: false, price: 2999 },
        certificate: { isProvided: true, type: 'professional' },
        ratings: { average: 4.9, count: 1500 }
      }
    ];

    await Course.insertMany(courses, { ordered: false }).catch(() => {});

    res.json({
      success: true,
      message: 'Courses seeded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed courses',
      error: error.message
    });
  }
});

module.exports = router;
