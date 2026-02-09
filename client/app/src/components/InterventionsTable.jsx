// src/components/InterventionsTable.jsx
import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit, AssignmentInd } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchInterventions } from "../store/interventionsSlice";
import AssignTechnicianModal from "./AssignTechnicianModal";

const InterventionsTable = memo(() => {
  const dispatch = useDispatch();
  const { interventions, status, error } = useSelector(
    (state) => state.interventions
  );
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  useEffect(() => {
    dispatch(fetchInterventions());
  }, [dispatch]);

  const handleAssignClick = useCallback((intervention) => {
    setSelectedIntervention(intervention);
    setAssignModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setAssignModalOpen(false);
    setSelectedIntervention(null);
  }, []);

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Interventions
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interventions.map((intervention) => (
              <TableRow key={intervention.id}>
                <TableCell>{intervention.id}</TableCell>
                <TableCell>{intervention.title}</TableCell>
                <TableCell>{intervention.status}</TableCell>
                <TableCell>{intervention.client?.username || "N/A"}</TableCell>
                <TableCell>
                  {intervention.technician?.username || "Unassigned"}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleAssignClick(intervention)}
                    title="Assign Technician"
                  >
                    <AssignmentInd />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedIntervention && (
        <AssignTechnicianModal
          open={assignModalOpen}
          handleClose={handleModalClose}
          interventionId={selectedIntervention.id}
        />
      )}
    </Box>
  );
});

InterventionsTable.displayName = "InterventionsTable";

export default InterventionsTable;
