import pymongo
from pymongo import MongoClient
from datetime import datetime
import os
from typing import List, Dict, Any

class MongoDBConnection:
    def __init__(self):
        # MongoDB connection string - update with your MongoDB Compass connection
        self.connection_string = os.getenv('MONGODB_CONNECTION_STRING', 'mongodb://localhost:27017/')
        self.client = None
        self.db = None
        
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.connection_string)
            self.db = self.client['crypto_investment_manager']
            print("Connected to MongoDB successfully")
            return True
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    def get_collection(self, collection_name: str):
        """Get a MongoDB collection"""
        if self.db is not None:
            return self.db[collection_name]
        return None

class MongoDBService:
    def __init__(self):
        self.connection = MongoDBConnection()
        self.connection.connect()
    
    # User operations
    def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create a new user"""
        users_collection = self.connection.get_collection('users')
        try:
            result = users_collection.insert_one(user_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Dict[str, Any]:
        """Get user by email"""
        users_collection = self.connection.get_collection('users')
        try:
            user = users_collection.find_one({"email": email})
            if user:
                user['_id'] = str(user['_id'])  # Convert ObjectId to string
                return user
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    # Portfolio operations
    def get_portfolio_summary(self) -> Dict[str, Any]:
        """Get portfolio summary with assets"""
        portfolio_collection = self.connection.get_collection('portfolio')
        try:
            # Get all portfolio assets
            assets = list(portfolio_collection.find({}))
            
            # Convert ObjectId to string for JSON serialization
            for asset in assets:
                asset['_id'] = str(asset['_id'])
            
            # Calculate total value
            total_value = sum(asset.get('value', 0) for asset in assets)
            
            return {
                "total_value": total_value,
                "assets": assets,
                "risk_level": "Medium",
                "predicted_return": 0.15
            }
        except Exception as e:
            print(f"Error getting portfolio: {e}")
            return {
                "total_value": 0,
                "assets": [],
                "risk_level": "Medium",
                "predicted_return": 0.15
            }
    
    def add_portfolio_asset(self, asset_data: Dict[str, Any]) -> str:
        """Add a new asset to portfolio"""
        portfolio_collection = self.connection.get_collection('portfolio')
        try:
            asset_data['created_at'] = datetime.utcnow()
            result = portfolio_collection.insert_one(asset_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding portfolio asset: {e}")
            return None
    
    def update_portfolio_asset(self, symbol: str, update_data: Dict[str, Any]) -> bool:
        """Update an existing portfolio asset"""
        portfolio_collection = self.connection.get_collection('portfolio')
        try:
            result = portfolio_collection.update_one(
                {"symbol": symbol},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating portfolio asset: {e}")
            return False
    
    def remove_portfolio_asset(self, symbol: str) -> bool:
        """Remove an asset from portfolio"""
        portfolio_collection = self.connection.get_collection('portfolio')
        try:
            result = portfolio_collection.delete_one({"symbol": symbol})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error removing portfolio asset: {e}")
            return False
    
    # Crypto prices operations
    def get_crypto_prices(self) -> List[Dict[str, Any]]:
        """Get latest crypto prices"""
        prices_collection = self.connection.get_collection('crypto_prices')
        try:
            # Get all prices from collection
            prices = list(prices_collection.find({}))
            
            # Convert ObjectId to string for JSON serialization
            for price in prices:
                price['_id'] = str(price['_id'])
            
            return prices
        except Exception as e:
            print(f"Error getting crypto prices: {e}")
            return []
    
    def update_crypto_prices(self, prices_data: List[Dict[str, Any]]) -> bool:
        """Update crypto prices in database"""
        prices_collection = self.connection.get_collection('crypto_prices')
        try:
            # Add timestamp to each price record
            for price in prices_data:
                price['timestamp'] = datetime.utcnow()
            
            # Insert new price records
            if prices_data:
                result = prices_collection.insert_many(prices_data)
                print(f"Inserted {len(result.inserted_ids)} price records")
                return True
            return False
        except Exception as e:
            print(f"Error updating crypto prices: {e}")
            return False
    
    # Alerts operations
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Get all alerts"""
        alerts_collection = self.connection.get_collection('alerts')
        try:
            alerts = list(alerts_collection.find({}))
            for alert in alerts:
                alert['_id'] = str(alert['_id'])
            return alerts
        except Exception as e:
            print(f"Error getting alerts: {e}")
            return []
    
    def create_alert(self, alert_data: Dict[str, Any]) -> str:
        """Create a new alert"""
        alerts_collection = self.connection.get_collection('alerts')
        try:
            alert_data['created_at'] = datetime.utcnow()
            result = alerts_collection.insert_one(alert_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating alert: {e}")
            return None
    
    def get_reports(self) -> List[Dict[str, Any]]:
        """Get all reports"""
        reports_collection = self.connection.get_collection('reports')
        try:
            reports = list(reports_collection.find({}))
            for report in reports:
                report['_id'] = str(report['_id'])
            return reports
        except Exception as e:
            print(f"Error getting reports: {e}")
            return []
    
    def create_report(self, report_data: Dict[str, Any]) -> str:
        """Create a new report"""
        reports_collection = self.connection.get_collection('reports')
        try:
            report_data['created_at'] = datetime.utcnow()
            result = reports_collection.insert_one(report_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating report: {e}")
            return None

# Global MongoDB service instance
mongo_service = MongoDBService()

# Initialize database with demo data
def initialize_demo_data():
    """Initialize MongoDB with demo data"""
    try:
        # Create demo user if not exists
        existing_user = mongo_service.get_user_by_email("demo@example.com")
        if not existing_user:
            demo_user = {
                "full_name": "Demo User",
                "email": "demo@example.com",
                "password_hash": hashlib.sha256("demo123".encode()).hexdigest(),
                "created_at": datetime.utcnow()
            }
            mongo_service.create_user(demo_user)
            print("Created demo user")
        
        # Create demo portfolio assets if empty
        portfolio = mongo_service.get_portfolio_summary()
        if not portfolio.get('assets', []):
            demo_assets = [
                {
                    "symbol": "BTC",
                    "amount": 0.5,
                    "current_price": 40000,
                    "value": 20000,
                    "change_percentage_24h": 2.5
                },
                {
                    "symbol": "ETH",
                    "amount": 2.0,
                    "current_price": 3000,
                    "value": 6000,
                    "change_percentage_24h": -1.2
                },
                {
                    "symbol": "ADA",
                    "amount": 1000,
                    "current_price": 0.5,
                    "value": 500,
                    "change_percentage_24h": 0.8
                }
            ]
            
            for asset in demo_assets:
                mongo_service.add_portfolio_asset(asset)
            print("Created demo portfolio assets")
        
        # Create demo alerts if empty
        alerts = mongo_service.get_alerts()
        if not alerts:
            demo_alerts = [
                {
                    "symbol": "BTC",
                    "condition": "price_above",
                    "threshold": 50000,
                    "message": "BTC price alert",
                    "triggered": False
                },
                {
                    "symbol": "ETH",
                    "condition": "price_below",
                    "threshold": 2500,
                    "message": "ETH price drop alert",
                    "triggered": False
                }
            ]
            
            for alert in demo_alerts:
                mongo_service.create_alert(alert)
            print("Created demo alerts")
        
        print("MongoDB demo data initialized successfully")
        
    except Exception as e:
        print(f"Error initializing demo data: {e}")

# Crypto symbols to track
crypto_symbols = ["bitcoin", "ethereum", "binancecoin", "cardano", "solana"]
