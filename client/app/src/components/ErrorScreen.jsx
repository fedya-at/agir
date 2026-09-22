// src/components/ErrorScreen.jsx
import React, { useEffect } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import ConstructionIcon from "@mui/icons-material/Construction";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

const errorTypes = {
  network: {
    icon: <WifiOffIcon sx={{ fontSize: 80 }} color="error" />,
    title: "Connection Error",
    message:
      "We couldn't connect to the server. Please check your internet connection.",
  },
  server: {
    icon: <ConstructionIcon sx={{ fontSize: 80 }} color="error" />,
    title: "Server Error",
    message: "Something went wrong on our end. Our team has been notified.",
  },
  notFound: {
    icon: <ErrorOutlineIcon sx={{ fontSize: 80 }} color="error" />,
    title: "Not Found",
    message: "The resource you requested doesn't exist or has been removed.",
  },
  unauthorized: {
    icon: <ErrorOutlineIcon sx={{ fontSize: 80 }} color="error" />,
    title: "Unauthorized",
    message: "Your token has expired. Please log in again.",
  },
  default: {
    icon: <SentimentVeryDissatisfiedIcon sx={{ fontSize: 80 }} color="error" />,
    title: "Oops! Something went wrong",
    message: "We encountered an unexpected error. Please try again later.",
  },
};

const ErrorScreen = ({
  type = "default",
  message,
  title,
  onRetry,
  fullScreen = true,
  customIcon,
  errorDetails,
}) => {
  const errorConfig = errorTypes[type] || errorTypes.default;
  const navigate = useNavigate();

  useEffect(() => {
    if (type === "unauthorized") {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [type, navigate]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
        ...(fullScreen && {
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          bgcolor: "background.default",
          zIndex: 9999,
        }),
      }}
    >
      <Navbar />
      <Stack spacing={3} alignItems="center">
        {customIcon || errorConfig.icon}

        <Typography variant="h4" component="h1">
          {title || errorConfig.title}
        </Typography>

        <Typography variant="body1" color="text.secondary">
          {message || errorConfig.message}
        </Typography>

        {errorDetails && (
          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              maxWidth: "600px",
              overflow: "auto",
              textAlign: "left",
            }}
          >
            <Typography variant="caption" component="pre">
              {typeof errorDetails === "object"
                ? JSON.stringify(errorDetails, null, 2)
                : errorDetails}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={2}>
          {type === "unauthorized" ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")}
              size="large"
            >
              Go to Login
            </Button>
          ) : (
            onRetry && (
              <Button
                variant="contained"
                color="primary"
                onClick={onRetry}
                size="large"
              >
                Retry
              </Button>
            )
          )}
        </Stack>
      </Stack>
      <Footer />
    </Box>
  );
};

export default ErrorScreen;
