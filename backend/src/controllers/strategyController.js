const Strategy = require('../models/Strategy');
const strategyParser = require('../services/strategyParser');

// @desc    Create new strategy
// @route   POST /api/strategies
// @access  Private
exports.createStrategy = async (req, res) => {
  try {
    const { name, description, indicators, rules, timeframe } = req.body;

    // Validate
    if (!indicators || indicators.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one indicator is required' 
      });
    }

    if (!rules || !rules.entry || rules.entry.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one entry rule is required' 
      });
    }

    // Transform indicators: ensure both 'name' and 'type' fields exist
    const transformedIndicators = indicators.map(ind => ({
      name: ind.type || ind.name,
      type: ind.type || ind.name,
      params: ind.params
    }));

    // Generate Python code from indicators and rules
    const generatedCode = strategyParser.parseToCode({ 
      indicators: transformedIndicators, 
      rules, 
      timeframe 
    });

    // Create strategy
    const strategy = await Strategy.create({
      userId: req.user.id,
      name,
      description,
      indicators: transformedIndicators,
      rules,
      timeframe,
      generatedCode
    });

    res.status(201).json({ success: true, data: strategy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all user strategies
// @route   GET /api/strategies
// @access  Private
exports.getStrategies = async (req, res) => {
  try {
    const strategies = await Strategy.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: strategies.length, 
      data: strategies 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single strategy
// @route   GET /api/strategies/:id
// @access  Private
exports.getStrategy = async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);

    if (!strategy) {
      return res.status(404).json({ 
        success: false, 
        error: 'Strategy not found' 
      });
    }

    // Check ownership
    if (strategy.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    res.status(200).json({ success: true, data: strategy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update strategy
// @route   PUT /api/strategies/:id
// @access  Private
exports.updateStrategy = async (req, res) => {
  try {
    let strategy = await Strategy.findById(req.params.id);

    if (!strategy) {
      return res.status(404).json({ 
        success: false, 
        error: 'Strategy not found' 
      });
    }

    // Check ownership
    if (strategy.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    // If indicators or rules updated, regenerate code
    if (req.body.indicators || req.body.rules || req.body.timeframe) {
      const indicators = req.body.indicators || strategy.indicators;
      const rules = req.body.rules || strategy.rules;
      const timeframe = req.body.timeframe || strategy.timeframe;

      req.body.generatedCode = strategyParser.parseToCode({ 
        indicators, 
        rules, 
        timeframe 
      });
    }

    strategy = await Strategy.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: strategy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete strategy
// @route   DELETE /api/strategies/:id
// @access  Private
exports.deleteStrategy = async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);

    if (!strategy) {
      return res.status(404).json({ 
        success: false, 
        error: 'Strategy not found' 
      });
    }

    // Check ownership
    if (strategy.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    await strategy.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
