import requests
import json

def test_crypto_prices_api():
    try:
        # Test the crypto prices endpoint
        response = requests.get('http://localhost:8001/crypto/prices')
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Response Status: 200 OK")
            print(f"📊 Crypto Prices Data: {json.dumps(data, indent=2)}")
            
            if isinstance(data, list):
                print(f"📈 Number of crypto prices: {len(data)}")
                for price in data:
                    print(f"  - {price.get('symbol', 'Unknown')}: ${price.get('price', 0)}")
            else:
                print(f"⚠️ Unexpected data format: {type(data)}")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_crypto_prices_api()
