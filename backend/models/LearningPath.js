const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  thumbnail: String,
  
  targetRole: {
    type: String,
    required: true
  },
  
  // Used by seed data
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  duration: {
    weeks: Number,
    hoursPerWeek: Number
  },
  
  skills: [{
    name: String,
    targetLevel: Number
  }],
  
  // Fields used by the learning path service for generated paths
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isPersonalized: {
    type: Boolean,
    default: false
  },
  
  category: String,
  
  totalDuration: {
    type: Number,
    default: 0
  },
  
  totalModules: {
    type: Number,
    default: 0
  },
  
  difficulty: {
    type: mongoose.Schema.Types.Mixed,
    default: 'beginner'
  },
  
  targetSkills: [{
    name: String,
    targetProficiency: String
  }],
  
  skillGapAnalysis: {
    currentSkills: [{
      name: String,
      currentLevel: String
    }],
    missingSkills: [{
      name: String,
      importance: String
    }],
    gapScore: Number
  },
  
  adaptiveRules: [{
    condition: String,
    action: String,
    additionalResources: [{
      title: String,
      type: String
    }]
  }],
  
  successMetrics: {
    enrollments: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  },
  
  stages: [{
    order: Number,
    title: String,
    description: String,
    difficulty: String,
    estimatedDuration: Number,
    duration: Number,
    modules: [{
      order: Number,
      title: String,
      description: String,
      type: {
        type: String,
        enum: ['course', 'assessment', 'project', 'resource']
      },
      referenceId: mongoose.Schema.Types.ObjectId,
      refModel: String,
      duration: Number,
      isOptional: { type: Boolean, default: false },
      isRequired: { type: Boolean, default: true },
      skillsCovered: [{
        name: String,
        proficiencyGain: Number
      }],
      completionCriteria: {
        type: { type: String },
        minimumScore: Number
      }
    }],
    milestone: {
      badge: String,
      skillsUnlocked: [String]
    },
    assessments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    }],
    projects: [{
      title: String,
      description: String,
      skills: [String]
    }]
  }],
  
  enrollments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now },
    progress: {
      currentStage: { type: Number, default: 0 },
      completedModules: [Number],
      percentage: { type: Number, default: 0 }
    },
    completedAt: Date
  }],
  
  stats: {
    totalEnrollments: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    avgCompletionTime: Number,
    rating: { type: Number, default: 0 }
  },
  
  isAdaptive: {
    type: Boolean,
    default: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
