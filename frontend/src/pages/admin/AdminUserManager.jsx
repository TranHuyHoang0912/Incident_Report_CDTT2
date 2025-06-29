import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Pagination,
  MenuItem,
  Select,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import axios from "../../utils/axios";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const pageSize = 8;

const roleMap = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  USER: "USER",
};

const AdminUserManager = () => {
  // Lấy role của user từ localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role;

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "USER",
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("asc"); // asc/desc
  const [sortBy, setSortBy] = useState("username"); // name/description
  const [error, setError] = useState("");
  // Xác nhận đổi vai trò
  const [confirmRole, setConfirmRole] = useState({
    open: false,
    userId: null,
    newRole: "",
    username: "",
  });

  // Xác nhận xoá user
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    userId: null,
    username: "",
  });

  // Fetch users (chỉ khi là ADMIN)
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users", {
        params: {
          take: pageSize,
          skip: (page - 1) * pageSize,
          search,
          order,
          sortBy,
        },
      });
      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError("Không thể tải dữ liệu người dùng.");
    }
  };

  useEffect(() => {
    if (role === "ADMIN") {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [page, search, order, sortBy]);

  // Nếu là STAFF, chỉ hiện thông báo
  if (role === "STAFF") {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Bạn không có quyền xem trang này!
        </Typography>
      </Paper>
    );
  }

  // (ADMIN)
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/users", form);
      setOpen(false);
      setForm({ username: "", password: "", email: "", role: "USER" });
      fetchUsers();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      setError(msg); // Set error để hiện lên UI
    }
  };

  // Thay đổi vai trò (gọi sau khi xác nhận)
  const handleRoleChange = async (userId, newRole) => {
    await axios.patch(`/users/${userId}`, { role: newRole });
    fetchUsers();
  };

  // Xoá user (gọi sau khi xác nhận)
  const handleDeleteUser = async (userId) => {
    await axios.delete(`/users/${userId}`);
    fetchUsers();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
    setPage(1); // reset về trang 1
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Quản lý người dùng</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Tạo người dùng mới
        </Button>
      </Box>
      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Tìm kiếm người dùng"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => handleSort("username")}
              >
                Username{" "}
                {sortBy === "name" &&
                  (order === "asc" ? (
                    <ArrowUpwardIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle" }}
                    />
                  ) : (
                    <ArrowDownwardIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle" }}
                    />
                  ))}
              </TableCell>
              <TableCell
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => handleSort("role")}
              >
                Role{" "}
                {sortBy === "role" &&
                  (order === "asc" ? (
                    <ArrowUpwardIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle" }}
                    />
                  ) : (
                    <ArrowDownwardIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle" }}
                    />
                  ))}
              </TableCell>
              <TableCell>Xóa người dùng</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user, idx) => (
              <TableRow key={user.userId}>
                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    size="small"
                    onChange={(e) =>
                      setConfirmRole({
                        open: true,
                        userId: user.userId,
                        newRole: e.target.value,
                        username: user.username,
                      })
                    }
                  >
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                    <MenuItem value="STAFF">STAFF</MenuItem>
                    <MenuItem value="USER">USER</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    color="error"
                    size="small"
                    onClick={() =>
                      setConfirmDelete({
                        open: true,
                        userId: user.userId,
                        username: user.username,
                      })
                    }
                  >
                    Xoá
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(total / pageSize)}
          page={page}
          onChange={(e, val) => setPage(val)}
        />
      </Box>

      {/* Form tạo mới người dùng */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tạo người dùng mới</DialogTitle>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Mật khẩu"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              fullWidth
              margin="normal"
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="STAFF">STAFF</MenuItem>
              <MenuItem value="USER">USER</MenuItem>
            </Select>
            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
              Tạo người dùng
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận đổi vai trò */}
      <Dialog
        open={confirmRole.open}
        onClose={() =>
          setConfirmRole({
            open: false,
            userId: null,
            newRole: "",
            username: "",
          })
        }
      >
        <DialogTitle>Xác nhận thay đổi vai trò</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn đổi vai trò của <b>{confirmRole.username}</b>{" "}
            thành <b>{roleMap[confirmRole.newRole]}</b> không?
          </Typography>
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                await handleRoleChange(confirmRole.userId, confirmRole.newRole);
                setConfirmRole({
                  open: false,
                  userId: null,
                  newRole: "",
                  username: "",
                });
              }}
            >
              Xác nhận
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                setConfirmRole({
                  open: false,
                  userId: null,
                  newRole: "",
                  username: "",
                })
              }
            >
              Huỷ
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xoá user */}
      <Dialog
        open={confirmDelete.open}
        onClose={() =>
          setConfirmDelete({ open: false, userId: null, username: "" })
        }
      >
        <DialogTitle>Xác nhận xoá người dùng</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xoá người dùng <b>{confirmDelete.username}</b>{" "}
            không?
          </Typography>
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                await handleDeleteUser(confirmDelete.userId);
                setConfirmDelete({ open: false, userId: null, username: "" });
              }}
            >
              Xác nhận
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                setConfirmDelete({ open: false, userId: null, username: "" })
              }
            >
              Huỷ
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default AdminUserManager;
