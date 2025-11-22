import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getStrategy, deleteStrategy } from '../store/slices/strategySlice'
import { getBacktests } from '../store/slices/backtestSlice'
import toast from 'react-hot-toast'
import { ArrowLeft, Trash2, Play, Loader, Code } from 'lucide-react'
import { format } from 'date-fns'
import RunBacktestModal from '../components/RunBacktestModal'

const StrategyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentStrategy, isLoading } = useSelector((state) => state.strategy)
  const { backtests } = useSelector((state) => state.backtest)
  const [showRunModal, setShowRunModal] = useState(false)
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    dispatch(getStrategy(id))
    dispatch(getBacktests())
  }, [dispatch, id])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      try {
        await dispatch(deleteStrategy(id)).unwrap()
        toast.success('Strategy deleted successfully')
        navigate('/strategies')
      } catch (error) {
        toast.error('Failed to delete strategy')
      }
    }
  }

  const strategyBacktests = backtests.filter(
    (bt) => bt.strategy?._id === id || bt.strategy === id
  )

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading || !currentStrategy) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/strategies')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentStrategy.name}</h1>
            <p className="text-gray-600 mt-1">
              {currentStrategy.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRunModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Run Backtest</span>
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Timeframe</p>
            <p className="text-lg font-semibold text-gray-900">{currentStrategy.timeframe}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="text-lg font-semibold text-gray-900">
              {format(new Date(currentStrategy.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Backtests</p>
            <p className="text-lg font-semibold text-gray-900">{strategyBacktests.length}</p>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Indicators ({currentStrategy.indicators?.length || 0})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentStrategy.indicators?.map((indicator, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{indicator.type}</h3>
              <div className="space-y-1">
                {Object.entries(indicator.params || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry Rules */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Entry Rules ({currentStrategy.rules?.entry?.length || 0})
        </h2>
        <div className="mb-3">
          <span className="text-sm text-gray-600">Logic: </span>
          <span className="text-sm font-semibold text-gray-900">
            {currentStrategy.rules?.entryLogic || 'AND'}
          </span>
        </div>
        <div className="space-y-2">
          {currentStrategy.rules?.entry?.map((rule, index) => (
            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm">
                <span className="font-semibold">{rule.indicator}</span>
                <span className="mx-2 text-gray-600">{rule.condition.replace(/_/g, ' ')}</span>
                <span className="font-semibold">
                  {rule.value !== undefined ? rule.value : rule.compareIndicator}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exit Rules */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Exit Rules ({currentStrategy.rules?.exit?.length || 0})
        </h2>
        <div className="mb-3">
          <span className="text-sm text-gray-600">Logic: </span>
          <span className="text-sm font-semibold text-gray-900">
            {currentStrategy.rules?.exitLogic || 'AND'}
          </span>
        </div>
        <div className="space-y-2">
          {currentStrategy.rules?.exit?.map((rule, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm">
                <span className="font-semibold">{rule.indicator}</span>
                <span className="mx-2 text-gray-600">{rule.condition.replace(/_/g, ' ')}</span>
                <span className="font-semibold">
                  {rule.value !== undefined ? rule.value : rule.compareIndicator}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Code */}
      {currentStrategy.generatedCode && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Generated Code</h2>
            <button
              onClick={() => setShowCode(!showCode)}
              className="btn-secondary text-sm flex items-center space-x-2"
            >
              <Code className="w-4 h-4" />
              <span>{showCode ? 'Hide' : 'Show'} Code</span>
            </button>
          </div>
          {showCode && (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{currentStrategy.generatedCode}</code>
            </pre>
          )}
        </div>
      )}

      {/* Past Backtests */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Past Backtests ({strategyBacktests.length})
        </h2>
        {strategyBacktests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No backtests run yet</p>
            <button
              onClick={() => setShowRunModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Run First Backtest</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {strategyBacktests.map((backtest) => (
                  <tr key={backtest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backtest.historicalData?.assetName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(backtest.status)}`}>
                        {backtest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(backtest.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/backtests/${backtest._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Run Backtest Modal */}
      {showRunModal && (
        <RunBacktestModal
          strategyId={id}
          onClose={() => setShowRunModal(false)}
        />
      )}
    </div>
  )
}

export default StrategyDetail
