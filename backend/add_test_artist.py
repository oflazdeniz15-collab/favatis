#!/usr/bin/env python3
"""
Script to add a test artist directly to MongoDB using pymongo or motor.
Run with: python add_test_artist.py
"""
import sys
from datetime import datetime, timezone
import uuid

def add_test_artist_with_pymongo():
    """Add a test artist using pymongo if available."""
    try:
        from pymongo import MongoClient
        from dotenv import load_dotenv
        import os
        from pathlib import Path
        
        ROOT_DIR = Path(__file__).parent
        load_dotenv(ROOT_DIR / '.env')
        
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME')
        
        if not mongo_url or not db_name:
            print("Error: MONGO_URL and DB_NAME must be set in .env file")
            return False
        
        # Connect to MongoDB
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        # Create test artist data
        artist_id = f"artist_{uuid.uuid4().hex[:12]}"
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        test_artist = {
            "artist_id": artist_id,
            "user_id": user_id,
            "name": "Test Artist",
            "bio": "This is a test artist profile for development and testing.",
            "profile_image": None,
            "status": "approved",
            "spotify_link": "https://open.spotify.com/artist/0TnOYISbd1XlKEYbW9h18H",
            "submitted_at": now.isoformat(),
            "approved_at": now.isoformat(),
            "created_at": now.isoformat()
        }
        
        # Check if test artist already exists
        existing = db.artists.find_one({"name": "Test Artist"})
        if existing:
            print(f"✓ Test artist already exists!")
            print(f"  Artist ID: {existing['artist_id']}")
            return True
        
        # Insert test artist
        result = db.artists.insert_one(test_artist)
        print(f"✓ Test artist added successfully!")
        print(f"  Artist ID: {artist_id}")
        print(f"  User ID: {user_id}")
        print(f"  Name: Test Artist")
        print(f"  Status: approved")
        
        client.close()
        return True
        
    except ImportError as e:
        print(f"Error: {e}")
        print("pymongo not found. Please install it with: pip install pymongo")
        return False
    except Exception as e:
        print(f"Error adding test artist: {e}")
        return False

def add_test_artist_with_motor():
    """Add a test artist using motor (async MongoDB driver)."""
    try:
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        from dotenv import load_dotenv
        import os
        from pathlib import Path
        
        async def _add_artist():
            ROOT_DIR = Path(__file__).parent
            load_dotenv(ROOT_DIR / '.env')
            
            mongo_url = os.environ.get('MONGO_URL')
            db_name = os.environ.get('DB_NAME')
            
            if not mongo_url or not db_name:
                print("Error: MONGO_URL and DB_NAME must be set in .env file")
                return False
            
            client = AsyncIOMotorClient(mongo_url)
            db = client[db_name]
            
            try:
                # Create test artist data
                artist_id = f"artist_{uuid.uuid4().hex[:12]}"
                user_id = f"user_{uuid.uuid4().hex[:12]}"
                now = datetime.now(timezone.utc)
                
                test_artist = {
                    "artist_id": artist_id,
                    "user_id": user_id,
                    "name": "Test Artist",
                    "bio": "This is a test artist profile for development and testing.",
                    "profile_image": None,
                    "status": "approved",
                    "spotify_link": "https://open.spotify.com/artist/0TnOYISbd1XlKEYbW9h18H",
                    "submitted_at": now.isoformat(),
                    "approved_at": now.isoformat(),
                    "created_at": now.isoformat()
                }
                
                # Check if test artist already exists
                existing = await db.artists.find_one({"name": "Test Artist"})
                if existing:
                    print(f"✓ Test artist already exists!")
                    print(f"  Artist ID: {existing['artist_id']}")
                    return True
                
                # Insert test artist
                await db.artists.insert_one(test_artist)
                print(f"✓ Test artist added successfully!")
                print(f"  Artist ID: {artist_id}")
                print(f"  User ID: {user_id}")
                print(f"  Name: Test Artist")
                print(f"  Status: approved")
                return True
                
            finally:
                client.close()
        
        return asyncio.run(_add_artist())
        
    except Exception as e:
        return False

if __name__ == "__main__":
    # Try pymongo first (synchronous), then motor (async)
    success = add_test_artist_with_pymongo()
    
    if not success:
        print("\nTrying with motor (async)...")
        success = add_test_artist_with_motor()
    
    if not success:
        print("\nCould not add test artist. Please ensure:")
        print("  1. Python dependencies are installed (pymongo or motor)")
        print("  2. .env file exists with MONGO_URL and DB_NAME")
        print("  3. MongoDB is running and accessible")
        sys.exit(1)
