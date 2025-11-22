import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import strategyReducer from './slices/strategySlice'
import backtestReducer from './slices/backtestSlice'
import dataReducer from './slices/dataSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    strategy: strategyReducer,
    backtest: backtestReducer,
    data: dataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
