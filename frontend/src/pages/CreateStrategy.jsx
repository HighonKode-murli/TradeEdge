import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { createStrategy } from '../store/slices/strategySlice'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, Check, Loader } from 'lucide-react'

const AVAILABLE_INDICATORS = [
  { id: 'SMA', name: 'Simple Moving Average', params: [{ name: 'period', type: 'number', default: 20 }] },
  { id: 'EMA', name: 'Exponential Moving Average', params: [{ name: 'period', type: 'number', default: 20 }] },
  { id: 'RSI', name: 'Relative Strength Index', params: [{ name: 'period', type: 'number', default: 14 }] },
  { id: 'MACD', name: 'MACD', params: [
    { name: 'fast', type: 'number', default: 12 },
    { name: 'slow', type: 'number', default: 26 },
    { name: 'signal', type: 'number', default: 9 }
  ]},
  { id: 'BB', name: 'Bollinger Bands', params: [
    { name: 'period', type: 'number', default: 20 },
    { name: 'std', type: 'number', default: 2 }
  ]},
  { id: 'ATR', name: 'Average True Range', params: [{ name: 'period', type: 'number', default: 14 }] },
  { id: 'STOCH', name: 'Stochastic Oscillator', params: [
    { name: 'k_period', type: 'number', default: 14 },
    { name: 'd_period', type: 'number', default: 3 }
  ]},
]

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']

const CONDITION_TYPES = [
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'crosses_above', label: 'Crosses Above' },
  { value: 'crosses_below', label: 'Crosses Below' },
  { value: 'equals', label: 'Equals' },
]

const CreateStrategy = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timeframe: '1d',
    indicators: [],
    entryRules: [{ indicator: '', condition: 'greater_than', value: '', compareIndicator: '' }],
    exitRules: [{ indicator: '', condition: 'less_than', value: '', compareIndicator: '' }],
    entryLogic: 'AND',
    exitLogic: 'AND',
  })

  const steps = [
    { number: 1, name: 'Basic Info' },
    { number: 2, name: 'Indicators' },
    { number: 3, name: 'Entry Rules' },
    { number: 4, name: 'Exit Rules' },
    { number: 5, name: 'Review' },
  ]

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleIndicatorToggle = (indicatorId) => {
    const exists = formData.indicators.find(ind => ind.type === indicatorId)
    if (exists) {
      setFormData({
        ...formData,
        indicators: formData.indicators.filter(ind => ind.type !== indicatorId)
      })
    } else {
      const indicator = AVAILABLE_INDICATORS.find(ind => ind.id === indicatorId)
      const params = {}
      indicator.params.forEach(param => {
        params[param.name] = param.default
      })
      setFormData({
        ...formData,
        indicators: [...formData.indicators, { type: indicatorId, params }]
      })
    }
  }

  const handleIndicatorParamChange = (indicatorType, paramName, value) => {
    setFormData({
      ...formData,
      indicators: formData.indicators.map(ind =>
        ind.type === indicatorType
          ? { ...ind, params: { ...ind.params, [paramName]: parseFloat(value) || value } }
          : ind
      )
    })
  }

  const addRule = (type) => {
    const newRule = { indicator: '', condition: 'greater_than', value: '', compareIndicator: '' }
    if (type === 'entry') {
      setFormData({ ...formData, entryRules: [...formData.entryRules, newRule] })
    } else {
      setFormData({ ...formData, exitRules: [...formData.exitRules, newRule] })
    }
  }

  const removeRule = (type, index) => {
    if (type === 'entry') {
      setFormData({
        ...formData,
        entryRules: formData.entryRules.filter((_, i) => i !== index)
      })
    } else {
      setFormData({
        ...formData,
        exitRules: formData.exitRules.filter((_, i) => i !== index)
      })
    }
  }

  const handleRuleChange = (type, index, field, value) => {
    const rules = type === 'entry' ? [...formData.entryRules] : [...formData.exitRules]
    rules[index][field] = value
    if (type === 'entry') {
      setFormData({ ...formData, entryRules: rules })
    } else {
      setFormData({ ...formData, exitRules: rules })
    }
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('Please enter a strategy name')
          return false
        }
        if (!formData.timeframe) {
          toast.error('Please select a timeframe')
          return false
        }
        return true
      case 2:
        if (formData.indicators.length === 0) {
          toast.error('Please select at least one indicator')
          return false
        }
        return true
      case 3:
        if (formData.entryRules.length === 0) {
          toast.error('Please add at least one entry rule')
          return false
        }
        for (let rule of formData.entryRules) {
          if (!rule.indicator) {
            toast.error('Please select an indicator for all entry rules')
            return false
          }
        }
        return true
      case 4:
        if (formData.exitRules.length === 0) {
          toast.error('Please add at least one exit rule')
          return false
        }
        for (let rule of formData.exitRules) {
          if (!rule.indicator) {
            toast.error('Please select an indicator for all exit rules')
            return false
          }
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setIsSubmitting(true)
    try {
      const strategyData = {
        name: formData.name,
        description: formData.description,
        timeframe: formData.timeframe,
        indicators: formData.indicators,
        rules: {
          entry: formData.entryRules.map(rule => ({
            indicator: rule.indicator,
            condition: rule.condition,
            value: rule.value ? parseFloat(rule.value) : undefined,
            compareIndicator: rule.compareIndicator || undefined,
          })),
          exit: formData.exitRules.map(rule => ({
            indicator: rule.indicator,
            condition: rule.condition,
            value: rule.value ? parseFloat(rule.value) : undefined,
            compareIndicator: rule.compareIndicator || undefined,
          })),
          entryLogic: formData.entryLogic,
          exitLogic: formData.exitLogic,
        }
      }

      await dispatch(createStrategy(strategyData)).unwrap()
      toast.success('Strategy created successfully!')
      navigate('/strategies')
    } catch (error) {
      console.error('Create strategy error:', error)
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to create strategy'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strategy Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="My Trading Strategy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Describe your strategy..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe *
              </label>
              <select
                name="timeframe"
                value={formData.timeframe}
                onChange={handleInputChange}
                className="input-field"
              >
                {TIMEFRAMES.map(tf => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Select the indicators you want to use in your strategy
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_INDICATORS.map(indicator => {
                const isSelected = formData.indicators.find(ind => ind.type === indicator.id)
                return (
                  <div key={indicator.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => handleIndicatorToggle(indicator.id)}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="font-medium">{indicator.name}</span>
                      </label>
                    </div>
                    {isSelected && (
                      <div className="space-y-2 pl-6">
                        {indicator.params.map(param => (
                          <div key={param.name}>
                            <label className="block text-xs text-gray-600 mb-1">
                              {param.name}
                            </label>
                            <input
                              type="number"
                              value={isSelected.params[param.name]}
                              onChange={(e) => handleIndicatorParamChange(indicator.id, param.name, e.target.value)}
                              className="input-field text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Define conditions for entering a trade
              </p>
              <button
                type="button"
                onClick={() => addRule('entry')}
                className="btn-secondary text-sm"
              >
                Add Rule
              </button>
            </div>
            <div className="space-y-4">
              {formData.entryRules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Indicator</label>
                      <select
                        value={rule.indicator}
                        onChange={(e) => handleRuleChange('entry', index, 'indicator', e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Select...</option>
                        {formData.indicators.map(ind => (
                          <option key={ind.type} value={ind.type}>{ind.type}</option>
                        ))}
                        <option value="close">Close Price</option>
                        <option value="open">Open Price</option>
                        <option value="high">High Price</option>
                        <option value="low">Low Price</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Condition</label>
                      <select
                        value={rule.condition}
                        onChange={(e) => handleRuleChange('entry', index, 'condition', e.target.value)}
                        className="input-field text-sm"
                      >
                        {CONDITION_TYPES.map(cond => (
                          <option key={cond.value} value={cond.value}>{cond.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Value</label>
                      <input
                        type="number"
                        value={rule.value}
                        onChange={(e) => handleRuleChange('entry', index, 'value', e.target.value)}
                        className="input-field text-sm"
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeRule('entry', index)}
                        className="btn-danger text-sm w-full"
                        disabled={formData.entryRules.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logic between rules
              </label>
              <select
                value={formData.entryLogic}
                onChange={(e) => setFormData({ ...formData, entryLogic: e.target.value })}
                className="input-field"
              >
                <option value="AND">AND (All conditions must be true)</option>
                <option value="OR">OR (Any condition can be true)</option>
              </select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Define conditions for exiting a trade
              </p>
              <button
                type="button"
                onClick={() => addRule('exit')}
                className="btn-secondary text-sm"
              >
                Add Rule
              </button>
            </div>
            <div className="space-y-4">
              {formData.exitRules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Indicator</label>
                      <select
                        value={rule.indicator}
                        onChange={(e) => handleRuleChange('exit', index, 'indicator', e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Select...</option>
                        {formData.indicators.map(ind => (
                          <option key={ind.type} value={ind.type}>{ind.type}</option>
                        ))}
                        <option value="close">Close Price</option>
                        <option value="open">Open Price</option>
                        <option value="high">High Price</option>
                        <option value="low">Low Price</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Condition</label>
                      <select
                        value={rule.condition}
                        onChange={(e) => handleRuleChange('exit', index, 'condition', e.target.value)}
                        className="input-field text-sm"
                      >
                        {CONDITION_TYPES.map(cond => (
                          <option key={cond.value} value={cond.value}>{cond.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Value</label>
                      <input
                        type="number"
                        value={rule.value}
                        onChange={(e) => handleRuleChange('exit', index, 'value', e.target.value)}
                        className="input-field text-sm"
                        placeholder="e.g., 30"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeRule('exit', index)}
                        className="btn-danger text-sm w-full"
                        disabled={formData.exitRules.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logic between rules
              </label>
              <select
                value={formData.exitLogic}
                onChange={(e) => setFormData({ ...formData, exitLogic: e.target.value })}
                className="input-field"
              >
                <option value="AND">AND (All conditions must be true)</option>
                <option value="OR">OR (Any condition can be true)</option>
              </select>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Review Your Strategy</h3>
              <p className="text-sm text-blue-700">
                Please review all the details before creating your strategy
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.name}</span></p>
                  <p><span className="text-gray-600">Description:</span> <span className="font-medium">{formData.description || 'N/A'}</span></p>
                  <p><span className="text-gray-600">Timeframe:</span> <span className="font-medium">{formData.timeframe}</span></p>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Indicators ({formData.indicators.length})</h4>
                <div className="space-y-2">
                  {formData.indicators.map(ind => (
                    <div key={ind.type} className="text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">{ind.type}</span>
                      <span className="text-gray-600 ml-2">
                        {Object.entries(ind.params).map(([key, val]) => `${key}: ${val}`).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Entry Rules ({formData.entryRules.length})</h4>
                <p className="text-xs text-gray-600 mb-2">Logic: {formData.entryLogic}</p>
                <div className="space-y-2">
                  {formData.entryRules.map((rule, idx) => (
                    <div key={idx} className="text-sm bg-green-50 p-2 rounded">
                      {rule.indicator} {rule.condition} {rule.value || rule.compareIndicator}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Exit Rules ({formData.exitRules.length})</h4>
                <p className="text-xs text-gray-600 mb-2">Logic: {formData.exitLogic}</p>
                <div className="space-y-2">
                  {formData.exitRules.map((rule, idx) => (
                    <div key={idx} className="text-sm bg-red-50 p-2 rounded">
                      {rule.indicator} {rule.condition} {rule.value || rule.compareIndicator}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/strategies')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Strategy</h1>
          <p className="text-gray-600">Build your trading strategy step by step</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <span className="text-xs mt-2 text-center">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="card">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Create Strategy</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default CreateStrategy
