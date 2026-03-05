# create_admin.py

"""
Script to manually create admin accounts

Run this script to create admin users directly in the database.

Usage:
    python create_admin.py

The script will prompt for admin details.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    """Create an admin account in the database"""

    # Get admin details from input
    print("="*50)
    print("CREATE ADMIN ACCOUNT")
    print("="*50)

    email = input("Admin Email: ").strip()
    password = input("Admin Password: ").strip()
    full_name = input("Admin Full Name: ").strip()
    phone_number = input("Admin Phone (optional): ").strip() or None

    if not email or not password or not full_name:
        print("❌ Email, password, and full name are required!")
        return

    # Confirm
    print("\n" + "="*50)
    print("CONFIRM ADMIN DETAILS:")
    print(f"Email: {email}")
    print(f"Name: {full_name}")
    print(f"Phone: {phone_number or 'Not provided'}")
    print("="*50)

    confirm = input("\nCreate this admin account? (yes/no): ").strip().lower()
    if confirm != 'yes':
        print("❌ Admin creation cancelled")
        return

    # Connect to MongoDB
    try:
        uri = os.getenv("MONGO_URL")
        if not uri:
            raise ValueError("MONGO_URL not found in .env file")

        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        await client.server_info()  # Test connection

        db = client.providerplus_db
        users_collection = db['users']

        # Check if email already exists
        existing = await users_collection.find_one({"email": email})
        if existing:
            print(f"\n❌ User with email '{email}' already exists!")

            # Ask if they want to update to admin
            update = input("Update this user to admin role? (yes/no): ").strip().lower()
            if update == 'yes':
                result = await users_collection.update_one(
                    {"email": email},
                    {"$set": {"role": "admin"}}
                )
                if result.modified_count > 0:
                    print(f"\n✅ User '{email}' updated to admin role!")
                else:
                    print(f"\n⚠️  User is already an admin")
            return

        # Hash password
        password_hash = pwd_context.hash(password)

        # Create admin document
        admin_doc = {
            "email": email,
            "password_hash": password_hash,
            "full_name": full_name,
            "phone_number": phone_number,
            "role": "admin",  # CRITICAL: Set role to admin
            "is_active": True,
            "created_at": datetime.utcnow(),
            "provider_profile_id": None  # Admins don't have provider profiles
        }

        # Insert into database
        result = await users_collection.insert_one(admin_doc)

        print("\n" + "="*50)
        print("✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!")
        print("="*50)
        print(f"Email: {email}")
        print(f"User ID: {result.inserted_id}")
        print(f"Role: admin")
        print("\n⚠️  IMPORTANT: Keep these credentials secure!")
        print("="*50)

        client.close()

    except Exception as e:
        print(f"\n❌ Error creating admin: {e}")

if __name__ == "__main__":
    print("\n🔐 Admin Account Creator")
    print("Make sure your .env file has MONGO_URL set\n")

    asyncio.run(create_admin())
