import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("DATABASE_URL")

if not MONGO_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

client = AsyncIOMotorClient(
    MONGO_URL,
    tls=True,
    serverSelectionTimeoutMS=30000,
    connectTimeoutMS=30000,
)

database = client.hrms_lite

employee_collection = database.get_collection("employees")
attendance_collection = database.get_collection("attendance")