// src/components/NotificationCenter.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconButton, Badge, Tooltip } from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
} from "@mui/icons-material";
import {
  selectUnreadCount,
  fetchNotifications,
} from "../store/notificationSlice";

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const unreadCount = useSelector(selectUnreadCount);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleNotificationClick = () => {
    // Navigate to notifications screen
    navigate("/notifications");
  };

  return (
    <Tooltip title={`Notifications (${unreadCount} unread)`}>
      <IconButton
        color="inherit"
        onClick={handleNotificationClick}
        sx={{
          color: "text.primary",
          "&:hover": {
            backgroundColor: "action.hover",
          },
          position: "relative",
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              right: -3,
              top: -3,
              fontSize: "0.75rem",
              height: "20px",
              minWidth: "20px",
              fontWeight: "bold",
            },
          }}
        >
          {unreadCount > 0 ? (
            <NotificationsIcon sx={{ fontSize: "1.5rem" }} />
          ) : (
            <NotificationsNoneIcon sx={{ fontSize: "1.5rem" }} />
          )}
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationCenter;
