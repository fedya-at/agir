// API service for chatbot backend integration
const API_BASE_URL ="http://localhost:5000/api/chatbot";

class ChatbotAPI {
  static async sendMessage(message, userId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  static async getHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }

  static async getIntents() {
    try {
      const response = await fetch(`${API_BASE_URL}/intents`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to get intents:", error);
      throw error;
    }
  }

  static async getTroubleshootingTopics() {
    try {
      const response = await fetch(`${API_BASE_URL}/troubleshooting-topics`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to get troubleshooting topics:", error);
      throw error;
    }
  }
}

export default ChatbotAPI;
