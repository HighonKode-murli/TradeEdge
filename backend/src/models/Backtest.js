const mongoose = require('mongoose');

const backtestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    required: true
  },
  
  // Input parameters
  asset: {
    type: String,
    required: true
  },
  dataSourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HistoricalData',
    required: true
  },
  startDate: Date,
  endDate: Date,
  initialCapital: {
    type: Number,
    default: 10000
  },
  commission: {
    type: Number,
    default: 0.001
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed'],
    default: 'queued',
    index: true
  },
  
  // Results
  results: {
    finalEquity: Number,
    totalReturn: Number,
    totalReturnPct: Number,
    sharpeRatio: Number,
    sortinoRatio: Number,
    maxDrawdown: Number,
    maxDrawdownPct: Number,
    winRate: Number,
    totalTrades: Number,
    winningTrades: Number,
    losingTrades: Number,
    profitFactor: Number,
    avgWin: Number,
    avgLoss: Number,
    largestWin: Number,
    largestLoss: Number,
    avgTradeDuration: Number,
    
    equityCurve: [{
      date: Date,
      value: Number
    }],
    
    drawdownCurve: [{
      date: Date,
      value: Number
    }],
    
    trades: [{
      entryDate: Date,
      exitDate: Date,
      entryPrice: Number,
      exitPrice: Number,
      size: Number,
      pnl: Number,
      pnlPct: Number,
      type: {
        type: String,
        enum: ['long', 'short']
      },
      duration: Number
    }]
  },
  
  errorMessage: String,
  executionTime: Number,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Indexes for querying
backtestSchema.index({ userId: 1, createdAt: -1 });
backtestSchema.index({ strategyId: 1 });
backtestSchema.index({ status: 1 });

module.exports = mongoose.model('Backtest', backtestSchema);
