import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  selectFilteredNotifications,
} from "../store/notificationSlice";
import {
  fetchAlerts,
  acknowledgeAlert,
  AlertStatus,
} from "../store/alertsSlice";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert as MuiAlert,
  Paper,
  IconButton,
  Badge,
  Tooltip,
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  DoneAll as MarkAllReadIcon,
  NotificationsActive as NotificationsActiveIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Build as BuildIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { formatDistanceToNow } from "date-fns";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import signalRService from "../services/signalRService";

// Styled components
const StyledNotificationCard = styled(Card)(({ theme, unread, priority }) => ({
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${
    priority === "critical"
      ? theme.palette.error.main
      : priority === "high"
      ? theme.palette.warning.main
      : priority === "medium"
      ? theme.palette.info.main
      : theme.palette.success.main
  }`,
  backgroundColor: unread ? theme.palette.action.selected : "transparent",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
}));

const StyledAlertCard = styled(Card)(({ theme, status }) => ({
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${
    status === AlertStatus.Escalated
      ? theme.palette.error.main
      : status === AlertStatus.Pending
      ? theme.palette.warning.main
      : theme.palette.info.main
  }`,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
}));

// Notification Type Icons
const getNotificationIcon = (type) => {
  switch (type) {
    case "intervention_assigned":
    case "intervention_created":
    case "intervention_updated":
      return <AssignmentIcon />;
    case "stock_alert":
      return <InventoryIcon />;
    case "invoice_generated":
      return <ReceiptIcon />;
    case "user_created":
    case "user_registered":
      return <PersonIcon />;
    case "system_alert":
      return <BuildIcon />;
    default:
      return <NotificationsIcon />;
  }
};

// Priority Colors
const getPriorityColor = (priority) => {
  switch (priority) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    case "low":
      return "success";
    default:
      return "info";
  }
};

// Simple Notification Card Component
const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const handleMarkRead = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  const timeAgo = formatDistanceToNow(
    new Date(notification.timestamp || notification.createdAt),
    { addSuffix: true }
  );

  return (
    <StyledNotificationCard
      unread={!notification.isRead}
      priority={notification.priority}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar
            sx={{ bgcolor: `${getPriorityColor(notification.priority)}.main` }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>

          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" fontWeight="bold">
                {notification.title}
              </Typography>
              {!notification.isRead && (
                <Box
                  component="span"
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                  }}
                />
              )}
            </Box>

            <Typography variant="body1" color="text.secondary" mb={2}>
              {notification.message}
            </Typography>

            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                size="small"
                label={notification.priority}
                color={getPriorityColor(notification.priority)}
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                {timeAgo}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end" }}>
        {!notification.isRead && (
          <Button size="small" onClick={handleMarkRead} variant="outlined">
            Mark as Read
          </Button>
        )}
        <IconButton size="small" onClick={handleDelete} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </StyledNotificationCard>
  );
};

// Simple Stock Alert Card Component (Admin only)
const StockAlertCard = ({ alert, onAcknowledge }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case AlertStatus.Escalated:
        return "error";
      case AlertStatus.Pending:
        return "warning";
      default:
        return "info";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case AlertStatus.Pending:
        return "Needs Attention";
      case AlertStatus.Escalated:
        return "Critical";
      case AlertStatus.Acknowledged:
        return "Resolved";
      default:
        return "Active";
    }
  };

  return (
    <StyledAlertCard status={alert.status}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar sx={{ bgcolor: `${getStatusColor(alert.status)}.main` }}>
            <InventoryIcon />
          </Avatar>

          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" fontWeight="bold">
                Low Stock Alert
              </Typography>
              <Chip
                size="small"
                label={getStatusText(alert.status)}
                color={getStatusColor(alert.status)}
              />
            </Box>

            <Typography variant="body1" color="text.secondary" mb={1}>
              <strong>{alert.partName}</strong> is running low
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Current Stock: <strong>{alert.currentStock}</strong> | Minimum
              Required: <strong>{alert.threshold}</strong>
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(alert.createdAt), {
                addSuffix: true,
              })}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {alert.status !== AlertStatus.Acknowledged && (
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onAcknowledge(alert.id)}
            disabled={alert.acknowledging}
            startIcon={
              alert.acknowledging ? (
                <CircularProgress size={14} />
              ) : (
                <CheckCircleIcon />
              )
            }
          >
            {alert.acknowledging ? "Resolving..." : "Mark as Resolved"}
          </Button>
        </CardActions>
      )}
    </StyledAlertCard>
  );
};

// Main Notifications Screen Component
const NotificationScreen = () => {
  const dispatch = useDispatch();

  // Get current user to determine role
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === 0;

  // Redux state
  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
  } = useSelector((state) => state.alerts);
  const notifications = useSelector(selectFilteredNotifications);

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize data and SignalR connection
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      // Fetch notifications for all users
      await dispatch(fetchNotifications());

      // Fetch alerts only for admins
      if (isAdmin) {
        await dispatch(fetchAlerts());
      }

      // Initialize SignalR connection
      try {
        const token = localStorage.getItem("token");
        if (token && !signalRService.isConnectionActive()) {
          await signalRService.connect(token);
        }
      } catch {
        // Connection failed, notifications will work in polling mode
      }

      setLoading(false);
    };

    initializeData();
  }, [dispatch, isAdmin]);

  // Event handlers
  const handleAcknowledgeAlert = (alertId) => {
    dispatch(acknowledgeAlert(alertId));
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (notificationId) => {
    dispatch(deleteNotification(notificationId));
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications());
    if (isAdmin) {
      dispatch(fetchAlerts());
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Computed values
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.isRead
  ).length;
  const unreadAlertsCount = isAdmin
    ? alerts.filter((a) => a.status !== AlertStatus.Acknowledged).length
    : 0;

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />
        <Container
          sx={{
            flex: 1,
            py: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={60} />
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <Container sx={{ flex: 1, py: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" fontWeight="bold">
              Notifications
            </Typography>
            <Badge
              badgeContent={unreadNotificationsCount + unreadAlertsCount}
              color="error"
              max={99}
            >
              <NotificationsIcon />
            </Badge>
          </Box>

          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="large">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Tab Navigation - Only show alerts tab for admins */}
        {isAdmin ? (
          <>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab
                label="My Notifications"
                icon={
                  <Badge
                    badgeContent={unreadNotificationsCount}
                    color="error"
                    max={99}
                  >
                    <NotificationsActiveIcon />
                  </Badge>
                }
                iconPosition="end"
              />
              <Tab
                label="Stock Alerts"
                icon={
                  <Badge
                    badgeContent={unreadAlertsCount}
                    color="error"
                    max={99}
                  >
                    <WarningIcon />
                  </Badge>
                }
                iconPosition="end"
              />
            </Tabs>

            {/* Tab Content */}
            {activeTab === 0 && (
              <Box>
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography variant="h5" fontWeight="bold">
                      My Notifications ({notifications.length})
                    </Typography>
                    {unreadNotificationsCount > 0 && (
                      <Button
                        variant="outlined"
                        onClick={handleMarkAllAsRead}
                        startIcon={<MarkAllReadIcon />}
                      >
                        Mark All as Read ({unreadNotificationsCount})
                      </Button>
                    )}
                  </Box>

                  {notifications.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <NotificationsActiveIcon
                        sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No notifications yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You'll see important updates and alerts here
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {notifications.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkRead={handleMarkAsRead}
                          onDelete={handleDeleteNotification}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography variant="h5" fontWeight="bold">
                      Stock Alerts ({alerts.length})
                    </Typography>
                  </Box>

                  {alertsLoading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                      <CircularProgress />
                    </Box>
                  ) : alertsError ? (
                    <MuiAlert severity="error" sx={{ mb: 2 }}>
                      Error loading alerts: {alertsError}
                    </MuiAlert>
                  ) : alerts.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <InventoryIcon
                        sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No stock alerts
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        All inventory levels are normal
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {alerts.map((alert) => (
                        <StockAlertCard
                          key={alert.id}
                          alert={alert}
                          onAcknowledge={handleAcknowledgeAlert}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
          </>
        ) : (
          // Simple view for non-admin users (clients and technicians)
          <Paper elevation={0} sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h5" fontWeight="bold">
                My Notifications ({notifications.length})
              </Typography>
              {unreadNotificationsCount > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleMarkAllAsRead}
                  startIcon={<MarkAllReadIcon />}
                >
                  Mark All as Read ({unreadNotificationsCount})
                </Button>
              )}
            </Box>

            {notifications.length === 0 ? (
              <Box textAlign="center" py={8}>
                <NotificationsActiveIcon
                  sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You'll see important updates and alerts here
                </Typography>
              </Box>
            ) : (
              <Box>
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                  />
                ))}
              </Box>
            )}
          </Paper>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default NotificationScreen;
