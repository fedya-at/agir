// InterventionHeader.js
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import StatusChip from "./StatusChip";
import dayjs from "dayjs";

const InterventionHeader = ({
  intervention,
  isTechnician,
  isAdmin,
  onStatusChangeClick,
}) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
      <Box>
        <Typography variant="h4" fontWeight={600}>
          Intervention #{intervention.id.split("-")[0]}
        </Typography>
        <Typography color="text.secondary">
          Created on {dayjs(intervention.createdAt).format("MMM D, YYYY")}
        </Typography>
        {(isTechnician || isAdmin) && (
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={onStatusChangeClick}
          >
            Change Status
          </Button>
        )}
      </Box>
      <StatusChip
        status={intervention.status}
        size="large"
        sx={{
          fontSize: "1.2rem",
          padding: "8px 16px",
          borderRadius: "8px",
        }}
      />
    </Box>
  );
};

export default InterventionHeader;
