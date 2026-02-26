import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

client = AsyncIOMotorClient(
    DATABASE_URL,
    serverSelectionTimeoutMS=30000,
    connectTimeoutMS=30000,
)

database = client["hrms_lite"]

employee_collection = database["employees"]
attendance_collection = database["attendance"]