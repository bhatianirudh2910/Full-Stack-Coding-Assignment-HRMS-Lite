import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, CssBaseline, GlobalStyles } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const queryClient = new QueryClient();

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        <GlobalStyles styles={{
          body: { margin: 0, padding: 0, display: 'block', width: '100%', minHeight: '100vh' },
          '#root': { width: '100%', maxWidth: '100%', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', textAlign: 'left' }
        }} />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              HRMS Lite
            </Typography>
            <Button 
              color="inherit" 
              startIcon={<DashboardIcon />} 
              onClick={() => navigate('/')}
              sx={{ backgroundColor: isActive('/') ? 'rgba(255,255,255,0.2)' : 'transparent' }}
            >
              Dashboard
            </Button>
            <Button color="inherit" startIcon={<PeopleIcon />} onClick={() => navigate('/employees')}>
              Employees
            </Button>
            <Button color="inherit" startIcon={<EventAvailableIcon />} onClick={() => navigate('/attendance')}>
              Attendance
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4, flexGrow: 1 }}>
          <Outlet />
        </Container>
      </Box>
    </QueryClientProvider>
  );
};

export default Layout;