// Service management API functions
import { API_BASE_URL as BASE_URL } from "../config/apiConfig";

const API_BASE_URL = `${BASE_URL}/api`;

export const updateInterventionService = async (
  interventionId,
  serviceData
) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/Interventions/${interventionId}/service`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating intervention service:", error);
    throw error;
  }
};

export const updateInterventionLaborCost = async (
  interventionId,
  laborCost
) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/Interventions/${interventionId}/labor-cost`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ laborCost }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating labor cost:", error);
    throw error;
  }
};

export const getInterventionsByServiceType = async (serviceType) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/Interventions/service-type/${serviceType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching interventions by service type:", error);
    throw error;
  }
};
