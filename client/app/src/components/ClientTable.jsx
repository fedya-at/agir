/* eslint-disable no-unused-vars */
import React, { useState } from "react";
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

export default function ClientTable({ clients }) {
  const dispatch = useDispatch();
  const [selectedClient, setSelectedClient] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleEdit = (client) => {
    setSelectedClient(client);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      toast.loading("Deleting client...", { id: "delete" });

      try {
        await dispatch(deleteClient(id)).unwrap();
        toast.success("Client deleted successfully!", { id: "delete" });
      } catch (error) {
        toast.error("Failed to delete client", { id: "delete" });
      }
    }
  };

  return (
    <>
      <Box mb={2}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Clients List
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
                Name
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Phone
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Address
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Actions
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
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
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
        onClose={() => setOpenDialog(false)}
        client={selectedClient}
        onSuccess={(message) => toast.success(message)}
        onError={(message) => toast.error(message)}
      />
    </>
  );
}
