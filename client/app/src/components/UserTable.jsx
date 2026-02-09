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
import { useLanguage } from "../contexts/LanguageContext";

import VpnKeyIcon from "@mui/icons-material/VpnKey"; // Import a new icon
import ResetPasswordDialog from "./ResetPasswordDialog";
const UserTable = ({ users }) => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [resetUser, setResetUser] = useState(null); // State to hold the user whose password is being reset
  const handleOpenResetDialog = (user) => {
    setResetUser(user);
  };

  const handleCloseResetDialog = () => {
    setResetUser(null);
  };

  const handleDelete = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      toast.error(`Échec de la suppression de l'utilisateur: ${error.message}`);
    }
  };

  const handleView = (user) => {
    toast.info(`Affichage des détails de ${user.username}`);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await dispatch(changeUserRole({ id: userId, role: newRole })).unwrap();
      toast.success("Rôle utilisateur mis à jour avec succès");
    } catch (error) {
      toast.error(`Échec de la mise à jour du rôle: ${error.message}`);
    }
  };

  if (!users || users.length === 0) {
    return <Typography>{t("noDataFound")}</Typography>;
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("username")}</TableCell>
              <TableCell>{t("email")}</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell>{t("actions")}</TableCell>
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
                      <MenuItem value={0}>{t("administrators")}</MenuItem>
                      <MenuItem value={1}>{t("technicians")}</MenuItem>
                      <MenuItem value={2}>{t("clients")}</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {user.isActive ? t("active") : t("inactive")}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title={t("view")}>
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
                    <Tooltip title="Réinitialiser le mot de passe">
                      <IconButton
                        onClick={() => handleOpenResetDialog(user)}
                        size="small"
                        sx={{ color: "#22c55e" }}
                      >
                        <VpnKeyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={t("delete")}>
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
