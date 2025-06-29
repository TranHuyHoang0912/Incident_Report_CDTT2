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

const pageSize = 8;

const statusList = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xử lý" },
  { value: "cancelled", label: "Đã huỷ" },
];
const statusMap = Object.fromEntries(
  statusList.map((item) => [item.value, item.label])
);

const AdminIncidentManager = () => {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    roomId: "",
    incidentTypeId: "",
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [confirmStatus, setConfirmStatus] = useState({
    open: false,
    incidentId: null,
    newStatus: "",
  });
  const [confirmDeleteIncident, setconfirmDeleteIncident] = useState({
    open: false,
    incidentId: null,
  });
  const [rooms, setRooms] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingIncidentTypes, setLoadingIncidentTypes] = useState(true);

  // Fetch incidents
  const fetchIncidents = async () => {
    const res = await axios.get("/incidents", {
      params: {
        take: pageSize,
        skip: (page - 1) * pageSize,
        search,
        sortField,
        sortOrder,
      },
    });
    setIncidents(res.data.data || []);
    setTotal(res.data.total || 0);
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, search, sortField, sortOrder]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await axios.post("/incidents", form);
    setOpen(false);
    setForm({ title: "", description: "", roomId: "", incidentTypeId: "" });
    fetchIncidents();
  };

  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await axios.get("/rooms");
        // Đảm bảo luôn là array
        let data = Array.isArray(res.data) ? res.data : res.data?.data;
        setRooms(Array.isArray(data) ? data : []);
      } catch {
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    const fetchIncidentTypes = async () => {
      setLoadingIncidentTypes(true);
      try {
        const res = await axios.get("/incident-types");
        let data = Array.isArray(res.data) ? res.data : res.data?.data;
        setIncidentTypes(Array.isArray(data) ? data : []);
      } catch {
        setIncidentTypes([]);
      } finally {
        setLoadingIncidentTypes(false);
      }
    };
    fetchRooms();
    fetchIncidentTypes();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleDelete = async (incidentId) => {
    await axios.delete(`/incidents/${incidentId}`);
    fetchIncidents();
  };

  const handleChangeStatus = async (incidentId, newStatus) => {
    await axios.patch(`/incidents/update-status/${incidentId}`, {
      status: newStatus,
    });
    fetchIncidents();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Quản lý sự cố</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Tạo sự cố mới
        </Button>
      </Box>
      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Tìm kiếm sự cố"
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
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Người tạo</TableCell>
              <TableCell
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("createdAt")}
              >
                Ngày tạo{" "}
                {sortField === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
              </TableCell>
              <TableCell
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("status")}
              >
                Trạng thái{" "}
                {sortField === "status" && (sortOrder === "asc" ? "▲" : "▼")}
              </TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((inc, idx) => (
              <TableRow key={inc.incidentId}>
                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                <TableCell>{inc.title}</TableCell>
                <TableCell>{inc.description}</TableCell>
                <TableCell>{inc.room?.name}</TableCell>
                <TableCell>{inc.user?.username}</TableCell>
                <TableCell>
                  {inc.createdAt
                    ? new Date(inc.createdAt).toLocaleString("vi-VN", {
                        hour12: false,
                      })
                    : ""}
                </TableCell>
                <TableCell>
                  <Select
                    value={inc.status}
                    size="small"
                    onChange={(e) =>
                      setConfirmStatus({
                        open: true,
                        incidentId: inc.incidentId,
                        newStatus: e.target.value,
                      })
                    }
                  >
                    {statusList.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    color="error"
                    size="small"
                    onClick={() =>
                      setconfirmDeleteIncident({
                        open: true,
                        incidentId: inc.incidentId,
                      })
                    }
                  >
                    Xoá
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {incidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
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

      {/* Form tạo mới sự cố */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tạo sự cố mới</DialogTitle>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <TextField
              label="Tiêu đề"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              required
              margin="normal"
            />

            {/* Chọn phòng */}
            <Select
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              fullWidth
              displayEmpty
              required
              margin="normal"
              sx={{ mt: 2 }}
            >
              <MenuItem value="" disabled>
                {loadingRooms
                  ? "Đang tải phòng..."
                  : rooms.length === 0
                  ? "Không có phòng"
                  : "Chọn phòng"}
              </MenuItem>
              {rooms.map((room) => (
                <MenuItem key={room.roomId} value={room.roomId}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
            {/* Loại sự cố */}
            <Select
              value={form.incidentTypeId}
              onChange={(e) =>
                setForm({ ...form, incidentTypeId: e.target.value })
              }
              fullWidth
              displayEmpty
              required
              margin="normal"
              sx={{ mt: 2 }}
            >
              <MenuItem value="" disabled>
                {loadingIncidentTypes
                  ? "Đang tải loại sự cố..."
                  : incidentTypes.length === 0
                  ? "Không có loại sự cố"
                  : "Chọn loại sự cố"}
              </MenuItem>
              {incidentTypes.map((type) => (
                <MenuItem key={type.incidentTypeId} value={type.incidentTypeId}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Mô tả"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
              Tạo sự cố
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmStatus.open}
        onClose={() =>
          setConfirmStatus({ open: false, incidentId: null, newStatus: "" })
        }
      >
        <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn đổi trạng thái sự cố thành{" "}
            <b>{statusMap[confirmStatus.newStatus]}</b> không?
          </Typography>
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                await handleChangeStatus(
                  confirmStatus.incidentId,
                  confirmStatus.newStatus
                );
                setConfirmStatus({
                  open: false,
                  incidentId: null,
                  newStatus: "",
                });
              }}
            >
              Xác nhận
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                setConfirmStatus({
                  open: false,
                  incidentId: null,
                  newStatus: "",
                })
              }
            >
              Huỷ
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Xác nhận xoá sự cố */}
      <Dialog
        open={confirmDeleteIncident.open}
        onClose={() =>
          setconfirmDeleteIncident({ open: false, incidentId: null })
        }
      >
        <DialogTitle>Xác nhận xoá sự cố</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xoá sự cố không?</Typography>
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                await handleDelete(confirmDeleteIncident.incidentId);
                setconfirmDeleteIncident({
                  open: false,
                  incidentId: null,
                });
              }}
            >
              Xác nhận
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                setconfirmDeleteIncident({
                  open: false,
                  incidentId: null,
                })
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

export default AdminIncidentManager;
