const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const ResumeParserService = require('../services/resumeParser.service');

const router = express.Router();

/**
 * @route   POST /api/resume/upload
 * @desc    Upload and parse resume (PDF)
 * @access  Private
 */
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or DOC)'
      });
    }

    // Parse the resume
    const parsedData = await ResumeParserService.parseResume(req.file.path);

    // Update user's resume data (matches User model schema)
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          resume: {
            url: req.file.path,
            filename: req.file.originalname,
            uploadedAt: new Date(),
            atsScore: parsedData.atsScore,
            parsedData: {
              skills: parsedData.parsedSkills || [],
              experience: JSON.stringify(parsedData.parsedExperience || []),
              education: JSON.stringify(parsedData.parsedEducation || [])
            }
          },
          resumeAnalysis: {
            parsedSkills: parsedData.parsedSkills || [],
            parsedProjects: parsedData.parsedProjects || [],
            parsedCertifications: parsedData.parsedCertifications || [],
            parsedEducation: parsedData.parsedEducation || [],
            parsedExperience: parsedData.parsedExperience || [],
            atsScore: parsedData.atsScore,
            improvementSuggestions: parsedData.improvementSuggestions || [],
            analyzedAt: new Date()
          }
        }
      },
      { new: true }
    );

    // Auto-update skills from parsed resume
    if (parsedData.parsedSkills && parsedData.parsedSkills.length > 0) {
      const existingSkillNames = (user.skills || []).map(s => (s.name || '').toLowerCase());
      const newSkills = parsedData.parsedSkills
        .filter(skill => !existingSkillNames.includes(skill.toLowerCase()))
        .map(skill => ({
          name: skill,
          level: 50,
          verified: false,
          category: 'technical'
        }));

      if (newSkills.length > 0) {
        user.skills.push(...newSkills);
        await user.save();
      }
    }

    // Update skill readiness score if user model has the method
    if (typeof user.updateSkillReadinessScore === 'function') {
      await user.updateSkillReadinessScore();
    }

    // Calculate detailed scores
    const normalizedText = (await require('pdf-parse')(require('fs').readFileSync(req.file.path))).text;
    const wordCount = normalizedText.split(/\s+/).length;
    const formattingScore = ResumeParserService.calculateFormattingScore(normalizedText);
    const keywordScore = ResumeParserService.calculateKeywordScore(normalizedText);
    const skillMatchScore = Math.min(100, (parsedData.parsedSkills.length / 15) * 100);

    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        fileName: req.file.originalname,
        parsedSkills: parsedData.parsedSkills,
        parsedProjects: parsedData.parsedProjects,
        parsedCertifications: parsedData.parsedCertifications,
        parsedEducation: parsedData.parsedEducation,
        parsedExperience: parsedData.parsedExperience,
        atsScore: parsedData.atsScore,
        skillMatchScore: Math.round(skillMatchScore),
        formattingScore,
        keywordScore,
        wordCount,
        improvementSuggestions: parsedData.improvementSuggestions
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process resume',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/resume
 * @desc    Get user's resume data
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resumeData');

    if (!user.resumeData || !user.resumeData.filePath) {
      return res.status(404).json({
        success: false,
        message: 'No resume uploaded yet'
      });
    }

    res.json({
      success: true,
      data: user.resumeData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume data',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/resume/ats-score
 * @desc    Get ATS score and suggestions
 * @access  Private
 */
router.get('/ats-score', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resumeData');

    if (!user.resumeData) {
      return res.status(404).json({
        success: false,
        message: 'No resume uploaded yet'
      });
    }

    res.json({
      success: true,
      data: {
        atsScore: user.resumeData.atsScore || 0,
        improvementSuggestions: user.resumeData.improvementSuggestions || [],
        skillsCount: user.resumeData.parsedSkills?.length || 0,
        projectsCount: user.resumeData.parsedProjects?.length || 0,
        certificationsCount: user.resumeData.parsedCertifications?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ATS score',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/resume/analyze-text
 * @desc    Analyze resume text without upload
 * @access  Private
 */
router.post('/analyze-text', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume text (minimum 100 characters)'
      });
    }

    const analysis = await ResumeParserService.analyzeResumeText(text);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze resume',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/resume/optimization-tips
 * @desc    Get resume optimization tips based on target job
 * @access  Private
 */
router.get('/optimization-tips', protect, async (req, res) => {
  try {
    const { targetRole } = req.query;
    const user = await User.findById(req.user.id).select('resumeData skills');

    const tips = [];

    // General tips
    tips.push({
      category: 'format',
      priority: 'high',
      tip: 'Use a clean, ATS-friendly format without tables, images, or graphics'
    });

    // Skills-based tips
    if (user.skills.length < 8) {
      tips.push({
        category: 'skills',
        priority: 'high',
        tip: 'Add more relevant technical skills to your resume (aim for 10-15 skills)'
      });
    }

    // Resume data-based tips
    if (user.resumeData) {
      if (!user.resumeData.parsedProjects || user.resumeData.parsedProjects.length < 2) {
        tips.push({
          category: 'projects',
          priority: 'high',
          tip: 'Include at least 2-3 significant projects with quantifiable outcomes'
        });
      }

      if (user.resumeData.atsScore < 70) {
        tips.push({
          category: 'ats',
          priority: 'high',
          tip: 'Use more action verbs and quantify your achievements to improve ATS score'
        });
      }

      if (!user.resumeData.parsedCertifications || user.resumeData.parsedCertifications.length === 0) {
        tips.push({
          category: 'certifications',
          priority: 'medium',
          tip: 'Add relevant certifications to stand out from other candidates'
        });
      }
    }

    // Target role specific tips
    if (targetRole) {
      tips.push({
        category: 'targeting',
        priority: 'high',
        tip: `Tailor your resume summary and skills section for ${targetRole} positions`
      });
    }

    res.json({
      success: true,
      data: tips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get optimization tips',
      error: error.message
    });
  }
});

module.exports = router;
