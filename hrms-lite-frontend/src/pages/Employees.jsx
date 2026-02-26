import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, 
  Chip, Box, CircularProgress, Alert, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { api } from '../services/api';

// Schema for validation
const employeeSchema = yup.object().shape({
  employee_id: yup.string().required('Employee ID is required'),
  name: yup.string().required('Full Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  department: yup.string().required('Department is required'),
});

// Reusable component for viewing attendance
const ViewAttendanceDialog = ({ open, onClose, employee }) => {
  const { data: attendance = [], isLoading, isError, error } = useQuery({
    queryKey: ['attendance', employee.employee_id],
    queryFn: () => api.getEmployeeAttendance(employee.employee_id),
    enabled: !!employee.employee_id && open, // Only fetch when dialog is open
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Attendance for {employee.name}</DialogTitle>
      <DialogContent>
        {isLoading && <Box display="flex" justifyContent="center" p={2}><CircularProgress /></Box>}
        {isError && <Alert severity="error">Error fetching attendance: {error.message}</Alert>}
        {!isLoading && !isError && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.length > 0 ? (
                  attendance.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.status} 
                          color={record.status === 'Present' ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No attendance records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const Employees = () => {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewAttendanceDialogOpen, setViewAttendanceDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form handling for adding an employee
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues: { employee_id: '', name: '', email: '', department: '' }
  });

  // Data fetching for employees list
  const { data: employees = [], isLoading, isError, error } = useQuery({
    queryKey: ['employees'],
    queryFn: api.getEmployees
  });

  // Mutation for adding an employee
  const addEmployeeMutation = useMutation({
    mutationFn: api.addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setSnackbar({ open: true, message: 'Employee added successfully!', severity: 'success' });
      setAddDialogOpen(false);
      reset();
    },
    onError: (err) => {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
    }
  });

  // Mutation for deleting an employee
  const deleteEmployeeMutation = useMutation({
    mutationFn: api.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setSnackbar({ open: true, message: 'Employee deleted successfully!', severity: 'success' });
    },
    onError: (err) => {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
    }
  });

  const onAddSubmit = (data) => {
    addEmployeeMutation.mutate(data);
  };

  const handleDelete = async (employee_id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployeeMutation.mutate(employee_id);
    }
  };

  const handleViewAttendance = async (employee) => {
    setSelectedEmployee(employee);
    setViewAttendanceDialogOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Main content rendering
  const renderContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">
            <Alert severity="error" sx={{ width: '100%', justifyContent: 'center' }}>
              Error fetching employees: {error.message}
            </Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (employees.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">No employees found. Add one to get started!</TableCell>
        </TableRow>
      );
    }

    return employees.map((emp) => (
      <TableRow key={emp.employee_id}>
        <TableCell>{emp.employee_id}</TableCell>
        <TableCell>{emp.name}</TableCell>
        <TableCell>{emp.email}</TableCell>
        <TableCell>{emp.department}</TableCell>
        <TableCell>{emp.total_present_days}</TableCell>
        <TableCell align="right">
          <IconButton color="primary" onClick={() => handleViewAttendance(emp)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(emp.employee_id)} disabled={deleteEmployeeMutation.isPending}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Employees</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
          Add Employee
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Total Present Days</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderContent()}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} PaperProps={{ component: 'form', onSubmit: handleSubmit(onAddSubmit) }}>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Controller
            name="employee_id"
            control={control}
            render={({ field }) => (
              <TextField {...field} autoFocus margin="dense" label="Employee ID" fullWidth error={!!errors.employee_id} helperText={errors.employee_id?.message} />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Email Address" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
            )}
          />
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Department" fullWidth error={!!errors.department} helperText={errors.department?.message} />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddDialogOpen(false); reset(); }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={addEmployeeMutation.isPending}>
            {addEmployeeMutation.isPending ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Attendance Dialog */}
      {selectedEmployee && (
        <ViewAttendanceDialog 
          open={viewAttendanceDialogOpen} 
          onClose={() => setViewAttendanceDialogOpen(false)} 
          employee={selectedEmployee} 
        />
      )}

      {/* Snackbar for feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Employees;