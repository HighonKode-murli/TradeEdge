import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getDatasets, deleteDataset } from '../store/slices/dataSlice'
import dataService from '../services/dataService'
import toast from 'react-hot-toast'
import { Plus, Database, Search, Trash2, Eye, Loader } from 'lucide-react'
import { format } from 'date-fns'

const Datasets = () => {
  const dispatch = useDispatch()
  const { datasets, isLoading } = useSelector((state) => state.data)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [loadingDataset, setLoadingDataset] = useState(false)

  useEffect(() => {
    dispatch(getDatasets())
  }, [dispatch])

  const handleViewDataset = async (dataset) => {
    setLoadingDataset(true)
    try {
      const response = await dataService.getDataset(dataset._id)
      setSelectedDataset(response.data)
    } catch (error) {
      toast.error('Failed to load dataset details')
      console.error(error)
    } finally {
      setLoadingDataset(false)
    }
  }

  const filteredDatasets = Array.isArray(datasets)
    ? datasets.filter((dataset) =>
        dataset.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      setDeleteId(id)
      try {
        await dispatch(deleteDataset(id)).unwrap()
        toast.success('Dataset deleted successfully')
      } catch (error) {
        toast.error('Failed to delete dataset')
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
          <h1 className="text-3xl font-bold text-gray-900">Historical Datasets</h1>
          <p className="mt-2 text-gray-600">
            Manage your uploaded market data
          </p>
        </div>
        <Link to="/data/upload" className="btn-primary inline-flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Upload Data</span>
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
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Datasets Table */}
      {filteredDatasets.length === 0 ? (
        <div className="card text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No datasets found' : 'No datasets yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Upload your first dataset to get started'}
          </p>
          {!searchTerm && (
            <Link to="/data/upload" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Upload Data</span>
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
                    Asset Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rows
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDatasets.map((dataset) => (
                  <tr key={dataset._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Database className="w-5 h-5 text-primary-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {dataset.assetName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dataset.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dataset.startDate && dataset.endDate ? (
                        (() => {
                          try {
                            const start = new Date(dataset.startDate)
                            const end = new Date(dataset.endDate)
                            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                              return 'N/A'
                            }
                            return (
                              <>
                                {format(start, 'MMM dd, yyyy')}
                                {' - '}
                                {format(end, 'MMM dd, yyyy')}
                              </>
                            )
                          } catch {
                            return 'N/A'
                          }
                        })()
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dataset.rowCount?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        try {
                          const date = new Date(dataset.createdAt)
                          return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy')
                        } catch {
                          return 'N/A'
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <button
                        onClick={() => handleViewDataset(dataset)}
                        disabled={loadingDataset}
                        className="text-primary-600 hover:text-primary-900 disabled:opacity-50"
                      >
                        {loadingDataset ? (
                          <Loader className="w-4 h-4 inline animate-spin mr-1" />
                        ) : (
                          <Eye className="w-4 h-4 inline mr-1" />
                        )}
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(dataset._id)}
                        disabled={deleteId === dataset._id}
                        className="text-red-600 hover:text-red-900"
                      >
                        {deleteId === dataset._id ? (
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

      {/* Dataset Detail Modal */}
      {selectedDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Dataset Details</h2>
                <button
                  onClick={() => setSelectedDataset(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Dataset Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Asset Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedDataset.assetName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Filename</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedDataset.filename}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Rows</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedDataset.rowCount?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Uploaded</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(() => {
                        try {
                          const date = new Date(selectedDataset.createdAt || selectedDataset.uploadedAt)
                          return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy')
                        } catch {
                          return 'N/A'
                        }
                      })()}
                    </p>
                  </div>
                </div>

                {/* Date Range */}
                {selectedDataset.startDate && selectedDataset.endDate && (() => {
                  try {
                    const start = new Date(selectedDataset.startDate)
                    const end = new Date(selectedDataset.endDate)
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                      return null
                    }
                    return (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Date Range</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm">
                            <span className="font-medium">From:</span>{' '}
                            {format(start, 'MMMM dd, yyyy')}
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">To:</span>{' '}
                            {format(end, 'MMMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )
                  } catch {
                    return null
                  }
                })()}

                {/* Sample Data Table */}
                {selectedDataset.sampleData && selectedDataset.sampleData.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Sample Data (First {selectedDataset.sampleData.length} rows)
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              {Object.keys(selectedDataset.sampleData[0]).map((key) => (
                                <th
                                  key={key}
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedDataset.sampleData.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {Object.values(row).map((value, i) => (
                                  <td key={i} className="px-4 py-3 whitespace-nowrap text-gray-900">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No sample data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedDataset(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const X = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default Datasets
