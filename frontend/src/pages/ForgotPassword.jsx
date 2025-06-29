// Frontend
import React, { useState } from "react";
import axios from "../utils/axios";
import { TextField, Button, Alert } from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post("/auth/forgot-password", { email });
      setMessage("Đã gửi email hướng dẫn bạn đặt lại mật khẩu.");
    } catch (err) {
      setError("Email không hợp lệ, vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Gửi email reset mật khẩu"}
        </Button>
      </form>

      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}
    </div>
  );
};

export default ForgotPassword;
