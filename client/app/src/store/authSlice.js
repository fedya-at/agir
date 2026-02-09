import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "https://localhost:7143/api/Users";
const CLIENT_API_URL = "https://localhost:7143/api/Clients";

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

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/forgot-password`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message ||
            "User not found with this email address"
        );
      } else if (error.request) {
        return rejectWithValue("Network error - no response from server");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, resetToken, newPassword, confirmPassword },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/reset-password`,
        {
          email,
          resetToken,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to reset password"
        );
      } else if (error.request) {
        return rejectWithValue("Network error - no response from server");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const validateResetToken = createAsyncThunk(
  "auth/validateResetToken",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/validate-reset-token/${token}`
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Invalid or expired reset token"
        );
      } else if (error.request) {
        return rejectWithValue("Network error - no response from server");
      } else {
        return rejectWithValue(error.message);
      }
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
    forgotPasswordStatus: "idle",
    forgotPasswordError: null,
    resetPasswordStatus: "idle",
    resetPasswordError: null,
    validateTokenStatus: "idle",
    validateTokenError: null,
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
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordStatus = "loading";
        state.forgotPasswordError = null;
        toast.loading("Sending password reset email...", {
          id: "forgot-password",
        });
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordStatus = "succeeded";
        toast.success("Password reset email sent successfully!", {
          id: "forgot-password",
        });
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordStatus = "failed";
        state.forgotPasswordError = action.payload;
        toast.error(action.payload || "Failed to send password reset email", {
          id: "forgot-password",
        });
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordStatus = "loading";
        state.resetPasswordError = null;
        toast.loading("Resetting password...", { id: "reset-password" });
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordStatus = "succeeded";
        toast.success("Password reset successfully!", { id: "reset-password" });
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordStatus = "failed";
        state.resetPasswordError = action.payload;
        toast.error(action.payload || "Failed to reset password", {
          id: "reset-password",
        });
      })
      .addCase(validateResetToken.pending, (state) => {
        state.validateTokenStatus = "loading";
        state.validateTokenError = null;
      })
      .addCase(validateResetToken.fulfilled, (state) => {
        state.validateTokenStatus = "succeeded";
      })
      .addCase(validateResetToken.rejected, (state, action) => {
        state.validateTokenStatus = "failed";
        state.validateTokenError = action.payload;
      });
  },
});

export const { initializeAuth, logout, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
