const mongoose = require('mongoose');

const reportSectionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['personality', 'health', 'career', 'financial', 'relationship', 'life_predictions', 'dasha_analysis', 'yoga_analysis']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  insights: [{
    category: String,
    description: String,
    significance: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    timeframe: String,
    recommendations: [String]
  }],
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  warnings: [String],
  opportunities: [String]
}, { _id: false });

const predictionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['career', 'health', 'relationship', 'financial', 'spiritual', 'general']
  },
  timeframe: {
    start: Date,
    end: Date,
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'dasha_period']
    }
  },
  prediction: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  planetary_influences: [{
    planet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    influence: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    description: String
  }],
  remedies: [{
    type: {
      type: String,
      enum: ['gemstone', 'mantra', 'ritual', 'charity', 'lifestyle', 'yantra']
    },
    description: String,
    duration: String,
    instructions: String
  }]
}, { _id: false });

const qualityMetricsSchema = new mongoose.Schema({
  completeness: {
    type: Number,
    min: 0,
    max: 100
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100
  },
  consistency: {
    type: Number,
    min: 0,
    max: 100
  },
  contradictions: [{
    description: String,
    severity: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    resolution: String
  }],
  missing_elements: [String],
  overall_score: {
    type: Number,
    min: 0,
    max: 100
  }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  chartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chart',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['comprehensive', 'basic', 'focused', 'compatibility', 'transit', 'dasha', 'yearly', 'custom']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    maxlength: 1000
  },
  sections: [reportSectionSchema],
  predictions: [predictionSchema],
  keyHighlights: [{
    category: String,
    highlight: String,
    significance: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low']
    }
  }],
  remedies: [{
    category: {
      type: String,
      enum: ['general', 'health', 'career', 'relationship', 'financial', 'spiritual']
    },
    type: {
      type: String,
      enum: ['gemstone', 'mantra', 'ritual', 'charity', 'lifestyle', 'yantra', 'fasting', 'donation']
    },
    description: String,
    instructions: String,
    duration: String,
    planet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  qualityMetrics: qualityMetricsSchema,
  analysisData: {
    lagnaAnalysis: {
      strength: Number,
      characteristics: [String],
      lordAnalysis: String
    },
    planetaryAnalysis: [{
      planet: String,
      strength: Number,
      position: String,
      effects: [String],
      periods: [String]
    }],
    houseAnalysis: [{
      house: Number,
      strength: Number,
      signification: String,
      effects: [String]
    }],
    yogaAnalysis: [{
      name: String,
      type: String,
      strength: Number,
      effects: [String],
      timing: String
    }],
    dashaAnalysis: {
      currentMahadasha: {
        planet: String,
        effects: [String],
        duration: String,
        recommendations: [String]
      },
      upcomingPeriods: [{
        planet: String,
        startDate: Date,
        endDate: Date,
        predictions: [String]
      }]
    }
  },
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now
    },
    generationMethod: {
      type: String,
      enum: ['automated', 'manual', 'hybrid'],
      default: 'automated'
    },
    astrologer: {
      name: String,
      certification: String,
      experience: Number
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'sa', 'ta', 'te', 'kn', 'ml', 'gu', 'bn', 'mr']
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    processingTime: Number, // in milliseconds
    dataSource: {
      ephemeris: String,
      calculations: String,
      templates: String
    }
  },
  access: {
    isPublic: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permission: {
        type: String,
        enum: ['read', 'comment'],
        default: 'read'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }],
    downloadCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },
  format: {
    outputFormat: {
      type: String,
      enum: ['html', 'pdf', 'json', 'text'],
      default: 'html'
    },
    template: String,
    styling: {
      theme: String,
      colors: [String],
      fonts: [String]
    },
    includeCharts: {
      type: Boolean,
      default: true
    },
    includeRemedies: {
      type: Boolean,
      default: true
    }
  },
  feedback: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'error', 'archived'],
    default: 'draft'
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ chartId: 1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ 'metadata.generatedAt': -1 });
reportSchema.index({ 'access.isPublic': 1 });
reportSchema.index({ expiresAt: 1 });

// Compound indexes
reportSchema.index({ userId: 1, reportType: 1 });
reportSchema.index({ chartId: 1, reportType: 1 });

// Virtual for report age
reportSchema.virtual('age').get(function() {
  return Date.now() - this.metadata.generatedAt;
});

// Virtual for average rating
reportSchema.virtual('averageRating').get(function() {
  if (!this.feedback || this.feedback.length === 0) return null;

  const sum = this.feedback.reduce((acc, feedback) => acc + feedback.rating, 0);
  return sum / this.feedback.length;
});

// Virtual for word count
reportSchema.virtual('wordCount').get(function() {
  let totalWords = 0;

  if (this.summary) {
    totalWords += this.summary.split(/\s+/).length;
  }

  if (this.sections) {
    this.sections.forEach(section => {
      if (section.content) {
        totalWords += section.content.split(/\s+/).length;
      }
    });
  }

  return totalWords;
});

// Method to add feedback
reportSchema.methods.addFeedback = function(userId, rating, comment, accuracy, helpfulness) {
  this.feedback.push({
    userId,
    rating,
    comment,
    accuracy,
    helpfulness
  });
  return this.save();
};

// Method to increment view count
reportSchema.methods.incrementViewCount = function() {
  this.access.viewCount += 1;
  return this.save();
};

// Method to increment download count
reportSchema.methods.incrementDownloadCount = function() {
  this.access.downloadCount += 1;
  return this.save();
};

// Method to share report
reportSchema.methods.shareWith = function(userId, permission = 'read') {
  const existingShare = this.access.sharedWith.find(
    share => share.userId.toString() === userId.toString()
  );

  if (existingShare) {
    existingShare.permission = permission;
    existingShare.sharedAt = new Date();
  } else {
    this.access.sharedWith.push({
      userId,
      permission,
      sharedAt: new Date()
    });
  }

  return this.save();
};

// Method to get section by type
reportSchema.methods.getSection = function(sectionType) {
  return this.sections.find(section => section.type === sectionType);
};

// Method to get predictions by category
reportSchema.methods.getPredictionsByCategory = function(category) {
  return this.predictions.filter(prediction => prediction.category === category);
};

// Method to get remedies by category
reportSchema.methods.getRemediesByCategory = function(category) {
  return this.remedies.filter(remedy => remedy.category === category);
};

// Method to get high priority remedies
reportSchema.methods.getHighPriorityRemedies = function() {
  return this.remedies.filter(remedy => remedy.priority === 'high');
};

// Method to calculate completion percentage
reportSchema.methods.getCompletionPercentage = function() {
  const requiredSections = ['personality', 'career', 'health', 'relationship', 'financial'];
  const completedSections = this.sections.filter(section =>
    requiredSections.includes(section.type) && section.content && section.content.length > 100
  ).length;

  return (completedSections / requiredSections.length) * 100;
};

// Static method to find reports by date range
reportSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    'metadata.generatedAt': {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Static method to find popular reports
reportSchema.statics.findPopular = function(limit = 10) {
  return this.find({ 'access.isPublic': true })
    .sort({ 'access.viewCount': -1 })
    .limit(limit);
};

// Static method to find highly rated reports
reportSchema.statics.findHighlyRated = function(minRating = 4, limit = 10) {
  return this.aggregate([
    {
      $match: {
        'access.isPublic': true,
        'feedback.0': { $exists: true }
      }
    },
    {
      $addFields: {
        averageRating: { $avg: '$feedback.rating' }
      }
    },
    {
      $match: {
        averageRating: { $gte: minRating }
      }
    },
    {
      $sort: { averageRating: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Pre-save middleware to set expiration
reportSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration based on report type
    const expirationDays = {
      'basic': 30,
      'comprehensive': 365,
      'yearly': 730,
      'custom': 90
    };

    const days = expirationDays[this.reportType] || 90;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  next();
});

// Pre-save middleware to update quality metrics
reportSchema.pre('save', function(next) {
  if (this.isModified('sections') || this.isModified('predictions')) {
    // Calculate quality metrics
    const completeness = this.getCompletionPercentage();

    if (!this.qualityMetrics) {
      this.qualityMetrics = {};
    }

    this.qualityMetrics.completeness = completeness;

    // Production-grade calculation for overall_score
    // This calculation considers completeness, accuracy, consistency, and penalizes for contradictions.
    // Weights can be adjusted based on business logic and importance of each metric.
    const accuracy = this.qualityMetrics.accuracy || 0; // Assume 0 if not set
    const consistency = this.qualityMetrics.consistency || 0; // Assume 0 if not set
    const contradictions = this.qualityMetrics.contradictions || [];

    // Calculate penalty for contradictions (e.g., 10 points per high severity, 5 per medium)
    let contradictionPenalty = 0;
    contradictions.forEach(c => {
      if (c.severity === 'high') contradictionPenalty += 10;
      else if (c.severity === 'medium') contradictionPenalty += 5;
    });

    // Ensure penalty does not make score negative
    contradictionPenalty = Math.min(contradictionPenalty, 50); // Cap penalty at 50 points

    // Weighted average for overall score
    let calculatedOverallScore = (completeness * 0.4) + (accuracy * 0.3) + (consistency * 0.2) - contradictionPenalty;
    this.qualityMetrics.overall_score = Math.max(0, Math.min(100, calculatedOverallScore)); // Ensure score is between 0 and 100
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);
