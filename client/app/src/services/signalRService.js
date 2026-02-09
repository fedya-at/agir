import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { store } from "../store/store";
import { addNotification } from "../store/notificationSlice";

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = [0, 2000, 10000, 30000, null];
  }

  async connect(accessToken) {
    // Check if already connected with same token
    if (this.connection && this.isConnected && this.connection.state === 2) {
      return true;
    }

    // Disconnect existing connection if any
    if (this.connection) {
      try {
        await this.disconnect();
      } catch {
        // Silent fail on disconnect
      }
    }

    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "https://localhost:7143";

      this.connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/notification`, {
          accessTokenFactory: () => accessToken,
          skipNegotiation: true,
          transport: 1, // WebSockets
        })
        .withAutomaticReconnect(this.reconnectDelay)
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Set up connection state handlers
      this.connection.onreconnecting(() => {
        this.isConnected = false;
      });

      this.connection.onreconnected(() => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.connection.onclose((error) => {
        this.isConnected = false;
        if (error) {
          // Connection closed with error - handled silently
        }
      });

      await this.connection.start();
      this.isConnected = true;

      // Join user-specific groups based on role
      await this.joinUserGroups();

      return true;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  setupEventHandlers() {
    if (!this.connection) return;

    // General notification handler
    this.connection.on("ReceiveNotification", (notification) => {
      this.handleNotification(notification);
    });

    // Specific notification types
    this.connection.on("InterventionAssigned", (data) => {
      this.handleInterventionAssignment(data);
    });

    this.connection.on("StatusUpdate", (data) => {
      this.handleStatusUpdate(data);
    });

    this.connection.on("StockAlert", (data) => {
      this.handleStockAlert(data);
    });

    this.connection.on("InvoiceGenerated", (data) => {
      this.handleInvoiceGenerated(data);
    });

    this.connection.on("EmailSent", (data) => {
      this.handleEmailSent(data);
    });

    this.connection.on("SystemAlert", (data) => {
      this.handleSystemAlert(data);
    });

    this.connection.on("UserRegistered", (data) => {
      this.handleUserRegistered(data);
    });
  }

  async joinUserGroups() {
    if (!this.isConnected || !this.connection) return;

    try {
      const state = store.getState();
      const user = state.auth.user;

      if (user) {
        // Join role-based group
        const roleGroups = {
          0: "Admins",
          1: "Technicians",
          2: "Clients",
        };

        const userGroup = roleGroups[user.role];
        if (userGroup) {
          await this.connection.invoke("AddToGroup", userGroup);
        }

        // Join user-specific group
        await this.connection.invoke("AddToGroup", `User_${user.id}`);
      }
    } catch {
      // Failed to join groups - handled silently
    }
  }

  handleNotification(notification) {
    const notificationData = {
      id: notification.id || Date.now(),
      type: notification.type || "general",
      title: notification.title || "Notification",
      message: notification.message,
      timestamp: new Date(notification.createdAt || Date.now()),
      isRead: false,
      priority: notification.priority || "medium",
      actionUrl: notification.actionUrl,
      data: notification.data ? JSON.parse(notification.data) : {},
    };

    // Add to store
    store.dispatch(addNotification(notificationData));

    // Play sound if enabled
    this.playNotificationSound(notificationData.priority);
  }

  handleInterventionAssignment(data) {
    const notification = {
      id: Date.now(),
      type: "intervention_assigned",
      title: "New Intervention Assignment",
      message: `You have been assigned to: ${data.description}`,
      actionUrl: `/interventions/${data.interventionId}`,
      priority: "high",
      timestamp: new Date(),
      isRead: false,
      data,
    };

    store.dispatch(addNotification(notification));
    this.playNotificationSound("high");
  }

  handleStatusUpdate(data) {
    const notification = {
      id: Date.now(),
      type: "status_update",
      title: "Status Update",
      message: `Intervention status changed to: ${data.newStatus}`,
      actionUrl: `/interventions/${data.interventionId}`,
      priority: "medium",
      timestamp: new Date(),
      isRead: false,
      data,
    };

    store.dispatch(addNotification(notification));
  }

  handleStockAlert(data) {
    const notification = {
      id: Date.now(),
      type: "stock_alert",
      title: "Stock Alert",
      message: `Low stock: ${data.partName} (${data.currentStock} remaining)`,
      actionUrl: `/inventory/${data.partId}`,
      priority: "critical",
      timestamp: new Date(),
      isRead: false,
      data,
    };

    store.dispatch(addNotification(notification));
    this.playNotificationSound("critical");
  }

  handleInvoiceGenerated(data) {
    const notification = {
      id: Date.now(),
      type: "invoice_generated",
      title: "Invoice Generated",
      message: `Invoice #${data.invoiceNumber} has been generated`,
      actionUrl: `/invoices/${data.invoiceId}`,
      priority: "medium",
      timestamp: new Date(),
      isRead: false,
      data,
    };

    store.dispatch(addNotification(notification));
  }

  handleEmailSent(data) {
    const notification = {
      id: Date.now(),
      type: "email_sent",
      title: "Email Sent",
      message: `${data.emailType} email sent to ${data.recipient}`,
      priority: "low",
      timestamp: new Date(),
      isRead: false,
      data,
    };

    store.dispatch(addNotification(notification));
  }

  handleSystemAlert(data) {
    const notification = {
      id: Date.now(),
      type: "system_alert",
      title: "System Alert",
      message: data.message,
      priority: data.severity || "medium",
      timestamp: new Date(),
      isRead: false,
      data,
    };

    store.dispatch(addNotification(notification));
  }

  handleUserRegistered(data) {
    const notification = {
      id: Date.now(),
      type: "user_registered",
      title: "New User Registration",
      message: `New user registered: ${data.userName}`,
      priority: "low",
      timestamp: new Date(),
      isRead: false,
      data,
    };

    store.dispatch(addNotification(notification));
  }

  playNotificationSound(priority) {
    // Only play sound if enabled in settings
    const soundEnabled =
      localStorage.getItem("notificationSoundEnabled") !== "false";
    if (!soundEnabled) return;

    try {
      let audioFile;
      switch (priority) {
        case "critical":
          audioFile = "/sounds/critical-alert.mp3";
          break;
        case "high":
          audioFile = "/sounds/high-priority.mp3";
          break;
        default:
          audioFile = "/sounds/notification.mp3";
      }

      const audio = new Audio(audioFile);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silently fail if audio can't be played
      });
    } catch {
      // Silently fail if audio is not available
    }
  }

  async sendNotificationToUser(userId, notification) {
    if (!this.isConnected || !this.connection) return false;

    try {
      await this.connection.invoke("SendToUser", userId, notification);
      return true;
    } catch {
      return false;
    }
  }

  async sendNotificationToGroup(groupName, notification) {
    if (!this.isConnected || !this.connection) return false;

    try {
      await this.connection.invoke("SendToGroup", groupName, notification);
      return true;
    } catch {
      return false;
    }
  }

  async leaveGroup(groupName) {
    if (!this.isConnected || !this.connection) return;

    try {
      await this.connection.invoke("RemoveFromGroup", groupName);
    } catch {
      // Failed to leave group - handled silently
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        // Only stop if connection is in a state that allows stopping
        if (this.connection.state !== 0) {
          // Not already disconnected
          await this.connection.stop();
        }
      } catch {
        // Error disconnecting - handled silently
      } finally {
        this.connection = null;
        this.isConnected = false;
      }
    }
  }

  getConnectionState() {
    if (!this.connection) return "Disconnected";

    const states = {
      0: "Disconnected",
      1: "Connecting",
      2: "Connected",
      3: "Disconnecting",
      4: "Reconnecting",
    };

    return states[this.connection.state] || "Unknown";
  }

  isConnectionActive() {
    return this.isConnected && this.connection && this.connection.state === 2;
  }
}

// Create singleton instance
const signalRService = new SignalRService();
export default signalRService;
