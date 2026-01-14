from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
    # Return sample crypto prices
    return [
        {
            "symbol": "BTC",
            "price": 40000,
            "change_24h": 2.5
        },
        {
            "symbol": "ETH", 
            "price": 3000,
            "change_24h": -1.2
        },
        {
            "symbol": "ADA",
            "price": 0.5,
            "change_24h": 0.8
        }
    ]

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
