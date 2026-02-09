import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";

const Settings = () => {
  const { language, changeLanguage, t } = useLanguage();
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
          {t("settings")}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t("preferences")}
          </Typography>

          {/* Language Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t("language")}</InputLabel>
            <Select
              value={language}
              label={t("language")}
              onChange={(e) => changeLanguage(e.target.value)}
            >
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={() => setNotifications((v) => !v)}
                color="primary"
                inputProps={{ "aria-label": t("enableNotifications") }}
              />
            }
            label={t("enableNotifications")}
          />
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode((v) => !v)}
                color="primary"
                inputProps={{ "aria-label": t("darkMode") }}
              />
            }
            label={t("darkMode")}
          />
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default Settings;
