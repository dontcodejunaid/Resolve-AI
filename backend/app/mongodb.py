import os
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.config import settings

mongo_client: Optional[AsyncIOMotorClient] = None
mongo_db: Optional[AsyncIOMotorDatabase] = None


async def init_mongo():
    """Initialize MongoDB Atlas async connection."""
    global mongo_client, mongo_db
    if not settings.MONGODB_URI:
        print("[MongoDB Atlas] No MONGODB_URI configured. Skipping MongoDB initialization.")
        return

    try:
        mongo_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        # Verify connection
        await mongo_client.admin.command('ping')
        mongo_db = mongo_client[settings.MONGODB_DB_NAME]
        print(f"[MongoDB Atlas] Successfully connected to database: '{settings.MONGODB_DB_NAME}'")
    except Exception as e:
        print(f"[MongoDB Atlas] Warning: Could not connect to MongoDB Atlas: {e}")


async def close_mongo():
    """Close MongoDB connection gracefully."""
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("[MongoDB Atlas] Connection closed.")


def get_mongo_db() -> Optional[AsyncIOMotorDatabase]:
    """Dependency / accessor to get MongoDB database instance."""
    return mongo_db


def model_to_dict(obj) -> Dict[str, Any]:
    """Convert SQLAlchemy model instance into clean serializable dict for MongoDB."""
    if obj is None:
        return {}
    res = {}
    for col in obj.__table__.columns:
        val = getattr(obj, col.name)
        if isinstance(val, Decimal):
            val = float(val)
        elif isinstance(val, datetime):
            val = val.isoformat()
        res[col.name] = val
    return res


async def sync_doc(collection_name: str, key_field: str, data: Dict[str, Any]):
    """Upsert a document into MongoDB Atlas collection."""
    global mongo_db
    if mongo_db is None:
        return
    try:
        col = mongo_db[collection_name]
        key_val = data.get(key_field)
        if not key_val:
            return
        doc_with_meta = {
            **data,
            "_id": key_val,
            "_updated_at": datetime.now(timezone.utc).isoformat()
        }
        await col.update_one({"_id": key_val}, {"$set": doc_with_meta}, upsert=True)
    except Exception as e:
        print(f"[MongoDB Atlas] Error syncing to collection '{collection_name}': {e}")


async def sync_model(collection_name: str, key_field: str, model_obj):
    """Upsert a SQLAlchemy model object into MongoDB Atlas."""
    if model_obj is None:
        return
    data = model_to_dict(model_obj)
    await sync_doc(collection_name, key_field, data)


async def sync_model_to_mongo(collection_name: str, model_obj, key_field: str = "id"):
    """Helper alias to upsert model object to MongoDB Atlas by primary key."""
    await sync_model(collection_name, key_field, model_obj)


async def delete_docs(collection_name: str, query: Dict[str, Any]):
    """Delete matching documents from MongoDB Atlas collection."""
    global mongo_db
    if mongo_db is None:
        return
    try:
        col = mongo_db[collection_name]
        await col.delete_many(query)
    except Exception as e:
        print(f"[MongoDB Atlas] Error deleting from collection '{collection_name}': {e}")


async def sync_entire_db_to_mongo(db: AsyncSession):
    """
    Scans all tables in the authoritative database and replicates full state
    into MongoDB Atlas collections with live synchronized timestamps.
    """
    global mongo_db
    if mongo_db is None:
        return

    from backend.app.models import (
        User,
        Merchant,
        Product,
        MerchantPolicy,
        CheckoutAttempt,
        Payment,
        Order,
        Refund,
        Case,
        CaseEvent,
        Action,
        Approval,
        Notification,
    )

    table_mappings = [
        ("users", User, "id"),
        ("merchants", Merchant, "id"),
        ("products", Product, "id"),
        ("merchant_policies", MerchantPolicy, "id"),
        ("checkout_attempts", CheckoutAttempt, "id"),
        ("payments", Payment, "id"),
        ("orders", Order, "id"),
        ("refunds", Refund, "id"),
        ("cases", Case, "id"),
        ("case_events", CaseEvent, "id"),
        ("actions", Action, "id"),
        ("approvals", Approval, "id"),
        ("notifications", Notification, "id"),
    ]

    try:
        for col_name, model_cls, key_field in table_mappings:
            res = await db.execute(select(model_cls))
            records = res.scalars().all()
            for rec in records:
                await sync_model(col_name, key_field, rec)
        print("[MongoDB Atlas] Real-time full database sync complete.")
    except Exception as e:
        print(f"[MongoDB Atlas] Error during full DB sync: {e}")
