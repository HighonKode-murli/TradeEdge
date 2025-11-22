import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { runBacktest } from '../store/slices/backtestSlice'
import { getDatasets } from '../store/slices/dataSlice'
import { getStrategies } from '../store/slices/strategySlice'
import toast from 'react-hot-toast'
import { X, Play, Loader } from 'lucide-react'

const RunBacktestModal = ({ strategyId, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { datasets } = useSelector((state) => state.data)
  const { strategies } = useSelector((state) => state.strategy)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    strategyId: strategyId || '',
    datasetId: '',
    initialCapital: 10000,
    commission: 0.001,
  })

  useEffect(() => {
    dispatch(getDatasets())
    if (!strategyId) {
      dispatch(getStrategies())
    }
  }, [dispatch, strategyId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.strategyId) {
      toast.error('Please select a strategy')
      return
    }

    if (!formData.datasetId) {
      toast.error('Please select a dataset')
      return
    }

    setIsSubmitting(true)
    try {
      // Get the selected dataset to extract asset name
      const dataset = datasets.find(d => d._id === formData.datasetId)
      
      const result = await dispatch(runBacktest({
        strategyId: formData.strategyId,
        dataSourceId: formData.datasetId,
        asset: dataset?.assetName || dataset?.asset || 'Unknown',
        initialCapital: parseFloat(formData.initialCapital),
        commission: parseFloat(formData.commission),
      })).unwrap()

      toast.success('Backtest started successfully!')
      onClose()
      navigate(`/backtests/${result._id}`)
    } catch (error) {
      console.error('Backtest error:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.message || error || 'Failed to start backtest'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedDataset = datasets.find(d => d._id === formData.datasetId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Run Backtest</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Strategy Selection */}
            {!strategyId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy *
                </label>
                <select
                  value={formData.strategyId}
                  onChange={(e) => setFormData({ ...formData, strategyId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a strategy...</option>
                  {strategies.map((strategy) => (
                    <option key={strategy._id} value={strategy._id}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dataset Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Historical Dataset *
              </label>
              <select
                value={formData.datasetId}
                onChange={(e) => setFormData({ ...formData, datasetId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select a dataset...</option>
                {datasets.map((dataset) => (
                  <option key={dataset._id} value={dataset._id}>
                    {dataset.assetName} ({dataset.rowCount?.toLocaleString()} rows)
                  </option>
                ))}
              </select>
              {selectedDataset && (
                <p className="mt-2 text-sm text-gray-600">
                  Date range: {new Date(selectedDataset.startDate).toLocaleDateString()} - {new Date(selectedDataset.endDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Initial Capital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Capital ($) *
              </label>
              <input
                type="number"
                value={formData.initialCapital}
                onChange={(e) => setFormData({ ...formData, initialCapital: e.target.value })}
                className="input-field"
                min="100"
                step="100"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Starting portfolio value for the backtest
              </p>
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate *
              </label>
              <input
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                className="input-field"
                min="0"
                max="1"
                step="0.0001"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Trading commission as a decimal (e.g., 0.001 = 0.1%)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Backtest Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• The backtest will run asynchronously</li>
                <li>• You'll be redirected to the results page</li>
                <li>• Processing time depends on data size and strategy complexity</li>
                <li>• You can view progress on the backtests page</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Backtest</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RunBacktestModal
