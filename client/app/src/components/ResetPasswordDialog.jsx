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
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { adminResetPassword } from "../store/usersSlice";
import toast from "react-hot-toast"
export default function ResetPasswordDialog({ open, onClose, user }) {
  const dispatch = useDispatch();
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword) {
      alert("Password cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(adminResetPassword({ id: user.id, newPassword })).unwrap();
      onClose(); // Close the dialog on success
    } catch (error) {
      toast.error("error occured",error)
    } finally {
      setIsLoading(false);
      setNewPassword(""); // Clear the password field
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography>
            Enter a new temporary password for <strong>{user.username}</strong>.
          </Typography>
          <TextField
            label="New Temporary Password"
            type="text" // Show the password as the admin types it
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            autoFocus
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
          {isLoading ? <CircularProgress size={24} /> : "Reset Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
