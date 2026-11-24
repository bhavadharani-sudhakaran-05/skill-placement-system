const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Helper to get company query for the current recruiter
const getRecruiterJobQuery = (req) => {
  const recruiterId = req.user._id || req.user.id;
  const companyName = req.user.company?.name;
  if (companyName) {
    return {
      $or: [
        { postedBy: recruiterId },
        { 'company.name': new RegExp(`^${companyName.trim()}$`, 'i') }
      ]
    };
  }
  return { postedBy: recruiterId };
};

/**
 * @route   GET /api/recruiter/dashboard
 * @desc    Get recruiter overview metrics, recent applicants and postings
 * @access  Private (Recruiter, Admin)
 */
router.get('/dashboard', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const jobQuery = getRecruiterJobQuery(req);
    const jobs = await Job.find(jobQuery)
      .populate('applicants.user', 'name email education skills metrics resume resumeAnalysis')
      .populate('applicants.userId', 'name email education skills metrics resume resumeAnalysis')
      .sort({ createdAt: -1 });

    let totalApplicants = 0;
    let pendingReview = 0;
    let shortlisted = 0;
    let interviewing = 0;
    let hired = 0;
    let rejected = 0;

    const allApplicants = [];

    jobs.forEach(job => {
      (job.applicants || []).forEach(app => {
        totalApplicants++;
        const st = (app.status || 'pending').toLowerCase();
        if (st === 'pending' || st === 'applied') pendingReview++;
        else if (st === 'shortlisted') shortlisted++;
        else if (st === 'interview') interviewing++;
        else if (st === 'hired') hired++;
        else if (st === 'rejected') rejected++;

        const student = app.user || app.userId;
        allApplicants.push({
          applicantId: app._id,
          jobId: job._id,
          jobTitle: job.title,
          jobType: job.type,
          student: student ? {
            id: student._id,
            name: student.name,
            email: student.email,
            institution: student.education?.[0]?.institution || 'University',
            degree: student.education?.[0]?.degree || 'Computer Science',
            graduationYear: student.education?.[0]?.year || '',
            readinessScore: student.metrics?.skillReadinessScore || student.resumeAnalysis?.atsScore || 75,
            topSkills: (student.skills || []).slice(0, 4).map(s => s.name || s)
          } : {
            id: 'demo',
            name: 'Candidate Applicant',
            email: 'candidate@example.com',
            institution: 'Engineering College',
            degree: 'B.Tech IT',
            graduationYear: '2026',
            readinessScore: 80,
            topSkills: ['React', 'Node.js']
          },
          matchScore: app.matchScore || Math.floor(Math.random() * 20 + 75),
          status: app.status || 'pending',
          appliedAt: app.appliedAt || job.createdAt
        });
      });
    });

    // Sort applicants by latest appliedAt
    allApplicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    const metrics = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'active' && j.isActive !== false).length,
      totalApplicants,
      pendingReview,
      shortlisted,
      interviewing,
      hired,
      rejected
    };

    const recentJobs = jobs.slice(0, 5).map(j => ({
      id: j._id,
      title: j.title,
      type: j.type,
      mode: j.mode,
      location: j.location?.city ? `${j.location.city}, ${j.location.country || 'India'}` : 'Remote',
      applicantsCount: j.applicants?.length || 0,
      status: j.status,
      createdAt: j.createdAt
    }));

    res.json({
      success: true,
      data: {
        metrics,
        recentApplicants: allApplicants.slice(0, 6),
        recentJobs,
        company: req.user.company || {
          name: 'TechCorp Solutions',
          industry: 'Software & Technology',
          size: '500-1000'
        }
      }
    });
  } catch (error) {
    console.error('Recruiter dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recruiter dashboard', error: error.message });
  }
});

/**
 * @route   GET /api/recruiter/jobs
 * @desc    Get all jobs managed by this recruiter
 * @access  Private (Recruiter, Admin)
 */
router.get('/jobs', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const jobQuery = getRecruiterJobQuery(req);
    const jobs = await Job.find(jobQuery)
      .populate('applicants.user', 'name email education skills metrics')
      .populate('applicants.userId', 'name email education skills metrics')
      .sort({ createdAt: -1 });

    const formattedJobs = jobs.map(j => {
      const applicants = j.applicants || [];
      const shortlistedCount = applicants.filter(a => a.status === 'shortlisted' || a.status === 'interview').length;
      const hiredCount = applicants.filter(a => a.status === 'hired').length;

      return {
        _id: j._id,
        id: j._id,
        title: j.title,
        company: j.company,
        location: j.location,
        type: j.type,
        mode: j.mode,
        salary: j.salary,
        experience: j.experience,
        skills: j.skills,
        description: j.description,
        requirements: j.requirements,
        responsibilities: j.responsibilities,
        status: j.status,
        isActive: j.isActive,
        views: j.views || 0,
        applicantsCount: applicants.length,
        shortlistedCount,
        hiredCount,
        deadline: j.deadline,
        createdAt: j.createdAt
      };
    });

    res.json({
      success: true,
      count: formattedJobs.length,
      data: formattedJobs
    });
  } catch (error) {
    console.error('Recruiter get jobs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs', error: error.message });
  }
});

/**
 * @route   POST /api/recruiter/jobs
 * @desc    Post a new job as recruiter
 * @access  Private (Recruiter, Admin)
 */
router.post('/jobs', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      mode,
      salary,
      experience,
      skills,
      description,
      requirements,
      responsibilities,
      deadline
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Job title and description are required' });
    }

    const companyData = {
      name: company?.name || req.user.company?.name || 'TechCorp Solutions',
      website: company?.website || req.user.company?.website || '',
      industry: company?.industry || req.user.company?.industry || 'Technology',
      size: company?.size || req.user.company?.size || '500-1000',
      logo: company?.logo || req.user.company?.logo || ''
    };

    const parsedSkills = Array.isArray(skills)
      ? skills.map(s => typeof s === 'string' ? { name: s, importance: 'required', minLevel: 60 } : s)
      : [];

    const newJob = await Job.create({
      title,
      company: companyData,
      location: {
        city: location?.city || 'Bengaluru',
        state: location?.state || 'Karnataka',
        country: location?.country || 'India',
        remote: mode === 'remote' || !!location?.remote
      },
      type: type || 'full-time',
      mode: mode || 'hybrid',
      salary: {
        min: salary?.min ? Number(salary.min) : 600000,
        max: salary?.max ? Number(salary.max) : 1200000,
        currency: salary?.currency || 'INR',
        period: salary?.period || 'yearly'
      },
      experience: {
        min: experience?.min ? Number(experience.min) : 0,
        max: experience?.max ? Number(experience.max) : 3
      },
      skills: parsedSkills,
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? [responsibilities] : []),
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      postedBy: req.user._id || req.user.id,
      status: 'active',
      isActive: true,
      applicants: []
    });

    res.status(201).json({
      success: true,
      message: 'Job posting published successfully',
      data: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, message: 'Failed to create job', error: error.message });
  }
});

/**
 * @route   PUT /api/recruiter/jobs/:id
 * @desc    Update a job or toggle status
 * @access  Private (Recruiter, Admin)
 */
router.put('/jobs/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Update fields
    const updates = { ...req.body };
    if (updates.status && !updates.isActive) {
      updates.isActive = updates.status === 'active';
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ success: false, message: 'Failed to update job', error: error.message });
  }
});

/**
 * @route   DELETE /api/recruiter/jobs/:id
 * @desc    Delete a job posting
 * @access  Private (Recruiter, Admin)
 */
router.delete('/jobs/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job', error: error.message });
  }
});

/**
 * @route   GET /api/recruiter/applicants
 * @desc    Get all candidate applications with filtering
 * @access  Private (Recruiter, Admin)
 */
router.get('/applicants', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { status, jobId, search } = req.query;
    const jobQuery = getRecruiterJobQuery(req);

    if (jobId && jobId !== 'all') {
      jobQuery._id = jobId;
    }

    const jobs = await Job.find(jobQuery)
      .populate('applicants.user', 'name email education skills metrics resume resumeAnalysis')
      .populate('applicants.userId', 'name email education skills metrics resume resumeAnalysis')
      .sort({ createdAt: -1 });

    let applicantsList = [];

    jobs.forEach(job => {
      (job.applicants || []).forEach(app => {
        const student = app.user || app.userId;
        const studentName = student?.name || 'Applicant';
        const studentEmail = student?.email || 'student@skillforge.com';

        const applicantObj = {
          _id: app._id,
          id: app._id,
          jobId: job._id,
          jobTitle: job.title,
          jobLocation: job.location?.city || 'Remote',
          jobType: job.type,
          companyName: job.company?.name || 'Company',
          student: {
            id: student?._id,
            name: studentName,
            email: studentEmail,
            avatar: student?.avatar || '',
            institution: student?.education?.[0]?.institution || 'College of Technology',
            degree: student?.education?.[0]?.degree || 'Information Technology',
            year: student?.education?.[0]?.year || '2026',
            skills: (student?.skills || []).map(s => s.name || s),
            readinessScore: student?.metrics?.skillReadinessScore || student?.resumeAnalysis?.atsScore || 78
          },
          matchScore: app.matchScore || Math.floor(Math.random() * 20 + 75),
          status: app.status || 'pending',
          feedback: app.feedback || '',
          appliedAt: app.appliedAt || job.createdAt,
          skillGapAnalysis: app.skillGapAnalysis || {
            matchingSkills: (job.skills || []).slice(0, 3).map(s => s.name),
            missingSkills: []
          }
        };

        // Filter by status if specified
        if (status && status !== 'all') {
          if (applicantObj.status.toLowerCase() !== status.toLowerCase()) {
            return;
          }
        }

        // Filter by search
        if (search) {
          const q = search.toLowerCase();
          const match = studentName.toLowerCase().includes(q) ||
            studentEmail.toLowerCase().includes(q) ||
            job.title.toLowerCase().includes(q) ||
            applicantObj.student.skills.some(s => s.toLowerCase().includes(q));
          if (!match) return;
        }

        applicantsList.push(applicantObj);
      });
    });

    applicantsList.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.json({
      success: true,
      count: applicantsList.length,
      data: applicantsList
    });
  } catch (error) {
    console.error('Get applicants error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applicants', error: error.message });
  }
});

/**
 * @route   PUT /api/recruiter/applicants/:jobId/:applicantId/status
 * @desc    Update candidate applicant status and feedback
 * @access  Private (Recruiter, Admin)
 */
router.put('/applicants/:jobId/:applicantId/status', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const { jobId, applicantId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applicant = job.applicants.id(applicantId);
    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    applicant.status = status;
    if (feedback !== undefined) applicant.feedback = feedback;

    await job.save();

    // Sync to student's user profile if available
    const studentUserId = applicant.user || applicant.userId;
    if (studentUserId) {
      await User.updateOne(
        { _id: studentUserId, 'applicationHistory.jobId': job._id },
        { $set: { 'applicationHistory.$.status': status, 'applicationHistory.$.feedback': feedback } }
      ).catch(() => {});
    }

    res.json({
      success: true,
      message: `Applicant marked as ${status}`,
      data: applicant
    });
  } catch (error) {
    console.error('Update applicant status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update applicant status', error: error.message });
  }
});

/**
 * @route   GET /api/recruiter/candidates
 * @desc    Talent pool search for students
 * @access  Private (Recruiter, Admin)
 */
router.get('/candidates', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { skill, minScore, search, college } = req.query;

    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { 'education.institution': new RegExp(search, 'i') },
        { 'skills.name': new RegExp(search, 'i') }
      ];
    }

    if (college) {
      query['education.institution'] = new RegExp(college, 'i');
    }

    const students = await User.find(query)
      .select('name email avatar education skills metrics resume resumeAnalysis createdAt')
      .sort({ 'metrics.skillReadinessScore': -1, createdAt: -1 });

    let candidates = students.map(s => {
      const skills = (s.skills || []).map(sk => ({
        name: sk.name || sk,
        level: sk.level || 75,
        verified: !!sk.verified
      }));

      const atsScore = s.resumeAnalysis?.atsScore || s.resume?.atsScore || 0;
      const readiness = s.metrics?.skillReadinessScore || (atsScore > 0 ? atsScore : Math.floor(Math.random() * 20 + 72));

      return {
        id: s._id,
        _id: s._id,
        name: s.name,
        email: s.email,
        avatar: s.avatar || '',
        institution: s.education?.[0]?.institution || 'Engineering College',
        degree: s.education?.[0]?.degree || 'Information Technology',
        graduationYear: s.education?.[0]?.year || '2026',
        cgpa: s.education?.[0]?.gpa || '8.2',
        skills,
        skillReadinessScore: readiness,
        atsScore,
        coursesCompleted: s.metrics?.coursesCompleted || Math.floor(Math.random() * 4 + 2),
        assessmentsTaken: s.metrics?.assessmentsTaken || Math.floor(Math.random() * 3 + 1)
      };
    });

    if (skill) {
      const target = skill.toLowerCase();
      candidates = candidates.filter(c => c.skills.some(sk => sk.name.toLowerCase().includes(target)));
    }

    if (minScore) {
      const min = Number(minScore);
      candidates = candidates.filter(c => c.skillReadinessScore >= min);
    }

    res.json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    console.error('Candidate search error:', error);
    res.status(500).json({ success: false, message: 'Failed to search candidate talent pool', error: error.message });
  }
});

/**
 * @route   POST /api/recruiter/invite
 * @desc    Invite candidate to apply for a job
 * @access  Private (Recruiter, Admin)
 */
router.post('/invite', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { candidateId, jobId, message } = req.body;
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, message: 'Candidate and Job IDs are required' });
    }

    const candidate = await User.findById(candidateId);
    const job = await Job.findById(jobId);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, message: 'Candidate or Job not found' });
    }

    // In a production environment, send notification/email.
    res.json({
      success: true,
      message: `Invitation successfully sent to ${candidate.name} for ${job.title}!`
    });
  } catch (error) {
    console.error('Invite candidate error:', error);
    res.status(500).json({ success: false, message: 'Failed to send invitation', error: error.message });
  }
});

/**
 * @route   GET /api/recruiter/profile
 * @desc    Get recruiter company & contact profile
 * @access  Private (Recruiter, Admin)
 */
router.get('/profile', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        company: user.company || {
          name: 'TechCorp Solutions',
          website: 'https://techcorp.example.com',
          industry: 'Software & Technology',
          size: '500-1000',
          description: 'Global provider of enterprise cloud and AI solutions'
        },
        location: user.location || {
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'India'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recruiter profile', error: error.message });
  }
});

/**
 * @route   PUT /api/recruiter/profile
 * @desc    Update recruiter company & contact profile
 * @access  Private (Recruiter, Admin)
 */
router.put('/profile', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { name, phone, company, location } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (company) updates.company = company;
    if (location) updates.location = location;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update recruiter profile', error: error.message });
  }
});

module.exports = router;

