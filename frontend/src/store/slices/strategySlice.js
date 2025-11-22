import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import strategyService from '../../services/strategyService'

const initialState = {
  strategies: [],
  currentStrategy: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
}

// Get all strategies
export const getStrategies = createAsyncThunk(
  'strategy/getAll',
  async (_, thunkAPI) => {
    try {
      return await strategyService.getStrategies()
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get single strategy
export const getStrategy = createAsyncThunk(
  'strategy/getOne',
  async (id, thunkAPI) => {
    try {
      return await strategyService.getStrategy(id)
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Create strategy
export const createStrategy = createAsyncThunk(
  'strategy/create',
  async (strategyData, thunkAPI) => {
    try {
      return await strategyService.createStrategy(strategyData)
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Update strategy
export const updateStrategy = createAsyncThunk(
  'strategy/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await strategyService.updateStrategy(id, data)
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Delete strategy
export const deleteStrategy = createAsyncThunk(
  'strategy/delete',
  async (id, thunkAPI) => {
    try {
      await strategyService.deleteStrategy(id)
      return id
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const strategySlice = createSlice({
  name: 'strategy',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
    },
    clearCurrentStrategy: (state) => {
      state.currentStrategy = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all strategies
      .addCase(getStrategies.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getStrategies.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.strategies = action.payload
      })
      .addCase(getStrategies.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Get single strategy
      .addCase(getStrategy.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getStrategy.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentStrategy = action.payload
      })
      .addCase(getStrategy.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Create strategy
      .addCase(createStrategy.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createStrategy.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.strategies.push(action.payload)
      })
      .addCase(createStrategy.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Update strategy
      .addCase(updateStrategy.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateStrategy.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        const index = state.strategies.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.strategies[index] = action.payload
        }
        state.currentStrategy = action.payload
      })
      .addCase(updateStrategy.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Delete strategy
      .addCase(deleteStrategy.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteStrategy.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.strategies = state.strategies.filter(s => s._id !== action.payload)
      })
      .addCase(deleteStrategy.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearCurrentStrategy } = strategySlice.actions
export default strategySlice.reducer
