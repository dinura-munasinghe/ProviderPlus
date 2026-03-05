# migration_provider_auth.py

"""
Migration script to add authentication fields to existing providers

Run this ONCE after deploying the new Provider model

Usage:
    python migration_provider_auth.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate_providers():
    """
    Add auth fields to existing providers
    """

    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
    db = client.providerplus_db

    providers_collection = db['providers']
    users_collection = db['users']

    # Get all existing providers
    providers = await providers_collection.find({}).to_list(length=None)

    print(f"Found {len(providers)} existing providers to migrate")

    migrated_count = 0
    skipped_count = 0

    for provider in providers:
        provider_id = str(provider['_id'])

        # Skip if already has user_id (already migrated)
        if 'user_id' in provider:
            print(f"⏭️  Skipping {provider['name']} - already migrated")
            skipped_count += 1
            continue

        # Create placeholder email
        email = f"provider_{provider_id}@legacy.providerplus.com"

        # Check if user already exists with this email
        existing_user = await users_collection.find_one({"email": email})

        if existing_user:
            user_id = str(existing_user['_id'])
        else:
            # Create User account for this provider
            user_doc = {
                "email": email,
                "password_hash": "LEGACY_UNCLAIMED",  # They'll need to reset password
                "full_name": provider['name'],
                "phone_number": provider.get('contact_info', 'No contact info'),
                "role": "provider",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "provider_profile_id": provider_id
            }

            result = await users_collection.insert_one(user_doc)
            user_id = str(result.inserted_id)

        # Update provider with new fields
        update_data = {
            "user_id": user_id,
            "is_verified": True,  # Legacy providers are auto-approved
            "business_documents": [],
            "portfolio_images": [],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Migrate contact_info to phone_number if exists
        if 'contact_info' in provider and provider['contact_info'] != "No contact info":
            update_data['phone_number'] = provider['contact_info']
        else:
            update_data['phone_number'] = "0000000000"  # Placeholder

        # Keep profile_image as None if not exists
        if 'profile_image' not in provider:
            update_data['profile_image'] = None

        # Update provider document
        await providers_collection.update_one(
            {"_id": provider['_id']},
            {"$set": update_data}
        )

        print(f"✅ Migrated: {provider['name']} (email: {email})")
        migrated_count += 1

    print("\n" + "="*50)
    print(f"Migration Complete!")
    print(f"✅ Migrated: {migrated_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"📧 Total: {len(providers)}")
    print("="*50)

    # Close connection
    client.close()

if __name__ == "__main__":
    print("Starting Provider Migration...")
    print("="*50)
    asyncio.run(migrate_providers())
