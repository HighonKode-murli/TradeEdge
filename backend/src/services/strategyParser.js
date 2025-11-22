/**
 * Parse form-based strategy configuration to Python backtesting code using TA library
 */
exports.parseToCode = ({ indicators, rules, timeframe }) => {
  let code = `from backtesting import Strategy
from backtesting.lib import crossover
import pandas as pd
from ta.momentum import RSIIndicator, StochasticOscillator
from ta.trend import MACD, EMAIndicator, SMAIndicator, ADXIndicator
from ta.volatility import BollingerBands, AverageTrueRange

class CustomStrategy(Strategy):
    def init(self):
        # Create DataFrame for indicators
        close = pd.Series(self.data.Close, index=self.data.index)
        high = pd.Series(self.data.High, index=self.data.index)
        low = pd.Series(self.data.Low, index=self.data.index)
        
`;

  // Track initialized indicators
  const indicatorVars = {};

  // Add indicator initialization
  indicators.forEach((indicator, index) => {
    const indicatorType = indicator.type || indicator.name;
    const varName = `${indicatorType.toLowerCase()}_${index}`;
    indicatorVars[`${indicatorType}_${index}`] = varName;

    switch (indicatorType) {
      case 'RSI':
        const rsiPeriod = indicator.params?.period || 14;
        code += `        # RSI Indicator\n`;
        code += `        rsi_ind_${index} = RSIIndicator(close=close, window=${rsiPeriod})\n`;
        code += `        self.${varName} = self.I(lambda: rsi_ind_${index}.rsi().values)\n\n`;
        break;

      case 'MACD':
        const fast = indicator.params?.fast || 12;
        const slow = indicator.params?.slow || 26;
        const signal = indicator.params?.signal || 9;
        code += `        # MACD Indicator\n`;
        code += `        macd_ind_${index} = MACD(close=close, window_slow=${slow}, window_fast=${fast}, window_sign=${signal})\n`;
        code += `        self.${varName} = self.I(lambda: macd_ind_${index}.macd().values)\n`;
        code += `        self.${varName}_signal = self.I(lambda: macd_ind_${index}.macd_signal().values)\n`;
        code += `        self.${varName}_diff = self.I(lambda: macd_ind_${index}.macd_diff().values)\n\n`;
        break;

      case 'EMA':
        const emaPeriod = indicator.params?.period || 20;
        code += `        # EMA Indicator\n`;
        code += `        ema_ind_${index} = EMAIndicator(close=close, window=${emaPeriod})\n`;
        code += `        self.${varName} = self.I(lambda: ema_ind_${index}.ema_indicator().values)\n\n`;
        break;

      case 'SMA':
        const smaPeriod = indicator.params?.period || 50;
        code += `        # SMA Indicator\n`;
        code += `        sma_ind_${index} = SMAIndicator(close=close, window=${smaPeriod})\n`;
        code += `        self.${varName} = self.I(lambda: sma_ind_${index}.sma_indicator().values)\n\n`;
        break;

      case 'BB':
        const bbPeriod = indicator.params?.period || 20;
        const bbStd = indicator.params?.std || 2;
        code += `        # Bollinger Bands\n`;
        code += `        bb_ind_${index} = BollingerBands(close=close, window=${bbPeriod}, window_dev=${bbStd})\n`;
        code += `        self.${varName}_upper = self.I(lambda: bb_ind_${index}.bollinger_hband().values)\n`;
        code += `        self.${varName}_middle = self.I(lambda: bb_ind_${index}.bollinger_mavg().values)\n`;
        code += `        self.${varName}_lower = self.I(lambda: bb_ind_${index}.bollinger_lband().values)\n\n`;
        break;

      case 'STOCH':
        const stochK = indicator.params?.k_period || 14;
        const stochD = indicator.params?.d_period || 3;
        code += `        # Stochastic Oscillator\n`;
        code += `        stoch_ind_${index} = StochasticOscillator(high=high, low=low, close=close, window=${stochK}, smooth_window=${stochD})\n`;
        code += `        self.${varName}_k = self.I(lambda: stoch_ind_${index}.stoch().values)\n`;
        code += `        self.${varName}_d = self.I(lambda: stoch_ind_${index}.stoch_signal().values)\n\n`;
        break;

      case 'ADX':
        const adxPeriod = indicator.params?.period || 14;
        code += `        # ADX Indicator\n`;
        code += `        adx_ind_${index} = ADXIndicator(high=high, low=low, close=close, window=${adxPeriod})\n`;
        code += `        self.${varName} = self.I(lambda: adx_ind_${index}.adx().values)\n\n`;
        break;

      case 'ATR':
        const atrPeriod = indicator.params?.period || 14;
        code += `        # ATR Indicator\n`;
        code += `        atr_ind_${index} = AverageTrueRange(high=high, low=low, close=close, window=${atrPeriod})\n`;
        code += `        self.${varName} = self.I(lambda: atr_ind_${index}.average_true_range().values)\n\n`;
        break;
    }
  });

  code += `    def next(self):\n`;

  // Build entry conditions
  if (rules.entry && rules.entry.length > 0) {
    code += `        # Entry conditions\n`;
    const entryConditions = rules.entry.map((rule, idx) => {
      return generateCondition(rule, indicators, idx);
    }).join(' and \\\n           ');
    
    code += `        if ${entryConditions}:\n`;
    code += `            if not self.position:\n`;
    code += `                self.buy()\n\n`;
  }

  // Build exit conditions
  if (rules.exit && rules.exit.length > 0) {
    code += `        # Exit conditions\n`;
    const exitConditions = rules.exit.map((rule, idx) => {
      return generateCondition(rule, indicators, idx);
    }).join(' and \\\n           ');
    
    code += `        if ${exitConditions}:\n`;
    code += `            if self.position:\n`;
    code += `                self.position.close()\n`;
  }

  return code;
};

/**
 * Generate Python condition from rule
 */
function generateCondition(rule, indicators, ruleIndex) {
  const { indicator, condition, value, compareIndicator } = rule;
  
  // Helper to get indicator reference
  const getIndicatorRef = (indName) => {
    if (indName === 'close' || indName === 'Close') return 'self.data.Close[-1]';
    if (indName === 'open' || indName === 'Open') return 'self.data.Open[-1]';
    if (indName === 'high' || indName === 'High') return 'self.data.High[-1]';
    if (indName === 'low' || indName === 'Low') return 'self.data.Low[-1]';
    
    // Find matching indicator by type or name
    const indIndex = indicators.findIndex(ind => (ind.type || ind.name) === indName);
    if (indIndex !== -1) {
      return `self.${indName.toLowerCase()}_${indIndex}[-1]`;
    }
    return indName;
  };

  const ind = getIndicatorRef(indicator);
  const compareValue = compareIndicator ? getIndicatorRef(compareIndicator) : value;

  // Generate condition based on type
  switch (condition) {
    case 'greater_than':
    case '>':
      return `${ind} > ${compareValue}`;
    
    case 'less_than':
    case '<':
      return `${ind} < ${compareValue}`;
    
    case 'equals':
    case '==':
      return `${ind} == ${compareValue}`;
    
    case 'greater_than_or_equal':
    case '>=':
      return `${ind} >= ${compareValue}`;
    
    case 'less_than_or_equal':
    case '<=':
      return `${ind} <= ${compareValue}`;
    
    case 'crosses_above':
      return `crossover(${ind}, ${compareValue})`;
    
    case 'crosses_below':
      return `crossover(${compareValue}, ${ind})`;
    
    default:
      return `${ind} ${condition} ${compareValue}`;
  }
}

/**
 * Validate strategy configuration
 */
exports.validateStrategy = (indicators, rules) => {
  const errors = [];

  if (!indicators || indicators.length === 0) {
    errors.push('At least one indicator is required');
  }

  if (!rules || !rules.entry || rules.entry.length === 0) {
    errors.push('At least one entry rule is required');
  }

  // Validate indicator configurations
  indicators.forEach((ind, index) => {
    if (!ind.name) {
      errors.push(`Indicator at index ${index} must have a name`);
    }
  });

  // Validate rules
  if (rules.entry) {
    rules.entry.forEach((rule, index) => {
      if (!rule.indicator || !rule.condition) {
        errors.push(`Entry rule at index ${index} must have indicator and condition`);
      }
    });
  }

  return errors;
};
