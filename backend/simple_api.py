from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
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

@app.get("/")
async def root():
    return {"message": "Crypto Investment Manager API is running"}

@app.get("/crypto/prices")
async def get_crypto_prices():
    """Get current crypto prices - mock data for demo"""
    return [
        {
            "symbol": "BTC",
            "price": 42500.50,
            "change_24h": 2.5,
            "change_percentage_24h": 2.5,
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "symbol": "ETH",
            "price": 3150.25,
            "change_24h": -1.2,
            "change_percentage_24h": -1.2,
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "symbol": "BNB",
            "price": 320.75,
            "change_24h": 0.8,
            "change_percentage_24h": 0.8,
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "symbol": "ADA",
            "price": 0.52,
            "change_24h": 1.5,
            "change_percentage_24h": 1.5,
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "symbol": "SOL",
            "price": 98.30,
            "change_24h": -0.5,
            "change_percentage_24h": -0.5,
            "timestamp": datetime.utcnow().isoformat()
        }
    ]

@app.get("/dashboard/summary")
async def get_dashboard_summary():
    """Get dashboard summary"""
    return {
        "total_value": 26500,
        "assets": [
            {
                "symbol": "BTC",
                "amount": 0.5,
                "current_price": 42500.50,
                "value": 21250.25,
                "change_percentage_24h": 2.5
            },
            {
                "symbol": "ETH", 
                "amount": 2.0,
                "current_price": 3150.25,
                "value": 6300.50,
                "change_percentage_24h": -1.2
            },
            {
                "symbol": "ADA",
                "amount": 1000,
                "current_price": 0.52,
                "value": 520.00,
                "change_percentage_24h": 1.5
            }
        ],
        "risk_level": "Medium",
        "predicted_return": 0.15
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    print("Starting Crypto Investment Manager API on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
