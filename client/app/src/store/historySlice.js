import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "https://localhost:7143/api/History";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Authentication token not found. Please login again.");
    window.location.href = "/login";
    throw new Error("No authentication token available");
  }
  return token;
};

const api = axios.create({ baseURL: BASE_URL });

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
      toast.error("Session expirée. Veuillez vous reconnecter.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Fetch all history (paged)
export const fetchAllHistory = createAsyncThunk(
  "history/fetchAll",
  async ({ pageNumber = 1, pageSize = 100 } = {}) => {
    try {
      const response = await api.get("/all", {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement de l'historique"
      );
      throw error;
    }
  }
);

// Fetch filtered/paged history
export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async (params = {}) => {
    try {
      const response = await api.get("/", { params });
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement de l'historique"
      );
      throw error;
    }
  }
);

// Create a new history record
export const createHistory = createAsyncThunk(
  "history/createHistory",
  async (historyData) => {
    try {
      toast.loading("Ajout de l'historique...", { id: "createHistory" });
      const response = await api.post("/", historyData);
      toast.success("Historique ajouté avec succès !", { id: "createHistory" });
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Échec de l'ajout de l'historique",
        { id: "createHistory" }
      );
      throw error;
    }
  }
);

// Fetch by entityId (returns array)
export const fetchHistoryByEntityId = createAsyncThunk(
  "history/fetchByEntityId",
  async (entityId) => {
    try {
      const response = await api.get(`/entity/${entityId}`);
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement de l'historique de l'entité"
      );
      throw error;
    }
  }
);

// Fetch by entityName and entityId (returns array)
export const fetchHistoryByEntityNameAndId = createAsyncThunk(
  "history/fetchByEntityNameAndId",
  async ({ entityName, entityId }) => {
    try {
      const response = await api.get(`/entity/${entityName}/${entityId}`);
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement de l'historique"
      );
      throw error;
    }
  }
);

// Fetch by userId (returns array)
export const fetchHistoryByUserId = createAsyncThunk(
  "history/fetchByUserId",
  async (userId) => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement de l'historique utilisateur"
      );
      throw error;
    }
  }
);

// Fetch by entityName (returns array)
export const fetchHistoryByEntityName = createAsyncThunk(
  "history/fetchByEntityName",
  async (entityName) => {
    try {
      const response = await api.get(`/entity-name/${entityName}`);
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement de l'historique"
      );
      throw error;
    }
  }
);

// Export endpoints (PDF, Excel, CSV)
export const exportHistoryPdf = createAsyncThunk(
  "history/exportPdf",
  async () => {
    try {
      const response = await api.get("/export/pdf", { responseType: "blob" });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de l'export PDF");
      throw error;
    }
  }
);

export const exportHistoryExcel = createAsyncThunk(
  "history/exportExcel",
  async () => {
    try {
      const response = await api.get("/export/excel", { responseType: "blob" });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de l'export Excel");
      throw error;
    }
  }
);

export const exportHistoryCsv = createAsyncThunk(
  "history/exportCsv",
  async () => {
    try {
      const response = await api.get("/export/csv", { responseType: "blob" });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de l'export CSV");
      throw error;
    }
  }
);

const initialState = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 100,
  status: "idle",
  error: null,
  exportData: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    clearHistory: (state) => {
      state.items = [];
      state.totalCount = 0;
      state.pageNumber = 1;
      state.pageSize = 100;
      state.status = "idle";
      state.error = null;
    },
    resetHistoryStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Paged endpoints
      .addCase(fetchAllHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalCount = action.payload.totalCount || 0;
        state.pageNumber = action.payload.pageNumber || 1;
        state.pageSize = action.payload.pageSize || 100;
      })
      .addCase(fetchAllHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalCount = action.payload.totalCount || 0;
        state.pageNumber = action.payload.pageNumber || 1;
        state.pageSize = action.payload.pageSize || 100;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Create
      .addCase(createHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        action.payload && state.items.push(action.payload);
      })
      .addCase(createHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Array endpoints (not paged)
      .addCase(fetchHistoryByEntityId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      .addCase(fetchHistoryByEntityNameAndId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      .addCase(fetchHistoryByUserId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      .addCase(fetchHistoryByEntityName.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      // Export
      .addCase(exportHistoryPdf.fulfilled, (state, action) => {
        state.exportStatus = "succeeded";

        state.exportData = action.payload;
      })
      .addCase(exportHistoryExcel.fulfilled, (state, action) => {
        state.exportStatus = "succeeded";

        state.exportData = action.payload;
      })
      .addCase(exportHistoryCsv.fulfilled, (state, action) => {
        state.exportStatus = "succeeded";

        state.exportData = action.payload;
      });
  },
});

export const { clearHistory, resetHistoryStatus } = historySlice.actions;
export default historySlice.reducer;
