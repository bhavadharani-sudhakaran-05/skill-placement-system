const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'recruiter', 'admin', 'college']).withMessage('Invalid role'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Job creation validation
const validateJob = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('company')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required'),
  body('requiredSkills')
    .isArray({ min: 1 }).withMessage('At least one required skill is needed'),
  handleValidationErrors
];

// Course validation
const validateCourse = [
  body('title')
    .trim()
    .notEmpty().withMessage('Course title is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Course description is required'),
  body('provider.name')
    .trim()
    .notEmpty().withMessage('Provider name is required'),
  body('skillsTaught')
    .isArray({ min: 1 }).withMessage('At least one skill must be specified'),
  handleValidationErrors
];

// Assessment validation
const validateAssessment = [
  body('title')
    .trim()
    .notEmpty().withMessage('Assessment title is required'),
  body('questions')
    .isArray({ min: 1 }).withMessage('At least one question is required'),
  body('settings.duration')
    .isNumeric().withMessage('Duration is required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateJob,
  validateCourse,
  validateAssessment
};



