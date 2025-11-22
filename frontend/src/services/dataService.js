import api from './api'

const dataService = {
  // Get all datasets
  getDatasets: async () => {
    const response = await api.get('/data')
    return response.data.data || []
  },

  // Get single dataset
  getDataset: async (id) => {
    const response = await api.get(`/data/${id}`)
    return response.data.data
  },

  // Upload dataset
  uploadDataset: async (formData, onProgress) => {
    const response = await api.post('/data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        if (onProgress) {
          onProgress(percentCompleted)
        }
      },
    })
    return response.data.data
  },

  // Delete dataset
  deleteDataset: async (id) => {
    const response = await api.delete(`/data/${id}`)
    return response.data.data
  },
}

export default dataService
