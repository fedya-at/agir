import React from "react";
import { Paper, Typography } from "@mui/material";
import { darken } from "@mui/system";

const StatCard = React.memo(({ icon, label, value, bgColor, onClick }) => {
  return (
    <Paper
      elevation={3}
      onClick={onClick}
      sx={{
        p: 2,
        minWidth: 100,
        textAlign: "center",
        backgroundColor: bgColor,
        border: `1px solid ${darken(bgColor, 0.2)}`, // Border color is a darker shade of the background
      }}
    >
      {icon}
      <Typography variant="subtitle2">{label}</Typography>
      <Typography variant="h6">{value}</Typography>
    </Paper>
  );
});

export default StatCard;
