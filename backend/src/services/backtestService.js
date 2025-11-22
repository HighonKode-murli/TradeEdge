const flaskService = require('./flaskService');
const Backtest = require('../models/Backtest');
const logger = require('../config/logger');

/**
 * Process a backtest job
 */
exports.processBacktest = async (backtestId, strategyCode, dataPath, params) => {
  try {
    logger.info(`Processing backtest: ${backtestId}`);

    // Update status to running
    await Backtest.findByIdAndUpdate(backtestId, { status: 'running' });

    const startTime = Date.now();

    // Run backtest via Flask API
    const results = await flaskService.runBacktest(strategyCode, dataPath, params);

    const executionTime = Date.now() - startTime;

    // Save results
    await Backtest.findByIdAndUpdate(backtestId, {
      status: 'completed',
      results: results,
      executionTime,
      completedAt: new Date()
    });

    logger.info(`Backtest ${backtestId} completed in ${executionTime}ms`);

    return { success: true, backtestId };

  } catch (error) {
    logger.error(`Backtest ${backtestId} failed: ${error.message}`);

    await Backtest.findByIdAndUpdate(backtestId, {
      status: 'failed',
      errorMessage: error.message
    });

    throw error;
  }
};

module.exports = exports;
