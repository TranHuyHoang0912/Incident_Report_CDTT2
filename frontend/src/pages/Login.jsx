import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setShowError(true);
      return;
    }
    try {
      const res = await axios.post("/auth/login", { username, password });
      const { user } = res.data;
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "STAFF") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/incidents");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          maxWidth={500}
          mx="auto"
          p={4}
          boxShadow={2}
          borderRadius={2}
          sx={{ background: "#fff" }} // Form cũng trắng!
        >
          <Typography
            textAlign="center"
            variant="h5"
            fontStyle="initial"
            sx={{ color: "secondary.black" }}
            gutterBottom
          >
            ĐĂNG NHẬP
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={handleLogin} autoComplete="off">
            <TextField
              fullWidth
              margin="normal"
              label="Tên người dùng"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!username && showError}
              helperText={
                !username && showError ? "Bạn phải nhập tên người dùng." : ""
              }
              sx={{
                "& .MuiInputBase-root": { color: "#222", background: "#fff" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#bdbdbd",
                },
                "& .MuiInputLabel-root": { color: "#555" },
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!password && showError}
              helperText={
                !password && showError ? "Bạn phải nhập mật khẩu." : ""
              }
              sx={{
                "& .MuiInputBase-root": { color: "#222", background: "#fff" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#bdbdbd",
                },
                "& .MuiInputLabel-root": { color: "#555" },
              }}
            />
            <Link
              sx={{ mb: 2, display: "block" }}
              color="secondary.changepass"
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              underline="none"
            >
              Khôi phục mật khẩu
            </Link>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ color: "white", textAlign: "center" }}
            >
              Đăng nhập
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
