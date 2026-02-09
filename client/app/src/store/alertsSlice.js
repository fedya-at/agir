import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Assuming you use axios for API calls

const API_BASE_URL = "https://localhost:7143/api";
// Define constants for alert status for better readability in JavaScript
const AlertStatus = {
    Pending: 0,
    Sent: 1,
    Acknowledged: 2,
    Escalated: 3,
  };
  
  // Async Thunks for API interaction
  export const fetchAlerts = createAsyncThunk(
    'alerts/fetchAlerts',
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Alerts`);
        return response.data;
      } catch (error) {
        // Provide a more user-friendly error message
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch alerts');
      }
    }
  );
  
  export const acknowledgeAlert = createAsyncThunk(
    'alerts/acknowledgeAlert',
    async (alertId, { rejectWithValue }) => {
      try {
        await axios.post(`${API_BASE_URL}/Alerts/${alertId}/acknowledge`);
        return alertId; // Return the ID of the acknowledged alert
      } catch (error) {
        // Provide a more user-friendly error message
        return rejectWithValue(error.response?.data?.message || error.message || `Failed to acknowledge alert ${alertId}`);
      }
    }
  );
  
  const alertsSlice = createSlice({
    name: 'alerts',
    initialState: {
      alerts: [],
      loading: false, // Global loading for fetching all alerts
      error: null, // Global error for fetching all alerts
    },
    reducers: {
      // Synchronous reducers if needed (e.g., for clearing alerts)
      clearAlerts: (state) => {
        state.alerts = [];
        state.error = null;
        state.loading = false;
      },
    },
    extraReducers: (builder) => {
      builder
        // Handle fetchAlerts
        .addCase(fetchAlerts.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAlerts.fulfilled, (state, action) => {
          state.loading = false;
          // Initialize acknowledging and acknowledgeError states for each alert
          state.alerts = action.payload.map((alert) => ({
            ...alert,
            acknowledging: false,
            acknowledgeError: null,
          }));
        })
        .addCase(fetchAlerts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload; // Payload is already a string message
        })
        // Handle acknowledgeAlert
        .addCase(acknowledgeAlert.pending, (state, action) => {
          const alertId = action.meta.arg; // Get the alertId from the thunk's argument
          const existingAlert = state.alerts.find(alert => alert.id === alertId);
          if (existingAlert) {
            existingAlert.acknowledging = true;
            existingAlert.acknowledgeError = null;
          }
        })
        .addCase(acknowledgeAlert.fulfilled, (state, action) => {
          const acknowledgedAlertId = action.payload;
          const existingAlert = state.alerts.find(alert => alert.id === acknowledgedAlertId);
          if (existingAlert) {
            existingAlert.acknowledging = false;
            existingAlert.status = AlertStatus.Acknowledged; // Use constant for clarity
            existingAlert.acknowledgedAt = new Date().toISOString();
          }
        })
        .addCase(acknowledgeAlert.rejected, (state, action) => {
          const alertId = action.meta.arg; // Get the alertId from the thunk's argument
          const existingAlert = state.alerts.find(alert => alert.id === alertId);
          if (existingAlert) {
            existingAlert.acknowledging = false;
            existingAlert.acknowledgeError = action.payload; // Payload is already a string message
          }
        });
    },
  });
  
  export const { clearAlerts } = alertsSlice.actions;
  export default alertsSlice.reducer;
  
  export { AlertStatus };