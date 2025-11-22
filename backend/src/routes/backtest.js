const express = require('express');
const { body } = require('express-validator');
const {
  runBacktest,
  getBacktests,
  getBacktest,
  getBacktestStatus,
  deleteBacktest
} = require('../controllers/backtestController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getBacktests)
  .post(
    [
      body('strategyId').notEmpty().withMessage('Strategy ID is required'),
      body('dataSourceId').notEmpty().withMessage('Data source ID is required'),
      body('asset').notEmpty().withMessage('Asset is required')
    ],
    validate,
    runBacktest
  );

router.route('/:id').get(getBacktest).delete(deleteBacktest);

router.route('/:id/status').get(getBacktestStatus);

module.exports = router;
