const API_BASE_URL = "http://localhost:8000";

export const api = {
  // --- Employee Operations ---
  getEmployees: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      return await res.json();
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error; // Re-throw to be handled by react-query
    }
  },

  addEmployee: async (employee) => {
    const res = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Failed to add employee" }));
      const error = new Error(errorData.detail);
      error.status = res.status;
      throw error;
    }
    return await res.json();
  },

  deleteEmployee: async (id) => {
    const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete employee");
    return true; // Success on 204 No Content
  },

  // --- Attendance Operations ---
  getAttendance: async (attendance_date) => {
    try {
      const url = new URL(`${API_BASE_URL}/attendance`);
      console.log("attendance_date", attendance_date);
      if (typeof attendance_date === "string" && attendance_date.trim() !== "") {
        url.searchParams.append("attendance_date", attendance_date);
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return await res.json();
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error; // Re-throw to be handled by react-query
    }
  },

  markAttendance: async (data) => {
    const res = await fetch(`${API_BASE_URL}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Failed to mark attendance" }));
      const error = new Error(errorData.detail);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  getEmployeeAttendance: async (employee_id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employee_id}/attendance`);
      if (!res.ok) {
        throw new Error(`Failed to fetch attendance for employee ${employee_id}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Error fetching attendance for employee ${employee_id}:`, error);
      throw error; // Re-throw to be handled by react-query
    }
  },
};