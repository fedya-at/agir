import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../config/apiConfig";

const API_URL = API_ENDPOINTS.AUTH;
const CLIENT_API_URL = API_ENDPOINTS.CLIENTS;

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ loginIdentifier, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        {
          loginIdentifier,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with status code
        return rejectWithValue(error.response.data.message || "Login failed");
      } else if (error.request) {
        // The request was made but no response received
        return rejectWithValue("Network error - no response from server");
      } else {
        // Something happened in setting up the request
        return rejectWithValue(error.message);
      }
    }
  }
);
export const registerClient = createAsyncThunk(
  "auth/registerClient",
  async (registrationData, { rejectWithValue }) => {
    try {
      // Post to the new, correct endpoint
      const response = await axios.post(
        `${CLIENT_API_URL}/register`,
        registrationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    status: "loading", // Start with loading state
    error: null,
    registerStatus: "idle",
    registerError: null,
  },
  reducers: {
    initializeAuth: (state) => {
      state.token = localStorage.getItem("token");
      state.user = JSON.parse(localStorage.getItem("user"));
      state.status = "idle";
    },
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      toast.success("Logged out successfully");
    },
    updateAuthUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
        toast.loading("Signing in...", { id: "login" });
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        toast.success("Login successful!", { id: "login" });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Login failed", { id: "login" });
      })
      .addCase(registerClient.pending, (state) => {
        state.registerStatus = "loading";
        state.registerError = null;
        toast.loading("Creating account...", { id: "register" });
      })
      .addCase(registerClient.fulfilled, (state) => {
        state.registerStatus = "succeeded";
        toast.success("Account created successfully!", { id: "register" });
      })
      .addCase(registerClient.rejected, (state, action) => {
        state.registerStatus = "failed";
        state.registerError = action.payload;
        toast.error(action.payload || "Registration failed", {
          id: "register",
        });
      });
  },
});

export const { initializeAuth, logout, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
