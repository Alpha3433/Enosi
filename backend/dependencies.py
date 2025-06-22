from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from .database import get_database

# Database dependency
async def get_db() -> AsyncIOMotorDatabase:
    return await get_database()