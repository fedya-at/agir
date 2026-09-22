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

export default function TechnicianTable({ technicians }) {
  const dispatch = useDispatch();
  const [editTech, setEditTech] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleToggleStatus = async (tech) => {
    const action = tech.isActive ? deactivateTechnician : activateTechnician;
    const actionText = tech.isActive ? "Deactivating" : "Activating";

    toast.loading(`${actionText} technician...`, { id: "status" });

    try {
      await dispatch(action(tech.id)).unwrap();
      toast.success(
        `Technician ${tech.isActive ? "deactivated" : "activated"} successfully!`,
        { id: "status" }
      );
    } catch (error) {
      toast.error(
        `Failed to ${tech.isActive ? "deactivate" : "activate"} technician`,
        { id: "status" }
      );
    }
  };

  const handleEdit = (tech) => {
    setEditTech(tech);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this technician?")) {
      toast.loading("Deleting technician...", { id: "delete" });

      try {
        await dispatch(deleteTechnician(id)).unwrap();
        toast.success("Technician deleted successfully!", { id: "delete" });
      } catch (error) {
        toast.error("Failed to delete technician", { id: "delete" });
      }
    }
  };

  return (
    <>
      <Box mb={2}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Technicians List
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
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Name
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Specialization
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Actions
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
                <TableCell>{tech.name}</TableCell>
                <TableCell>{tech.specialization}</TableCell>
                <TableCell>{tech.email}</TableCell>
                <TableCell>
                  <Chip
                    label={tech.isActive ? "Active" : "Inactive"}
                    color={tech.isActive ? "success" : "default"}
                    variant={tech.isActive ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(tech)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(tech.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={tech.isActive ? "Deactivate" : "Activate"}>
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
        onClose={() => {
          setOpenDialog(false);
          setEditTech(null);
        }}
        technician={editTech}
        onSuccess={(message) => toast.success(message)}
        onError={(message) => toast.error(message)}
      />
    </>
  );
}
