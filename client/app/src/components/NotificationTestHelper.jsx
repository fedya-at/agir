// src/components/NotificationTestHelper.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { Button, Box, Typography } from "@mui/material";
import { addNotification } from "../store/notificationSlice";

const NotificationTestHelper = () => {
  const dispatch = useDispatch();

  const addTestNotification = (type, priority) => {
    const testNotifications = {
      intervention: {
        id: Date.now(),
        type: "intervention_assigned",
        title: "New Intervention Assignment",
        message: "You have been assigned to repair AC unit at Building A",
        priority: priority || "medium",
        isRead: false,
        timestamp: new Date().toISOString(),
        actionUrl: "/interventions/123",
      },
      stock: {
        id: Date.now(),
        type: "stock_alert",
        title: "Low Stock Alert",
        message: "Air filters are running low (5 remaining)",
        priority: priority || "high",
        isRead: false,
        timestamp: new Date().toISOString(),
        actionUrl: "/inventory",
      },
      email: {
        id: Date.now(),
        type: "email_sent",
        title: "Email Sent",
        message: "Invoice email sent to client successfully",
        priority: priority || "low",
        isRead: false,
        timestamp: new Date().toISOString(),
      },
      system: {
        id: Date.now(),
        type: "system_alert",
        title: "System Maintenance",
        message: "Scheduled maintenance will begin in 30 minutes",
        priority: priority || "critical",
        isRead: false,
        timestamp: new Date().toISOString(),
      },
    };

    dispatch(addNotification(testNotifications[type]));
  };

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 9999,
        backgroundColor: "background.paper",
        p: 2,
        borderRadius: 1,
        boxShadow: 3,
        maxWidth: 250,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Test Notifications
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => addTestNotification("intervention", "medium")}
        >
          Add Intervention
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="warning"
          onClick={() => addTestNotification("stock", "high")}
        >
          Add Stock Alert
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="info"
          onClick={() => addTestNotification("email", "low")}
        >
          Add Email Notification
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => addTestNotification("system", "critical")}
        >
          Add System Alert
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationTestHelper;
