from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import requests
import asyncio
from typing import List, Optional
import os
import hashlib
import json
from mongodb_service import mongo_service, initialize_demo_data

app = FastAPI(title="Crypto Investment Manager API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (for demo - replace with database in production)
users_db = {}
portfolio_db = {}
prices_db = {}

# Add demo user for testing
users_db["demo@example.com"] = {
    "full_name": "Demo User",
    "email": "demo@example.com",
    "password_hash": hashlib.sha256("demo123".encode()).hexdigest(),
    "created_at": datetime.utcnow()
}

# Pydantic models (simplified)
class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class PortfolioAsset(BaseModel):
    symbol: str
    amount: float
    current_price: float
    value: float

class PortfolioSummary(BaseModel):
    total_value: float
    assets: List[PortfolioAsset]
    risk_level: str
    predicted_return: float

class CryptoPrice(BaseModel):
    symbol: str
    price: float
    change_24h: float
    change_percentage_24h: float
    timestamp: datetime

# Simple password hashing (demo only)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# Simple token generation (demo only)
def create_simple_token(email: str) -> str:
    return hashlib.sha256(f"{email}{datetime.now()}".encode()).hexdigest()

# Mock current user (simplified)
current_user = {"email": "demo@example.com", "full_name": "Demo User"}

# Crypto symbols
crypto_symbols = ["bitcoin", "ethereum", "binancecoin", "cardano", "solana"]

# Background task for fetching crypto prices
async def fetch_crypto_prices():
    """Background task to fetch crypto prices every 30 seconds"""
    while True:
        try:
            # Fetch prices from CoinGecko
            ids = ",".join(crypto_symbols)
            response = requests.get(
                f"https://api.coingecko.com/api/v3/simple/price",
                params={
                    "ids": ids,
                    "vs_currencies": "usd",
                    "include_24hr_change": "true"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Store prices in MongoDB
                prices_data = []
                for symbol in crypto_symbols:
                    if symbol in data:
                        price_data = {
                            "symbol": symbol,
                            "price": data[symbol]["usd"],
                            "change_24h": data[symbol]["usd_24h_change"],
                            "change_percentage_24h": data[symbol]["usd_24h_change"],
                            "timestamp": datetime.utcnow()
                        }
                        prices_data.append(price_data)
                
                # Update MongoDB with new prices
                mongo_service.update_crypto_prices(prices_data)
            
            await asyncio.sleep(30)  # Wait 30 seconds
        except Exception as e:
            print(f"Error fetching crypto prices: {e}")
            await asyncio.sleep(30)

# Startup event
@app.on_event("startup")
async def startup_event():
    try:
        # Initialize MongoDB connection (no demo data)
        print("MongoDB initialized successfully")
    except Exception as e:
        print(f"Error during startup: {e}")
        print("Starting without MongoDB initialization")
    finally:
        # Start background task for fetching crypto prices
        asyncio.create_task(fetch_crypto_prices())

# Auth endpoints
@app.post("/auth/signup")
async def signup(user: UserCreate):
    # Check if user already exists
    existing_user = mongo_service.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_data = {
        "full_name": user.full_name,
        "email": user.email,
        "password_hash": hash_password(user.password),
        "created_at": datetime.utcnow()
    }
    
    result = mongo_service.create_user(user_data)
    if result:
        return {"message": "User created successfully", "email": user.email}
    else:
        raise HTTPException(status_code=500, detail="Error creating user")

@app.post("/auth/login")
async def login(user: UserLogin):
    # Find user
    db_user = mongo_service.get_user_by_email(user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create simple token
    token = create_simple_token(user.email)
    
    return {"access_token": token, "token_type": "bearer"}

# Protected endpoints
@app.get("/dashboard/summary")
async def get_dashboard_summary():
    # Calculate dynamic predicted return based on actual portfolio data
    try:
        portfolio_data = mongo_service.get_portfolio_summary()
        
        if portfolio_data and portfolio_data.get('assets'):
            # Calculate predicted return based on actual assets
            crypto_weights = {
                'BTC': 0.4,    # High risk, high return
                'ETH': 0.3,    # Medium risk, medium return  
                'BNB': 0.1,    # Low risk, low return
                'ADA': 0.1,    # Low risk, low return
                'SOL': 0.1     # High risk, high return
            };
            
            weighted_return = 0;
            for asset in portfolio_data['assets']:
                weight = crypto_weights.get(asset.get('symbol'), 0.2);
                asset_return = (asset.get('change_percentage_24h', 0)) / 100;
                weighted_return += weight * asset_return;
            
            # Calculate risk level based on diversification
            unique_symbols = len(set(asset.get('symbol') for asset in portfolio_data['assets']));
            diversification_score = unique_symbols / 5;  # 5 is max possible symbols
            
            if diversification_score >= 0.8:
                risk_level = 'Low'
            elif diversification_score >= 0.6:
                risk_level = 'Medium'
            else:
                risk_level = 'High'
            
            portfolio_data['predicted_return'] = weighted_return
            portfolio_data['risk_level'] = risk_level
            
            return portfolio_data
        else:
            # Return empty portfolio with default values
            return {
                "total_value": 0,
                "assets": [],
                "risk_level": "Medium",
                "predicted_return": 0.0
            }
    except Exception as e:
        print(f"Error calculating portfolio summary: {e}")
        return {
            "total_value": 0,
            "assets": [],
            "risk_level": "Medium",
            "predicted_return": 0.0
        }

@app.get("/crypto/prices")
async def get_crypto_prices():
    # Get latest prices from MongoDB
    return mongo_service.get_crypto_prices()

@app.post("/portfolio/mix")
async def calculate_investment_mix(request: dict):
    symbols = request.get("symbols", [])
    weights = request.get("weights", [])
    strategy = request.get("strategy", "balanced")
    
    # Simple rule-based calculation
    total_weight = sum(weights)
    if abs(total_weight - 100.0) > 0.01:
        raise HTTPException(status_code=400, detail="Weights must sum to 100%")
    
    # Mock calculation logic
    expected_returns = {
        "bitcoin": 0.20,
        "ethereum": 0.25,
        "binancecoin": 0.15,
        "cardano": 0.18,
        "solana": 0.30
    }
    
    portfolio_return = sum(
        expected_returns.get(symbol, 0.10) * (weight / 100)
        for symbol, weight in zip(symbols, weights)
    )
    
    return {
        "suggested_mix": dict(zip(symbols, weights)),
        "expected_return": portfolio_return,
        "risk_score": 0.65 if strategy == "balanced" else 0.45
    }

@app.get("/risk/analyze")
async def analyze_risk():
    # Mock risk analysis
    return {
        "portfolio_risk": 0.65,
        "volatility": 0.45,
        "predicted_return": 0.15,
        "risk_level": "Medium"
    }

@app.get("/reports")
async def get_reports():
    # Mock reports data
    return [
        {
            "id": "1",
            "date": datetime.utcnow().isoformat(),
            "type": "Portfolio Summary",
            "value": 30000,
            "risk_level": "Medium"
        }
    ]

@app.get("/reports/export/csv")
async def export_reports_csv():
    # Mock CSV export
    csv_content = "Date,Type,Value,Risk Level\n2026-01-13,Portfolio Summary,29000,Medium"
    
    return {"csv_content": csv_content, "filename": "portfolio_report.csv"}

@app.post("/alerts")
async def create_alert(alert_data: dict):
    # Create alert in MongoDB
    result = mongo_service.create_alert(alert_data)
    if result:
        return {"id": result, "message": "Alert created successfully", "alert_data": alert_data}
    else:
        raise HTTPException(status_code=500, detail="Error creating alert")

@app.get("/alerts")
async def get_alerts():
    # Return empty alerts for new users
    return []

@app.post("/portfolio/add")
async def add_portfolio_asset(asset_data: dict):
    # Get current crypto price and add it to the asset data
    try:
        crypto_prices = mongo_service.get_crypto_prices()
        current_price = None
        change_24h = 0
        change_percentage_24h = 0
        
        # Find current price for the asset
        for price_data in crypto_prices:
            if price_data['symbol'] == asset_data.get('symbol'):
                current_price = price_data['price']
                change_24h = price_data.get('change_24h', 0)
                change_percentage_24h = price_data.get('change_percentage_24h', 0)
                break
        
        # Calculate value if not provided
        amount = asset_data.get('amount', 0)
        if current_price and not asset_data.get('current_price'):
            asset_data['current_price'] = current_price
            asset_data['value'] = amount * current_price
        elif not asset_data.get('value'):
            asset_data['value'] = amount * asset_data.get('current_price', 0)
        
        # Add price change data
        asset_data['change_24h'] = change_24h
        asset_data['change_percentage_24h'] = change_percentage_24h
        
        # Add new asset to portfolio in MongoDB
        result = mongo_service.add_portfolio_asset(asset_data)
        if result:
            return {"message": "Asset added successfully", "id": result}
        else:
            raise HTTPException(status_code=500, detail="Error adding asset")
    except Exception as e:
        print(f"Error adding portfolio asset: {e}")
        raise HTTPException(status_code=500, detail="Error adding asset")

@app.delete("/portfolio/remove/{symbol}")
async def remove_portfolio_asset(symbol: str):
    # Remove asset from portfolio in MongoDB
    result = mongo_service.remove_portfolio_asset(symbol)
    if result:
        return {"message": f"Asset {symbol} removed successfully"}
    else:
        raise HTTPException(status_code=500, detail="Error removing asset")

@app.get("/debug/data")
async def debug_data():
    """Debug endpoint to view MongoDB data"""
    try:
        # Get sample data from each collection
        users = list(mongo_service.connection.get_collection('users').find({}))
        portfolio = list(mongo_service.connection.get_collection('portfolio').find({}))
        prices = list(mongo_service.connection.get_collection('crypto_prices').find({}))
        alerts = mongo_service.get_alerts()
        reports = mongo_service.get_reports()
        rules = mongo_service.get_rules()
        
        # Convert ObjectId to string for JSON serialization
        for user in users:
            user['_id'] = str(user['_id'])
        for asset in portfolio:
            asset['_id'] = str(asset['_id'])
        for price in prices:
            price['_id'] = str(price['_id'])
        
        return {
            "users": users,
            "portfolio": portfolio,
            "prices": prices,
            "alerts": alerts,
            "rules": rules,
            "reports": reports,
            "crypto_symbols": crypto_symbols
        }
    except Exception as e:
        return {"error": f"Error accessing MongoDB data: {e}"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)