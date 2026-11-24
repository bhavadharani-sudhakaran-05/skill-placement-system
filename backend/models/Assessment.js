const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  skillName: String,
  
  category: {
    type: String,
    enum: ['technical', 'soft', 'domain', 'aptitude'],
    default: 'technical'
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  
  duration: {
    type: Number,
    required: true,
    min: 5
  },
  
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['mcq', 'coding', 'short-answer', 'true-false'],
      default: 'mcq'
    },
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    explanation: String,
    points: { type: Number, default: 1 },
    difficulty: String,
    tags: [String]
  }],
  
  totalQuestions: {
    type: Number,
    default: function() {
      return this.questions?.length || 0;
    }
  },
  totalPoints: Number,
  passingScore: {
    type: Number,
    default: 60
  },
  
  attempts: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt: Date,
    completedAt: Date,
    answers: [{
      questionIndex: Number,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      timeTaken: Number
    }],
    score: Number,
    percentage: Number,
    passed: Boolean,
    skillLevelAchieved: Number
  }],
  
  stats: {
    totalAttempts: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 }
  },
  
  certificate: {
    available: { type: Boolean, default: true },
    validityMonths: { type: Number, default: 12 }
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assessment', assessmentSchema);
