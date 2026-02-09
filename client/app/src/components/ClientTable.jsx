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
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { deleteClient } from "../store/clientsSlice";
import ClientDialog from "./ClientDialog";
import { toast } from "react-hot-toast";
import { useLanguage } from "../contexts/LanguageContext";

const ClientTable = memo(({ clients = [] }) => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [selectedClient, setSelectedClient] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleEdit = useCallback((client) => {
    setSelectedClient(client);
    setOpenDialog(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
        toast.loading("Suppression du client...", { id: "delete" });

        try {
          await dispatch(deleteClient(id)).unwrap();
          toast.success("Client supprimé avec succès !", { id: "delete" });
        } catch (error) {
          toast.error("Échec de la suppression du client", { id: "delete" });
        }
      }
    },
    [dispatch]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedClient(null);
  }, []);

  return (
    <>
      <Box mb={2}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Liste des clients
        </Typography>
      </Box>
      <TableContainer
        component={Paper}
        elevation={4}
        sx={{
          overflow: "hidden",
          mt: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("username")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("name")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("email")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("phone")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("address")}
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                {t("actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client, index) => (
              <TableRow
                key={client.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                  },
                }}
              >
                <TableCell>{client.username}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>
                  <Tooltip title={t("edit")}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("delete")}>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ClientDialog
        open={openDialog}
        onClose={handleCloseDialog}
        client={selectedClient}
        onSuccess={(message) => toast.success(message)}
        onError={(message) => toast.error(message)}
      />
    </>
  );
});

ClientTable.displayName = "ClientTable";

export default ClientTable;
