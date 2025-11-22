import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import dataService from '../../services/dataService'

const initialState = {
  datasets: [],
  currentDataset: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  uploadProgress: 0,
}

// Get all datasets
export const getDatasets = createAsyncThunk(
  'data/getAll',
  async (_, thunkAPI) => {
    try {
      return await dataService.getDatasets()
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get single dataset
export const getDataset = createAsyncThunk(
  'data/getOne',
  async (id, thunkAPI) => {
    try {
      return await dataService.getDataset(id)
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Upload dataset
export const uploadDataset = createAsyncThunk(
  'data/upload',
  async ({ formData, onProgress }, thunkAPI) => {
    try {
      return await dataService.uploadDataset(formData, onProgress)
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Delete dataset
export const deleteDataset = createAsyncThunk(
  'data/delete',
  async (id, thunkAPI) => {
    try {
      await dataService.deleteDataset(id)
      return id
    } catch (error) {
      const message = error.response?.data?.error || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
      state.uploadProgress = 0
    },
    clearCurrentDataset: (state) => {
      state.currentDataset = null
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all datasets
      .addCase(getDatasets.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getDatasets.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.datasets = action.payload
      })
      .addCase(getDatasets.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Get single dataset
      .addCase(getDataset.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getDataset.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentDataset = action.payload
      })
      .addCase(getDataset.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Upload dataset
      .addCase(uploadDataset.pending, (state) => {
        state.isLoading = true
        state.uploadProgress = 0
      })
      .addCase(uploadDataset.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.datasets.unshift(action.payload)
        state.uploadProgress = 100
      })
      .addCase(uploadDataset.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
        state.uploadProgress = 0
      })
      // Delete dataset
      .addCase(deleteDataset.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteDataset.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.datasets = state.datasets.filter(d => d._id !== action.payload)
      })
      .addCase(deleteDataset.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearCurrentDataset, setUploadProgress } = dataSlice.actions
export default dataSlice.reducer
