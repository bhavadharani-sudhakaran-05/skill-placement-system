const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  thumbnail: String,
  
  provider: {
    name: { type: String, required: true },
    logo: String,
    website: String
  },
  
  instructor: {
    name: String,
    bio: String,
    avatar: String
  },
  
  category: {
    type: String,
    required: true
  },
  subcategory: String,
  tags: [String],
  
  // Skills covered
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  }],
  
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'beginner'
  },
  
  duration: {
    hours: Number,
    weeks: Number
  },
  
  content: {
    modules: [{
      title: String,
      description: String,
      duration: Number,
      lessons: [{
        title: String,
        type: { type: String, enum: ['video', 'article', 'quiz', 'project'] },
        duration: Number
      }]
    }],
    totalModules: Number,
    totalLessons: Number
  },
  
  pricing: {
    isFree: { type: Boolean, default: false },
    price: Number,
    currency: { type: String, default: 'INR' },
    discount: Number
  },
  
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  
  enrollments: {
    total: { type: Number, default: 0 },
    completions: { type: Number, default: 0 }
  },
  
  certificate: {
    available: { type: Boolean, default: true },
    type: String
  },
  
  language: {
    type: String,
    default: 'English'
  },
  
  prerequisites: [String],
  
  externalUrl: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Course', courseSchema);
