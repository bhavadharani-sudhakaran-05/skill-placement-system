const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'college_admin', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  },
  
  // Student-specific fields
  profile: {
    title: String,
    bio: String,
    website: String,
    github: String,
    linkedin: String,
    twitter: String
  },
  
  education: [{
    degree: String,
    institution: String,
    year: String,
    gpa: String
  }],
  
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  
  skills: [{
    name: String,
    level: { type: Number, min: 0, max: 100 },
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    category: {
      type: String,
      enum: ['technical', 'soft', 'domain', 'tools']
    }
  }],
  
  resume: {
    url: String,
    filename: String,
    uploadedAt: Date,
    atsScore: Number,
    parsedData: {
      skills: [String],
      experience: String,
      education: String
    }
  },

  // Detailed resume analysis from AI parser
  resumeAnalysis: {
    parsedSkills: [String],
    parsedProjects: [mongoose.Schema.Types.Mixed],
    parsedCertifications: [mongoose.Schema.Types.Mixed],
    parsedEducation: [mongoose.Schema.Types.Mixed],
    parsedExperience: [mongoose.Schema.Types.Mixed],
    atsScore: Number,
    improvementSuggestions: [mongoose.Schema.Types.Mixed],
    analyzedAt: Date
  },
  
  preferences: {
    jobTypes: [String],
    locations: [String],
    salaryExpectation: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' }
    },
    remote: { type: Boolean, default: true }
  },
  
  // Recruiter-specific fields
  company: {
    name: String,
    website: String,
    size: String,
    industry: String,
    description: String,
    logo: String
  },
  
  // College Admin fields
  college: {
    name: String,
    location: String,
    website: String,
    placementCell: String
  },
  
  // Metrics
  metrics: {
    skillReadinessScore: { type: Number, default: 0 },
    profileCompleteness: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    assessmentsTaken: { type: Number, default: 0 },
    jobsApplied: { type: Number, default: 0 }
  },
  
  // Assessment history
  assessmentHistory: [{
    title: String,
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    timeTaken: String,
    badge: String,
    status: {
      type: String,
      enum: ['completed', 'terminated', 'in-progress'],
      default: 'completed'
    },
    terminationReason: String,
    takenAt: { type: Date, default: Date.now },
    skillsAssessed: [String]
  }],
  
  // Badges earned from assessments
  badges: [{
    name: String,
    earnedFor: String,
    earnedAt: { type: Date, default: Date.now },
    score: Number
  }],

  // Course progress stored by frontend courseId (numeric)
  courseProgress: [{
    courseId: { type: Number, required: true },
    courseTitle: String,
    progress: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['enrolled', 'in-progress', 'completed', 'not-started'],
      default: 'enrolled'
    },
    videosWatched: [Number],
    completedWeeks: [Number],
    enrolledAt: Date,
    startedAt: Date,
    completedAt: Date,
    updatedAt: Date
  }],
  
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  
  savedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Active learning path
  activeLearningPath: {
    pathId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningPath'
    },
    startedAt: Date,
    currentStage: { type: Number, default: 0 },
    completedModules: [String],
    estimatedCompletionDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active'
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date,
  
  refreshToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Alias for matchPassword (backward compatibility)
userSchema.methods.matchPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
  let score = 0;
  const fields = [
    { check: this.name, weight: 10 },
    { check: this.email, weight: 10 },
    { check: this.phone, weight: 5 },
    { check: this.profile?.bio, weight: 10 },
    { check: this.education?.length > 0, weight: 15 },
    { check: this.experience?.length > 0, weight: 15 },
    { check: this.skills?.length > 0, weight: 15 },
    { check: this.resume?.url, weight: 10 },
    { check: this.profile?.linkedin, weight: 5 },
    { check: this.profile?.github, weight: 5 }
  ];
  
  fields.forEach(field => {
    if (field.check) score += field.weight;
  });
  
  return score;
};

module.exports = mongoose.model('User', userSchema);
