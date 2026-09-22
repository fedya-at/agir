import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Switch,
  FormControlLabel,

} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Settings = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f7f7f7",
      }}
    >
      <Navbar />
      <Box
        sx={{ flex: 1, py: 5, px: 2, maxWidth: 700, mx: "auto", width: "100%" }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Paramètres
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Préférences
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={() => setNotifications((v) => !v)}
                color="primary"
                inputProps={{ "aria-label": "Activer les notifications" }}
              />
            }
            label="Activer les notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode((v) => !v)}
                color="primary"
                inputProps={{ "aria-label": "Mode sombre" }}
              />
            }
            label="Mode sombre"
          />
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default Settings;
