const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateJob } = require('../middleware/validation.middleware');
const SkillGapService = require('../services/skillGap.service');

const router = express.Router();

/**
 * @route   GET /api/jobs
 * @desc    Get all active jobs
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      location, 
      jobType, 
      skills,
      minSalary,
      experience 
    } = req.query;

    let query = { status: 'active', isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }
    if (jobType) {
      query.jobType = jobType;
    }
    if (skills) {
      const skillList = skills.split(',');
      query['requiredSkills.name'] = { $in: skillList };
    }
    if (minSalary) {
      query['salary.minimum'] = { $gte: parseInt(minSalary) };
    }
    if (experience) {
      query['experience.minimum'] = { $lte: parseInt(experience) };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name recruiterProfile.company recruiterProfile.companyLogo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
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
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/jobs/matched
 * @desc    Get jobs matched against user's resume skills with real match scores
 * @access  Private
 */
router.get('/matched', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skills resume resumeAnalysis');

    // Gather user's skills from profile + resume
    const userSkills = new Set();
    (user.skills || []).forEach(s => {
      if (s.name) userSkills.add(s.name.toLowerCase());
    });
    // Also include resume-parsed skills
    if (user.resume?.parsedData?.skills) {
      user.resume.parsedData.skills.forEach(s => userSkills.add(s.toLowerCase()));
    }
    if (user.resumeAnalysis?.parsedSkills) {
      user.resumeAnalysis.parsedSkills.forEach(s => userSkills.add(s.toLowerCase()));
    }

    // Include skills learned from completed courses (sent from frontend)
    let learnedSkills = [];
    if (req.query.learnedSkills) {
      try {
        learnedSkills = JSON.parse(req.query.learnedSkills);
        learnedSkills.forEach(s => userSkills.add(s.toLowerCase()));
      } catch (e) { /* ignore parse error */ }
    }

    const userSkillsArray = Array.from(userSkills);

    // Get all active jobs
    const jobs = await Job.find({ status: 'active', isActive: true })
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate match score for each job
    const matchedJobs = jobs.map(job => {
      const jobSkills = (job.skills || []).map(s => (s.name || '').toLowerCase());
      const requiredSkills = jobSkills.filter(Boolean);

      if (requiredSkills.length === 0) {
        return { ...job, matchScore: 50, matchingSkills: [], missingSkills: [] };
      }

      const matching = requiredSkills.filter(js => 
        userSkillsArray.some(us => us.includes(js) || js.includes(us))
      );
      const missing = requiredSkills.filter(js => 
        !userSkillsArray.some(us => us.includes(js) || js.includes(us))
      );

      const matchScore = Math.round((matching.length / requiredSkills.length) * 100);

      return {
        ...job,
        matchScore,
        matchingSkills: matching,
        missingSkills: missing
      };
    });

    // Sort by match score descending
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: matchedJobs,
      userSkills: userSkillsArray,
      hasResume: !!(user.resume?.url || user.resume?.filename)
    });
  } catch (error) {
    console.error('Matched jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matched jobs',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/jobs/my/posted
 * @desc    Get jobs posted by recruiter
 * @access  Private (Recruiter)
 */
router.get('/my/posted', protect, authorize('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID with skill gap analysis for logged-in user
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email recruiterProfile');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.analytics.views++;
    await job.save();

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/jobs/:id/skill-gap
 * @desc    Get skill gap analysis for a job
 * @access  Private
 */
router.get('/:id/skill-gap', protect, async (req, res) => {
  try {
    const analysis = await SkillGapService.analyzeGap(req.user.id, req.params.id);

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
 * @route   POST /api/jobs
 * @desc    Create a new job
 * @access  Private (Recruiter)
 */
router.post('/', protect, authorize('recruiter', 'admin'), validateJob, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id,
      company: req.body.company || req.user.recruiterProfile?.company
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job
 * @access  Private (Recruiter who posted)
 */
router.put('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/jobs/:id/apply
 * @desc    Apply for a job
 * @access  Private (Student)
 */
router.post('/:id/apply', protect, authorize('student'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(
      app => app.userId.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Calculate skill gap analysis
    const skillGapAnalysis = await SkillGapService.analyzeGap(req.user.id, req.params.id);

    // Add application
    job.applicants.push({
      userId: req.user.id,
      matchScore: skillGapAnalysis.overallMatchScore,
      skillGapAnalysis: {
        matchingSkills: skillGapAnalysis.matchingSkills.map(s => s.skill),
        missingSkills: skillGapAnalysis.missingSkills.map(s => s.skill),
        overallMatch: skillGapAnalysis.overallMatchScore
      }
    });

    job.analytics.applications++;
    await job.save();

    // Update user's application history
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        applicationHistory: {
          jobId: job._id,
          status: 'applied'
        }
      }
    });

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        matchScore: skillGapAnalysis.overallMatchScore,
        skillGapAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to apply for job',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/jobs/:id/applicants
 * @desc    Get job applicants
 * @access  Private (Recruiter who posted)
 */
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applicants.userId', 'name email studentProfile skills skillReadinessScore resumeData');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Sort applicants by match score
    const sortedApplicants = job.applicants.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: sortedApplicants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applicants',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/jobs/:id/applicants/:applicantId/status
 * @desc    Update applicant status
 * @access  Private (Recruiter)
 */
router.put('/:id/applicants/:applicantId/status', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    applicant.status = status;
    if (feedback) applicant.feedback = feedback;

    // Update analytics
    if (status === 'shortlisted') job.analytics.shortlisted++;
    if (status === 'hired') job.analytics.hired++;

    await job.save();

    // Update user's application status
    await User.updateOne(
      { _id: applicant.userId, 'applicationHistory.jobId': job._id },
      { $set: { 'applicationHistory.$.status': status, 'applicationHistory.$.feedback': feedback } }
    );

    res.json({
      success: true,
      message: 'Applicant status updated',
      data: applicant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

module.exports = router;
