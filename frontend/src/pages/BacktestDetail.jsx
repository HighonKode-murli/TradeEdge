import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getBacktest, updateBacktestStatus } from '../store/slices/backtestSlice'
import { ArrowLeft, Loader, TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import backtestService from '../services/backtestService'

const BacktestDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentBacktest, isLoading } = useSelector((state) => state.backtest)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    dispatch(getBacktest(id))
  }, [dispatch, id])

  // Poll if backtest is running
  useEffect(() => {
    if (!currentBacktest || currentBacktest.status === 'completed' || currentBacktest.status === 'failed') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const updated = await backtestService.getBacktest(id)
        if (updated.status !== currentBacktest.status) {
          dispatch(updateBacktestStatus({
            id,
            status: updated.status,
            results: updated.results,
          }))
        }
      } catch (error) {
        console.error('Error polling backtest:', error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [currentBacktest, id, dispatch])

  if (isLoading || !currentBacktest) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const { status, results, strategy, historicalData } = currentBacktest

  // Show loading state for running/queued backtests
  if (status === 'running' || status === 'queued') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/backtests')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backtest Running</h1>
            <p className="text-gray-600">Please wait while the backtest is being processed...</p>
          </div>
        </div>

        <div className="card text-center py-12">
          <Loader className="w-16 h-16 animate-spin text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {status === 'queued' ? 'Backtest Queued' : 'Backtest Running'}
          </h3>
          <p className="text-gray-600">
            {status === 'queued'
              ? 'Your backtest is in the queue and will start shortly'
              : 'Your backtest is currently being processed'}
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500">Strategy: {strategy?.name}</p>
            <p className="text-sm text-gray-500">Asset: {historicalData?.assetName}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state for failed backtests
  if (status === 'failed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/backtests')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backtest Failed</h1>
            <p className="text-gray-600">The backtest encountered an error</p>
          </div>
        </div>

        <div className="card bg-red-50 border border-red-200 text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Backtest Failed</h3>
          <p className="text-red-700 mb-4">
            {currentBacktest.error || 'An error occurred while running the backtest'}
          </p>
          <Link to="/backtests" className="btn-primary inline-block">
            Back to Backtests
          </Link>
        </div>
      </div>
    )
  }

  // Prepare chart data with date validation
  const equityCurveData = results?.equityCurve?.map((point) => {
    try {
      const date = new Date(point.date)
      return {
        date: isNaN(date.getTime()) ? 'Invalid' : format(date, 'MMM dd'),
        equity: point.value || point.equity || 0,
      }
    } catch {
      return {
        date: 'Invalid',
        equity: point.value || point.equity || 0,
      }
    }
  }).filter(point => point.date !== 'Invalid') || []

  const drawdownData = results?.drawdownCurve?.map((point) => {
    try {
      const date = new Date(point.date)
      return {
        date: isNaN(date.getTime()) ? 'Invalid' : format(date, 'MMM dd'),
        drawdown: point.value || point.drawdown || 0,
      }
    } catch {
      return {
        date: 'Invalid',
        drawdown: point.value || point.drawdown || 0,
      }
    }
  }).filter(point => point.date !== 'Invalid') || []

  const metrics = [
    {
      name: 'Final Equity',
      value: `$${results?.finalEquity?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Return',
      value: `${results?.totalReturnPct >= 0 ? '+' : ''}${results?.totalReturnPct?.toFixed(2)}%`,
      icon: results?.totalReturnPct >= 0 ? TrendingUp : TrendingDown,
      color: results?.totalReturnPct >= 0 ? 'bg-green-500' : 'bg-red-500',
    },
    {
      name: 'Sharpe Ratio',
      value: results?.sharpeRatio?.toFixed(2) || 'N/A',
      icon: Activity,
      color: 'bg-purple-500',
    },
    {
      name: 'Max Drawdown',
      value: `${results?.maxDrawdownPct?.toFixed(2)}%`,
      icon: TrendingDown,
      color: 'bg-orange-500',
    },
    {
      name: 'Win Rate',
      value: `${results?.winRate?.toFixed(2)}%`,
      icon: Target,
      color: 'bg-teal-500',
    },
    {
      name: 'Total Trades',
      value: results?.totalTrades || 0,
      icon: Activity,
      color: 'bg-indigo-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/backtests')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backtest Results</h1>
            <p className="text-gray-600 mt-1">
              {strategy?.name} on {historicalData?.assetName}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-sm font-medium text-gray-900">
            {currentBacktest.updatedAt || currentBacktest.completedAt 
              ? format(new Date(currentBacktest.updatedAt || currentBacktest.completedAt), 'MMM dd, yyyy HH:mm')
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.name} className="metric-card border-primary-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'trades'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Equity Curve */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Equity Curve</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <Legend />
                <Line type="monotone" dataKey="equity" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Portfolio Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Drawdown Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Drawdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={drawdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                <Legend />
                <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Drawdown %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Metrics */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Profit Factor</span>
                <span className="font-semibold text-gray-900">
                  {results?.profitFactor?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Average Trade</span>
                <span className="font-semibold text-gray-900">
                  {results?.totalTrades && results?.totalReturn 
                    ? `$${(results.totalReturn / results.totalTrades).toFixed(2)}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Winning Trades</span>
                <span className="font-semibold text-green-600">
                  {results?.winningTrades || 0}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Losing Trades</span>
                <span className="font-semibold text-red-600">
                  {results?.losingTrades || 0}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Initial Capital</span>
                <span className="font-semibold text-gray-900">
                  ${currentBacktest?.initialCapital?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Commission Rate</span>
                <span className="font-semibold text-gray-900">
                  {currentBacktest?.commission 
                    ? `${(currentBacktest.commission * 100).toFixed(3)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Trade History ({results?.trades?.length || 0} trades)
          </h2>
          {results?.trades && results.trades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.trades.map((trade, index) => {
                    const pnl = trade.exitPrice - trade.entryPrice
                    const pnlPct = ((pnl / trade.entryPrice) * 100)
                    const isProfit = pnl >= 0
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            try {
                              const date = new Date(trade.entryDate)
                              return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy')
                            } catch {
                              return 'N/A'
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            try {
                              const date = new Date(trade.exitDate)
                              return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy')
                            } catch {
                              return 'N/A'
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${trade.entryPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${trade.exitPrice.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isProfit ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isProfit ? '+' : ''}${pnl.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isProfit ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trade.duration || 'N/A'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No trades executed</p>
          )}
        </div>
      )}
    </div>
  )
}

export default BacktestDetail
