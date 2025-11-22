const express = require('express');
const { body } = require('express-validator');
const {
  createStrategy,
  getStrategies,
  getStrategy,
  updateStrategy,
  deleteStrategy
} = require('../controllers/strategyController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getStrategies)
  .post(
    [
      body('name').notEmpty().withMessage('Strategy name is required'),
      body('indicators').isArray({ min: 1 }).withMessage('At least one indicator required'),
      body('rules.entry').isArray({ min: 1 }).withMessage('At least one entry rule required')
    ],
    validate,
    createStrategy
  );

router
  .route('/:id')
  .get(getStrategy)
  .put(updateStrategy)
  .delete(deleteStrategy);

module.exports = router;
