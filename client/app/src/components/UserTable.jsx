import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Select,
  FormControl,
  Box,
  Tooltip,
  MenuItem,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch } from "react-redux";
import { deleteUser, changeUserRole } from "../store/usersSlice";
import toast from "react-hot-toast";

import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ResetPasswordDialog from "./ResetPasswordDialog";

const UserTable = ({ users }) => {
  const dispatch = useDispatch();
  const [resetUser, setResetUser] = useState(null);

  const handleOpenResetDialog = (user) => {
    setResetUser(user);
  };

  const handleCloseResetDialog = () => {
    setResetUser(null);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error(`Failed to delete user: ${error.message}`);
      }
    }
  };

  const handleView = (user) => {
    console.log("View user:", user);
    toast.info(`Viewing details for ${user.username}`);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await dispatch(changeUserRole({ id: userId, role: newRole })).unwrap();
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error(`Failed to update role: ${error.message}`);
    }
  };

  if (!users || users.length === 0) {
    return <Typography>No users found</Typography>;
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <FormControl size="small" variant="standard">
                    <Select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={user.role === 0} // Disable for admins
                    >
                      <MenuItem value={0}>Administrator</MenuItem>
                      <MenuItem value={1}>Technician</MenuItem>
                      <MenuItem value={2}>Client</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => handleView(user)}
                        size="small"
                        sx={{
                          color: "#60a5fa",
                          "&:hover": {
                            backgroundColor: "rgba(96, 165, 250, 0.1)",
                          },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                      <IconButton
                        onClick={() => handleOpenResetDialog(user)}
                        size="small"
                        sx={{ color: "#22c55e" }}
                      >
                        <VpnKeyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(user.id)}
                        size="small"
                        sx={{
                          color: "#ef4444",
                          "&:hover": {
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ResetPasswordDialog
        open={!!resetUser}
        onClose={handleCloseResetDialog}
        user={resetUser}
      />
    </>
  );
};

export default UserTable;
