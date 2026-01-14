import pymongo
from pymongo import MongoClient
from datetime import datetime

def force_create_collections():
    try:
        # Connect to MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        db = client['crypto_investment_manager']
        
        # Create collections
        db.create_collection('users')
        db.create_collection('portfolio') 
        db.create_collection('crypto_prices')
        db.create_collection('alerts')
        db.create_collection('rules')
        db.create_collection('reports')
        
        print(' Collections created successfully!')
        print(' Available collections:', db.list_collection_names())
        
        # Insert sample data
        sample_user = {"full_name": "Demo User", "email": "demo@example.com"}
        db['users'].insert_one(sample_user)
        
        sample_asset = {"symbol": "BTC", "amount": 0.5, "current_price": 40000, "value": 20000}
        db['portfolio'].insert_one(sample_asset)
        
        sample_price = {"symbol": "BTC", "price": 40000, "change_24h": 2.5}
        db['crypto_prices'].insert_one(sample_price)
        
        sample_alert = {"symbol": "BTC", "threshold": 50000, "active": True}
        db['alerts'].insert_one(sample_alert)
        
        print('✅ Sample data inserted!')
        return True
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return False

if __name__ == "__main__":
    force_create_collections()
