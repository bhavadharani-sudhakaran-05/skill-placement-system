const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['technical', 'soft', 'domain', 'tools'],
    required: true
  },
  subcategory: String,
  description: String,
  
  // Skill metadata
  demandLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  growthTrend: {
    type: String,
    enum: ['rising', 'stable', 'declining'],
    default: 'stable'
  },
  
  // Related entities
  relatedSkills: [{
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    relevance: { type: Number, min: 0, max: 100 }
  }],
  
  relatedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  
  relatedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Assessment info
  assessmentAvailable: {
    type: Boolean,
    default: false
  },
  
  // Industry relevance
  industries: [String],
  
  // Skill levels definition
  levels: {
    beginner: {
      minScore: { type: Number, default: 0 },
      maxScore: { type: Number, default: 30 },
      description: String
    },
    intermediate: {
      minScore: { type: Number, default: 31 },
      maxScore: { type: Number, default: 70 },
      description: String
    },
    advanced: {
      minScore: { type: Number, default: 71 },
      maxScore: { type: Number, default: 90 },
      description: String
    },
    expert: {
      minScore: { type: Number, default: 91 },
      maxScore: { type: Number, default: 100 },
      description: String
    }
  },
  
  // Statistics
  stats: {
    totalUsers: { type: Number, default: 0 },
    avgProficiency: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 }
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
skillSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
