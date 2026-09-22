import { useEffect, useRef } from "react";
import { createNotificationConnection } from "../services/signalR";
import { useAuth } from "../context/AuthContext"; // Replace with your actual auth context

const NotificationListener = () => {
  const { token, user } = useAuth(); // Ensure token and user are available
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const connection = createNotificationConnection(token);

    connection.on("ReceiveNotification", (message) => {
      // Handle incoming notifications (e.g., show toast or modal)
      console.log("New notification:", message);
    });

    connection
      .start()
      .then(() => {
        console.log("Connected to Notification Hub");

        // Example: join a group based on user role
        connection.invoke("AddToGroup", user.role); // e.g., "Admins", "Technicians"
      })
      .catch((err) => console.error("SignalR Connection Error:", err));

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [token, user.role]);

  return null; // This component doesn't render anything
};

export default NotificationListener;
