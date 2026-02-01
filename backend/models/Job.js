const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    name: { type: String, required: true },
    logo: String,
    website: String,
    size: String,
    industry: String
  },
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    remote: { type: Boolean, default: false }
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  mode: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'hybrid'
  },
  
  description: {
    type: String,
    required: true
  },
  responsibilities: [String],
  requirements: [String],
  benefits: [String],
  
  // Skills required
  skills: [{
    name: String,
    importance: {
      type: String,
      enum: ['required', 'preferred', 'nice-to-have'],
      default: 'required'
    },
    minLevel: { type: Number, min: 0, max: 100, default: 50 }
  }],
  
  experience: {
    min: { type: Number, default: 0 },
    max: Number
  },
  
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' },
    period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' }
  },
  
  education: {
    degree: String,
    field: String
  },
  
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'pending'
    },
    matchScore: Number,
    coverLetter: String,
    resume: String
  }],
  
  deadline: Date,
  
  status: {
    type: String,
    enum: ['active', 'closed', 'draft', 'expired'],
    default: 'active'
  },
  
  views: { type: Number, default: 0 },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
jobSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });

module.exports = mongoose.model('Job', jobSchema);
