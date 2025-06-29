import React, { createContext, useContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

// Tạo context để lưu trữ thông tin người dùng
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Lấy thông tin từ token
    const token = localStorage.getItem("token"); // Giả sử bạn lưu token trong localStorage
    if (token) {
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role); // Lấy vai trò từ token (cần token chứa thông tin vai trò)
    }
  }, []);

  return (
    <AuthContext.Provider value={{ role }}>{children}</AuthContext.Provider>
  );
};
