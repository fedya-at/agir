import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// The API endpoint for admins
const API_URL = "https://localhost:7143/api/Admins";

// Helper to create an authenticated API instance
const createApi = (token) => {
  if (!token) throw new Error("Authentication token not found.");
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- ASYNC THUNKS ---

export const fetchAdmins = createAsyncThunk(
  "admins/fetchAdmins",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const api = createApi(token);
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admins"
      );
    }
  }
);

export const createAdmin = createAsyncThunk(
  "admins/createAdmin",
  async (adminData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const api = createApi(token);
      const response = await api.post("/", adminData);
      toast.success("Admin created successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create admin");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateAdmin = createAsyncThunk(
  "admins/updateAdmin",
  async ({ id, adminData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const api = createApi(token);
      const response = await api.put(`/${id}`, adminData);
      toast.success("Admin updated successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update admin");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  "admins/deleteAdmin",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const api = createApi(token);
      await api.delete(`/${id}`);
      toast.success("Admin deleted successfully!");
      return id; // Return the ID for removal from state
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// --- SLICE DEFINITION ---

const adminsSlice = createSlice({
  name: "admins",
  initialState: {
    admins: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Admins
      .addCase(fetchAdmins.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create Admin
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.admins.push(action.payload);
      })
      // Update Admin
      .addCase(updateAdmin.fulfilled, (state, action) => {
        const index = state.admins.findIndex(
          (admin) => admin.id === action.payload.id
        );
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
      })
      // Delete Admin
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter(
          (admin) => admin.id !== action.payload
        );
      });
  },
});

export default adminsSlice.reducer;
