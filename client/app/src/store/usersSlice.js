/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { updateAuthUser } from "./authSlice";
const BASE_URL = "https://localhost:7143/api/Users";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Authentication token not found. Please login again.");
    // Optionally redirect to login page
    window.location.href = "/login";
    throw new Error("No authentication token available");
  }
  return token;
};
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  try {
    const token = getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
const createApi = (token) => {
  const api = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
  return api;
};

export const fetchCurrentUser = createAsyncThunk(
  "users/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const api = createApi(token);
      const response = await api.get("/me"); // NEW ENDPOINT
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch users";
    toast.error(errorMessage);
    throw error; // Throw error instead of using rejectWithValue
  }
});

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || `Failed to fetch user ${id}`;
      toast.error(errorMessage);
      throw error;
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "users/updateUserProfile",
  async ({ id, userData }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const api = createApi(token);
      // Use the correct endpoint based on user role
      const role = getState().auth.user.role;
      const endpoint =
        role === 1 ? `/api/Technicians/${id}` : `/api/Clients/${id}`;

      const response = await axios.put(
        `https://localhost:7143${endpoint}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Dispatch action to update the user in auth state as well
      dispatch(updateAuthUser(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteUser = createAsyncThunk("users/deleteUser", async (id) => {
  try {
    toast.loading("Deleting user...", { id: "deleteUser" });
    await api.delete(`/${id}`);
    toast.success("User deleted successfully!", { id: "deleteUser" });
    return id;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete user";
    toast.error(errorMessage, { id: "deleteUser" });
    throw error;
  }
});

export const changeUserRole = createAsyncThunk(
  "users/changeUserRole",
  async ({ id, role }) => {
    try {
      toast.loading("Changing user role...", { id: "changeRole" });
      const response = await api.put(`${id}/changerole`, { role });
      const roleName =
        role === 0 ? "Admin" : role === 1 ? "Technician" : "Client";
      toast.success(`Role changed to ${roleName} successfully!`, {
        id: "changeRole",
      });
      return { id, role };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to change user role";
      toast.error(errorMessage, { id: "changeRole" });
      throw errorMessage; // Throw the string message, not the error object
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async ({ id, isActive }) => {
    try {
      const endpoint = isActive ? "deactivate" : "activate";
      toast.loading(`${isActive ? "Deactivating" : "Activating"} user...`, {
        id: "toggleStatus",
      });
      const response = await api.put(`/${id}/${endpoint}`);
      toast.success(
        `User ${isActive ? "deactivated" : "activated"} successfully!`,
        { id: "toggleStatus" }
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${isActive ? "deactivate" : "activate"} user`;
      toast.error(errorMessage, { id: "toggleStatus" });
      throw error;
    }
  }
);

export const changePassword = createAsyncThunk(
  "users/changePassword",
  async ({ id, passwordData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/${id}/changepassword`, passwordData);
      toast.success("Password changed successfully!");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);


export const adminResetPassword = createAsyncThunk(
  "users/adminResetPassword",
  async ({ id, newPassword }, { rejectWithValue }) => {
    try {
      // We can reuse the existing authenticated 'api' instance
      const response = await api.post(`/${id}/admin-reset-password`, {
        newPassword,
      });
      toast.success("Password has been reset successfully!");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    currentUser: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    resetUserStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserProfile.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(changeUserRole.pending, (state) => {
        state.status = "loading";
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        const { id, role, user } = action.payload;
        const index = state.users.findIndex((u) => u.id === id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...user, role };
        }
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message; // Access error message from action.error
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "succeeded";
        toast.success("Password updated successfully!");
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Store the error message
      })
      .addCase(adminResetPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(adminResetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { id, newPassword } = action.payload;
        const index = state.users.findIndex((user) => user.id === id);
        if (index !== -1) {
          state.users[index].password = newPassword;
        }
      })
      .addCase(adminResetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentUser, resetUserStatus } = usersSlice.actions;
export default usersSlice.reducer;
