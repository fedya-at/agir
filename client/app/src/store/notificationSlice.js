// src/store/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import api from "./api";

const BASE_URL = "/Notifications"; // already prefixed with baseURL in api.js

// Thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(BASE_URL);
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch notifications");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, thunkAPI) => {
    try {
      await api.put(`${BASE_URL}/${id}/read`);
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
      await api.put(`${BASE_URL}/read-all`);
      return;
    } catch (err) {
      toast.error("Failed to mark all as read");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload);
        if (index !== -1) state.items[index].isRead = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
      });
  },
});

export default notificationsSlice.reducer;
