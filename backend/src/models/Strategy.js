const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add a strategy name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Indicators configuration
  indicators: [{
    name: {
      type: String,
      enum: ['RSI', 'MACD', 'EMA', 'SMA', 'BB', 'STOCH', 'ADX', 'ATR'],
      required: true
    },
    type: {
      type: String,
      enum: ['RSI', 'MACD', 'EMA', 'SMA', 'BB', 'STOCH', 'ADX', 'ATR']
    },
    params: mongoose.Schema.Types.Mixed
  }],
  
  // Trading rules
  rules: {
    entry: [{
      indicator: String,
      condition: String,
      value: mongoose.Schema.Types.Mixed,
      compareIndicator: String
    }],
    exit: [{
      indicator: String,
      condition: String,
      value: mongoose.Schema.Types.Mixed,
      compareIndicator: String
    }]
  },
  
  timeframe: {
    type: String,
    enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
    default: '1d'
  },
  
  // Generated Python code
  generatedCode: {
    type: String,
    required: true
  },
  
  // Metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  
  backtestCount: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
strategySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
strategySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Strategy', strategySchema);
