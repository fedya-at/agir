import React from "react";
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from "@mui/material";

const TechnicianListModal = ({ open, onClose, technicians, onAssign }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "600px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Assign Technician
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {technicians.map((technician) => (
            <ListItem key={technician.id} disablePadding>
              <ListItemButton onClick={() => onAssign(technician.id)}>
                <ListItemText
                  primary={technician.name}
                  secondary={technician.specialization}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
};

export default TechnicianListModal;
