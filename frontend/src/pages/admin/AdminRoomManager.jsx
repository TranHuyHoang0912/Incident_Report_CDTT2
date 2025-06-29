import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Pagination,
  InputAdornment,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../utils/axios";

const pageSize = 8;

const AdminRoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("name");
  const [errorMessage, setErrorMessage] = useState("");
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Lấy role từ localStorage
  const role = React.useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.role || "";
    } catch {
      return "";
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("/rooms", {
        params: {
          take: pageSize,
          skip: (page - 1) * pageSize,
          search,
          order,
          sortBy,
        },
      });
      setRooms(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setErrorMessage("Không thể tải danh sách phòng, vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchRooms();
    setErrorMessage("");
  }, [page, search, order, sortBy]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
    setPage(1);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !description) {
      setErrorMessage("Tên phòng và ghi chú không thể để trống.");
      return;
    }
    try {
      await axios.post("/rooms", { name, description });
      fetchRooms();
      setOpen(false);
      setErrorMessage("");
      setName("");
      setDescription("");
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setErrorMessage("Xin lỗi, bạn không có quyền tạo phòng.");
      } else {
        setErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await axios.delete(`/rooms/${roomToDelete.roomId}`);
      fetchRooms();
      setRoomToDelete(null);
      setErrorMessage("");
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setErrorMessage(
          err.response.data.message ||
            "Phòng này vẫn còn sự cố, không thể xóa được."
        );
      } else {
        setErrorMessage("Đã có lỗi xảy ra khi xóa phòng. Vui lòng thử lại.");
      }
    }
  };

  const handleConfirmDelete = (room) => {
    setRoomToDelete(room);
    setErrorMessage("");
  };

  const handleCloseDialog = () => {
    setRoomToDelete(null);
    setErrorMessage("");
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Quản lý phòng</Typography>
        {role === "ADMIN" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            color="primary"
          >
            Tạo phòng mới
          </Button>
        )}
      </Box>
      <Box mb={2} display="flex" gap={2}>
        <TextField
          size="small"
          placeholder="Tìm kiếm phòng"
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
                onClick={() => handleSort("name")}
              >
                Tên phòng
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
                onClick={() => handleSort("description")}
              >
                Ghi chú
                {sortBy === "description" &&
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
              {role === "ADMIN" && <TableCell>Thao tác</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {rooms.map((room, idx) => (
              <TableRow key={room.roomId}>
                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.description}</TableCell>
                <TableCell>
                  {role === "ADMIN" && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleConfirmDelete(room)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rooms.length === 0 && (
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

      {errorMessage && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {errorMessage}
        </Typography>
      )}

      <Dialog
        open={!!roomToDelete}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa phòng</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="error">
            {errorMessage ||
              "Bạn có chắc chắn muốn xóa phòng này? (Phải xóa hết sự cố trước)"}
          </Typography>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCloseDialog}
            >
              Hủy
            </Button>
            {role === "ADMIN" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeleteRoom}
              >
                Xóa
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tạo phòng mới</DialogTitle>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <TextField
              label="Tên phòng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              margin="normal"
              disabled={role !== "ADMIN"}
            />
            <TextField
              label="Ghi chú"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
              disabled={role !== "ADMIN"}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              fullWidth
              disabled={role !== "ADMIN"}
            >
              Tạo phòng
            </Button>
            {role !== "ADMIN" && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                Chỉ admin mới được tạo phòng.
              </Typography>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default AdminRoomManager;
