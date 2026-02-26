import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  FormControl, InputLabel, Select, MenuItem, Button, Grid, TextField, Chip, Box, 
  CircularProgress, Alert, Snackbar, FormHelperText
} from '@mui/material';
import { api } from '../services/api';

// Schema for validation
const attendanceSchema = yup.object().shape({
  employee_id: yup.string().required('Employee is required'),
  date: yup.string().required('Date is required'),
  status: yup.string().required('Status is required'),
});

const Attendance = () => {
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Form handling
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(attendanceSchema),
    defaultValues: {
      employee_id: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present'
    }
  });

  // Data fetching for employees dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: api.getEmployees,
    staleTime: 1000 * 60 * 5, // Cache employees for 5 minutes
  });

  // Data fetching for attendance records
  const { data: records = [], isLoading, isError, error } = useQuery({
    queryKey: ['attendance', filterDate],
    queryFn: () => api.getAttendance(filterDate)
  });

  // Mutation for marking attendance
  const markAttendanceMutation = useMutation({
    mutationFn: api.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setSnackbar({ open: true, message: 'Attendance marked successfully!', severity: 'success' });
      reset({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
      });
    },
    onError: (err) => {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
    }
  });

  const onSubmit = (data) => {
    const employee = employees.find(e => e.employee_id === data.employee_id);
    const payload = { ...data, name: employee?.name };
    markAttendanceMutation.mutate(payload);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Render logic for the attendance table
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center">
            <Alert severity="error" sx={{ width: '100%', justifyContent: 'center' }}>
              Error fetching attendance records: {error.message}
            </Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (records.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} align="center">No attendance records found.</TableCell>
        </TableRow>
      );
    }

    return records.map((record, index) => (
      <TableRow key={`${record.employee_id}-${record.date}-${index}`}>
        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
        <TableCell>{record.name || `ID: ${record.employee_id}`}</TableCell>
        <TableCell>
          <Chip 
            label={record.status} 
            color={record.status === 'Present' ? 'success' : 'error'} 
            size="small" 
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Attendance Management</Typography>

      {/* Mark Attendance Form */}
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Mark Attendance</Typography>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={!!errors.employee_id}>
              <InputLabel>Employee</InputLabel>
              <Controller
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Employee">
                    {employees.map(emp => (
                      <MenuItem key={emp.employee_id} value={emp.employee_id}>{emp.name} ({emp.department})</MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.employee_id && <FormHelperText>{errors.employee_id.message}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                  sx={{
                    '& .MuiInputBase-input': { colorScheme: 'light' }
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth error={!!errors.status}>
              <InputLabel>Status</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Status">
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                  </Select>
                )}
              />
              {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button type="submit" variant="contained" fullWidth size="large" disabled={markAttendanceMutation.isPending} sx={{ height: '56px' }}>
              {markAttendanceMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance History */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">Attendance History</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            type="date"
            label="Filter by Date"
            size="small"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-input': { colorScheme: 'light' }
            }}
          />
          <Button variant="outlined" onClick={() => setFilterDate('')} disabled={!filterDate}>
            Clear
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Employee</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Attendance;