// src/pages/admin/AdminDashboard.jsx
import React from "react";
import { Typography, Box, Paper } from "@mui/material";
import axios from "../../utils/axios";

const AdminDashboard = () => (
  <Box sx={{ textAlign: "center", mt: 6 }}>
    <Paper elevation={2} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Typography mb={2}>Chào mừng bạn đến trang quản trị!</Typography>
      <Typography variant="body1">
        Hãy chọn chức năng quản lý ở menu bên trái.
        <br />
      </Typography>
    </Paper>
  </Box>
);

export default AdminDashboard;
