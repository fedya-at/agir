// components/InterventionCard.jsx
import React from "react";
import { Paper, Stack, Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import StatusChip from "./StatusChip";
import { useNavigate } from "react-router-dom";

const InterventionCard = React.memo(({ intervention, bgColor }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/interventions/${intervention.id}`);
  };

  return (
    <Paper
      elevation={4}
      onClick={handleClick}
      sx={{
        borderRadius: 1,
        p: 3,
        width: 280,
        height: 300,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: bgColor,
        overflow: "hidden",
        border: "1px solid black",
        cursor: "pointer", // Add pointer cursor to indicate clickable
        "&:hover": {
          transform: "scale(1.02)",
          transition: "transform 0.2s ease-in-out",
        },
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight="bold">
          Intervention #{intervention.id}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {intervention.description}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Client: {intervention.client?.name || "Unknown"}
        </Typography>
        <Typography variant="body2">
          Date: {dayjs(intervention.startDate).format("DD/MM/YYYY")}
        </Typography>
      </Box>

      <Stack spacing={1} alignItems="flex-end">
        <StatusChip status={intervention.status} />
        <Typography variant="body2">
          Technicien: {intervention.technician?.name || "Non assigné"}
        </Typography>
      </Stack>
    </Paper>
  );
});

export default InterventionCard;
