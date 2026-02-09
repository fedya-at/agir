// ClientInterventionsModal.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import { Close, InfoOutlined } from "@mui/icons-material";
import StyledCard from "../StyledCard";
import dayjs from "dayjs";

const statusColors = {
  Pending: "warning",
  InProgress: "info",
  Completed: "success",
  Cancelled: "error",
};

const ClientInterventionsModal = ({
  open,
  onClose,
  interventions = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (id) => {
    onClose(); // Close the modal before navigating
    navigate(`/interventions/${id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="client-interventions-modal-title"
      aria-describedby="client-interventions-modal-desc"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "98%", sm: "90%", md: "70%" },
          maxWidth: 950,
          maxHeight: "85vh",
          overflow: "auto",
          outline: "none",
          zIndex: 1300,
          borderRadius: 3,
          boxShadow: 24,
        }}
      >
        <StyledCard>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 3,
              borderBottom: "1px solid #eee",
              background: "#f5f7fa",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <Typography
              id="client-interventions-modal-title"
              variant="h5"
              component="h2"
              sx={{ fontWeight: 600, color: "#2d3748" }}
            >
              <InfoOutlined sx={{ mr: 1, verticalAlign: "middle" }} />
              Client previous Interventions
            </Typography>
            <IconButton onClick={onClose} aria-label="close" size="large">
              <Close />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ p: { xs: 1, sm: 3 } }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                <CircularProgress size={48} />
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: "60vh",
                  borderRadius: 2,
                  boxShadow: "none",
                  mt: 1,
                }}
              >
                <Table
                  stickyHeader
                  size="medium"
                  aria-label="interventions table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {interventions.length > 0 ? (
                      interventions.map((intervention) => (
                        <TableRow
                          key={intervention.id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRowClick(intervention.id)}
                        >
                          <TableCell>{intervention.id}</TableCell>
                          <TableCell>
                            <Tooltip
                              title={intervention.description || ""}
                              arrow
                            >
                              <span>
                                {intervention.description?.length > 40
                                  ? intervention.description.slice(0, 40) +
                                    "..."
                                  : intervention.description}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {intervention.startDate
                              ? dayjs(intervention.startDate).format(
                                  "MMM D, YYYY"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {intervention.endDate ? (
                              dayjs(intervention.endDate).format("MMM D, YYYY")
                            ) : (
                              <Chip label="Ongoing" color="info" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                typeof intervention.status === "number"
                                  ? [
                                      "Pending",
                                      "InProgress",
                                      "Completed",
                                      "Cancelled",
                                    ][intervention.status] ||
                                    intervention.status
                                  : intervention.status
                              }
                              color={
                                statusColors[
                                  typeof intervention.status === "number"
                                    ? [
                                        "Pending",
                                        "InProgress",
                                        "Completed",
                                        "Cancelled",
                                      ][intervention.status]
                                    : intervention.status
                                ] || "default"
                              }
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" sx={{ py: 4 }}>
                            No interventions found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </StyledCard>
      </Box>
    </Modal>
  );
};

export default ClientInterventionsModal;
