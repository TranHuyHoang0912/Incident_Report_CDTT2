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
  Pagination,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "../../utils/axios";

const pageSize = 8;

const AdminIncidentReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  // Get user role from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setRole(user?.role || "");
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let params = { take: pageSize, skip: (page - 1) * pageSize, search };

      // Nếu là staff, chỉ lấy đánh giá của chính họ
      if (role === "STAFF") {
        const user = JSON.parse(localStorage.getItem("user"));
        params = { ...params, userId: user.userId };
      }

      const res = await axios.get("/staff-ratings", { params });
      setReviews(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, search, role]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Quản lý đánh giá sự cố
      </Typography>
      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Tìm kiếm đánh giá"
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
              <TableCell>Người đánh giá</TableCell>
              <TableCell>Sự cố</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Điểm</TableCell>
              <TableCell>Ngày đánh giá</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review, idx) => (
                <TableRow key={review.reviewId}>
                  <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                  <TableCell>
                    {review.user?.username || review.userId}
                  </TableCell>
                  <TableCell>
                    {review.incident?.title || review.incidentId}
                  </TableCell>
                  <TableCell>{review.comment}</TableCell>
                  <TableCell>{review.rating}</TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleString("vi-VN")}
                  </TableCell>
                </TableRow>
              ))
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
    </Paper>
  );
};

export default AdminIncidentReviewManager;
