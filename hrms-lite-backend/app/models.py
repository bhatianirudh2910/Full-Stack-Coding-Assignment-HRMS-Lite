from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date

class Employee(BaseModel):
    employee_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    email: EmailStr
    department: str = Field(..., min_length=1)

class EmployeeResponse(Employee):
    total_present_days: int = 0

class Attendance(BaseModel):
    employee_id: str
    date: date
    status: str # "Present" or "Absent"