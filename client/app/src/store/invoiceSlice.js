import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "https://localhost:7143/api"; // Replace with your actual API URL

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

// Async Thunks

// Fetch all invoices
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/Invoices");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch invoices"
      );
    }
  }
);

// Fetch invoice by ID
export const fetchInvoiceById = createAsyncThunk(
  "invoices/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Invoices/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch invoice");
    }
  }
);

// Fetch invoice by intervention ID
export const fetchInterventionInvoice = createAsyncThunk(
  "invoices/fetchInterventionInvoice",
  async (interventionId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/Invoices/intervention/${interventionId}`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue(
          error.response?.data || "Failed to fetch intervention invoice"
        );
      }
    }
  }
);

// Create a new invoice
export const createInvoice = createAsyncThunk(
  "invoices/create",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await api.post("/Invoices", invoiceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create invoice"
      );
    }
  }
);

// Update an invoice
export const updateInvoice = createAsyncThunk(
  "invoices/update",
  async ({ id, invoiceData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/Invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update invoice"
      );
    }
  }
);

// Issue an invoice
export const issueInvoice = createAsyncThunk(
  "invoices/issue",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/Invoices/${id}/issue`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to issue invoice");
    }
  }
);

// Mark an invoice as paid
export const markInvoiceAsPaid = createAsyncThunk(
  "invoices/markPaid",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/Invoices/${id}/markpaid`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to mark invoice as paid"
      );
    }
  }
);

// Cancel an invoice
export const cancelInvoice = createAsyncThunk(
  "invoices/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/Invoices/${id}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to cancel invoice"
      );
    }
  }
);

// Download invoice PDF
export const downloadInvoicePdf = createAsyncThunk(
  "invoices/downloadPdf",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Invoices/${invoiceId}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to download PDF");
    }
  }
);

// Generate an invoice for an intervention
export const generateInvoiceForIntervention = createAsyncThunk(
  "invoices/generateForIntervention",
  async (interventionId, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/Invoices/generate/intervention/${interventionId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to generate invoice"
      );
    }
  }
);

// Get global labor cost
export const fetchGlobalLaborCost = createAsyncThunk(
  "invoices/fetchGlobalLaborCost",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/Invoices/global-labor-cost");
      // The API returns text/plain, so response.data is a string or number
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch global labor cost"
      );
    }
  }
);

// Update global labor cost
export const updateGlobalLaborCost = createAsyncThunk(
  "invoices/updateGlobalLaborCost",
  async (laborCost, { rejectWithValue }) => {
    try {
      const response = await api.put("/Invoices/global-labor-cost", {
        laborCost,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update global labor cost"
      );
    }
  }
);

// Slice
const invoiceSlice = createSlice({
  name: "invoices",
  initialState: {
    items: [],
    currentInvoice: null,
    status: "idle",
    error: null,
    globalLaborCost: null, // <-- add this to state
  },
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchInterventionInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInterventionInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(generateInvoiceForIntervention.pending, (state) => {
        state.status = "loading";
      })
      .addCase(generateInvoiceForIntervention.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentInvoice = action.payload;
      })
      .addCase(generateInvoiceForIntervention.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(issueInvoice.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(fetchGlobalLaborCost.fulfilled, (state, action) => {
        state.globalLaborCost = action.payload;
      })
      .addCase(updateGlobalLaborCost.fulfilled, (state, action) => {
        state.globalLaborCost = action.payload;
      });
  },
});

export const { clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
