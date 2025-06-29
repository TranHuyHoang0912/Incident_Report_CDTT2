import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/auth/reset-password/${token}`, { newPassword });
      setMsg("Đặt lại mật khẩu thành công! Hãy đăng nhập lại.");
    } catch (err) {
      setMsg(
        "Có lỗi xảy ra: " + (err.response?.data?.message || "Không xác định")
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: 32,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={{ width: "100%", margin: "12px 0", padding: 8 }}
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button style={{ width: "100%", padding: 8 }} type="submit">
          Đổi mật khẩu
        </button>
      </form>
      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </div>
  );
};

export default ResetPassword;
