import React, { useEffect } from "react";
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
  Alert,
  Paper,
  IconButton,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  DoneAll as MarkAllReadIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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

const AlertList = () => {
  const dispatch = useDispatch();
  const { alerts, loading, error } = useSelector((state) => state.alerts);
  const [unreadCount, setUnreadCount] = React.useState(0);

  useEffect(() => {
    dispatch(fetchAlerts());
    const intervalId = setInterval(() => dispatch(fetchAlerts()), 60000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    setUnreadCount(
      alerts.filter((a) => a.status !== AlertStatus.Acknowledged).length
    );
  }, [alerts]);

  const handleAcknowledge = (alertId) => {
    dispatch(acknowledgeAlert(alertId));
  };

  const handleAcknowledgeAll = () => {
    alerts
      .filter((a) => a.status !== AlertStatus.Acknowledged)
      .forEach((a) => dispatch(acknowledgeAlert(a.id)));
  };

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
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading alerts: {error}
      </Alert>
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
            onClick={handleAcknowledgeAll}
            disabled={unreadCount === 0}
            color="primary"
          >
            <Badge badgeContent={unreadCount} color="error">
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
                  onClick={() => handleAcknowledge(alert.id)}
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

export default AlertList;
