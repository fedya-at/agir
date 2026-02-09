import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = "https://localhost:7143/api";

// Async thunks for technicians
export const fetchTechnicians = createAsyncThunk(
  "technicians/fetchTechnicians",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get(`${API_URL}/Technicians`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);


export const fetchActiveTechnicians = createAsyncThunk(
  "technicians/fetchActiveTechnicians",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get(`${API_URL}/Technicians/active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

export const createTechnician = createAsyncThunk(
  "technicians/createTechnician",
  async (technicianData, { getState }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.post(
        `${API_URL}/Technicians`,
        technicianData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Technician created successfully");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create technician"
      );
      throw error;
    }
  }
);

export const updateTechnician = createAsyncThunk(
  "technicians/updateTechnician",
  async ({ id, technicianData }, { getState }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.put(
        `${API_URL}/Technicians/${id}`,
        technicianData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Technician updated successfully");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update technician"
      );
      throw error;
    }
  }
);

export const deleteTechnician = createAsyncThunk(
  "technicians/deleteTechnician",
  async (id, { getState }) => {
    const token = getState().auth.token;
    try {
      await axios.delete(`${API_URL}/Technicians/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Technician deleted successfully");
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete technician"
      );
      throw error;
    }
  }
);
// Fetch technician by ID
export const getTechnicianById = createAsyncThunk(
  "technicians/getTechnicianById",
  async (id, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.get(`${API_URL}/Technicians/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the technician data
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch technician by ID";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
export const activateTechnician = createAsyncThunk(
  "technicians/activateTechnician",
  async (id, { getState }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.put(
        `${API_URL}/Technicians/${id}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Technician activated successfully");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to activate technician"
      );
      throw error;
    }
  }
);

export const deactivateTechnician = createAsyncThunk(
  "technicians/deactivateTechnician",
  async (id, { getState }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.put(
        `${API_URL}/Technicians/${id}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Technician deactivated successfully");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to deactivate technician"
      );
      throw error;
    }
  }
);
// Fetch interventions for a specific technician by ID
export const fetchInterventionsByTechnician = createAsyncThunk(
  "technicians/fetchInterventionsByTechnician",
  async (technicianId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.get(
        `${API_URL}/Technicians/${technicianId}/interventions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Return the list of interventions
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch interventions";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const techniciansSlice = createSlice({
  name: "technicians",
  initialState: {
    technicians: [],
    activeTechnicians: [],
    technicianById: null, // Add state for a single technician
    interventionsByTechnician: [], // Add state for interventions by technician
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechnicians.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.technicians = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchInterventionsByTechnician.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionsByTechnician.fulfilled, (state, action) => {

        state.interventionsByTechnician = action.payload; // Update the state with fetched interventions
        state.status = "succeeded";
      })
      .addCase(fetchInterventionsByTechnician.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Store the error message
      })
      .addCase(fetchActiveTechnicians.fulfilled, (state, action) => {
        state.activeTechnicians = action.payload;
      })
      .addCase(createTechnician.fulfilled, (state, action) => {
        state.technicians.push(action.payload);
      })
      .addCase(getTechnicianById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTechnicianById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.technicianById = action.payload; // Store the fetched technician
      })
      .addCase(getTechnicianById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Store the error message
      })

      .addCase(updateTechnician.fulfilled, (state, action) => {
        const index = state.technicians.findIndex(
          (tech) => tech.id === action.payload.id
        );
        if (index !== -1) {
          state.technicians[index] = action.payload;
        }
      })
      .addCase(deleteTechnician.fulfilled, (state, action) => {
        state.technicians = state.technicians.filter(
          (tech) => tech.id !== action.payload
        );
      })
      .addCase(activateTechnician.fulfilled, (state, action) => {
        const index = state.technicians.findIndex(
          (tech) => tech.id === action.payload.id
        );
        if (index !== -1) {
          state.technicians[index] = action.payload;
        }
      })
      .addCase(deactivateTechnician.fulfilled, (state, action) => {
        const index = state.technicians.findIndex(
          (tech) => tech.id === action.payload.id
        );
        if (index !== -1) {
          state.technicians[index] = action.payload;
        }
      });
  },
});

export default techniciansSlice.reducer;
