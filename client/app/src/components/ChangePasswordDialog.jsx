import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { changePassword } from "../store/usersSlice";
import toast from "react-hot-toast"
export default function ChangePasswordDialog({ open, onClose, userId }) {
  const dispatch = useDispatch();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(
        changePassword({ id: userId, passwordData: passwords })
      ).unwrap();
      toast.success("Password changed successfully")
      onClose(); 
    } catch (error) {
      toast.error("Failed to change password",error);
    } finally {
      setIsLoading(false);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Your Password</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            name="currentPassword"
            label="Current Password"
            type="password"
            value={passwords.currentPassword}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            name="newPassword"
            label="New Password"
            type="password"
            value={passwords.newPassword}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            value={passwords.confirmNewPassword}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Change Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
