// src/store/api.js
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/apiConfig";

const BASE_URL = `${API_BASE_URL}/api`;

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
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
