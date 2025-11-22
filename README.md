# Trading Strategy Backtesting Platform

A full-stack web application for creating, managing, and backtesting trading strategies using historical market data. Built with React, Node.js/Express, MongoDB, and Python Flask.

## 🚀 Features

- **Strategy Management**: Create and manage trading strategies with an intuitive interface
- **Natural Language to Code**: Convert strategy descriptions to executable Python code
- **Data Upload**: Upload and manage historical market data (CSV format)
- **Backtest Execution**: Run backtests on historical data using the backtesting.py library
- **Performance Analytics**: Comprehensive performance metrics including Sharpe ratio, drawdown, win rate, and more
- **Visual Analysis**: Interactive charts for equity curves, drawdown analysis, and trade history
- **User Authentication**: Secure JWT-based authentication system
- **Async Processing**: Non-blocking backtest execution via Flask API

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with Vite
- Redux Toolkit for state management
- React Router v6 for navigation
- Recharts for data visualization
- Tailwind CSS for styling
- Axios for API communication

**Backend:**
- Node.js with Express 5
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads
- Winston for logging

**Backtest Engine:**
- Python Flask API
- backtesting.py library
- Pandas for data processing
- NumPy for numerical computations

### System Flow

```
User → React Frontend → Express API → Flask API → Backtest Results
                             ↓
                         MongoDB
```

1. User creates a strategy and uploads historical data
2. Express backend validates and stores the request
3. Flask API receives strategy code and data, executes backtest
4. Results are returned and stored in MongoDB
5. Frontend displays comprehensive analytics

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (v7.0 or higher)
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PROJECT_2
```

### 2. Backend Setup

```bash
cd backend

# Install Node.js dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Set MONGODB_URI, JWT_SECRET, FLASK_API_URL, etc.
```

### 3. Python Flask API Setup

```bash
cd backend/python-engine

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (if needed)
# Add VITE_API_URL if different from default
```

### 5. MongoDB Setup

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service):
# MongoDB should start automatically

# Linux:
sudo systemctl start mongod

# Mac:
brew services start mongodb-community

# Or run manually:
mongod --dbpath <path-to-data-directory>
```

## 🚀 Running the Application

### Option 1: Run All Services Separately

**Terminal 1 - MongoDB:**
```bash
# Make sure MongoDB is running (see setup above)
```

**Terminal 2 - Flask API:**
```bash
cd backend/python-engine
# Activate virtual environment if using one
python flask_app.py
# Flask API will run on http://localhost:5001
```

**Terminal 3 - Backend:**
```bash
cd backend
npm run dev
# Express server will run on http://localhost:5000
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
# React app will run on http://localhost:5173
```

### Option 2: Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Flask API:**
```bash
cd backend/python-engine
python flask_app.py
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
PROJECT_2/
├── backend/
│   ├── python-engine/
│   │   ├── flask_app.py          # Flask API for backtest execution
│   │   └── requirements.txt       # Python dependencies
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # MongoDB connection
│   │   │   └── logger.js          # Winston logger setup
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── backtestController.js
│   │   │   ├── dataController.js
│   │   │   └── strategyController.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication
│   │   │   └── validation.js      # Request validation
│   │   ├── models/
│   │   │   ├── Backtest.js
│   │   │   ├── HistoricalData.js
│   │   │   ├── Strategy.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── backtest.js
│   │   │   ├── data.js
│   │   │   └── strategy.js
│   │   ├── services/
│   │   │   ├── backtestService.js  # Backtest orchestration
│   │   │   ├── flaskService.js     # Flask API client
│   │   │   └── strategyParser.js   # Strategy code parsing
│   │   └── server.js               # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── RunBacktestModal.jsx
│   │   ├── pages/
│   │   │   ├── BacktestDetail.jsx
│   │   │   ├── Backtests.jsx
│   │   │   ├── CreateStrategy.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Datasets.jsx
│   │   │   ├── DataUpload.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Strategies.jsx
│   │   │   └── StrategyDetail.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── backtestService.js
│   │   │   ├── dataService.js
│   │   │   └── strategyService.js
│   │   ├── store/
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── backtestSlice.js
│   │   │       ├── dataSlice.js
│   │   │       └── strategySlice.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Strategies
- `GET /api/strategies` - Get all user strategies
- `GET /api/strategies/:id` - Get single strategy
- `POST /api/strategies` - Create new strategy
- `PUT /api/strategies/:id` - Update strategy
- `DELETE /api/strategies/:id` - Delete strategy

### Data Management
- `GET /api/data` - Get all datasets
- `GET /api/data/:id` - Get single dataset
- `POST /api/data/upload` - Upload CSV data
- `DELETE /api/data/:id` - Delete dataset

### Backtests
- `GET /api/backtests` - Get all backtests
- `GET /api/backtests/:id` - Get single backtest
- `POST /api/backtests` - Run new backtest
- `GET /api/backtests/:id/status` - Get backtest status
- `DELETE /api/backtests/:id` - Delete backtest

### Flask API
- `GET /health` - Health check
- `POST /backtest` - Execute backtest

## 📊 CSV Data Format

Upload CSV files with the following required columns:

```csv
Date,Open,High,Low,Close,Volume
2023-01-01,100.5,102.3,99.8,101.2,1000000
2023-01-02,101.2,103.5,100.9,102.8,1200000
...
```

**Required Columns:**
- `Date` - Trading date (YYYY-MM-DD format)
- `Open` - Opening price
- `High` - Highest price
- `Low` - Lowest price
- `Close` - Closing price

**Optional Columns:**
- `Volume` - Trading volume
- Any other custom indicators

## 📝 Strategy Code Example

Strategies should be written using the backtesting.py library format:

```python
from backtesting import Strategy
from backtesting.lib import crossover
import pandas as pd

class MyStrategy(Strategy):
    # Define parameters
    n1 = 20  # Fast moving average period
    n2 = 50  # Slow moving average period
    
    def init(self):
        # Calculate indicators
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

## 🔒 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/trading-platform

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d

# Flask API
FLASK_API_URL=http://localhost:5001

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

## 🧪 Testing

### Test Flask API

```bash
curl http://localhost:5001/health
```

### Test Backend API

```bash
curl http://localhost:5000/health
```

### Test Frontend

Open browser to `http://localhost:5173`

## 📈 Performance Metrics

The platform provides comprehensive backtest metrics:

- **Return Metrics**: Total return, return percentage
- **Risk Metrics**: Sharpe ratio, Sortino ratio, maximum drawdown
- **Trade Statistics**: Total trades, win rate, profit factor
- **Trade Analysis**: Average win/loss, largest win/loss, average duration
- **Visual Analysis**: Equity curve, drawdown chart, trade list

## 🛠️ Development

### Adding New Features

1. **Backend**: Add routes, controllers, and models in respective folders
2. **Frontend**: Create components and pages in src folder
3. **Flask API**: Extend flask_app.py for new backtest features

### Code Style

- **JavaScript**: ES6+ with async/await
- **Python**: PEP 8 style guide
- **React**: Functional components with hooks

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB is accessible on specified port

### Flask API Not Responding
- Check if Python virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check Flask API is running on port 5001

### CORS Errors
- Ensure backend CORS is properly configured
- Check frontend API URL matches backend URL

### File Upload Issues
- Verify UPLOAD_DIR exists and has write permissions
- Check MAX_FILE_SIZE setting
- Ensure CSV format matches requirements

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📧 Support

For issues and questions, please open an issue on the repository.

## 🎯 Roadmap

- [ ] Add more technical indicators
- [ ] Implement strategy optimization
- [ ] Add paper trading capabilities
- [ ] Multi-asset portfolio backtesting
- [ ] Export reports to PDF
- [ ] Real-time data integration
- [ ] Strategy marketplace
- [ ] Advanced charting features

---

**Built with ❤️ by the Trading Platform Team**
