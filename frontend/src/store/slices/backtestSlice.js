import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import backtestService from '../../services/backtestService'

const initialState = {
  backtests: [],
  currentBacktest: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
}

// Get all backtests
export const getBacktests = createAsyncThunk(
  'backtest/getAll',
  async (_, thunkAPI) => {
    try {
      const backtests = await backtestService.getBacktests()
      console.log("Fetched backtests:", backtests)
      return backtests
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get single backtest
export const getBacktest = createAsyncThunk(
  'backtest/getOne',
  async (id, thunkAPI) => {
    try {
      return await backtestService.getBacktest(id)
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Run backtest
export const runBacktest = createAsyncThunk(
  'backtest/run',
  async (backtestData, thunkAPI) => {
    try {
      return await backtestService.runBacktest(backtestData)
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Delete backtest
export const deleteBacktest = createAsyncThunk(
  'backtest/delete',
  async (id, thunkAPI) => {
    try {
      await backtestService.deleteBacktest(id)
      return id
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const backtestSlice = createSlice({
  name: 'backtest',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
    },
    clearCurrentBacktest: (state) => {
      state.currentBacktest = null
    },
    updateBacktestStatus: (state, action) => {
      const { id, status, results } = action.payload
      const backtest = state.backtests.find(b => b._id === id)
      if (backtest) {
        backtest.status = status
        if (results) {
          backtest.results = results
        }
      }
      if (state.currentBacktest && state.currentBacktest._id === id) {
        state.currentBacktest.status = status
        if (results) {
          state.currentBacktest.results = results
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all backtests
      .addCase(getBacktests.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBacktests.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.backtests = action.payload
      })
      .addCase(getBacktests.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Get single backtest
      .addCase(getBacktest.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBacktest.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBacktest = action.payload
      })
      .addCase(getBacktest.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Run backtest
      .addCase(runBacktest.pending, (state) => {
        state.isLoading = true
      })
      .addCase(runBacktest.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.backtests.unshift(action.payload)
      })
      .addCase(runBacktest.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Delete backtest
      .addCase(deleteBacktest.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteBacktest.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.backtests = state.backtests.filter(b => b._id !== action.payload)
      })
      .addCase(deleteBacktest.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearCurrentBacktest, updateBacktestStatus } = backtestSlice.actions
export default backtestSlice.reducer
