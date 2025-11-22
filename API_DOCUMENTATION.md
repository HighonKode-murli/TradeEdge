# API Documentation

## Base URLs

- **Backend API**: `http://localhost:5000`
- **Flask API**: `http://localhost:5001`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Backend API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Strategy Routes (`/api/strategies`)

#### Get All Strategies
```http
GET /api/strategies
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "name": "Moving Average Crossover",
      "description": "Simple MA crossover strategy",
      "strategyType": "trend-following",
      "backtestCount": 5,
      "createdAt": "2023-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Single Strategy
```http
GET /api/strategies/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1b",
    "name": "Moving Average Crossover",
    "description": "Simple MA crossover strategy",
    "strategyType": "trend-following",
    "generatedCode": "from backtesting import Strategy...",
    "backtestCount": 5,
    "createdAt": "2023-01-15T10:30:00Z"
  }
}
```

#### Create Strategy
```http
POST /api/strategies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "RSI Mean Reversion",
  "description": "Buy when RSI < 30, sell when RSI > 70",
  "strategyType": "mean-reversion",
  "naturalLanguageStrategy": "Buy when RSI is oversold and sell when overbought"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1c",
    "name": "RSI Mean Reversion",
    "generatedCode": "from backtesting import Strategy...",
    "createdAt": "2023-01-15T10:30:00Z"
  }
}
```

#### Update Strategy
```http
PUT /api/strategies/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Strategy Name",
  "description": "Updated description"
}
```

#### Delete Strategy
```http
DELETE /api/strategies/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

---

### Data Management Routes (`/api/data`)

#### Get All Datasets
```http
GET /api/data
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1d",
      "filename": "AAPL_2023.csv",
      "asset": "AAPL",
      "startDate": "2023-01-01T00:00:00Z",
      "endDate": "2023-12-31T00:00:00Z",
      "dataPoints": 252,
      "uploadedAt": "2023-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Single Dataset
```http
GET /api/data/:id
Authorization: Bearer <token>
```

#### Upload Dataset
```http
POST /api/data/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <csv-file>
asset: "AAPL"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "filename": "AAPL_2023.csv",
    "asset": "AAPL",
    "startDate": "2023-01-01T00:00:00Z",
    "endDate": "2023-12-31T00:00:00Z",
    "dataPoints": 252
  }
}
```

#### Delete Dataset
```http
DELETE /api/data/:id
Authorization: Bearer <token>
```

---

### Backtest Routes (`/api/backtests`)

#### Get All Backtests
```http
GET /api/backtests
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1e",
      "strategyId": {
        "_id": "60d5ec49f1b2c72b8c8e4f1b",
        "name": "Moving Average Crossover"
      },
      "dataSourceId": {
        "_id": "60d5ec49f1b2c72b8c8e4f1d",
        "asset": "AAPL",
        "filename": "AAPL_2023.csv"
      },
      "status": "completed",
      "initialCapital": 10000,
      "commission": 0.001,
      "createdAt": "2023-01-15T10:30:00Z",
      "completedAt": "2023-01-15T10:31:00Z",
      "executionTime": 5234
    }
  ]
}
```

#### Get Single Backtest
```http
GET /api/backtests/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1e",
    "status": "completed",
    "results": {
      "finalEquity": 12500.50,
      "totalReturn": 2500.50,
      "totalReturnPct": 25.005,
      "sharpeRatio": 1.85,
      "maxDrawdown": 850.25,
      "maxDrawdownPct": 8.5,
      "winRate": 65.5,
      "totalTrades": 45,
      "equityCurve": [...],
      "trades": [...]
    }
  }
}
```

#### Run Backtest
```http
POST /api/backtests
Authorization: Bearer <token>
Content-Type: application/json

{
  "strategyId": "60d5ec49f1b2c72b8c8e4f1b",
  "dataSourceId": "60d5ec49f1b2c72b8c8e4f1d",
  "asset": "AAPL",
  "initialCapital": 10000,
  "commission": 0.001
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1e",
    "status": "queued",
    "strategyId": "60d5ec49f1b2c72b8c8e4f1b",
    "dataSourceId": "60d5ec49f1b2c72b8c8e4f1d",
    "createdAt": "2023-01-15T10:30:00Z"
  }
}
```

#### Get Backtest Status
```http
GET /api/backtests/:id/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "running",
    "completedAt": null,
    "errorMessage": null
  }
}
```

#### Delete Backtest
```http
DELETE /api/backtests/:id
Authorization: Bearer <token>
```

---

## Flask API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "backtest-engine",
  "version": "1.0.0"
}
```

### Execute Backtest
```http
POST /backtest
Content-Type: application/json

{
  "strategyCode": "ZnJvbSBiYWNrdGVzdGluZyBpbXBvcnQgU3RyYXRlZ3k...",
  "csvData": "RGF0ZSxPcGVuLEhpZ2gsTG93LENsb3NlLFZvbHVtZQ0KMj...",
  "initialCapital": 10000,
  "commission": 0.001
}
```

**Note:** `strategyCode` and `csvData` must be base64 encoded.

**Response:**
```json
{
  "finalEquity": 12500.50,
  "totalReturn": 2500.50,
  "totalReturnPct": 25.005,
  "sharpeRatio": 1.85,
  "sortinoRatio": 2.15,
  "maxDrawdown": 850.25,
  "maxDrawdownPct": 8.5,
  "winRate": 65.5,
  "totalTrades": 45,
  "winningTrades": 30,
  "losingTrades": 15,
  "profitFactor": 2.3,
  "avgWin": 125.50,
  "avgLoss": -75.30,
  "largestWin": 450.00,
  "largestLoss": -280.00,
  "avgTradeDuration": 240,
  "equityCurve": [
    {
      "date": "2023-01-01T00:00:00",
      "value": 10000
    }
  ],
  "drawdownCurve": [
    {
      "date": "2023-01-01T00:00:00",
      "value": 0
    }
  ],
  "trades": [
    {
      "entryDate": "2023-01-05T00:00:00",
      "exitDate": "2023-01-10T00:00:00",
      "entryPrice": 150.25,
      "exitPrice": 155.50,
      "size": 100,
      "pnl": 525.00,
      "pnlPct": 3.5,
      "type": "long",
      "duration": 5
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "CSV must have 'Date' column",
  "traceback": "Traceback (most recent call last):\n..."
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. This may be added in future versions.

---

## Pagination

List endpoints currently return all results. Pagination may be added in future versions.

---

## CSV Data Format

When uploading historical data, ensure your CSV has these required columns:

```csv
Date,Open,High,Low,Close,Volume
2023-01-01,100.5,102.3,99.8,101.2,1000000
2023-01-02,101.2,103.5,100.9,102.8,1200000
```

**Required:**
- `Date` - Format: YYYY-MM-DD or any pandas-parseable date format
- `Open`, `High`, `Low`, `Close` - Numeric price values

**Optional:**
- `Volume` - Trading volume
- Any custom indicators

---

## Strategy Code Format

Strategies must be written using the backtesting.py library:

```python
from backtesting import Strategy
from backtesting.lib import crossover
import pandas as pd

class MyStrategy(Strategy):
    # Parameters
    n1 = 20
    n2 = 50
    
    def init(self):
        # Initialize indicators
        close = self.data.Close
        self.ma1 = self.I(lambda x: pd.Series(x).rolling(self.n1).mean(), close)
        self.ma2 = self.I(lambda x: pd.Series(x).rolling(self.n2).mean(), close)
    
    def next(self):
        # Trading logic
        if crossover(self.ma1, self.ma2):
            self.buy()
        elif crossover(self.ma2, self.ma1):
            self.position.close()
```

**Important:**
- Class name should be unique (e.g., `MyStrategy`, not just `Strategy`)
- Must inherit from `backtesting.Strategy`
- Use `self.I()` for indicators
- Use `self.buy()`, `self.sell()`, `self.position.close()`

---

## WebSocket Support

WebSocket support for real-time backtest updates is planned for future releases.

---

## Versioning

API Version: `2.0.0`

The API follows semantic versioning. Breaking changes will result in a major version bump.
