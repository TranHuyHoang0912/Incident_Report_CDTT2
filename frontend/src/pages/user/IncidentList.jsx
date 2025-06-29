import React, { useState, useEffect } from "react";
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
  Pagination,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Rating from "@mui/material/Rating";
import axios from "../../utils/axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const pageSize = 8;

const IncidentList = () => {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [files, setFiles] = useState([]);
  // Tạo sự cố - state cho form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomId, setRoomId] = useState("");
  const [incidentTypeId, setIncidentTypeId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingIncidentTypes, setLoadingIncidentTypes] = useState(true);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [ratingIncident, setRatingIncident] = useState(null); // incident chọn đánh giá
  const [staffRating, setStaffRating] = useState(0);
  const [staffComment, setStaffComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files).slice(0, 3)); // Tối đa 3 ảnh
  };
  // Lấy role từ localStorage
  const role = React.useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.role || "";
    } catch {
      return "";
    }
  }, []);

  // Chọn hoặc bỏ chọn từng dòng
  const handleToggleSelect = (incidentId) => {
    setSelectedIds((prev) =>
      prev.includes(incidentId)
        ? prev.filter((id) => id !== incidentId)
        : [...prev, incidentId]
    );
  };

  // Chọn hoặc bỏ chọn tất cả
  const handleToggleSelectAll = () => {
    if (selectedIds.length === incidents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(incidents.map((item) => item.incidentId));
    }
  };

  const handleExportExcel = () => {
    const XLSX = require("xlsx");
    // Nếu không chọn dòng nào thì xuất tất cả, nếu chọn thì chỉ xuất các dòng đã chọn
    const dataToExport =
      selectedIds.length > 0
        ? incidents.filter((i) => selectedIds.includes(i.incidentId))
        : incidents;
    const ws = XLSX.utils.json_to_sheet(
      dataToExport.map((item) => ({
        "Tiêu đề": item.title,
        Phòng: item.room?.name || "",
        "Loại sự cố": item.incidentType?.name || "",
        "Trạng thái": item.status,
        "Ngày tạo": new Date(item.createdAt).toLocaleString(),
        "Nhân viên xử lý": item.handledBy?.username || "",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incidents");
    XLSX.writeFile(wb, "incidents.xlsx");
  };

  // Lấy danh sách phòng
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await axios.get("/rooms", {
          params: { take: 100, skip: 0 },
        });
        setRooms(res.data.data || []);
      } catch (err) {
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    if (openDialog) fetchRooms();
  }, [openDialog]);

  // Lấy danh sách loại sự cố
  useEffect(() => {
    const fetchIncidentTypes = async () => {
      setLoadingIncidentTypes(true);
      try {
        const res = await axios.get("/incident-types");
        setIncidentTypes(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setIncidentTypes([]);
      } finally {
        setLoadingIncidentTypes(false);
      }
    };
    if (openDialog) fetchIncidentTypes();
  }, [openDialog]);

  // Lấy danh sách sự cố
  const fetchIncidents = async () => {
    const res = await axios.get("/incidents", {
      params: {
        take: pageSize,
        skip: (page - 1) * pageSize,
        search,
      },
    });
    setIncidents(res.data.data || []);
    setTotal(res.data.total || 0);
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, search]);

  // Xử lý tạo mới sự cố
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("roomId", roomId);
      formData.append("incidentTypeId", incidentTypeId);

      files.forEach((file) => formData.append("files", file)); // 'files' phải trùng với BE

      await axios.post("/incidents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOpenDialog(false);
      setTitle("");
      setDescription("");
      setRoomId("");
      setIncidentTypeId("");
      setFiles([]); // Reset files
      fetchIncidents();
    } catch (err) {
      setFormError("Không tạo được sự cố. Kiểm tra lại dữ liệu hoặc ảnh.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenRatingDialog = (incident) => {
    setRatingIncident(incident);
    setStaffRating(0);
    setStaffComment("");
    setRatingError("");
    setOpenRatingDialog(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setRatingLoading(true);
    setRatingError("");
    try {
      await axios.post("/staff-ratings", {
        incidentId: ratingIncident.incidentId,
        rating: staffRating,
        comment: staffComment,
        // Không cần truyền staffId, BE sẽ lấy incident.handledById
      });
      setOpenRatingDialog(false);
      fetchIncidents(); // Load lại dữ liệu
    } catch (err) {
      setRatingError(
        err?.response?.data?.message?.[0] ||
          err?.response?.data?.message ||
          "Không gửi được đánh giá."
      );
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Danh sách sự cố của bạn</Typography>
        <Box display="flex" gap={1}>
          {role === "USER" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Tạo sự cố mới
            </Button>
          )}
          <Button
            variant="outlined"
            color="success"
            onClick={handleExportExcel}
          >
            Xuất Excel
          </Button>
        </Box>
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
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === incidents.length &&
                    incidents.length > 0
                  }
                  onChange={handleToggleSelectAll}
                />
              </TableCell>
              <TableCell>STT</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Loại sự cố</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ảnh</TableCell>
              <TableCell>Nhân viên xử lý</TableCell>
              {role === "USER" && <TableCell>Đánh giá</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((item, idx) => (
              <TableRow key={item.incidentId}>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.incidentId)}
                    onChange={() => handleToggleSelect(item.incidentId)}
                  />
                </TableCell>

                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.room?.name || ""}</TableCell>
                <TableCell>{item.incidentType?.name || ""}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
                {/* Ảnh sự cố */}
                <TableCell>
                  {item.imageUrls && item.imageUrls.length > 0
                    ? item.imageUrls.map((img, idx) => (
                        <a
                          key={idx}
                          href={`http://localhost:3001${img}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`http://localhost:3001${img}`}
                            alt="Sự cố"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              marginRight: 8,
                            }}
                          />
                        </a>
                      ))
                    : "-"}
                </TableCell>

                <TableCell>{item.handledBy?.username || ""}</TableCell>
                {role === "USER" && (
                  <TableCell>
                    {item.status === "resolved" ? (
                      item.staffRating ? (
                        <Box>
                          <Rating
                            value={item.staffRating.rating}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {item.staffRating.comment}
                          </Typography>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenRatingDialog(item)}
                        >
                          Đánh giá
                        </Button>
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {incidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
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

      {/* Dialog tạo sự cố mới */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tạo sự cố mới</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error">{formError}</Alert>}
          <form onSubmit={handleCreate}>
            <TextField
              label="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
            <TextField
              select
              label="Phòng"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              fullWidth
              required
              margin="normal"
              disabled={loadingRooms}
            >
              {loadingRooms ? (
                <MenuItem value="">
                  <CircularProgress size={18} sx={{ mr: 1 }} /> Đang tải
                  phòng...
                </MenuItem>
              ) : rooms.length === 0 ? (
                <MenuItem value="">Không có phòng</MenuItem>
              ) : (
                rooms.map((room) => (
                  <MenuItem key={room.roomId} value={room.roomId}>
                    {room.name}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              select
              label="Loại sự cố"
              value={incidentTypeId}
              onChange={(e) => setIncidentTypeId(e.target.value)}
              fullWidth
              required
              margin="normal"
              disabled={loadingIncidentTypes}
            >
              {loadingIncidentTypes ? (
                <MenuItem value="">
                  <CircularProgress size={18} sx={{ mr: 1 }} /> Đang tải loại sự
                  cố...
                </MenuItem>
              ) : incidentTypes.length === 0 ? (
                <MenuItem value="">Không có loại sự cố</MenuItem>
              ) : (
                incidentTypes.map((type) => (
                  <MenuItem
                    key={type.incidentTypeId}
                    value={type.incidentTypeId}
                  >
                    {type.name}
                  </MenuItem>
                ))
              )}
            </TextField>

            {/* INPUT CHỌN ẢNH */}
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              fullWidth
              sx={{ my: 2 }}
            >
              Chọn ảnh (tối đa 3)
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {/* Hiển thị preview ảnh */}
            <Box display="flex" gap={1} mb={1}>
              {files.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt={`preview-${idx}`}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              ))}
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              fullWidth
              disabled={formLoading}
            >
              {formLoading ? <CircularProgress size={22} /> : "Tạo sự cố"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog đánh giá nhân viên xử lý */}
      <Dialog
        open={openRatingDialog}
        onClose={() => setOpenRatingDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Đánh giá nhân viên xử lý</DialogTitle>
        <DialogContent>
          {ratingError && <Alert severity="error">{ratingError}</Alert>}
          <form onSubmit={handleSubmitRating}>
            <Box my={2}>
              <Typography>Chọn số sao:</Typography>
              <Rating
                value={staffRating}
                onChange={(_, newValue) => setStaffRating(newValue)}
                size="large"
                required
              />
            </Box>
            <TextField
              label="Nhận xét (tuỳ chọn)"
              value={staffComment}
              onChange={(e) => setStaffComment(e.target.value)}
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
              disabled={ratingLoading || !staffRating}
            >
              {ratingLoading ? <CircularProgress size={22} /> : "Gửi đánh giá"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default IncidentList;
