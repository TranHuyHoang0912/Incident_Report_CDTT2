import React, { useState, useEffect } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Box, Pagination, TextField, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "../../utils/axios";

const pageSize = 8;

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchRooms = async () => {
    const res = await axios.get("/rooms", {
      params: { take: pageSize, skip: (page - 1) * pageSize, search },
    });
    setRooms(res.data.data || []);
    setTotal(res.data.total || 0);
  };

  useEffect(() => { fetchRooms(); }, [page, search]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>Danh sách phòng</Typography>
      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Tìm kiếm phòng"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên phòng</TableCell>
              <TableCell>Ghi chú</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room, idx) => (
              <TableRow key={room.roomId}>
                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.description}</TableCell>
              </TableRow>
            ))}
            {rooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">Không có dữ liệu</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} display="flex" justifyContent="center">
        <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={(e, val) => setPage(val)} />
      </Box>
    </Paper>
  );
};

export default RoomList;
