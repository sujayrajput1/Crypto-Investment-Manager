import pymongo
from pymongo import MongoClient

def clean_crypto_prices():
    """Clean up crypto prices collection - keep only latest price per symbol"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['crypto_investment_manager']
        prices_collection = db['crypto_prices']
        
        # Get all current prices
        all_prices = list(prices_collection.find({}))
        print(f"Found {len(all_prices)} price records")
        
        # Group by symbol and keep only the latest for each
        latest_prices = {}
        for price in all_prices:
            symbol = price.get('symbol', 'UNKNOWN')
            if symbol not in latest_prices or price.get('timestamp', '') > latest_prices[symbol].get('timestamp', ''):
                latest_prices[symbol] = price
        
        # Clear collection and insert only latest prices
        prices_collection.delete_many({})
        if latest_prices:
            prices_collection.insert_many(list(latest_prices.values()))
            print(f"Inserted {len(latest_prices)} unique price records")
        
        # Show what we kept
        for symbol, price in latest_prices.items():
            print(f"  {symbol}: ${price.get('price', 0)} ({price.get('change_percentage_24h', 0):.2f}%)")
        
        client.close()
        print("✅ Crypto prices cleaned successfully!")
        
    except Exception as e:
        print(f"❌ Error cleaning crypto prices: {e}")

def clean_portfolio():
    """Clean up portfolio collection - remove duplicate symbols"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['crypto_investment_manager']
        portfolio_collection = db['portfolio']
        
        # Get all portfolio assets
        all_assets = list(portfolio_collection.find({}))
        print(f"Found {len(all_assets)} portfolio assets")
        
        # Group by symbol and keep only one entry per symbol
        unique_assets = {}
        for asset in all_assets:
            symbol = asset.get('symbol', 'UNKNOWN')
            if symbol not in unique_assets:
                unique_assets[symbol] = asset
        
        # Clear collection and insert only unique assets
        portfolio_collection.delete_many({})
        if unique_assets:
            portfolio_collection.insert_many(list(unique_assets.values()))
            print(f"Inserted {len(unique_assets)} unique portfolio assets")
        
        # Show what we kept
        for symbol, asset in unique_assets.items():
            print(f"  {symbol}: {asset.get('amount', 0)} units @ ${asset.get('current_price', 0)}")
        
        client.close()
        print("✅ Portfolio cleaned successfully!")
        
    except Exception as e:
        print(f"❌ Error cleaning portfolio: {e}")

if __name__ == "__main__":
    print("🧹 Cleaning MongoDB database...")
    clean_crypto_prices()
    clean_portfolio()
    print("✅ Database cleanup complete!")
