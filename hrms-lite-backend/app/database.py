import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("DATABASE_URL")

client = AsyncIOMotorClient(MONGO_URL)
database = client.hrms_lite
employee_collection = database.get_collection("employees")
attendance_collection = database.get_collection("attendance")