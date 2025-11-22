from flask import Flask, request, jsonify
import os
import json
import base64
import pandas as pd
import traceback
from backtesting import Backtest, Strategy
import importlib.util
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def load_strategy_from_code(code_str):
    """Dynamically load strategy class from code string"""
    try:
        spec = importlib.util.spec_from_loader("strategy_module", loader=None)
        strategy_module = importlib.util.module_from_spec(spec)
        exec(code_str, strategy_module.__dict__)
        
        for name, obj in strategy_module.__dict__.items():
            if isinstance(obj, type) and issubclass(obj, Strategy) and obj != Strategy:
                return obj
                
        raise ValueError("No Strategy class found")
    except Exception as e:
        raise ValueError(f"Failed to load strategy: {str(e)}")

def safe_get(stats, key, default=0):
    """Safely get stat value, return default if not found"""
    try:
        val = stats.get(key, default)
        return float(val) if pd.notna(val) else default
    except:
        return default

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'backtest-engine',
        'version': '1.0.0'
    }), 200

@app.route('/backtest', methods=['POST'])
def run_backtest():
    """Execute backtest with provided strategy and data"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract parameters
        strategy_code_b64 = data.get('strategyCode')
        csv_data_b64 = data.get('csvData')
        initial_capital = float(data.get('initialCapital', 10000))
        commission = float(data.get('commission', 0.001))
        
        if not strategy_code_b64:
            return jsonify({'error': 'strategyCode is required'}), 400
        if not csv_data_b64:
            return jsonify({'error': 'csvData is required'}), 400
        
        # Decode strategy code
        try:
            strategy_code = base64.b64decode(strategy_code_b64).decode('utf-8')
        except Exception as e:
            return jsonify({'error': f'Failed to decode strategy code: {str(e)}'}), 400
        
        # Decode CSV data
        try:
            csv_content = base64.b64decode(csv_data_b64).decode('utf-8')
        except Exception as e:
            return jsonify({'error': f'Failed to decode CSV data: {str(e)}'}), 400
        
        # Write CSV to temporary file and load
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as tmp_file:
            tmp_file.write(csv_content)
            tmp_file_path = tmp_file.name
        
        try:
            # Load data
            df = pd.read_csv(tmp_file_path)
            
            if 'Date' not in df.columns:
                return jsonify({'error': "CSV must have 'Date' column"}), 400
            
            df['Date'] = pd.to_datetime(df['Date'])
            df.set_index('Date', inplace=True)
            
            # Validate OHLC columns
            required = ['Open', 'High', 'Low', 'Close']
            for col in required:
                if col not in df.columns:
                    return jsonify({'error': f"CSV must have '{col}' column"}), 400
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            df = df.dropna()
            
            if len(df) == 0:
                return jsonify({'error': 'No valid data after cleaning'}), 400
            
            # Load strategy
            StrategyClass = load_strategy_from_code(strategy_code)
            
            # Run backtest
            bt = Backtest(
                df, 
                StrategyClass, 
                cash=initial_capital, 
                commission=commission,
                exclusive_orders=True
            )
            
            stats = bt.run()
            
            # Format equity curve
            equity_curve = []
            if hasattr(stats, '_equity_curve'):
                for date, value in stats._equity_curve['Equity'].items():
                    equity_curve.append({
                        'date': date.isoformat(),
                        'value': float(value)
                    })
            
            # Format drawdown
            drawdown_curve = []
            if hasattr(stats, '_equity_curve') and 'DrawdownPct' in stats._equity_curve:
                for date, value in stats._equity_curve['DrawdownPct'].items():
                    drawdown_curve.append({
                        'date': date.isoformat(),
                        'value': float(value)
                    })
            
            # Format trades
            trades_list = []
            if hasattr(stats, '_trades') and len(stats._trades) > 0:
                for _, trade in stats._trades.iterrows():
                    trades_list.append({
                        'entryDate': trade['EntryTime'].isoformat() if pd.notna(trade['EntryTime']) else None,
                        'exitDate': trade['ExitTime'].isoformat() if pd.notna(trade['ExitTime']) else None,
                        'entryPrice': float(trade['EntryPrice']) if pd.notna(trade['EntryPrice']) else None,
                        'exitPrice': float(trade['ExitPrice']) if pd.notna(trade['ExitPrice']) else None,
                        'size': float(trade['Size']) if pd.notna(trade['Size']) else None,
                        'pnl': float(trade['PnL']) if pd.notna(trade['PnL']) else None,
                        'pnlPct': float(trade['ReturnPct']) if pd.notna(trade['ReturnPct']) else None,
                        'type': 'long' if trade['Size'] > 0 else 'short',
                        'duration': int(trade['Duration'].total_seconds() / 60) if pd.notna(trade['Duration']) else None
                    })
            
            # Calculate metrics
            winning = len([t for t in trades_list if t['pnl'] and t['pnl'] > 0])
            losing = len([t for t in trades_list if t['pnl'] and t['pnl'] < 0])
            
            avg_win = sum([t['pnl'] for t in trades_list if t['pnl'] and t['pnl'] > 0]) / winning if winning > 0 else 0
            avg_loss = sum([t['pnl'] for t in trades_list if t['pnl'] and t['pnl'] < 0]) / losing if losing > 0 else 0
            
            largest_win = max([t['pnl'] for t in trades_list if t['pnl'] and t['pnl'] > 0], default=0)
            largest_loss = min([t['pnl'] for t in trades_list if t['pnl'] and t['pnl'] < 0], default=0)
            
            avg_duration = sum([t['duration'] for t in trades_list if t['duration']]) / len(trades_list) if trades_list else 0
            
            # Results with safe key access
            results = {
                'finalEquity': safe_get(stats, 'Equity Final [$]', initial_capital),
                'totalReturn': safe_get(stats, 'Equity Final [$]', initial_capital) - initial_capital,
                'totalReturnPct': safe_get(stats, 'Return [%]'),
                'sharpeRatio': safe_get(stats, 'Sharpe Ratio'),
                'sortinoRatio': safe_get(stats, 'Sortino Ratio'),
                'maxDrawdown': abs(safe_get(stats, 'Max. Drawdown [%]')) * initial_capital / 100,
                'maxDrawdownPct': abs(safe_get(stats, 'Max. Drawdown [%]')),
                'winRate': safe_get(stats, 'Win Rate [%]'),
                'totalTrades': int(safe_get(stats, '# Trades')),
                'winningTrades': winning,
                'losingTrades': losing,
                'profitFactor': safe_get(stats, 'Profit Factor'),
                'avgWin': float(avg_win),
                'avgLoss': float(avg_loss),
                'largestWin': float(largest_win),
                'largestLoss': float(largest_loss),
                'avgTradeDuration': float(avg_duration),
                'equityCurve': equity_curve,
                'drawdownCurve': drawdown_curve,
                'trades': trades_list
            }
            
            logger.info(f"Backtest completed successfully. Total trades: {results['totalTrades']}")
            return jsonify(results), 200
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        
    except Exception as e:
        logger.error(f"Backtest error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
