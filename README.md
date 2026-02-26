# HRMS Lite

HRMS Lite is a lightweight, web-based Human Resource Management System designed to manage employee records and track daily attendance.  
The application simulates a basic internal HR tool with a clean, usable, and production-ready interface.

This project was built as a full-stack assignment to demonstrate end-to-end development skills, including frontend development, backend API design, database persistence, validation, and deployment.

---

## Project Overview

The system allows an admin to:
- Add and manage employee records
- Mark daily attendance for employees
- View attendance history per employee

The scope is intentionally kept minimal to focus on stability, usability, and clean architecture rather than excessive features.

---

## Tech Stack Used

### Frontend
- React
- Vite
- MUI
- tanstack react query
- yup validation
- React Router DOM

### Backend
- FastAPI
- Python
- MongoDB

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB (Local / Atlas)

---


---

## Steps to Run the Project Locally

### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.9+)
- MongoDB (running locally)

---

### 1. Backend Setup

Create a `.env` file inside the `backend` folder with the following content:

MONGO_URI=mongodb://localhost:27017

Then run the following commands:

cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
