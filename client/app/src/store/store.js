import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import interventionsReducer from "./interventionsSlice";
import usersReducer from "./usersSlice";
import clientsReducer from "./clientsSlice";
import techniciansReducer from "./techniciansSlice";
import partsReducer from "./partsSlice";
import notificationsReducer from "./notificationSlice";
import interventionPartsReducer from "./interventionPartSlice";
import invoiceReducer from "./invoiceSlice";
import historyReducer from "./historySlice";
import chatReducer from "./chatSlice";
import alertsReducer from "./alertsSlice";
import adminsReducer from "./adminsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interventions: interventionsReducer,
    users: usersReducer,
    clients: clientsReducer,
    technicians: techniciansReducer,
    parts: partsReducer,
    notifications: notificationsReducer,
    interventionParts: interventionPartsReducer,
    invoices: invoiceReducer,
    history: historyReducer,
    chat: chatReducer,
    alerts: alertsReducer,
    admins: adminsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "history/exportPdf/fulfilled",
          "history/exportCsv/fulfilled",
          "history/exportExcel/fulfilled",
        ],
        ignoredPaths: ["history.exportData"],
        warnAfter: 128, // Warn if serializable check takes longer than 128ms
      },
      immutableCheck: {
        warnAfter: 128, // Warn if immutable check takes longer than 128ms
      },
    }),
  devTools: import.meta.env.MODE !== "production",
});
