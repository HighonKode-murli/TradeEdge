import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getStrategies, deleteStrategy } from '../store/slices/strategySlice'
import toast from 'react-hot-toast'
import { Plus, TrendingUp, Search, Trash2, Eye, Edit, Loader } from 'lucide-react'
import { format } from 'date-fns'

const Strategies = () => {
  const dispatch = useDispatch()
  const { strategies, isLoading } = useSelector((state) => state.strategy)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    dispatch(getStrategies())
  }, [dispatch])

  const filteredStrategies = Array.isArray(strategies) 
    ? strategies.filter((strategy) =>
        strategy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      setDeleteId(id)
      try {
        await dispatch(deleteStrategy(id)).unwrap()
        toast.success('Strategy deleted successfully')
      } catch (error) {
        toast.error('Failed to delete strategy')
      } finally {
        setDeleteId(null)
      }
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Strategies</h1>
          <p className="mt-2 text-gray-600">
            Manage and create your trading strategies
          </p>
        </div>
        <Link to="/strategies/create" className="btn-primary inline-flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Strategy</span>
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search strategies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Strategies Grid */}
      {filteredStrategies.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No strategies found' : 'No strategies yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Create your first trading strategy to get started'}
          </p>
          {!searchTerm && (
            <Link to="/strategies/create" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Strategy</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrategies.map((strategy) => (
            <div key={strategy._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {strategy.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {strategy.description || 'No description'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Timeframe:</span>
                  <span className="font-medium text-gray-900">{strategy.timeframe}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Indicators:</span>
                  <span className="font-medium text-gray-900">
                    {strategy.indicators?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Entry Rules:</span>
                  <span className="font-medium text-gray-900">
                    {strategy.rules?.entry?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Exit Rules:</span>
                  <span className="font-medium text-gray-900">
                    {strategy.rules?.exit?.length || 0}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Created {format(new Date(strategy.createdAt), 'MMM dd, yyyy')}
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to={`/strategies/${strategy._id}`}
                  className="flex-1 btn-primary text-center text-sm py-2"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  View
                </Link>
                <button
                  onClick={() => handleDelete(strategy._id)}
                  disabled={deleteId === strategy._id}
                  className="btn-danger text-sm py-2 px-3"
                >
                  {deleteId === strategy._id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Strategies
