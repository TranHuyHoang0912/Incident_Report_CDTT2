import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <>
      <Navbar />
      <Box sx={{ pt: { xs: '56px', sm: '64px' } }}>
        <Outlet />
      </Box>
    </>
  );
}
export default MainLayout;
