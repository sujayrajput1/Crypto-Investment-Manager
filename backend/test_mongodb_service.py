import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from mongodb_service import mongo_service
    print("✅ MongoDB service imported successfully")
    
    # Test getting crypto prices
    prices = mongo_service.get_crypto_prices()
    print(f"📊 Crypto prices: {prices}")
    
    # Test getting portfolio summary
    portfolio = mongo_service.get_portfolio_summary()
    print(f"💼 Portfolio summary: {portfolio}")
    
    print("✅ MongoDB service working correctly!")
    
except Exception as e:
    print(f"❌ Error with MongoDB service: {e}")
    import traceback
    traceback.print_exc()
