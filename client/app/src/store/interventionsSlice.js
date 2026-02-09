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

// Fetch all interventions
export const fetchInterventions = createAsyncThunk(
  "interventions/fetchInterventions",
  async () => {
    try {
      const response = await api.get("/Interventions");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch interventions";
      toast.error(errorMessage);
      throw error;
    }
  }
);

export const fetchInterventionById = createAsyncThunk(
  "interventions/fetchInterventionById",
  async (id) => {
    try {
      const response = await api.get(`/Interventions/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch intervention details";
      toast.error(errorMessage);
      throw error;
    }
  }
);

// Create a new intervention
export const createIntervention = createAsyncThunk(
  "interventions/createIntervention",
  async (interventionData, { rejectWithValue }) => {
    // Validate required fields
    const requiredFields = [
      "description",
      "startDate",
      "clientId",
      "technicianId",
      "serviceType",
      "serviceDetails",
    ];
    for (const field of requiredFields) {
      if (
        interventionData[field] === undefined ||
        interventionData[field] === null ||
        interventionData[field] === ""
      ) {
        toast.error(`Missing required field: ${field}`);
        return rejectWithValue({ message: `Missing required field: ${field}` });
      }
    }
    try {
      // Construct the body to match backend requirements
      const body = {
        description: interventionData.description,
        startDate: interventionData.startDate,
        clientId: interventionData.clientId,
        technicianId: interventionData.technicianId,
        serviceType: interventionData.serviceType,
        serviceDetails: interventionData.serviceDetails,
      };
      const response = await api.post("/Interventions", body, {
        headers: {
          accept: "text/plain",
          "Content-Type": "application/json",
        },
      });
      toast.success("Intervention created successfully!");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create intervention";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data);
    }
  }
);
// Update an intervention
export const updateIntervention = createAsyncThunk(
  "interventions/updateIntervention",
  async ({ id, interventionData }) => {
    try {
      const response = await api.put(`/Interventions/${id}`, interventionData);
      toast.success("Intervention updated successfully!");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update intervention";
      toast.error(errorMessage);
      throw error;
    }
  }
);

// Delete an intervention
export const deleteIntervention = createAsyncThunk(
  "interventions/deleteIntervention",
  async (id) => {
    try {
      await api.delete(`/Interventions/${id}`);
      toast.success("Intervention deleted successfully!");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete intervention";
      toast.error(errorMessage);
      throw error;
    }
  }
);

// Fetch interventions by status
export const fetchInterventionsByStatus = createAsyncThunk(
  "interventions/fetchInterventionsByStatus",
  async (status) => {
    try {
      const response = await api.get(`/Interventions/status/${status}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch interventions by status";
      toast.error(errorMessage);
      throw error;
    }
  }
);

// Fetch interventions by date range
export const fetchInterventionsByDateRange = createAsyncThunk(
  "interventions/fetchInterventionsByDateRange",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/Interventions/daterange?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch interventions by date range";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || errorMessage);
    }
  }
);

// Assign technician to intervention
export const assignTechnician = createAsyncThunk(
  "interventions/assignTechnician",
  async ({ interventionId, technicianId }) => {
    try {
      const response = await api.put(
        `/Interventions/${interventionId}/assign/${technicianId}`
      );
      toast.success("Technician assigned successfully!");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to assign technician";
      toast.error(errorMessage);
      throw error;
    }
  }
);

// Add parts to an intervention
export const addInterventionParts = createAsyncThunk(
  "interventions/addInterventionParts",
  async ({ id, parts }) => {
    try {
      const response = await api.post(`/Interventions/${id}/parts`, parts);
      toast.success("Parts added successfully!");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add parts to intervention";
      toast.error(errorMessage);
      throw error;
    }
  }
);

// Remove a part from an intervention
export const removeInterventionPart = createAsyncThunk(
  "interventions/removeInterventionPart",
  async ({ id, partId }) => {
    try {
      await api.delete(`/Interventions/${id}/parts/${partId}`);
      toast.success("Part removed successfully!");
      return { id, partId };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove part from intervention";
      toast.error(errorMessage);
      throw error;
    }
  }
);

// Update intervention status
export const updateInterventionStatus = createAsyncThunk(
  "interventions/updateInterventionStatus",
  async ({ id, newStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/Interventions/${id}/status`, null, {
        params: { newStatus },
      });
      toast.success("Intervention status updated successfully!");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update intervention status";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || errorMessage);
    }
  }
);

// Fetch interventions by technician ID
export const fetchInterventionsByTechnicianId = createAsyncThunk(
  "technicians/fetchInterventionsByTechnicianId",
  async (technicianId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `Interventions/technician/${technicianId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch interventions for the currently logged-in technician
export const fetchMyInterventions = createAsyncThunk(
  "interventions/fetchMyInterventions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Interventions/technician/me`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch your interventions";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || errorMessage);
    }
  }
);

// Fetch interventions by client ID
export const fetchInterventionsByClientId = createAsyncThunk(
  "interventions/fetchInterventionsByClientId",
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Interventions/client/${clientId}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch interventions for client";
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || errorMessage);
    }
  }
);

// Intervention slice
const interventionsSlice = createSlice({
  name: "interventions",
  initialState: {
    interventions: [],
    currentIntervention: null,
    status: "idle",
    error: null,
  },
  reducers: {
    resetInterventionStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all interventions
      .addCase(fetchInterventions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interventions = action.payload;
      })
      .addCase(fetchInterventions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Fetch intervention by ID
      .addCase(fetchInterventionById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentIntervention = action.payload;
      })
      .addCase(fetchInterventionById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Create a new intervention
      .addCase(createIntervention.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createIntervention.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interventions.push(action.payload);
      })
      .addCase(createIntervention.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Update an intervention
      .addCase(updateIntervention.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateIntervention.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.interventions.findIndex(
          (intervention) => intervention.id === action.payload.id
        );
        if (index !== -1) {
          state.interventions[index] = action.payload;
        }
      })
      .addCase(updateIntervention.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Delete an intervention
      .addCase(deleteIntervention.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteIntervention.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interventions = state.interventions.filter(
          (intervention) => intervention.id !== action.payload
        );
      })
      .addCase(deleteIntervention.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Fetch interventions by status
      .addCase(fetchInterventionsByStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionsByStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interventions = action.payload;
      })
      .addCase(fetchInterventionsByStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Fetch interventions by date range
      .addCase(fetchInterventionsByDateRange.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionsByDateRange.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interventions = action.payload;
      })
      .addCase(fetchInterventionsByDateRange.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // Assign technician to intervention
      .addCase(assignTechnician.pending, (state) => {
        state.status = "loading";
      })
      .addCase(assignTechnician.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.interventions.findIndex(
          (intervention) => intervention.id === action.payload.id
        );
        if (index !== -1) {
          state.interventions[index] = action.payload;
        }
      })
      .addCase(assignTechnician.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Add parts to an intervention
      .addCase(addInterventionParts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addInterventionParts.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.interventions.findIndex(
          (intervention) => intervention.id === action.payload.id
        );
        if (index !== -1) {
          state.interventions[index] = action.payload;
        }
      })
      .addCase(addInterventionParts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Remove a part from an intervention
      .addCase(removeInterventionPart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeInterventionPart.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.interventions.findIndex(
          (intervention) => intervention.id === action.payload.id
        );
        if (index !== -1) {
          state.interventions[index] = action.payload;
        }
      })
      .addCase(removeInterventionPart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Update intervention status
      .addCase(updateInterventionStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateInterventionStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.interventions.findIndex(
          (intervention) => intervention.id === action.payload.id
        );
        if (index !== -1) {
          state.interventions[index] = action.payload;
        }
        if (state.currentIntervention?.id === action.payload.id) {
          state.currentIntervention = action.payload;
        }
      })
      .addCase(updateInterventionStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      })

      // Fetch interventions by technician ID
      .addCase(fetchInterventionsByTechnicianId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionsByTechnicianId.fulfilled, (state, action) => {
        state.interventionsByTechnician = action.payload; // Update the state with fetched interventions
        state.status = "succeeded";
      })
      .addCase(fetchInterventionsByTechnicianId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Fetch interventions for the currently logged-in technician
      .addCase(fetchMyInterventions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyInterventions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interventions = action.payload;
      })
      .addCase(fetchMyInterventions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // Fetch interventions by client ID
      .addCase(fetchInterventionsByClientId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionsByClientId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interventions = action.payload;
      })
      .addCase(fetchInterventionsByClientId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { resetInterventionStatus } = interventionsSlice.actions;
export default interventionsSlice.reducer;
