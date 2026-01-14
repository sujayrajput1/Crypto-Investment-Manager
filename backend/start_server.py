import uvicorn
import asyncio

if __name__ == "__main__":
    print("Starting FastAPI server on http://0.0.0.0:8001")
    
    # Run uvicorn server
    config = uvicorn.Config(
        "main:app",
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )
    
    try:
        uvicorn.run(config)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"\nError starting server: {e}")
