import os
from pymongo import MongoClient

def test_mongodb_connection():
    try:
        # Test basic MongoDB connection
        client = MongoClient('mongodb://localhost:27017/')
        
        # Test database connection
        db = client['crypto_investment_manager']
        print("✅ Connected to MongoDB successfully")
        
        # Test database access
        collections = db.list_collection_names()
        print(f"📁 Available collections: {collections}")
        
        # Test creating a test collection
        test_collection = db['test_collection']
        test_doc = {"test": "data", "timestamp": "2026-01-13"}
        result = test_collection.insert_one(test_doc)
        print(f"✅ Inserted test document with ID: {result.inserted_id}")
        
        # Test reading the document
        found_doc = test_collection.find_one({"test": "data"})
        print(f"✅ Found test document: {found_doc}")
        
        # Clean up
        test_collection.delete_one({"test": "data"})
        print("✅ Test document deleted")
        
        print("🎉 MongoDB connection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
