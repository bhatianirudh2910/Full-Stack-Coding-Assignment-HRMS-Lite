import React from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const Dashboard = () => {
  const { data: employees, isLoading: isLoadingEmployees, isError: isErrorEmployees, error: errorEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: api.getEmployees
  });

  const { data: attendance, isLoading: isLoadingAttendance, isError: isErrorAttendance, error: errorAttendance } = useQuery({
    queryKey: ['attendance'],
    queryFn: api.getAttendance
  });

  const isLoading = isLoadingEmployees || isLoadingAttendance;
  const isError = isErrorEmployees || isErrorAttendance;
  const error = errorEmployees || errorAttendance;

  const stats = {
    employees: employees?.length ?? 0,
    // In a real app, you'd filter attendance by today's date
    presentToday: attendance?.filter(a => a.status === 'Present').length ?? 0
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading dashboard data: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Employees</Typography>
              <Typography variant="h3">{stats.employees}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Present Today</Typography>
              <Typography variant="h3">{stats.presentToday}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;