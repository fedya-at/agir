// src/services/partsApi.js
import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = "https://localhost:7143/api/Parts";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Authentication token not found. Please login again.");
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

export const fetchParts = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch parts");
    throw error;
  }
};

export const fetchPartById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch part details");
    throw error;
  }
};

export const createPart = async (partData) => {
  try {
    const response = await api.post("/", partData);
    toast.success("Part created successfully");
    return response.data;
  } catch (error) {
    toast.error("Failed to create part");
    throw error;
  }
};

export const updatePart = async (id, partData) => {
  try {
    const response = await api.put(`/${id}`, partData);
    toast.success("Part updated successfully");
    return response.data;
  } catch (error) {
    toast.error("Failed to update part");
    throw error;
  }
};

export const deletePart = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    toast.success("Part deleted successfully");
    return response.data;
  } catch (error) {
    toast.error("Failed to delete part");
    throw error;
  }
};

export const searchParts = async (term) => {
  try {
    const response = await api.get("/search", { params: { term } }); // Use 'term' as the query parameter
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to search parts");
    throw error;
  }
};

export const fetchLowStockParts = async () => {
  try {
    const response = await api.get("/lowstock");
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch low stock parts");
    throw error;
  }
};

export const addStock = async (id, quantity) => {
  try {
    const response = await api.put(
      `/${id}/addstock`, // Correct endpoint
      quantity, // Send quantity as a plain number
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    toast.success("Stock added successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to add stock");
    throw error;
  }
};

export const removeStock = async (id, quantity) => {
  try {
    const response = await api.put(
      `/${id}/removestock`, // Correct endpoint
      quantity, // Send quantity as a plain number
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    toast.success("Stock removed successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to remove stock");
    throw error;
  }
};
