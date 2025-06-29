import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { Alert, Container, CircularProgress } from "@mui/material";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isValid, setIsValid] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await axios.get("/auth/me");
        setIsValid(true);
        setUserRole(response.data.role); // Lấy vai trò từ API trả về
      } catch (err) {
        // Token hết hạn hoặc bị vô hiệu → logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setErrorMessage("Phiên đăng nhập không còn hợp lệ!");
        setIsValid(false);
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    };

    checkToken();
  }, [navigate]);

  if (isValid === null) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isValid) {
    return (
      <Container sx={{ mt: 10 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Container>
    );
  }

  // Kiểm tra vai trò của người dùng và điều kiện truy cập
  if (requiredRole && !requiredRole.split(",").includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
