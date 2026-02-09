// src/components/NotificationToast.jsx
import React from "react";
import { Snackbar, Alert, AlertTitle, Box, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledAlert = styled(Alert)(({ theme, priority }) => ({
  "& .MuiAlert-message": {
    padding: theme.spacing(0.5, 0),
  },
  "& .MuiAlert-action": {
    paddingLeft: theme.spacing(1),
  },
  borderLeft: `4px solid ${
    priority === "critical"
      ? theme.palette.error.main
      : priority === "high"
      ? theme.palette.warning.main
      : priority === "medium"
      ? theme.palette.info.main
      : theme.palette.success.main
  }`,
}));

const getSeverity = (priority) => {
  switch (priority) {
    case "critical":
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "info";
  }
};

const NotificationToast = ({
  open,
  onClose,
  notification,
  autoHideDuration = 6000,
  position = { vertical: "top", horizontal: "right" },
}) => {
  if (!notification) return null;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={position}
      sx={{ zIndex: 9999 }}
    >
      <StyledAlert
        severity={getSeverity(notification.priority)}
        priority={notification.priority}
        onClose={handleClose}
        variant="filled"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontWeight: "bold" }}>
          {notification.title || "Notification"}
        </AlertTitle>
        <Box>{notification.message}</Box>
        {notification.actionUrl && (
          <Box sx={{ mt: 1 }}>
            <a
              href={notification.actionUrl}
              style={{
                color: "inherit",
                textDecoration: "underline",
                fontSize: "0.875rem",
              }}
            >
              View Details
            </a>
          </Box>
        )}
      </StyledAlert>
    </Snackbar>
  );
};

export default NotificationToast;
