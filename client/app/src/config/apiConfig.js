/**
 * Central API configuration for frontend.
 * Configured via Vite environment variables:
 * - VITE_API_BASE_URL (defaults to https://localhost:7143)
 * - VITE_CHATBOT_URL (defaults to http://localhost:5000/api/chatbot)
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7143"
).replace(/\/+$/, "");

export const CHATBOT_BASE_URL = (
  import.meta.env.VITE_CHATBOT_URL || "http://localhost:5000/api/chatbot"
).replace(/\/+$/, "");

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/Users`,
  USERS: `${API_BASE_URL}/api/Users`,
  CLIENTS: `${API_BASE_URL}/api/Clients`,
  TECHNICIANS: `${API_BASE_URL}/api/Technicians`,
  ADMINS: `${API_BASE_URL}/api/Admins`,
  INTERVENTIONS: `${API_BASE_URL}/api/Interventions`,
  INTERVENTION_PARTS: `${API_BASE_URL}/api/InterventionParts`,
  PARTS: `${API_BASE_URL}/api/Parts`,
  INVOICES: `${API_BASE_URL}/api/Invoices`,
  ALERTS: `${API_BASE_URL}/api/Alerts`,
  HISTORY: `${API_BASE_URL}/api/History`,
  SIGNALR_NOTIFICATION: `${API_BASE_URL}/hubs/notification`,
  SIGNALR_INTERVENTION: `${API_BASE_URL}/hubs/intervention`,
  CHATBOT: CHATBOT_BASE_URL,
};

export default {
  API_BASE_URL,
  CHATBOT_BASE_URL,
  API_ENDPOINTS,
};
