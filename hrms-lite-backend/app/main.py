from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import date

from .database import employee_collection, attendance_collection
from .models import Employee, Attendance, EmployeeResponse

app = FastAPI(
    title="HRMS Lite API",
    description="API for a lightweight Human Resource Management System.",
    version="1.0.0"
)

# CORS Middleware to allow frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to HRMS Lite API"}

# --- Employee Management Endpoints ---

@app.post("/employees", response_model=Employee, status_code=status.HTTP_201_CREATED)
async def add_employee(employee: Employee):
    """
    Add a new employee.
    - Checks for duplicate employee_id and email.
    """
    if await employee_collection.find_one({"employee_id": employee.employee_id}):
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    if await employee_collection.find_one({"email": employee.email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    await employee_collection.insert_one(employee.dict())
    return employee

@app.get("/employees", response_model=List[EmployeeResponse])
async def get_all_employees():
    """
    Retrieve a list of all employees including their total present days.
    """
    pipeline = [
        {
            "$lookup": {
                "from": "attendance",
                "localField": "employee_id",
                "foreignField": "employee_id",
                "as": "attendance_records"
            }
        },
        {
            "$addFields": {
                "total_present_days": {
                    "$size": {
                        "$filter": {
                            "input": "$attendance_records",
                            "as": "record",
                            "cond": {"$eq": ["$$record.status", "Present"]}
                        }
                    }
                }
            }
        },
        {
            "$project": {
                "attendance_records": 0
            }
        }
    ]
    employees = await employee_collection.aggregate(pipeline).to_list(1000)
    return employees

@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: str):
    """
    Delete an employee by their Employee ID.
    """
    delete_result = await employee_collection.delete_one({"employee_id": employee_id})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    # Also delete associated attendance records
    await attendance_collection.delete_many({"employee_id": employee_id})
    return

# --- Attendance Management Endpoints ---

@app.post("/attendance", response_model=Attendance, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: Attendance):
    """
    Mark attendance for an employee on a specific date.
    - Validates that the employee exists.
    - Prevents duplicate attendance for the same employee on the same day.
    """
    if not await employee_collection.find_one({"employee_id": attendance.employee_id}):
        raise HTTPException(status_code=404, detail="Employee not found")

    # Note: MongoDB stores dates as strings, so we convert the date to an ISO format string for querying
    if await attendance_collection.find_one({"employee_id": attendance.employee_id, "date": attendance.date.isoformat()}):
        raise HTTPException(status_code=409, detail="Attendance already marked for this date")

    await attendance_collection.insert_one({"employee_id": attendance.employee_id, "date": attendance.date.isoformat(), "status": attendance.status})
    return attendance

@app.get("/attendance", response_model=List[Attendance])
async def get_all_attendance(attendance_date: Optional[date] = None):
    """
    Retrieve a list of all attendance records.
    Optionally filters by date with a query parameter, e.g., /attendance?attendance_date=YYYY-MM-DD
    """
    query = {}
    if attendance_date:
        # Filter by date if the query parameter is provided
        query["date"] = attendance_date.isoformat()
    records = await attendance_collection.find(query).to_list(1000)
    return records

@app.get("/employees/{employee_id}/attendance", response_model=List[Attendance])
async def get_attendance_for_employee(employee_id: str):
    """
    Retrieve all attendance records for a specific employee.
    """
    if not await employee_collection.find_one({"employee_id": employee_id}):
        raise HTTPException(status_code=404, detail="Employee not found")

    records = await attendance_collection.find({"employee_id": employee_id}).to_list(1000)
    return records