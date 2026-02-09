import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
  Modal
} from "@mui/material";
import { Close } from "@mui/icons-material";
import StyledCard from "../StyledCard";

const AssignTechnicianModal = ({
  open,
  onClose,
  availableTechnicians,
  selectedTechnician,
  onTechnicianSelect,
  onAssign,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <StyledCard sx={{ width: 500, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Assign Technician
          </Typography>
          <Button size="small" onClick={onClose} sx={{ minWidth: 0 }}>
            <Close />
          </Button>
        </Box>

        {availableTechnicians.length > 0 ? (
          <>
            <Select
              value={selectedTechnician}
              onChange={(e) => onTechnicianSelect(e.target.value)}
              fullWidth
              sx={{ mb: 3, mt: 1 }}
            >
              <MenuItem value="" disabled>
                Select a technician
              </MenuItem>
              {availableTechnicians.map((technician) => (
                <MenuItem key={technician.id} value={technician.id}>
                  {technician.name} ({technician.email})
                </MenuItem>
              ))}
            </Select>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onAssign}
                disabled={!selectedTechnician}
              >
                Assign
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CircularProgress size={24} sx={{ mb: 2 }} />
            <Typography>Loading available technicians...</Typography>
          </Box>
        )}
      </StyledCard>
    </Modal>
  );
};

export default AssignTechnicianModal;
