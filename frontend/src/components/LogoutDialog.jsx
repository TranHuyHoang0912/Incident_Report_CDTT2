// src/components/LogoutDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const LogoutDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xác nhận đăng xuất</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Bạn có chắc chắn muốn đăng xuất không?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Đăng xuất
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
