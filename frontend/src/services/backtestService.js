import api from './api'

const backtestService = {
  // Get all backtests
  getBacktests: async () => {
    const response = await api.get('/backtests')
    return response.data.data || []
  },

  // Get single backtest
  getBacktest: async (id) => {
    const response = await api.get(`/backtests/${id}`)
    return response.data.data
  },

  // Run backtest
  runBacktest: async (backtestData) => {
    const response = await api.post('/backtests', backtestData)
    return response.data.data
  },

  // Delete backtest
  deleteBacktest: async (id) => {
    const response = await api.delete(`/backtests/${id}`)
    return response.data.data
  },
}

export default backtestService
