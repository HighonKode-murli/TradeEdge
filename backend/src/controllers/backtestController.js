const Backtest = require('../models/Backtest.js');
const Strategy = require('../models/Strategy.js');
const HistoricalData = require('../models/HistoricalData.js');
const backtestService = require('../services/backtestService.js');

// @desc    Submit backtest job
// @route   POST /api/backtests
// @access  Private
exports.runBacktest = async (req, res) => {
  try {
    const { strategyId, dataSourceId, asset, initialCapital, commission } = req.body;

    // Verify strategy
    const strategy = await Strategy.findById(strategyId);
    if (!strategy || strategy.userId.toString() !== req.user.id) {
      return res.status(404).json({ 
        success: false, 
        error: 'Strategy not found' 
      });
    }

    // Verify data source
    const dataSource = await HistoricalData.findById(dataSourceId);
    if (!dataSource || dataSource.userId.toString() !== req.user.id) {
      return res.status(404).json({ 
        success: false, 
        error: 'Data source not found' 
      });
    }

    // Create backtest record
    const backtest = await Backtest.create({
      userId: req.user.id,
      strategyId,
      dataSourceId,
      asset,
      initialCapital: initialCapital || 10000,
      commission: commission || 0.001,
      startDate: dataSource.startDate,
      endDate: dataSource.endDate,
      status: 'queued'
    });

    // Update strategy backtest count
    strategy.backtestCount += 1;
    await strategy.save();

    // Process backtest asynchronously
    backtestService.processBacktest(
      backtest._id,
      strategy.generatedCode,
      dataSource.filePath,
      {
        initialCapital: backtest.initialCapital,
        commission: backtest.commission
      }
    ).catch(err => {
      // Error already logged and backtest status updated in service
      console.error('Backtest processing error:', err.message);
    });

    res.status(201).json({ success: true, data: backtest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all user backtests
// @route   GET /api/backtests
// @access  Private
exports.getBacktests = async (req, res) => {
  try {
    const backtests = await Backtest.find({ userId: req.user.id })
      .populate('strategyId', 'name')
      .populate('dataSourceId', 'asset filename')
      .sort({ createdAt: -1 });

    
    res.status(200).json({ 
      success: true, 
      count: backtests.length, 
      data: backtests 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single backtest
// @route   GET /api/backtests/:id
// @access  Private
exports.getBacktest = async (req, res) => {
  try {
    const backtest = await Backtest.findById(req.params.id)
      .populate('strategyId', 'name description')
      .populate('dataSourceId', 'asset filename');

    if (!backtest) {
      return res.status(404).json({ 
        success: false, 
        error: 'Backtest not found' 
      });
    }

    if (backtest.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    res.status(200).json({ success: true, data: backtest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get backtest status
// @route   GET /api/backtests/:id/status
// @access  Private
exports.getBacktestStatus = async (req, res) => {
  try {
    const backtest = await Backtest.findById(req.params.id)
      .select('status completedAt errorMessage');

    if (!backtest) {
      return res.status(404).json({ 
        success: false, 
        error: 'Backtest not found' 
      });
    }

    res.status(200).json({ success: true, data: backtest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete backtest
// @route   DELETE /api/backtests/:id
// @access  Private
exports.deleteBacktest = async (req, res) => {
  try {
    const backtest = await Backtest.findById(req.params.id);

    if (!backtest) {
      return res.status(404).json({ 
        success: false, 
        error: 'Backtest not found' 
      });
    }

    if (backtest.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    await backtest.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
