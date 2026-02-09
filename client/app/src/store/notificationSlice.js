// src/store/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import api from "./api";

const NOTIFICATIONS_URL = "/Notifications";
const EMAIL_URL = "/Email";

// Notification Types
export const NOTIFICATION_TYPES = {
  INTERVENTION_ASSIGNED: "intervention_assigned",
  INTERVENTION_COMPLETED: "intervention_completed",
  INTERVENTION_STATUS_UPDATE: "intervention_status_update",
  INVOICE_CREATED: "invoice_created",
  INVOICE_PAID: "invoice_paid",
  STOCK_ALERT: "stock_alert",
  SYSTEM_NOTIFICATION: "system_notification",
  EMAIL_NOTIFICATION: "email_notification",
};

// Priority Levels
export const NOTIFICATION_PRIORITIES = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3,
};

// Priority Names
export const PRIORITY_NAMES = {
  0: "Low",
  1: "Normal",
  2: "High",
  3: "Critical",
};

// Priority Colors
export const PRIORITY_COLORS = {
  0: "#28a745", // Low - Green
  1: "#6c757d", // Normal - Gray
  2: "#fd7e14", // High - Orange
  3: "#dc3545", // Critical - Red
};

// Notification Thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination parameters
      if (params.page) queryParams.append("page", params.page);
      if (params.pageSize) queryParams.append("pageSize", params.pageSize);

      // Add filter parameters
      if (params.type) queryParams.append("type", params.type);
      if (params.isRead !== undefined)
        queryParams.append("isRead", params.isRead);
      if (params.priority) queryParams.append("priority", params.priority);
      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);

      const url = queryParams.toString()
        ? `${NOTIFICATIONS_URL}?${queryParams.toString()}`
        : NOTIFICATIONS_URL;

      const res = await api.get(url);
      return res.data;
    } catch (err) {
      // For now, return mock data if API fails
      if (err.response?.status === 404 || err.code === "ERR_NETWORK") {
        return [];
      }

      toast.error("Failed to fetch notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchNotificationById = createAsyncThunk(
  "notifications/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`${NOTIFICATIONS_URL}/${id}`);
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch notification");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchAllNotifications = createAsyncThunk(
  "notifications/fetchAllNotifications",
  async (params = {}, thunkAPI) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.pageSize) queryParams.append("pageSize", params.pageSize);

      const url = queryParams.toString()
        ? `${NOTIFICATIONS_URL}/all?${queryParams.toString()}`
        : `${NOTIFICATIONS_URL}/all`;

      const res = await api.get(url);
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch all notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async (notificationData, thunkAPI) => {
    try {
      const res = await api.post(NOTIFICATIONS_URL, notificationData);
      toast.success("Notification created successfully");
      return res.data;
    } catch (err) {
      toast.error("Failed to create notification");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, thunkAPI) => {
    try {
      await api.put(`${NOTIFICATIONS_URL}/${id}/read`);
      return id;
    } catch (err) {
      toast.error("Failed to mark as read");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, thunkAPI) => {
    try {
      await api.put(`${NOTIFICATIONS_URL}/mark-all-read`);
      toast.success("All notifications marked as read");
      return;
    } catch (err) {
      toast.error("Failed to mark all as read");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const markAsUnread = createAsyncThunk(
  "notifications/markAsUnread",
  async (id, thunkAPI) => {
    try {
      await api.put(`${NOTIFICATIONS_URL}/${id}/unread`);
      toast.success("Notification marked as unread");
      return id;
    } catch (err) {
      toast.error("Failed to mark as unread");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const archiveNotification = createAsyncThunk(
  "notifications/archive",
  async (id, thunkAPI) => {
    try {
      await api.put(`${NOTIFICATIONS_URL}/${id}/archive`);
      toast.success("Notification archived");
      return id;
    } catch (err) {
      toast.error("Failed to archive notification");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, thunkAPI) => {
    try {
      await api.delete(`${NOTIFICATIONS_URL}/${id}`);
      toast.success("Notification deleted");
      return id;
    } catch (err) {
      toast.error("Failed to delete notification");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`${NOTIFICATIONS_URL}/unread-count`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const getNotificationStats = createAsyncThunk(
  "notifications/stats",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`${NOTIFICATIONS_URL}/stats`);
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch notification statistics");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  "notifications/fetchUnread",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`${NOTIFICATIONS_URL}/unread`);
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch unread notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchArchivedNotifications = createAsyncThunk(
  "notifications/fetchArchived",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`${NOTIFICATIONS_URL}/archived`);
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch archived notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const bulkMarkAsRead = createAsyncThunk(
  "notifications/bulkMarkAsRead",
  async (notificationIds, thunkAPI) => {
    try {
      await api.put(`${NOTIFICATIONS_URL}/bulk/mark-read`, {
        notificationIds,
        action: "markAsRead",
      });
      toast.success("Notifications marked as read");
      return notificationIds;
    } catch (err) {
      toast.error("Failed to mark notifications as read");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const bulkArchive = createAsyncThunk(
  "notifications/bulkArchive",
  async (notificationIds, thunkAPI) => {
    try {
      await api.put(`${NOTIFICATIONS_URL}/bulk/archive`, {
        notificationIds,
        action: "archive",
      });
      toast.success("Notifications archived");
      return notificationIds;
    } catch (err) {
      toast.error("Failed to archive notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const bulkDelete = createAsyncThunk(
  "notifications/bulkDelete",
  async (notificationIds, thunkAPI) => {
    try {
      await api.delete(`${NOTIFICATIONS_URL}/bulk`, {
        data: {
          notificationIds,
          action: "delete",
        },
      });
      toast.success("Notifications deleted");
      return notificationIds;
    } catch (err) {
      toast.error("Failed to delete notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const deleteReadNotifications = createAsyncThunk(
  "notifications/deleteRead",
  async (_, thunkAPI) => {
    try {
      await api.delete(`${NOTIFICATIONS_URL}/read`);
      toast.success("Read notifications deleted");
      return;
    } catch (err) {
      toast.error("Failed to delete read notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const searchNotifications = createAsyncThunk(
  "notifications/search",
  async (searchTerm, thunkAPI) => {
    try {
      const res = await api.get(
        `${NOTIFICATIONS_URL}/search?q=${encodeURIComponent(searchTerm)}`
      );
      return res.data;
    } catch (err) {
      toast.error("Failed to search notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Email Thunks
export const sendEmail = createAsyncThunk(
  "email/send",
  async (emailData, thunkAPI) => {
    try {
      const res = await api.post(`${EMAIL_URL}/send`, emailData);
      toast.success("Email sent successfully");
      return res.data;
    } catch (err) {
      toast.error("Failed to send email");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const sendSimpleEmail = createAsyncThunk(
  "email/sendSimple",
  async (emailData, thunkAPI) => {
    try {
      const res = await api.post(`${EMAIL_URL}/send-simple`, emailData);
      toast.success("Email sent successfully");
      return res.data;
    } catch (err) {
      toast.error("Failed to send email");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const sendWelcomeEmail = createAsyncThunk(
  "email/sendWelcome",
  async (welcomeData, thunkAPI) => {
    try {
      const res = await api.post(`${EMAIL_URL}/send-welcome`, welcomeData);
      toast.success("Welcome email sent");
      return res.data;
    } catch (err) {
      toast.error("Failed to send welcome email");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const sendPasswordResetEmail = createAsyncThunk(
  "email/sendPasswordReset",
  async (resetData, thunkAPI) => {
    try {
      const res = await api.post(`${EMAIL_URL}/send-password-reset`, resetData);
      toast.success("Password reset email sent");
      return res.data;
    } catch (err) {
      toast.error("Failed to send password reset email");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const sendInterventionNotification = createAsyncThunk(
  "email/sendInterventionNotification",
  async (interventionData, thunkAPI) => {
    try {
      const res = await api.post(
        `${EMAIL_URL}/send-intervention-notification`,
        interventionData
      );
      toast.success("Intervention notification sent");
      return res.data;
    } catch (err) {
      toast.error("Failed to send intervention notification");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const sendInvoiceEmail = createAsyncThunk(
  "email/sendInvoice",
  async (invoiceData, thunkAPI) => {
    try {
      const res = await api.post(`${EMAIL_URL}/send-invoice`, invoiceData);
      toast.success("Invoice email sent");
      return res.data;
    } catch (err) {
      toast.error("Failed to send invoice email");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const sendStockAlert = createAsyncThunk(
  "email/sendStockAlert",
  async (stockData, thunkAPI) => {
    try {
      const res = await api.post(`${EMAIL_URL}/send-stock-alert`, stockData);
      toast.success("Stock alert sent");
      return res.data;
    } catch (err) {
      toast.error("Failed to send stock alert");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const sendBulkEmail = createAsyncThunk(
  "email/sendBulk",
  async (bulkData, thunkAPI) => {
    try {
      const res = await api.post(`${EMAIL_URL}/send-bulk`, bulkData);
      toast.success("Bulk email sent");
      return res.data;
    } catch (err) {
      toast.error("Failed to send bulk email");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const testEmailConnection = createAsyncThunk(
  "email/testConnection",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`${EMAIL_URL}/test-connection`);
      if (res.data.connected) {
        toast.success("Email service is connected");
      } else {
        toast.error("Email service connection failed");
      }
      return res.data;
    } catch (err) {
      toast.error("Failed to test email connection");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    currentNotification: null,
    searchResults: [],
    pagination: {
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    loading: false,
    error: null,
    unreadCount: 0,
    stats: {
      totalNotifications: 0,
      unreadCount: 0,
      readCount: 0,
      todayCount: 0,
      thisWeekCount: 0,
      byType: {},
      byPriority: {},
    },
    archivedItems: [],
    emailStatus: {
      loading: false,
      connected: false,
      error: null,
    },
    emailHistory: [],
    filter: "all", // 'all', 'unread', 'alerts', 'emails', 'archived'
    selectedNotifications: [],
    searchTerm: "",
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateNotificationFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    clearError: (state) => {
      state.error = null;
      state.emailStatus.error = null;
    },
    setSelectedNotifications: (state, action) => {
      state.selectedNotifications = action.payload;
    },
    toggleNotificationSelection: (state, action) => {
      const id = action.payload;
      if (state.selectedNotifications.includes(id)) {
        state.selectedNotifications = state.selectedNotifications.filter(
          (selectedId) => selectedId !== id
        );
      } else {
        state.selectedNotifications.push(id);
      }
    },
    clearSelectedNotifications: (state) => {
      state.selectedNotifications = [];
    },
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchTerm = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.notifications) {
          // Paginated response
          state.items = action.payload.notifications;
          state.pagination = {
            page: action.payload.page,
            pageSize: action.payload.pageSize,
            totalCount: action.payload.totalCount,
            totalPages: action.payload.totalPages,
            hasNextPage: action.payload.hasNextPage,
            hasPreviousPage: action.payload.hasPreviousPage,
          };
          state.unreadCount = action.payload.notifications.filter(
            (n) => !n.isRead
          ).length;
        } else {
          // Simple array response
          state.items = action.payload || [];
          state.unreadCount = (action.payload || []).filter(
            (n) => !n.isRead
          ).length;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all notifications (simple)
      .addCase(fetchAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.notifications) {
          state.items = action.payload.notifications;
          state.pagination = {
            page: action.payload.page,
            pageSize: action.payload.pageSize,
            totalCount: action.payload.totalCount,
            totalPages: action.payload.totalPages,
            hasNextPage: action.payload.hasNextPage,
            hasPreviousPage: action.payload.hasPreviousPage,
          };
        } else {
          state.items = action.payload;
        }
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch notification by ID
      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.currentNotification = action.payload;
      })

      // Create notification
      .addCase(createNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload);
        if (index !== -1 && !state.items[index].isRead) {
          state.items[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark as unread
      .addCase(markAsUnread.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload);
        if (index !== -1 && state.items[index].isRead) {
          state.items[index].isRead = false;
          state.unreadCount += 1;
        }
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })

      // Archive notification
      .addCase(archiveNotification.fulfilled, (state, action) => {
        const notification = state.items.find((n) => n.id === action.payload);
        if (notification) {
          state.archivedItems.unshift(notification);
          state.items = state.items.filter((n) => n.id !== action.payload);
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedNotification = state.items.find(
          (n) => n.id === action.payload
        );
        state.items = state.items.filter((n) => n.id !== action.payload);
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Get notification stats
      .addCase(getNotificationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Fetch unread notifications
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unreadCount = action.payload.length;
      })

      // Fetch archived notifications
      .addCase(fetchArchivedNotifications.fulfilled, (state, action) => {
        state.archivedItems = action.payload;
      })

      // Bulk mark as read
      .addCase(bulkMarkAsRead.fulfilled, (state, action) => {
        const notificationIds = action.payload;
        state.items = state.items.map((n) =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        );
        const markedCount = state.items.filter(
          (n) => notificationIds.includes(n.id) && !n.isRead
        ).length;
        state.unreadCount = Math.max(0, state.unreadCount - markedCount);
        state.selectedNotifications = [];
      })

      // Bulk archive
      .addCase(bulkArchive.fulfilled, (state, action) => {
        const notificationIds = action.payload;
        const archivedNotifications = state.items.filter((n) =>
          notificationIds.includes(n.id)
        );
        state.archivedItems = [
          ...archivedNotifications,
          ...state.archivedItems,
        ];
        state.items = state.items.filter(
          (n) => !notificationIds.includes(n.id)
        );
        const unreadArchivedCount = archivedNotifications.filter(
          (n) => !n.isRead
        ).length;
        state.unreadCount = Math.max(
          0,
          state.unreadCount - unreadArchivedCount
        );
        state.selectedNotifications = [];
      })

      // Bulk delete
      .addCase(bulkDelete.fulfilled, (state, action) => {
        const notificationIds = action.payload;
        const deletedNotifications = state.items.filter((n) =>
          notificationIds.includes(n.id)
        );
        state.items = state.items.filter(
          (n) => !notificationIds.includes(n.id)
        );
        const unreadDeletedCount = deletedNotifications.filter(
          (n) => !n.isRead
        ).length;
        state.unreadCount = Math.max(0, state.unreadCount - unreadDeletedCount);
        state.selectedNotifications = [];
      })

      // Delete read notifications
      .addCase(deleteReadNotifications.fulfilled, (state) => {
        state.items = state.items.filter((n) => !n.isRead);
      })

      // Search notifications
      .addCase(searchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Email actions
      .addCase(sendEmail.pending, (state) => {
        state.emailStatus.loading = true;
        state.emailStatus.error = null;
      })
      .addCase(sendEmail.fulfilled, (state, action) => {
        state.emailStatus.loading = false;
        state.emailHistory.unshift({
          id: Date.now(),
          type: "standard",
          timestamp: new Date().toISOString(),
          status: "sent",
          ...action.payload,
        });
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.emailStatus.loading = false;
        state.emailStatus.error = action.payload;
      })

      // Test email connection
      .addCase(testEmailConnection.fulfilled, (state, action) => {
        state.emailStatus.connected = action.payload.connected;
        state.emailStatus.error = null;
      })
      .addCase(testEmailConnection.rejected, (state, action) => {
        state.emailStatus.connected = false;
        state.emailStatus.error = action.payload;
      })

      // Handle all other email actions
      .addMatcher(
        (action) =>
          action.type.startsWith("email/") &&
          action.type.endsWith("/fulfilled"),
        (state, action) => {
          state.emailStatus.loading = false;
          const emailType = action.type
            .split("/")[1]
            .replace("send", "")
            .toLowerCase();
          state.emailHistory.unshift({
            id: Date.now(),
            type: emailType,
            timestamp: new Date().toISOString(),
            status: "sent",
            ...action.payload,
          });
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("email/") && action.type.endsWith("/pending"),
        (state) => {
          state.emailStatus.loading = true;
          state.emailStatus.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("email/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.emailStatus.loading = false;
          state.emailStatus.error = action.payload;
        }
      );
  },
});

export const {
  addNotification,
  updateNotificationFilter,
  clearNotifications,
  clearError,
  setSelectedNotifications,
  toggleNotificationSelection,
  clearSelectedNotifications,
  updatePagination,
  setSearchTerm,
  clearSearchResults,
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.items;
export const selectCurrentNotification = (state) =>
  state.notifications.currentNotification;
export const selectSearchResults = (state) => state.notifications.searchResults;
export const selectSearchTerm = (state) => state.notifications.searchTerm;
export const selectPagination = (state) => state.notifications.pagination;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.loading;
export const selectNotificationError = (state) => state.notifications.error;
export const selectNotificationStats = (state) => state.notifications.stats;
export const selectArchivedNotifications = (state) =>
  state.notifications.archivedItems;
export const selectEmailStatus = (state) => state.notifications.emailStatus;
export const selectEmailHistory = (state) => state.notifications.emailHistory;
export const selectNotificationFilter = (state) => state.notifications.filter;
export const selectSelectedNotifications = (state) =>
  state.notifications.selectedNotifications;

// Filtered selectors
export const selectFilteredNotifications = (state) => {
  const { items, filter, archivedItems } = state.notifications;
  switch (filter) {
    case "unread":
      return items.filter((n) => !n.isRead);
    case "alerts":
      return items.filter(
        (n) => n.type && n.type.toLowerCase().includes("alert")
      );
    case "emails":
      return items.filter(
        (n) => n.type && n.type.toLowerCase().includes("email")
      );
    case "archived":
      return archivedItems;
    default:
      return items;
  }
};

// Enhanced selectors
export const selectNotificationsByType = (state) => {
  const notifications = state.notifications.items;
  return notifications.reduce((acc, notification) => {
    const type = notification.type || "general";
    if (!acc[type]) acc[type] = [];
    acc[type].push(notification);
    return acc;
  }, {});
};

export const selectNotificationsByPriority = (state) => {
  const notifications = state.notifications.items;
  return notifications.reduce((acc, notification) => {
    const priority = notification.priority || "normal";
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(notification);
    return acc;
  }, {});
};

export const selectRecentNotifications = (state, limit = 5) => {
  return state.notifications.items
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

export default notificationsSlice.reducer;
