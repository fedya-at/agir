import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// Define API base URL
const API_URL = "https://localhost:7143/api";

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Authentication token not found. Please login again.");
    throw new Error("No authentication token available");
  }
  return token;
};

// Configure axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "text/plain",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Async thunks for InterventionParts

// Fetch all parts for an intervention
export const fetchInterventionParts = createAsyncThunk(
  "interventionParts/fetchInterventionParts",
  async (interventionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/intervention-parts`, {
        params: { interventionId },
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch intervention parts";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch a specific intervention part by ID
export const fetchInterventionPartById = createAsyncThunk(
  "interventionParts/fetchInterventionPartById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/intervention-parts/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch intervention part details";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Add a part to an intervention
export const addInterventionPart = createAsyncThunk(
  "interventionParts/addInterventionPart",
  async ({ interventionId, partId, quantity }, { rejectWithValue }) => {
    try {
      const payload = { partId, quantity };
      const response = await api.post(`/intervention-parts`, payload, {
        params: { interventionId },
      });
      toast.success("Part added successfully!");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add part to intervention";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update an intervention part
export const updateInterventionPart = createAsyncThunk(
  "interventionParts/updateInterventionPart",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const payload = { quantity };
      const response = await api.put(`/intervention-parts/${id}`, payload);
      toast.success("Part updated successfully!");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update intervention part";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete an intervention part
export const deleteInterventionPart = createAsyncThunk(
  "interventionParts/deleteInterventionPart",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/intervention-parts/${id}`);
      toast.success("Part deleted successfully!");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete intervention part";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// InterventionParts slice
const interventionPartsSlice = createSlice({
  name: "interventionParts",
  initialState: {
    parts: [],
    currentPart: null,
    status: "idle",
    error: null,
  },
  reducers: {
    resetOperationStatus: (state) => {
      state.status = "idle";
    },
    clearCurrentPart: (state) => {
      state.currentPart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all parts for an intervention
      .addCase(fetchInterventionParts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionParts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parts = action.payload;
      })
      .addCase(fetchInterventionParts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch a specific part
      .addCase(fetchInterventionPartById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionPartById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentPart = action.payload;
      })
      .addCase(fetchInterventionPartById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add a part to an intervention
      .addCase(addInterventionPart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addInterventionPart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parts.push(action.payload);
      })
      .addCase(addInterventionPart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update a part
      .addCase(updateInterventionPart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateInterventionPart.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.parts.findIndex(
          (part) => part.id === action.payload.id
        );
        if (index !== -1) {
          state.parts[index] = action.payload;
        }
      })
      .addCase(updateInterventionPart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete a part
      .addCase(deleteInterventionPart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteInterventionPart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parts = state.parts.filter((part) => part.id !== action.payload);
      })
      .addCase(deleteInterventionPart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetOperationStatus, clearCurrentPart } =
  interventionPartsSlice.actions;

export default interventionPartsSlice.reducer;
