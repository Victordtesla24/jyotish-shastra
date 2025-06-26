const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
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
  analysisType: {
    type: String,
    required: true,
    enum: ['comprehensive', 'lagna', 'planetary', 'houses', 'aspects', 'yogas', 'dasha', 'navamsa', 'arudha', 'transits']
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  processingTime: {
    type: Number // in milliseconds
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  metadata: {
    calculationMethod: String,
    dataSource: String,
    parameters: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
analysisSchema.index({ chartId: 1, analysisType: 1 });
analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
