"""
Test script for Flask Backtest API
"""
import requests
import json
import base64

# Sample strategy code
STRATEGY_CODE = """
from backtesting import Strategy
from backtesting.lib import crossover

class TestStrategy(Strategy):
    n1 = 10
    n2 = 20
    
    def init(self):
        close = self.data.Close
        self.sma1 = self.I(lambda x: pd.Series(x).rolling(self.n1).mean(), close)
        self.sma2 = self.I(lambda x: pd.Series(x).rolling(self.n2).mean(), close)
    
    def next(self):
        if crossover(self.sma1, self.sma2):
            self.buy()
        elif crossover(self.sma2, self.sma1):
            self.position.close()
"""

# Sample CSV data
CSV_DATA = """Date,Open,High,Low,Close,Volume
2023-01-01,100,102,99,101,1000000
2023-01-02,101,103,100,102,1100000
2023-01-03,102,104,101,103,1200000
2023-01-04,103,105,102,104,1300000
2023-01-05,104,106,103,105,1400000
2023-01-06,105,107,104,106,1500000
2023-01-07,106,108,105,107,1600000
2023-01-08,107,109,106,108,1700000
2023-01-09,108,110,107,109,1800000
2023-01-10,109,111,108,110,1900000
2023-01-11,110,112,109,111,2000000
2023-01-12,111,113,110,112,2100000
2023-01-13,112,114,111,113,2200000
2023-01-14,113,115,112,114,2300000
2023-01-15,114,116,113,115,2400000
2023-01-16,115,117,114,116,2500000
2023-01-17,116,118,115,117,2600000
2023-01-18,117,119,116,118,2700000
2023-01-19,118,120,117,119,2800000
2023-01-20,119,121,118,120,2900000
2023-01-21,120,122,119,121,3000000
2023-01-22,121,123,120,122,3100000
2023-01-23,122,124,121,123,3200000
2023-01-24,123,125,122,124,3300000
2023-01-25,124,126,123,125,3400000
2023-01-26,125,127,124,126,3500000
2023-01-27,126,128,125,127,3600000
2023-01-28,127,129,126,128,3700000
2023-01-29,128,130,127,129,3800000
2023-01-30,129,131,128,130,3900000
"""

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get("http://localhost:5001/health")
        if response.status_code == 200:
            print("✓ Health check passed")
            print(f"  Response: {response.json()}")
            return True
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False

def test_backtest():
    """Test backtest endpoint"""
    print("\nTesting backtest endpoint...")
    
    # Encode data
    strategy_b64 = base64.b64encode(STRATEGY_CODE.encode()).decode()
    csv_b64 = base64.b64encode(CSV_DATA.encode()).decode()
    
    payload = {
        "strategyCode": strategy_b64,
        "csvData": csv_b64,
        "initialCapital": 10000,
        "commission": 0.001
    }
    
    try:
        response = requests.post(
            "http://localhost:5001/backtest",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✓ Backtest executed successfully")
            results = response.json()
            print(f"  Final Equity: ${results.get('finalEquity', 0):.2f}")
            print(f"  Total Return: {results.get('totalReturnPct', 0):.2f}%")
            print(f"  Total Trades: {results.get('totalTrades', 0)}")
            print(f"  Win Rate: {results.get('winRate', 0):.2f}%")
            print(f"  Sharpe Ratio: {results.get('sharpeRatio', 0):.2f}")
            return True
        else:
            print(f"✗ Backtest failed with status {response.status_code}")
            print(f"  Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"✗ Backtest failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("Flask Backtest API Test Suite")
    print("=" * 50)
    print()
    
    health_ok = test_health()
    
    if health_ok:
        backtest_ok = test_backtest()
        
        print("\n" + "=" * 50)
        if health_ok and backtest_ok:
            print("All tests passed! ✓")
        else:
            print("Some tests failed! ✗")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("Flask API is not running!")
        print("Please start it with: python flask_app.py")
        print("=" * 50)

if __name__ == "__main__":
    main()
