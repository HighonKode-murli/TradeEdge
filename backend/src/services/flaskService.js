const axios = require('axios');
const fs = require('fs');
const logger = require('../config/logger');

const FLASK_API_URL = process.env.FLASK_API_URL;

/**
 * Run backtest via Flask API
 */
exports.runBacktest = async (strategyCode, dataPath, params) => {
  try {
    logger.info('Starting backtest via Flask API');

    // Read CSV file
    const csvData = fs.readFileSync(dataPath, 'utf-8');
    
    // Encode data
    const strategyCodeB64 = Buffer.from(strategyCode).toString('base64');
    const csvDataB64 = Buffer.from(csvData).toString('base64');

    // Call Flask API
    const response = await axios.post(`${FLASK_API_URL}/backtest`, {
      strategyCode: strategyCodeB64,
      csvData: csvDataB64,
      initialCapital: params.initialCapital || 10000,
      commission: params.commission || 0.001
    }, {
      timeout: 300000, // 5 minutes timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info('Backtest completed successfully via Flask API');
    return response.data;

  } catch (error) {
    if (error.response) {
      // Flask API returned an error
      logger.error(`Flask API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      throw new Error(error.response.data.error || 'Backtest failed');
    } else if (error.request) {
      // No response received
      logger.error('Flask API not responding');
      throw new Error('Backtest engine is not available. Please ensure the Python Flask API is running.');
    } else {
      // Other error
      logger.error(`Flask Service Error: ${error.message}`);
      throw error;
    }
  }
};

/**
 * Check if Flask API is available
 */
exports.checkFlaskAPI = async () => {
  try {
    const response = await axios.get(`${FLASK_API_URL}/health`, { timeout: 5000 });
    return response.status === 200 && response.data.status === 'healthy';
  } catch (error) {
    logger.error('Flask API health check failed');
    return false;
  }
};

module.exports = exports;
