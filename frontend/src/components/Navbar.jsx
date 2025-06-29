// src/components/Navbar.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { Brightness4, Brightness7, AccountCircle } from "@mui/icons-material";
import { useThemeContext } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import LogoutDialog from "./LogoutDialog";
// import axios from '../utils/axios';
// import axios from '../../utils/axios';

const Navbar = () => {
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleOpenLogoutDialog = () => {
    handleClose();
    setTimeout(() => setOpenDialog(true), 100);
  };
  const handleClose = () => setAnchorEl(null);
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AppBar AppBar position="fixed" color="primary">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" component="div">
          Xin chào, {user?.username}
        </Typography>

        <Box display="flex" alignItems="center">
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => navigate("/user/change-password")}>
              Đổi mật khẩu
            </MenuItem>
            <MenuItem onClick={handleOpenLogoutDialog}>Đăng xuất</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* ✅ Đặt ngoài Menu để không bị đóng theo Menu */}
      <LogoutDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleLogout}
      />
    </AppBar>
  );
};

export default Navbar;
