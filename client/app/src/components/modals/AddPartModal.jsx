import React from "react";
import { Box, Button, Typography,Modal } from "@mui/material";
import { Close } from "@mui/icons-material";
import StyledCard from "../StyledCard";
import AddPartForm from "../AddPartForm";

const AddPartModal = ({
  open,
  onClose,
  availableParts,
  onAddPart,
  isLoading,
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
            Add New Part
          </Typography>
          <Button size="small" onClick={onClose} sx={{ minWidth: 0 }}>
            <Close />
          </Button>
        </Box>
        <AddPartForm
          parts={availableParts}
          onAdd={onAddPart}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </StyledCard>
    </Modal>
  );
};

export default AddPartModal;
