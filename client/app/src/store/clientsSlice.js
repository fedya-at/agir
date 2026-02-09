import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://localhost:7143/api";

const createApi = (token) => {
  return axios.create({
    baseURL: `${API_URL}/Clients`, // Base URL for this slice
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (_, { getState, rejectWithValue }) => {
    try {
      const api = createApi(getState().auth.token);
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const fetchClientById = createAsyncThunk(
  "clients/fetchClientById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const api = createApi(getState().auth.token);
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);


// Second: Fetch interventions using the client's own ID (Client.id)
export const fetchClientInterventions = createAsyncThunk(
  "clients/fetchClientInterventions",
  async (clientId, { getState, rejectWithValue }) => {
    try {
      const api = createApi(getState().auth.token);
      const response = await api.get(`/${clientId}/interventions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Update an existing client
export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async ({ id, clientData }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.put(`${API_URL}/Clients/${id}`, clientData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the updated client
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update client"
      );
    }
  }
);

// Delete a client by ID
export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (id, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      await axios.delete(`${API_URL}/Clients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the deleted client ID
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete client"
      );
    }
  }
);

// Fetch a client by email
export const fetchClientByEmail = createAsyncThunk(
  "clients/fetchClientByEmail",
  async (email, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.get(`${API_URL}/Clients/email/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the client data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch client by email"
      );
    }
  }
);

// Search for clients
export const searchClients = createAsyncThunk(
  "clients/searchClients",
  async (query, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.get(`${API_URL}/Clients/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the search results
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search clients"
      );
    }
  }
);

// Create a new client
export const createClient = createAsyncThunk(
  "clients/createClient",
  async (clientData, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.post(`${API_URL}/Clients`, clientData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the created client
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create client"
      );
    }
  }
);

const clientsSlice = createSlice({
  name: "clients",
  initialState: {
    clients: [], // Stores the list of all clients
    clientById: null, // Stores a single client fetched by ID
    clientByEmail: null, // Stores the client found by email
    clientInterventions: [], // Stores interventions for the client
    searchResults: [], // Stores search results
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all clients
      .addCase(fetchClients.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create a new client
      .addCase(createClient.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clients.push(action.payload); // Add the new client to the list
      })
      .addCase(createClient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update a client
      .addCase(updateClient.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.clients.findIndex(
          (client) => client.id === action.payload.id
        );
        if (index !== -1) {
          state.clients[index] = action.payload; // Update the client in the list
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete a client
      .addCase(deleteClient.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clients = state.clients.filter(
          (client) => client.id !== action.payload
        ); // Remove the deleted client from the list
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch a client by email
      .addCase(fetchClientByEmail.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchClientByEmail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clientByEmail = action.payload; // Store the fetched client
      })
      .addCase(fetchClientByEmail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Search for clients
      .addCase(searchClients.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchClients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.searchResults = action.payload; // Store the search results
      })
      .addCase(searchClients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default clientsSlice.reducer;
