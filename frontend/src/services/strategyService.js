import api from './api'

const strategyService = {
  // Get all strategies
  getStrategies: async () => {
    const response = await api.get('/strategies')
    return response.data.data
  },

  // Get single strategy
  getStrategy: async (id) => {
    const response = await api.get(`/strategies/${id}`)
    return response.data.data
  },

  // Create strategy
  createStrategy: async (strategyData) => {
    const response = await api.post('/strategies', strategyData)
    return response.data.data
  },

  // Update strategy
  updateStrategy: async (id, strategyData) => {
    const response = await api.put(`/strategies/${id}`, strategyData)
    return response.data.data
  },

  // Delete strategy
  deleteStrategy: async (id) => {
    const response = await api.delete(`/strategies/${id}`)
    return response.data.data
  },
}

export default strategyService
