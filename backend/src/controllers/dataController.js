const HistoricalData = require('../models/HistoricalData');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

// @desc    Upload historical data
// @route   POST /api/data/upload
// @access  Private
exports.uploadData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please upload a CSV file' 
      });
    }

    const { asset } = req.body;
    
    if (!asset) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        error: 'Asset name is required' 
      });
    }

    const filePath = req.file.path;
    
    // Parse CSV
    const rows = [];
    const columns = [];
    let startDate, endDate;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('headers', (headers) => {
        columns.push(...headers);
      })
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', async () => {
        try {
          // Validate required columns
          const requiredColumns = ['Date', 'Open', 'High', 'Low', 'Close'];
          const hasRequired = requiredColumns.every(col => columns.includes(col));

          if (!hasRequired) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ 
              success: false, 
              error: 'CSV must contain Date, Open, High, Low, Close columns' 
            });
          }

          // Extract date range
          if (rows.length > 0) {
            startDate = new Date(rows[0].Date);
            endDate = new Date(rows[rows.length - 1].Date);
          }

          // Save to database
          const historicalData = await HistoricalData.create({
            userId: req.user.id,
            asset,
            filename: req.file.filename,
            filePath,
            columns,
            startDate,
            endDate,
            rowCount: rows.length,
            fileSize: req.file.size
          });

          res.status(201).json({ success: true, data: historicalData });
        } catch (error) {
          fs.unlinkSync(filePath);
          res.status(500).json({ success: false, error: error.message });
        }
      })
      .on('error', (error) => {
        fs.unlinkSync(filePath);
        res.status(500).json({ success: false, error: error.message });
      });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all uploaded datasets
// @route   GET /api/data
// @access  Private
exports.getDatasets = async (req, res) => {
  try {
    const datasets = await HistoricalData.find({ userId: req.user.id })
      .sort({ uploadedAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: datasets.length, 
      data: datasets 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single dataset
// @route   GET /api/data/:id
// @access  Private
exports.getDataset = async (req, res) => {
  try {
    const dataset = await HistoricalData.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ 
        success: false, 
        error: 'Dataset not found' 
      });
    }

    if (dataset.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    // Read sample data from CSV file
    const sampleData = [];
    let rowCount = 0;
    const maxRows = 10; // Get first 10 rows

    if (fs.existsSync(dataset.filePath)) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(dataset.filePath)
          .pipe(csvParser())
          .on('data', (row) => {
            if (rowCount < maxRows) {
              sampleData.push(row);
              rowCount++;
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    const datasetWithSample = dataset.toObject();
    datasetWithSample.sampleData = sampleData;

    res.status(200).json({ success: true, data: datasetWithSample });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete dataset
// @route   DELETE /api/data/:id
// @access  Private
exports.deleteDataset = async (req, res) => {
  try {
    const dataset = await HistoricalData.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ 
        success: false, 
        error: 'Dataset not found' 
      });
    }

    if (dataset.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    // Delete file
    if (fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }

    await dataset.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
