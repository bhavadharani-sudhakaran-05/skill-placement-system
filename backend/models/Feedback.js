const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['recommendation', 'course', 'job', 'assessment', 'system'],
    required: true
  },
  
  referenceId: mongoose.Schema.Types.ObjectId,
  referenceModel: String,
  
  action: {
    type: String,
    enum: ['clicked', 'viewed', 'saved', 'applied', 'enrolled', 'completed', 'dismissed', 'rated'],
    required: true
  },
  
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  relevanceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  comment: String,
  
  context: {
    source: String,
    sessionId: String,
    recommendationScore: Number
  },
  
  metadata: {
    timeSpent: Number,
    position: Number,
    device: String,
    location: String
  }
}, {
  timestamps: true
});

// Index for analytics
feedbackSchema.index({ user: 1, type: 1, createdAt: -1 });
feedbackSchema.index({ referenceId: 1, action: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
