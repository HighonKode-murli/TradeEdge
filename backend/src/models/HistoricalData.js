const mongoose = require('mongoose');

const historicalDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  asset: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  columns: [String],
  startDate: Date,
  endDate: Date,
  rowCount: Number,
  fileSize: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for assetName (alias for asset)
historicalDataSchema.virtual('assetName').get(function() {
  return this.asset;
});

// Virtual for createdAt (alias for uploadedAt)
historicalDataSchema.virtual('createdAt').get(function() {
  return this.uploadedAt;
});

// Indexes
historicalDataSchema.index({ userId: 1, uploadedAt: -1 });
historicalDataSchema.index({ asset: 1 });

module.exports = mongoose.model('HistoricalData', historicalDataSchema);
