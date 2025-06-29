import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Brightness4, Brightness7, AccountCircle } from "@mui/icons-material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import { useThemeContext } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import LogoutDialog from "./LogoutDialog";
import StarRateIcon from "@mui/icons-material/StarRate";

const adminMenu = [
  { text: "Quản lý phòng", icon: <MeetingRoomIcon />, path: "/admin/rooms" },
  { text: "Quản lý người dùng", icon: <PeopleIcon />, path: "/admin/users" },
  {
    text: "Quản lý đánh giá",
    icon: <StarRateIcon />,
    path: "/admin/staff-ratings",
  },
  { text: "Quản lý sự cố", icon: <StarRateIcon />, path: "/admin/incidents" },
  {
    text: "Quản lý loại sự cố",
    icon: <StarRateIcon />,
    path: "/admin/incident-types",
  },
];

const AdminNavbar = () => {
  const { mode, toggleTheme } = useThemeContext();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // Menu tài khoản
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleOpenLogoutDialog = () => {
    handleClose();
    setTimeout(() => setOpenDialog(true), 100);
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* Navbar trên cùng */}
      <AppBar position="fixed" color="primary">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Nút menu 3 gạch */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trang quản trị
          </Typography>
          <Box display="flex" alignItems="center">
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.username ? (
                  user.username.charAt(0).toUpperCase()
                ) : (
                  <AccountCircle />
                )}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => navigate("/change-password")}>
                Đổi mật khẩu
              </MenuItem>
              <MenuItem onClick={handleOpenLogoutDialog}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Sidebar (menu 3 gạch) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ mr: 1, bgcolor: "primary.main" }}>
              {user?.username ? (
                user.username.charAt(0).toUpperCase()
              ) : (
                <AccountCircle />
              )}
            </Avatar>
            <Typography variant="subtitle1">
              {user?.username || "Admin"}
            </Typography>
          </Box>
          <Divider />
          <List>
            {adminMenu.map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Logout Dialog */}
      <LogoutDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleLogout}
      />
      {/* Chừa khoảng trống cho AppBar */}
      <Box sx={{ height: { xs: "56px", sm: "64px" } }} />
    </>
  );
};

export default AdminNavbar;
