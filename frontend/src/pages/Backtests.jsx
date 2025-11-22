import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getBacktests, deleteBacktest, updateBacktestStatus } from '../store/slices/backtestSlice'
import toast from 'react-hot-toast'
import { BarChart3, Search, Trash2, Eye, Loader, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import backtestService from '../services/backtestService'

const Backtests = () => {
  const dispatch = useDispatch()
  const { backtests, isLoading } = useSelector((state) => state.backtest)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteId, setDeleteId] = useState(null)
  const [pollingIds, setPollingIds] = useState(new Set())



  useEffect(() => {
    dispatch(getBacktests())
  }, [dispatch])

  // Poll for running backtests
  useEffect(() => {
    if (!Array.isArray(backtests)) return

    const runningBacktests = backtests.filter(
      (bt) => bt.status === 'running' || bt.status === 'queued'
    )

    if (runningBacktests.length === 0) {
      return
    }

    const interval = setInterval(async () => {
      for (const backtest of runningBacktests) {
        if (!pollingIds.has(backtest._id)) {
          setPollingIds((prev) => new Set(prev).add(backtest._id))
          
          try {
            const updated = await backtestService.getBacktest(backtest._id)
            if (updated.status !== backtest.status) {
              dispatch(updateBacktestStatus({
                id: backtest._id,
                status: updated.status,
                results: updated.results,
              }))
              
              if (updated.status === 'completed') {
                toast.success(`Backtest for ${backtest.strategy?.name} completed!`)
              } else if (updated.status === 'failed') {
                toast.error(`Backtest for ${backtest.strategy?.name} failed`)
              }
            }
          } catch (error) {
            console.error('Error polling backtest:', error)
          } finally {
            setPollingIds((prev) => {
              const newSet = new Set(prev)
              newSet.delete(backtest._id)
              return newSet
            })
          }
        }
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [backtests, dispatch, pollingIds])

  const filteredBacktests = Array.isArray(backtests)
  ? backtests.filter((backtest) => {
      const matchesSearch =
        backtest.strategyId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        backtest.asset?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = filterStatus === 'all' || backtest.status === filterStatus
      return matchesSearch && matchesFilter
    })
  : []


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this backtest?')) {
      setDeleteId(id)
      try {
        await dispatch(deleteBacktest(id)).unwrap()
        toast.success('Backtest deleted successfully')
      } catch (error) {
        toast.error('Failed to delete backtest')
      } finally {
        setDeleteId(null)
      }
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const statusCounts = Array.isArray(backtests)
    ? {
        all: backtests.length,
        completed: backtests.filter((bt) => bt.status === 'completed').length,
        running: backtests.filter((bt) => bt.status === 'running').length,
        queued: backtests.filter((bt) => bt.status === 'queued').length,
        failed: backtests.filter((bt) => bt.status === 'failed').length,
      }
    : {
        all: 0,
        completed: 0,
        running: 0,
        queued: 0,
        failed: 0,
      }

  if (isLoading) {
    
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Backtests</h1>
        <p className="mt-2 text-gray-600">
          View and manage your backtest results
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search backtests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status ({statusCounts.all})</option>
            <option value="completed">Completed ({statusCounts.completed})</option>
            <option value="running">Running ({statusCounts.running})</option>
            <option value="queued">Queued ({statusCounts.queued})</option>
            <option value="failed">Failed ({statusCounts.failed})</option>
          </select>
        </div>
      </div>

      {/* Backtests Table */}
      {filteredBacktests.length === 0 ? (
        <div className="card text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No backtests found' : 'No backtests yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create a strategy and run your first backtest'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link to="/strategies/create" className="btn-primary inline-flex items-center space-x-2">
              <span>Create Strategy</span>
            </Link>
          )}
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
                    Return
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
                {filteredBacktests.map((backtest) => (
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
                        {(backtest.status === 'running' || backtest.status === 'queued') && (
                          <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {backtest.status === 'completed' && backtest.results?.totalReturnPct !== undefined ? (
                        <span className={`text-sm font-medium ${
                          backtest.results.totalReturnPct >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {backtest.results.totalReturnPct >= 0 ? '+' : ''}
                          {backtest.results.totalReturnPct.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(backtest.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <Link
                        to={`/backtests/${backtest._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(backtest._id)}
                        disabled={deleteId === backtest._id}
                        className="text-red-600 hover:text-red-900"
                      >
                        {deleteId === backtest._id ? (
                          <Loader className="w-4 h-4 inline animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 inline mr-1" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Backtests
