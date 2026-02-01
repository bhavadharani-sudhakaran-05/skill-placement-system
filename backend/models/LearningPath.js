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
  
  stages: [{
    order: Number,
    title: String,
    description: String,
    duration: Number,
    modules: [{
      title: String,
      type: {
        type: String,
        enum: ['course', 'assessment', 'project', 'resource']
      },
      referenceId: mongoose.Schema.Types.ObjectId,
      refModel: String,
      duration: Number,
      isRequired: { type: Boolean, default: true }
    }],
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
