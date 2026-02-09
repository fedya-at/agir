/* eslint-disable no-unused-vars */
import React, { useState, useCallback, memo } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import { Edit, Delete, Lock, LockOpen } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import {
  activateTechnician,
  deactivateTechnician,
  deleteTechnician,
} from "../store/techniciansSlice";
import TechnicianDialog from "./TechnicianDialog";
import { toast } from "react-hot-toast";
import { useLanguage } from "../contexts/LanguageContext";

const TechnicianTable = memo(({ technicians = [] }) => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [editTech, setEditTech] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleToggleStatus = useCallback(
    async (tech) => {
      const action = tech.isActive ? deactivateTechnician : activateTechnician;
      const status = tech.isActive ? "Désactivation" : "Activation";

      toast.loading(`${status} du technicien...`, { id: "status" });

      try {
        await dispatch(action(tech.id)).unwrap();
        toast.success(
          `Technicien ${tech.isActive ? "désactivé" : "activé"} avec succès !`,
          { id: "status" }
        );
      } catch (error) {
        toast.error(
          `Échec de la ${
            tech.isActive ? "désactivation" : "activation"
          } du technicien`,
          { id: "status" }
        );
      }
    },
    [dispatch]
  );

  const handleEdit = useCallback((tech) => {
    setEditTech(tech);
    setOpenDialog(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (
        window.confirm("Êtes-vous sûr de vouloir supprimer ce technicien ?")
      ) {
        toast.loading("Suppression du technicien...", { id: "delete" });

        try {
          await dispatch(deleteTechnician(id)).unwrap();
          toast.success("Technicien supprimé avec succès !", { id: "delete" });
        } catch (error) {
          toast.error("Échec de la suppression du technicien", {
            id: "delete",
          });
        }
      }
    },
    [dispatch]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditTech(null);
  }, []);

  return (
    <>
      <Box mb={2}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Liste des techniciens
        </Typography>
      </Box>
      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#D24419FF" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("username")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("name")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("specialization")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("email")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("status")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {technicians.map((tech, index) => (
              <TableRow
                key={tech.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                  },
                }}
              >
                <TableCell>{tech.username}</TableCell>
                <TableCell>{tech.name}</TableCell>
                <TableCell>{tech.specialization}</TableCell>
                <TableCell>{tech.email}</TableCell>
                <TableCell>
                  <Chip
                    label={tech.isActive ? t("active") : t("inactive")}
                    color={tech.isActive ? "success" : "default"}
                    variant={tech.isActive ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={t("edit")}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(tech)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("delete")}>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(tech.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={tech.isActive ? "Désactiver" : "Activer"}>
                    <IconButton
                      color={tech.isActive ? "warning" : "success"}
                      onClick={() => handleToggleStatus(tech)}
                    >
                      {tech.isActive ? <Lock /> : <LockOpen />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TechnicianDialog
        open={openDialog}
        onClose={handleCloseDialog}
        technician={editTech}
        onSuccess={(message) => toast.success(message)}
        onError={(message) => toast.error(message)}
      />
    </>
  );
});

TechnicianTable.displayName = "TechnicianTable";

export default TechnicianTable;
