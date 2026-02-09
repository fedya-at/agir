/* eslint-disable no-unused-vars */
import React from "react";
import { Grid, Typography } from "@mui/material";
import InterventionCard from "./InterventionCard";

const statusColors = {
  pending: "#fff3e0",
  in_progress: "#e3f2fd",
  completed: "#e8f5e9",
  cancelled: "#ffebee",
};

const InterventionList = React.memo(
  ({ interventions, clients, technicians }) => {
    if (interventions.length === 0) {
      return <Typography>Aucune intervention trouvée</Typography>;
    }

    return (
      <Grid container spacing={2}>
        {interventions.map((intervention) => (
          <Grid item xs={12} sm={6} md={4} key={intervention.id}>
            <InterventionCard
              intervention={intervention}
              bgColor={statusColors[intervention.status] || "#f5f5f5"}
            />
          </Grid>
        ))}
      </Grid>
    );
  }
);

export default InterventionList;
