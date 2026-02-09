import React, { useEffect, useRef, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNotifications,
  addNotification,
} from "../store/notificationSlice";
import signalRService from "../services/signalRService";

const NotificationListener = memo(() => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const connectionInitialized = useRef(false);
  const testNotificationsAdded = useRef(false);

  // Add initial test notifications for development
  useEffect(() => {
    if (user && !testNotificationsAdded.current) {
      const testNotifications = [
        {
          id: 1,
          type: "intervention_assigned",
          title: "New Intervention Assignment",
          message: "You have been assigned to repair AC unit at Building A",
          priority: "high",
          isRead: false,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          actionUrl: "/interventions/123",
        },
        {
          id: 2,
          type: "stock_alert",
          title: "Low Stock Alert",
          message: "Air filters are running low (3 remaining)",
          priority: "critical",
          isRead: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          actionUrl: "/inventory",
        },
        {
          id: 3,
          type: "email_sent",
          title: "Email Sent Successfully",
          message: "Welcome email sent to new client",
          priority: "low",
          isRead: true,
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 4,
          type: "invoice_generated",
          title: "Invoice Generated",
          message: "Invoice #INV-2025-001 has been generated for Client ABC",
          priority: "medium",
          isRead: false,
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          actionUrl: "/invoices/1",
        },
        {
          id: 5,
          type: "system_alert",
          title: "System Maintenance",
          message: "Scheduled maintenance will occur tonight at 2 AM",
          priority: "medium",
          isRead: false,
          timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          createdAt: new Date(Date.now() - 900000).toISOString(),
        },
      ];

      testNotifications.forEach((notification) => {
        dispatch(addNotification(notification));
      });

      testNotificationsAdded.current = true;
    }
  }, [user, dispatch]);

  // Initialize SignalR connection when user is authenticated
  useEffect(() => {
    let isMounted = true;

    const initializeConnection = async () => {
      if (!token || !user || connectionInitialized.current) return;

      try {
        // Small delay to ensure authentication is settled
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!isMounted) return; // Component was unmounted

        // Connect to SignalR with the Redux store
        const connected = await signalRService.connect(token);

        if (connected && isMounted) {
          connectionInitialized.current = true;

          // Fetch initial notifications
          dispatch(fetchNotifications());
        }
      } catch {
        // Failed to initialize SignalR - handled silently
      }
    };

    initializeConnection();

    // Cleanup on unmount or user change
    return () => {
      isMounted = false;
      if (connectionInitialized.current && !token) {
        signalRService.disconnect();
        connectionInitialized.current = false;
      }
    };
  }, [token, user, dispatch]);

  // Disconnect when user logs out
  useEffect(() => {
    if (!token && connectionInitialized.current) {
      signalRService.disconnect();
      connectionInitialized.current = false;
    }
  }, [token]);

  return null; // This component doesn't render anything
});

NotificationListener.displayName = "NotificationListener";

export default NotificationListener;
