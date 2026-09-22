import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  DoneAll as MarkAllReadIcon,
  MarkEmailRead as MarkEmailReadIcon,
  NotificationsActive as NotificationsActiveIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Styled components
const StyledAlertItem = styled(ListItem)(({ theme, status }) => ({
  backgroundColor:
    status === AlertStatus.Escalated
      ? theme.palette.error.light
      : status === AlertStatus.Pending
      ? theme.palette.warning.light
      : status === AlertStatus.Sent
      ? theme.palette.info.light
      : theme.palette.success.light,
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateX(5px)",
    boxShadow: theme.shadows[2],
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === AlertStatus.Escalated
      ? theme.palette.error.main
      : status === AlertStatus.Pending
      ? theme.palette.warning.main
      : status === AlertStatus.Sent
      ? theme.palette.info.main
      : theme.palette.success.main,
  color: theme.palette.getContrastText(
    status === AlertStatus.Escalated
      ? theme.palette.error.main
      : status === AlertStatus.Pending
      ? theme.palette.warning.main
      : status === AlertStatus.Sent
      ? theme.palette.info.main
      : theme.palette.success.main
  ),
}));

// Alert List Component
const AlertList = ({
  alerts,
  loading,
  error,
  onAcknowledge,
  onAcknowledgeAll,
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case AlertStatus.Escalated:
        return <ErrorIcon />;
      case AlertStatus.Pending:
        return <WarningIcon />;
      case AlertStatus.Sent:
        return <NotificationsIcon />;
      case AlertStatus.Acknowledged:
        return <CheckCircleIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case AlertStatus.Pending:
        return "Pending";
      case AlertStatus.Sent:
        return "Sent";
      case AlertStatus.Acknowledged:
        return "Acknowledged";
      case AlertStatus.Escalated:
        return "Escalated";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <MuiAlert severity="error" sx={{ m: 2 }}>
        Error loading alerts: {error}
      </MuiAlert>
    );
  }

  if (alerts.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <NotificationsIcon sx={{ fontSize: 64, color: "text.secondary" }} />
        <Typography variant="h6" color="text.secondary">
          No active alerts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You'll be notified when stock levels are critical
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Stock Alerts
        </Typography>
        <Tooltip title="Acknowledge all">
          <IconButton
            onClick={onAcknowledgeAll}
            disabled={alerts.every(
              (a) => a.status === AlertStatus.Acknowledged
            )}
            color="primary"
          >
            <Badge
              badgeContent={
                alerts.filter((a) => a.status !== AlertStatus.Acknowledged)
                  .length
              }
              color="error"
            >
              <MarkAllReadIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <List>
        {alerts.map((alert) => (
          <React.Fragment key={alert.id}>
            <StyledAlertItem status={alert.status}>
              <ListItemAvatar>
                <Avatar>{getStatusIcon(alert.status)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight="bold">{alert.partName}</Typography>
                    <StatusChip
                      size="small"
                      label={getStatusText(alert.status)}
                      status={alert.status}
                    />
                    {alert.isEscalated && (
                      <Chip
                        size="small"
                        label="ESCALATED"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">{alert.message}</Typography>
                    <Typography variant="caption" display="block">
                      Stock: {alert.currentStock} (Threshold: {alert.threshold})
                    </Typography>
                    <Typography variant="caption" display="block">
                      Created: {new Date(alert.createdAt).toLocaleString()}
                    </Typography>
                    {alert.sentAt && (
                      <Typography variant="caption" display="block">
                        Sent: {new Date(alert.sentAt).toLocaleString()}
                      </Typography>
                    )}
                    {alert.acknowledgedAt && (
                      <Typography variant="caption" display="block">
                        Acknowledged:{" "}
                        {new Date(alert.acknowledgedAt).toLocaleString()}
                      </Typography>
                    )}
                  </>
                }
              />
              {alert.status !== AlertStatus.Acknowledged && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onAcknowledge(alert.id)}
                  disabled={alert.acknowledging}
                  startIcon={
                    alert.acknowledging ? <CircularProgress size={14} /> : null
                  }
                >
                  {alert.acknowledging ? "Processing..." : "Acknowledge"}
                </Button>
              )}
            </StyledAlertItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

// Notification Screen Component
const NotificationScreen = () => {
  const dispatch = useDispatch();
  const { alerts, loading, error } = useSelector((state) => state.alerts);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load alerts
  useEffect(() => {
    dispatch(fetchAlerts());
    const intervalId = setInterval(() => dispatch(fetchAlerts()), 60000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Load system notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockNotifications = [
          {
            id: 1,
            message:
              "Your intervention has been scheduled for tomorrow at 10:00 AM",
            createdAt: new Date().toISOString(),
            isRead: false,
          },
          {
            id: 2,
            message: "System maintenance completed successfully",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            isRead: true,
          },
          {
            id: 3,
            message: "New technician assigned to your case",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            isRead: false,
          },
        ];

        setNotifications(mockNotifications);
      } catch (err) {
        setNotificationsError("Failed to load notifications");
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleAcknowledge = (alertId) => {
    dispatch(acknowledgeAlert(alertId));
  };

  const handleAcknowledgeAll = () => {
    alerts
      .filter((a) => a.status !== AlertStatus.Acknowledged)
      .forEach((a) => dispatch(acknowledgeAlert(a.id)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const unreadAlertsCount = alerts.filter(
    (a) => a.status !== AlertStatus.Acknowledged
  ).length;
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.isRead
  ).length;
  const totalUnreadCount = unreadAlertsCount + unreadNotificationsCount;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <Container sx={{ flex: 1, py: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight="bold">
            Notifications
          </Typography>
          <Badge badgeContent={totalUnreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab
            label="Alerts"
            icon={
              <Badge badgeContent={unreadAlertsCount} color="error" max={99}>
                <WarningIcon />
              </Badge>
            }
            iconPosition="end"
          />
          <Tab
            label="System Notifications"
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
        </Tabs>

        {activeTab === 0 ? (
          <AlertList
            alerts={alerts}
            loading={loading}
            error={error}
            onAcknowledge={handleAcknowledge}
            onAcknowledgeAll={handleAcknowledgeAll}
          />
        ) : (
          <Paper elevation={0} sx={{ p: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight="bold">
                System Notifications
              </Typography>
              <Tooltip title="Mark all as read">
                <IconButton
                  onClick={handleMarkAllAsRead}
                  disabled={unreadNotificationsCount === 0}
                >
                  <Badge badgeContent={unreadNotificationsCount} color="error">
                    <MarkEmailReadIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>

            {notificationsLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : notificationsError ? (
              <MuiAlert severity="error" sx={{ m: 2 }}>
                {notificationsError}
              </MuiAlert>
            ) : notifications.length === 0 ? (
              <Box textAlign="center" p={4}>
                <NotificationsActiveIcon
                  sx={{ fontSize: 64, color: "text.secondary" }}
                />
                <Typography variant="h6" color="text.secondary">
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You'll see updates here when available
                </Typography>
              </Box>
            ) : (
              <List>
                {notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      backgroundColor: notification.isRead
                        ? "background.paper"
                        : "action.selected",
                      mb: 1,
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={notification.message}
                      secondary={new Date(
                        notification.createdAt
                      ).toLocaleString()}
                      secondaryTypographyProps={{
                        variant: "caption",
                        color: "text.secondary",
                      }}
                    />
                    {!notification.isRead && (
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          ml: 1,
                        }}
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default NotificationScreen;
