// src/components/NotificationTestPanel.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import {
  fetchNotifications,
  fetchAllNotifications,
  createNotification,
  getNotificationStats,
  fetchUnreadNotifications,
  fetchArchivedNotifications,
  searchNotifications,
  bulkMarkAsRead,
  bulkArchive,
  bulkDelete,
  deleteReadNotifications,
  selectNotifications,
  selectUnreadCount,
  selectNotificationStats,
  selectArchivedNotifications,
  selectSelectedNotifications,
  selectPagination,
  selectNotificationLoading,
  
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  PRIORITY_NAMES,
} from "../store/notificationSlice";

const NotificationTestPanel = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const stats = useSelector(selectNotificationStats);
  const archivedNotifications = useSelector(selectArchivedNotifications);
  const selectedNotifications = useSelector(selectSelectedNotifications);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectNotificationLoading);
 

  const [newNotification, setNewNotification] = useState({
    type: NOTIFICATION_TYPES.SYSTEM_NOTIFICATION,
    title: "",
    message: "",
    priority: NOTIFICATION_PRIORITIES.NORMAL,
  });

  const [fetchParams, setFetchParams] = useState({
    page: 1,
    pageSize: 10,
    type: "",
    isRead: "",
    priority: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNotification = () => {
    if (newNotification.title && newNotification.message) {
      dispatch(createNotification(newNotification));
      setNewNotification({
        type: NOTIFICATION_TYPES.SYSTEM_NOTIFICATION,
        title: "",
        message: "",
        priority: NOTIFICATION_PRIORITIES.NORMAL,
      });
    }
  };

  const handleFetchNotifications = () => {
    const params = {};
    if (fetchParams.page) params.page = fetchParams.page;
    if (fetchParams.pageSize) params.pageSize = fetchParams.pageSize;
    if (fetchParams.type) params.type = fetchParams.type;
    if (fetchParams.isRead !== "")
      params.isRead = fetchParams.isRead === "true";
    if (fetchParams.priority) params.priority = fetchParams.priority;

    dispatch(fetchNotifications(params));
  };

  const handleFetchAllNotifications = () => {
    const params = {};
    if (fetchParams.page) params.page = fetchParams.page;
    if (fetchParams.pageSize) params.pageSize = fetchParams.pageSize;

    dispatch(fetchAllNotifications(params));
  };

  const handleSearchNotifications = () => {
    if (searchQuery.trim()) {
      dispatch(searchNotifications(searchQuery));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notification System Test Panel
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Chip
                    label={`Total: ${stats.totalNotifications}`}
                    color="default"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`Unread: ${unreadCount}`}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`Read: ${stats.readCount}`}
                    color="success"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`Today: ${stats.todayCount}`}
                    color="info"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Chip
                    label={`Archived: ${archivedNotifications.length}`}
                    color="secondary"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                onClick={() => dispatch(getNotificationStats())}
                size="small"
              >
                Refresh Stats
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Pagination Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pagination Info
              </Typography>
              <Typography variant="body2">
                Page: {pagination.page} of {pagination.totalPages}
              </Typography>
              <Typography variant="body2">
                Total Count: {pagination.totalCount}
              </Typography>
              <Typography variant="body2">
                Page Size: {pagination.pageSize}
              </Typography>
              <Typography variant="body2">
                Has Next: {pagination.hasNextPage ? "Yes" : "No"}
              </Typography>
              <Typography variant="body2">
                Has Previous: {pagination.hasPreviousPage ? "Yes" : "No"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Create Notification */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Create Test Notification
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Title"
                  fullWidth
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      title: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newNotification.type}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        type: e.target.value,
                      })
                    }
                  >
                    <MenuItem value={NOTIFICATION_TYPES.SYSTEM_NOTIFICATION}>
                      System Notification
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_TYPES.INTERVENTION_ASSIGNED}>
                      Intervention Assigned
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_TYPES.INTERVENTION_COMPLETED}>
                      Intervention Completed
                    </MenuItem>
                    <MenuItem
                      value={NOTIFICATION_TYPES.INTERVENTION_STATUS_UPDATE}
                    >
                      Intervention Status Update
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_TYPES.INVOICE_CREATED}>
                      Invoice Created
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_TYPES.INVOICE_PAID}>
                      Invoice Paid
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_TYPES.STOCK_ALERT}>
                      Stock Alert
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_TYPES.EMAIL_NOTIFICATION}>
                      Email Notification
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  fullWidth
                  multiline
                  rows={3}
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      message: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newNotification.priority}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        priority: e.target.value,
                      })
                    }
                  >
                    <MenuItem value={NOTIFICATION_PRIORITIES.LOW}>
                      {PRIORITY_NAMES[NOTIFICATION_PRIORITIES.LOW]}
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_PRIORITIES.NORMAL}>
                      {PRIORITY_NAMES[NOTIFICATION_PRIORITIES.NORMAL]}
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_PRIORITIES.HIGH}>
                      {PRIORITY_NAMES[NOTIFICATION_PRIORITIES.HIGH]}
                    </MenuItem>
                    <MenuItem value={NOTIFICATION_PRIORITIES.CRITICAL}>
                      {PRIORITY_NAMES[NOTIFICATION_PRIORITIES.CRITICAL]}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleCreateNotification}
                  disabled={!newNotification.title || !newNotification.message}
                >
                  Create Notification
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Fetch Parameters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fetch Notifications with Parameters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Page"
                  type="number"
                  fullWidth
                  value={fetchParams.page}
                  onChange={(e) =>
                    setFetchParams({
                      ...fetchParams,
                      page: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Page Size"
                  type="number"
                  fullWidth
                  value={fetchParams.pageSize}
                  onChange={(e) =>
                    setFetchParams({
                      ...fetchParams,
                      pageSize: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Type"
                  fullWidth
                  value={fetchParams.type}
                  onChange={(e) =>
                    setFetchParams({
                      ...fetchParams,
                      type: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Is Read</InputLabel>
                  <Select
                    value={fetchParams.isRead}
                    onChange={(e) =>
                      setFetchParams({
                        ...fetchParams,
                        isRead: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Read</MenuItem>
                    <MenuItem value="false">Unread</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleFetchNotifications}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Fetch Notifications"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Bulk Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bulk Actions
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                onClick={() => dispatch(fetchUnreadNotifications())}
              >
                Fetch Unread Only
              </Button>
              <Button
                variant="outlined"
                onClick={() => dispatch(fetchArchivedNotifications())}
              >
                Fetch Archived
              </Button>
              <Button
                variant="outlined"
                onClick={() => dispatch(deleteReadNotifications())}
                color="error"
              >
                Delete All Read
              </Button>
              {selectedNotifications.length > 0 && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Button
                    variant="outlined"
                    onClick={() =>
                      dispatch(bulkMarkAsRead(selectedNotifications))
                    }
                  >
                    Mark Selected as Read ({selectedNotifications.length})
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => dispatch(bulkArchive(selectedNotifications))}
                  >
                    Archive Selected ({selectedNotifications.length})
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => dispatch(bulkDelete(selectedNotifications))}
                  >
                    Delete Selected ({selectedNotifications.length})
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Current Notifications */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Notifications ({notifications.length})
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  sx={{
                    p: 1,
                    mb: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: notification.isRead
                      ? "action.hover"
                      : "background.paper",
                  }}
                >
                  <Typography variant="subtitle2">
                    {notification.title ||
                      notification.message?.substring(0, 50)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {notification.type} | Priority:{" "}
                    {notification.priority} | Read:{" "}
                    {notification.isRead ? "Yes" : "No"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotificationTestPanel;
