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
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../utils/axios";

const AdminIncidentTypeManager = () => {
  // Lấy role từ localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role;

  const [incidentTypes, setIncidentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Xóa
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Lấy danh sách loại sự cố
  const fetchIncidentTypes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/incident-types");
      setIncidentTypes(res.data.data || res.data || []);
    } catch (err) {
      setIncidentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentTypes();
  }, []);

  // Tạo loại sự cố mới
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);
    try {
      await axios.post("/incident-types", {
        name,
        description,
      });
      setOpenDialog(false);
      setName("");
      setDescription("");
      fetchIncidentTypes();
    } catch (err) {
      setError(
        err?.response?.data?.message?.[0] ||
          err?.response?.data?.message ||
          "Không tạo được loại sự cố."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Hiện dialog xác nhận xóa
  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setDeleteDialog(true);
  };

  // Xử lý xóa loại sự cố
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteError("");
    setFormLoading(true);
    try {
      await axios.delete(`/incident-types/${deleteId}`);
      setDeleteDialog(false);
      fetchIncidentTypes();
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message?.[0] ||
          err?.response?.data?.message ||
          "Không thể xóa loại sự cố này (có thể vẫn còn dữ liệu liên quan)!"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // STAFF chỉ được xem, không có nút tạo/xóa
  const isAdmin = role === "ADMIN";

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Quản lý loại sự cố</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Tạo loại sự cố mới
          </Button>
        )}
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên loại sự cố</TableCell>
              <TableCell>Mô tả</TableCell>
              {isAdmin && <TableCell>Thao tác</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : incidentTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              incidentTypes.map((type, idx) => (
                <TableRow key={type.incidentTypeId}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => handleOpenDelete(type.incidentTypeId)}
                      >
                        Xóa
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog tạo mới loại sự cố */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tạo loại sự cố mới</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={handleCreate}>
            <TextField
              label="Tên loại sự cố"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              fullWidth
              disabled={formLoading}
            >
              {formLoading ? <CircularProgress size={22} /> : "Tạo loại sự cố"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa loại sự cố</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {deleteError}
            </Alert>
          )}
          <Typography>
            Bạn có chắc chắn muốn xóa loại sự cố này? <br />
            (Hành động này không thể hoàn tác)
          </Typography>
          <Box mt={2} display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setDeleteDialog(false)}
              disabled={formLoading}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? <CircularProgress size={20} /> : "Xóa"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default AdminIncidentTypeManager;
