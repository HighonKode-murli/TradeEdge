# Quick Setup Guide

## Prerequisites Installation

### 1. Install Node.js
Download and install Node.js v18+ from: https://nodejs.org/

### 2. Install Python
Download and install Python 3.10+ from: https://www.python.org/

### 3. Install MongoDB
Download and install MongoDB v7.0+ from: https://www.mongodb.com/try/download/community

## Project Setup

### Step 1: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Python dependencies
cd ../backend/python-engine
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# In backend directory
cp .env.example .env

# Edit .env and set:
# - MONGODB_URI (default: mongodb://localhost:27017/trading-platform)
# - JWT_SECRET (use a strong secret key)
# - FLASK_API_URL (default: http://localhost:5001)
```

### Step 3: Start MongoDB

```bash
# Windows (if installed as service):
# MongoDB starts automatically

# Linux:
sudo systemctl start mongod

# Mac:
brew services start mongodb-community

# Manual start:
mongod --dbpath <path-to-data-directory>
```

### Step 4: Run the Application

**Option A: Using Startup Scripts (Easiest)**

Windows:
```bash
start.bat
```

Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

**Option B: Manual Start**

Terminal 1 - Flask API:
```bash
cd backend/python-engine
python flask_app.py
```

Terminal 2 - Backend:
```bash
cd backend
npm start
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

## Verification

1. Flask API: http://localhost:5001/health
2. Backend API: http://localhost:5000/health
3. Frontend: http://localhost:5173

## First Time Usage

1. Open http://localhost:5173
2. Register a new account
3. Upload historical data (CSV format)
4. Create a strategy
5. Run a backtest

## Troubleshooting

### MongoDB Not Connecting
- Verify MongoDB is running: `mongod --version`
- Check connection string in .env file

### Flask API Not Starting
- Verify Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port 5001 is not in use

### Frontend Not Loading
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Development Mode

For development with hot reload:

```bash
# Backend (auto-restart on changes)
cd backend
npm run dev

# Frontend (hot module replacement)
cd frontend
npm run dev

# Flask API (with debug mode)
cd backend/python-engine
# Set environment variable first
export FLASK_DEBUG=1  # Linux/Mac
set FLASK_DEBUG=1     # Windows
python flask_app.py
```

## Need Help?

Check the main README.md for detailed documentation.
