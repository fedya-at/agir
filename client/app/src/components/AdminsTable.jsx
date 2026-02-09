import React, { memo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import {
  Delete,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { deleteAdmin } from "../store/adminsSlice";
import { toast } from "react-hot-toast";
import { useLanguage } from "../contexts/LanguageContext";

const AdminsTable = memo(({ admins = [] }) => {
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const isSuperAdmin = useCallback((admin) => {
    return admin.isSuperAdmin === true;
  }, []);

  const handleDelete = useCallback(
    async (id, username) => {
      if (
        window.confirm(
          `Êtes-vous sûr de vouloir supprimer l'administrateur "${username}" ? Cette action ne peut pas être annulée.`
        )
      ) {
        const toastId = toast.loading("Suppression de l'administrateur...");
        try {
          await dispatch(deleteAdmin(id)).unwrap();
          toast.success("Administrateur supprimé avec succès", { id: toastId });
        } catch (error) {
          toast.error(
            "Échec de la suppression de l'administrateur: " + error.message,
            {
              id: toastId,
            }
          );
        }
      }
    },
    [dispatch]
  );
  if (!admins || admins.length === 0) {
    return <Typography sx={{ p: 2 }}>{t("noDataFound")}</Typography>;
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "primary.main" }}>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              {t("username")}
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              {t("name")}
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              {t("email")}
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              {t("actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {admins.map((admin) => {
            const isSuper = isSuperAdmin(admin);
            return (
              <TableRow
                key={admin.id}
                hover={!isSuper}
                sx={{
                  backgroundColor: isSuper
                    ? "rgba(255, 193, 7, 0.1)"
                    : "inherit",
                  opacity: isSuper ? 0.8 : 1,
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {admin.username}
                    {isSuper && (
                      <Tooltip title="Super Administrator">
                        <AdminPanelSettingsIcon
                          sx={{
                            color: "warning.main",
                            fontSize: "small",
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{ color: isSuper ? "text.secondary" : "inherit" }}
                >
                  {admin.name}
                </TableCell>
                <TableCell
                  sx={{ color: isSuper ? "text.secondary" : "inherit" }}
                >
                  {admin.email}
                </TableCell>
                <TableCell>
                  {isSuper ? (
                    <Tooltip title="Cannot delete Super Administrator">
                      <span>
                        <IconButton disabled sx={{ color: "action.disabled" }}>
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t("delete")}>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(admin.id, admin.username)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

AdminsTable.displayName = "AdminsTable";

export default AdminsTable;
