

python - EOF
from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb://localhost:27017/")
db = client["crypto_investment_manager"]

collections_data = {
    "users": {"email": "demo@crypto.com", "created_at": datetime.utcnow()},
    "portfolio": {"user": "demo@crypto.com", "assets": [], "created_at": datetime.utcnow()},
    "crypto_prices": {"symbol": "BTC", "price": 45000, "timestamp": datetime.utcnow()},
    "alerts": {"symbol": "BTC", "target_price": 50000, "active": True},
    "rules": {"name": "Buy Low Sell High", "active": False},
    "reports": {"type": "monthly", "generated": False}
}

for collection, document in collections_data.items():
    db[collection].insert_one(document)

print("✅ Collections created with sample documents")
print("📁 Available collections:", db.list_collection_names())
EOF
