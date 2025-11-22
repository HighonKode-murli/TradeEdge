import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { uploadDataset, setUploadProgress } from '../store/slices/dataSlice'
import toast from 'react-hot-toast'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'

const DataUpload = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { uploadProgress, isLoading } = useSelector((state) => state.data)
  const [file, setFile] = useState(null)
  const [assetName, setAssetName] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setFile(selectedFile)

    // Read first few lines for preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').slice(0, 11) // Header + 10 rows
      setPreview(lines)
    }
    reader.readAsText(selectedFile)
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    dispatch(setUploadProgress(0))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      toast.error('Please select a file')
      return
    }

    if (!assetName.trim()) {
      toast.error('Please enter an asset name')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('asset', assetName)

    try {
      await dispatch(
        uploadDataset({
          formData,
          onProgress: (progress) => dispatch(setUploadProgress(progress)),
        })
      ).unwrap()

      toast.success('Dataset uploaded successfully!')
      navigate('/data')
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.error || 'Failed to upload dataset'
      toast.error(errorMessage)
    }
  }

  const validatePreview = () => {
    if (!preview || preview.length < 2) return null

    const headers = preview[0].split(',').map(h => h.trim().toLowerCase())
    const requiredColumns = ['date', 'open', 'high', 'low', 'close', 'volume']
    const hasAllColumns = requiredColumns.every(col => headers.includes(col))

    return {
      valid: hasAllColumns,
      headers,
      requiredColumns,
    }
  }

  const validation = validatePreview()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Historical Data</h1>
        <p className="mt-2 text-gray-600">
          Upload CSV files containing historical market data for backtesting
        </p>
      </div>

      {/* Requirements */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">CSV File Requirements</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>File must be in CSV format</li>
          <li>Required columns: Date, Open, High, Low, Close, Volume</li>
          <li>Date format should be YYYY-MM-DD or similar standard format</li>
          <li>Numeric values should not contain currency symbols</li>
        </ul>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset Name */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Name *
          </label>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="input-field"
            placeholder="e.g., AAPL, BTC-USD, EUR/USD"
            required
          />
        </div>

        {/* File Upload */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Upload CSV File *
          </label>

          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">
                Drag and drop your CSV file here, or
              </p>
              <label className="btn-primary cursor-pointer inline-block">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <File className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Upload Progress */}
              {isLoading && uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Validation Status */}
              {validation && (
                <div className={`flex items-start space-x-2 p-3 rounded-lg ${
                  validation.valid ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {validation.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      validation.valid ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {validation.valid
                        ? 'File format is valid'
                        : 'Missing required columns'}
                    </p>
                    {!validation.valid && (
                      <p className="text-xs text-red-700 mt-1">
                        Required: {validation.requiredColumns.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && preview.length > 1 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Data Preview (First 10 rows)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {preview[0].split(',').map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {header.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {preview.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.split(',').map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-gray-900">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/data')}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !file || !validation?.valid}
          >
            {isLoading ? 'Uploading...' : 'Upload Dataset'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DataUpload
