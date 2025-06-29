import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminIncidentManager from "./pages/admin/AdminIncidentManager";
import IncidentList from "./pages/user/IncidentList";
import ChangePassword from "./pages/user/ChangePassword";
import AdminIncidentTypeManager from "./pages/admin/AdminIncidentTypeManager";
import AdminUserManager from "./pages/admin/AdminUserManager";
import AdminIncidentReviewManager from "./pages/admin/AdminIncidentReviewManager";
import AdminRoomManager from "./pages/admin/AdminRoomManager";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Trang admin, chỉ cho phép ADMIN và STAFF */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="ADMIN,STAFF">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="incidents" element={<AdminIncidentManager />} />
          <Route
            path="staff-ratings"
            element={<AdminIncidentReviewManager />}
          />
          <Route path="incident-types" element={<AdminIncidentTypeManager />} />
          <Route path="rooms" element={<AdminRoomManager />} />
          <Route path="users" element={<AdminUserManager />} />
        </Route>

        {/* Trang user */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="incidents" element={<IncidentList />} />
          {/* <Route path="reset-password" element={<ResetPassword />} /> */}
          <Route path="change-password" element={<ChangePassword />} />
          {/* <Route path="forgot-password" element={<ForgotPassword />} /> */}
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
