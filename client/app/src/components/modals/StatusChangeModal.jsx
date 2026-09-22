// StatusChangeModal.js
import React from "react";
import { Box, Button, MenuItem, Select, Typography,Modal } from "@mui/material";
import { Close } from "@mui/icons-material";
import StyledCard from "../StyledCard";

const statusOptions = [
  { value: 0, label: "Pending" },
  { value: 1, label: "In Progress" },
  { value: 2, label: "Completed" },
  { value: 3, label: "Cancelled" },
];

const StatusChangeModal = ({
  open,
  onClose,
  currentStatus,
  selectedStatus,
  onStatusChange,
  onUpdate,
  isAdmin,
}) => {
  // Filter status options based on user role
  const availableOptions = isAdmin
    ? statusOptions
    : statusOptions.filter(
        (option) => option.value === 1 || option.value === 2
      );

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <StyledCard sx={{ width: 400, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Update Intervention Status
          </Typography>
          <Button size="small" onClick={onClose} sx={{ minWidth: 0 }}>
            <Close />
          </Button>
        </Box>
        <Select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          fullWidth
          sx={{ mb: 3, mt: 1 }}
        >
          {availableOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onUpdate}
            disabled={parseInt(selectedStatus, 10) === currentStatus}
          >
            Update Status
          </Button>
        </Box>
      </StyledCard>
    </Modal>
  );
};

export default StatusChangeModal;
