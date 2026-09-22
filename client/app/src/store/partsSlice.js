// src/store/partsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as partsApi from "../services/partsApi";

const initialState = {
  parts: [],
  currentPart: null,
  lowStockParts: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const fetchParts = createAsyncThunk(
  "parts/fetchParts",
  async (_, { rejectWithValue }) => {
    try {
      return await partsApi.fetchParts();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPartById = createAsyncThunk(
  "parts/fetchPartById",
  async (id, { rejectWithValue }) => {
    try {
      return await partsApi.fetchPartById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPart = createAsyncThunk(
  "parts/createPart",
  async (partData, { rejectWithValue }) => {
    try {
      return await partsApi.createPart(partData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePart = createAsyncThunk(
  "parts/updatePart",
  async ({ id, partData }, { rejectWithValue }) => {
    try {
      return await partsApi.updatePart(id, partData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePart = createAsyncThunk(
  "parts/deletePart",
  async (id, { rejectWithValue }) => {
    try {
      await partsApi.deletePart(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchParts = createAsyncThunk(
  "parts/searchParts",
  async (term, { rejectWithValue }) => {
    try {
      return await partsApi.searchParts(term); // Pass 'term' to the API
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to search parts");
    }
  }
);

export const fetchLowStockParts = createAsyncThunk(
  "parts/fetchLowStockParts",
  async (_, { rejectWithValue }) => {
    try {
      return await partsApi.fetchLowStockParts();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addStock = createAsyncThunk(
  "parts/addStock",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      return await partsApi.addStock(id, quantity); // Pass quantity as a plain number
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add stock");
    }
  }
);

export const removeStock = createAsyncThunk(
  "parts/removeStock",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      return await partsApi.removeStock(id, quantity); // Pass quantity as a plain number
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove stock");
    }
  }
);

const partsSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    clearCurrentPart(state) {
      state.currentPart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all parts
      .addCase(fetchParts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parts = action.payload;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch part by ID
      .addCase(fetchPartById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPartById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentPart = action.payload;
      })
      .addCase(fetchPartById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create part
      .addCase(createPart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createPart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parts.push(action.payload);
      })
      .addCase(createPart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update part
      .addCase(updatePart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updatePart.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.parts.findIndex(
          (part) => part.id === action.payload.id
        );
        if (index !== -1) {
          state.parts[index] = action.payload;
        }
        if (state.currentPart?.id === action.payload.id) {
          state.currentPart = action.payload;
        }
      })
      .addCase(updatePart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete part
      .addCase(deletePart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parts = state.parts.filter((part) => part.id !== action.payload);
        if (state.currentPart?.id === action.payload) {
          state.currentPart = null;
        }
      })
      .addCase(deletePart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Search parts
      .addCase(searchParts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchParts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parts = action.payload;
      })
      .addCase(searchParts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch low stock parts
      .addCase(fetchLowStockParts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLowStockParts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lowStockParts = action.payload;
      })
      .addCase(fetchLowStockParts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add stock
      .addCase(addStock.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addStock.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.parts.findIndex(
          (part) => part.id === action.payload.id
        );
        if (index !== -1) {
          state.parts[index] = action.payload;
        }
        if (state.currentPart?.id === action.payload.id) {
          state.currentPart = action.payload;
        }
      })
      .addCase(addStock.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Remove stock
      .addCase(removeStock.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeStock.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.parts.findIndex(
          (part) => part.id === action.payload.id
        );
        if (index !== -1) {
          state.parts[index] = action.payload;
        }
        if (state.currentPart?.id === action.payload.id) {
          state.currentPart = action.payload;
        }
      })
      .addCase(removeStock.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPart } = partsSlice.actions;

export default partsSlice.reducer;

export const selectAllParts = (state) => state.parts.parts;
export const selectCurrentPart = (state) => state.parts.currentPart;
export const selectLowStockParts = (state) => state.parts.lowStockParts;
export const selectPartsStatus = (state) => state.parts.status;
export const selectPartsError = (state) => state.parts.error;
