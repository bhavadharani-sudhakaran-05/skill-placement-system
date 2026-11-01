const express = require('express');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const ResumeParserService = require('../services/resumeParser.service');
const ResumeAnalysisService = require('../services/resumeAnalysis.service');

const router = express.Router();

function handleUpload(req, res, next) {
  upload.single('resume')(req, res, error => {
    if (!error) return next();
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : (error.status || 400);
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Resume file exceeds the 5 MB limit.'
      : (error.status ? error.message : 'The resume upload could not be accepted. Check that it is a PDF or DOCX under 5 MB.');
    return res.status(status).json({ success: false, message, code: error.code || 'UPLOAD_INVALID' });
  });
}

function safeFailure(res, error, fallback) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const known = Boolean(error.code);
  return res.status(status).json({
    success: false,
    message: known ? error.message : fallback,
    code: known ? error.code : 'RESUME_ANALYSIS_FAILED'
  });
}

router.post('/upload', protect, handleUpload, async (req, res) => {
  let tempFile;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please select a PDF or DOCX resume.' });
    tempFile = req.file.path;
    const jobDescription = typeof req.body.jobDescription === 'string' ? req.body.jobDescription.trim() : '';
    if (jobDescription.length > 20000) return res.status(400).json({ success: false, message: 'Job description must be 20,000 characters or fewer.' });

    const extracted = await ResumeParserService.extractDocument(tempFile, req.file.originalname);
    let analysis;
    try {
      analysis = await ResumeAnalysisService.analyzeResumeText(extracted.text, jobDescription);
    } catch (aiError) {
      if (['AI_NOT_CONFIGURED', 'AI_UNAVAILABLE', 'AI_RATE_LIMITED', 'AI_QUOTA_EXHAUSTED', 'AI_TIMEOUT', 'AI_AUTH_FAILED', 'AI_INVALID_RESPONSE'].includes(aiError.code) || !process.env.GEMINI_API_KEY) {
        console.warn(`[Resume Analysis] AI parsing unavailable (${aiError.code || aiError.message}). Using local rule-based parsing engine.`);
        const local = await ResumeParserService.analyzeResumeText(extracted.text, jobDescription);
        analysis = {
          ...local,
          structuredData: local,
          parsedSkills: local.parsedSkills || [],
          parsedProjects: local.parsedProjects || [],
          parsedCertifications: local.parsedCertifications || [],
          parsedEducation: local.parsedEducation || [],
          parsedExperience: local.parsedExperience || [],
          achievements: local.achievements || [],
          atsScore: local.atsScore,
          skillMatchScore: local.skillMatchScore,
          formattingScore: local.formattingScore,
          keywordScore: local.keywordScore,
          scoreDetails: local.scoreDetails,
          scoreBreakdown: local.scoreBreakdown,
          wordCount: local.wordCount,
          improvementSuggestions: local.improvementSuggestions || []
        };
      } else {
        throw aiError;
      }
    }
    const user = await User.findByIdAndUpdate(req.user.id, {
      $set: {
        'resume.url': '',
        'resume.filename': path.basename(req.file.originalname),
        'resume.uploadedAt': new Date(),
        'resume.atsScore': analysis.atsScore,
        'resume.parsedData.skills': analysis.parsedSkills,
        'resume.parsedData.experience': JSON.stringify(analysis.parsedExperience),
        'resume.parsedData.education': JSON.stringify(analysis.parsedEducation),
        resumeAnalysis: {
          parsedSkills: analysis.parsedSkills,
          parsedProjects: analysis.parsedProjects,
          parsedCertifications: analysis.parsedCertifications,
          parsedEducation: analysis.parsedEducation,
          parsedExperience: analysis.parsedExperience,
          structuredData: analysis.structuredData,
          atsScore: analysis.atsScore,
          skillMatchScore: analysis.skillMatchScore,
          formattingScore: analysis.formattingScore,
          keywordScore: analysis.keywordScore,
          scoreDetails: analysis.scoreDetails,
          scoreBreakdown: analysis.scoreBreakdown,
          achievements: analysis.achievements || analysis.structuredData?.achievements || [],
          improvementSuggestions: analysis.improvementSuggestions,
          analyzedAt: new Date()
        }
      }
    }, { new: true, runValidators: true }).select('_id');

    if (!user) return res.status(404).json({ success: false, message: 'Your account could not be found.' });
    return res.json({
      success: true,
      message: 'Resume analyzed from its extracted content.',
      data: {
        fileName: path.basename(req.file.originalname),
        extractionSource: extracted.source,
        extractionConfidence: extracted.source === 'ocr' ? 'review-recommended' : 'text-extracted',
        ...analysis
      }
    });
  } catch (error) {
    return safeFailure(res, error, 'The resume could not be analyzed. Please check the file and try again.');
  } finally {
    if (tempFile) await fs.promises.rm(tempFile, { force: true }).catch(() => {});
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resume resumeAnalysis');
    if (!user?.resumeAnalysis?.analyzedAt) return res.status(404).json({ success: false, message: 'No resume analysis is available yet.' });
    return res.json({ success: true, data: { resume: user.resume, analysis: user.resumeAnalysis } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resume analysis.' });
  }
});

router.get('/ats-score', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resumeAnalysis');
    if (!user?.resumeAnalysis?.analyzedAt) return res.status(404).json({ success: false, message: 'No resume analysis is available yet.' });
    const analysis = user.resumeAnalysis;
    return res.json({
      success: true,
      data: {
        atsScore: analysis.atsScore ?? null,
        scoreDetails: analysis.scoreDetails || [],
        improvementSuggestions: analysis.improvementSuggestions || [],
        skillsCount: analysis.parsedSkills?.length || 0,
        projectsCount: analysis.parsedProjects?.length || 0,
        certificationsCount: analysis.parsedCertifications?.length || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resume score.' });
  }
});

router.post('/analyze-text', protect, async (req, res) => {
  try {
    const { text, jobDescription = '' } = req.body || {};
    if (typeof text !== 'string' || text.trim().length < 120) {
      return res.status(400).json({ success: false, message: 'Please provide at least 120 characters of resume text.' });
    }
    if (typeof jobDescription !== 'string' || jobDescription.length > 20000) {
      return res.status(400).json({ success: false, message: 'Job description must be text under 20,000 characters.' });
    }
    const normalizedText = ResumeParserService.normalizeResumeText(text);
    let analysis;
    try {
      analysis = await ResumeAnalysisService.analyzeResumeText(normalizedText, jobDescription);
    } catch (aiError) {
      analysis = await ResumeParserService.analyzeResumeText(normalizedText, jobDescription);
    }
    return res.json({ success: true, data: analysis });
  } catch (error) {
    return safeFailure(res, error, 'Failed to analyze the supplied resume text.');
  }
});

router.get('/optimization-tips', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resumeAnalysis');
    if (!user?.resumeAnalysis?.analyzedAt) return res.json({ success: true, data: [] });
    return res.json({ success: true, data: user.resumeAnalysis.improvementSuggestions || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resume suggestions.' });
  }
});

module.exports = router;
