import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getStrategies } from '../store/slices/strategySlice'
import { getBacktests } from '../store/slices/backtestSlice'
import { getDatasets } from '../store/slices/dataSlice'
import { TrendingUp, Database, BarChart3, Plus, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { strategies } = useSelector((state) => state.strategy)
  const { backtests } = useSelector((state) => state.backtest)
  const { datasets } = useSelector((state) => state.data)

  useEffect(() => {
    dispatch(getStrategies())
    dispatch(getBacktests())
    dispatch(getDatasets())
  }, [dispatch])

  const recentBacktests = Array.isArray(backtests) ? backtests.slice(0, 5) : []

  const stats = [
    {
      name: 'Total Strategies',
      value: Array.isArray(strategies) ? strategies.length : 0,
      icon: TrendingUp,
      color: 'bg-blue-500',
      link: '/strategies',
    },
    {
      name: 'Datasets Uploaded',
      value: Array.isArray(datasets) ? datasets.length : 0,
      icon: Database,
      color: 'bg-green-500',
      link: '/data',
    },
    {
      name: 'Total Backtests',
      value: Array.isArray(backtests) ? backtests.length : 0,
      icon: BarChart3,
      color: 'bg-purple-500',
      link: '/backtests',
    },
  ]

  const quickActions = [
    {
      name: 'Create Strategy',
      description: 'Build a new trading strategy',
      icon: TrendingUp,
      link: '/strategies/create',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    {
      name: 'Upload Data',
      description: 'Upload historical market data',
      icon: Database,
      link: '/data/upload',
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
    },
  ]

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your trading platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.name}
                to={action.link}
                className={`card ${action.color} transition-all flex items-center space-x-4`}
              >
                <div className="p-3 bg-white rounded-lg">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{action.name}</h3>
                  <p className="text-sm opacity-80">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Backtests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Backtests</h2>
          <Link
            to="/backtests"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentBacktests.length === 0 ? (
          <div className="card text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No backtests yet</h3>
            <p className="text-gray-600 mb-4">
              Create a strategy and run your first backtest
            </p>
            <Link to="/strategies/create" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Strategy</span>
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Strategy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBacktests.map((backtest) => (
                    <tr key={backtest._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {backtest.strategyId?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {backtest.asset || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(backtest.status)}`}>
                          {backtest.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(backtest.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/backtests/${backtest._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
