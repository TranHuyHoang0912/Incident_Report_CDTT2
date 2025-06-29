import React from "react";
import { Box } from "@mui/material";
import AdminNavbar from "../components/AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => (
  <>
    <AdminNavbar />
    <Box sx={{ pt: { xs: "56px", sm: "64px" }, px: 2 }}>
      <Outlet />
    </Box>
  </>
);

export default AdminLayout;
