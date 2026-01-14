from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import requests
import asyncio
import uvicorn

app = FastAPI(title="Crypto Investment Manager API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for crypto prices
crypto_prices_cache = []

# Crypto symbols to track
crypto_symbols = ["bitcoin", "ethereum", "binancecoin", "cardano", "solana"]

# Background task for fetching crypto prices
async def fetch_crypto_prices():
    """Background task to fetch crypto prices every 30 seconds"""
    global crypto_prices_cache
    
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
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Update crypto prices cache
                crypto_prices_cache = []
                symbol_map = {
                    "bitcoin": "BTC",
                    "ethereum": "ETH", 
                    "binancecoin": "BNB",
                    "cardano": "ADA",
                    "solana": "SOL"
                }
                
                for symbol in crypto_symbols:
                    if symbol in data:
                        price_data = {
                            "symbol": symbol_map.get(symbol, symbol.upper()),
                            "price": data[symbol]["usd"],
                            "change_24h": data[symbol].get("usd_24h_change", 0),
                            "change_percentage_24h": data[symbol].get("usd_24h_change", 0),
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        crypto_prices_cache.append(price_data)
                
                print(f"Updated crypto prices: {len(crypto_prices_cache)} symbols")
            
            await asyncio.sleep(30)  # Wait 30 seconds
        except Exception as e:
            print(f"Error fetching crypto prices: {e}")
            await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    """Initialize crypto prices on startup"""
    print("Starting crypto price fetching...")
    asyncio.create_task(fetch_crypto_prices())

@app.get("/")
async def root():
    return {"message": "Crypto Investment Manager API is running"}

@app.get("/crypto/prices")
async def get_crypto_prices():
    """Get current crypto prices"""
    return crypto_prices_cache

@app.get("/dashboard/summary")
async def get_dashboard_summary():
    """Get dashboard summary"""
    return {
        "total_value": 26500,
        "assets": [
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
        ],
        "risk_level": "Medium",
        "predicted_return": 0.15
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
