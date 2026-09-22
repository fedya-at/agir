import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [
    {
      content:
        "Hello! I'm your Enhanced Computer Repair Assistant. I can help you troubleshoot common software issues with improved error handling and memory management. What problem are you experiencing today?",
      isUser: false,
      type: "greeting",
      timestamp: new Date().toISOString(),
      id: "initial-greeting",
    },
  ],
  isLoading: false,
  error: null,
  chatSession: null,
  lastIntent: null,
  confidence: null,
  systemHealth: null,
  availableModels: [],
  currentModel: "llama3.2:1b",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const message = {
        ...action.payload,
        timestamp: new Date().toISOString(),
        id: action.payload.id || Date.now() + Math.random(),
      };
      state.messages.push(message);
    },
    setModel: (state, action) => {
      state.currentModel = action.payload;
    },
    addBotResponse: (state, action) => {
      const { response, type, intent, confidence, id } = action.payload;

      const existingMessageIndex = state.messages.findIndex(
        (msg) => msg.id === id
      );

      if (existingMessageIndex !== -1) {
        state.messages[existingMessageIndex].content = response;
        state.messages[existingMessageIndex].type = type || "technical";
        state.messages[existingMessageIndex].intent = intent || null;
        state.messages[existingMessageIndex].confidence = confidence || null;
        state.messages[existingMessageIndex].timestamp =
          new Date().toISOString();
      } else {
        const message = {
          content: response,
          isUser: false,
          type: type || "technical",
          intent: intent || null,
          confidence: confidence || null,
          timestamp: new Date().toISOString(),
          id: id || Date.now() + Math.random(),
        };
        state.messages.push(message);
      }

      state.lastIntent = intent;
      state.confidence = confidence;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setChatSession: (state, action) => {
      state.chatSession = action.payload;
    },
    setSystemHealth: (state, action) => {
      state.systemHealth = action.payload;
    },
    setAvailableModels: (state, action) => {
      state.availableModels = action.payload;
    },
    clearChat: (state) => {
      state.messages = [state.messages[0]]; // Keep only the initial greeting
      state.error = null;
      state.lastIntent = null;
      state.confidence = null;
    },
    addSystemMessage: (state, action) => {
      const message = {
        content: action.payload.content,
        isUser: false,
        type: "system",
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random(),
      };
      state.messages.push(message);
    },
    updateMessageStatus: (state, action) => {
      const { id, status } = action.payload;
      const messageIndex = state.messages.findIndex((msg) => msg.id === id);
      if (messageIndex !== -1) {
        state.messages[messageIndex].status = status;
      }
    },
  },
});

export const {
  addMessage,
  addBotResponse,
  setLoading,
  setError,
  clearError,
  setChatSession,
  setSystemHealth,
  setAvailableModels,
  setModel,
  clearChat,
  addSystemMessage,
  updateMessageStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
