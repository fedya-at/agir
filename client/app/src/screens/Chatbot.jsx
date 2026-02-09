import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addMessage,
  addBotResponse,
  setLoading,
  setError,
  clearError,
} from "../store/chatSlice";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Container,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  Wifi as WifiIcon,
  BugReport as BugReportIcon,
  Computer as ComputerIcon,
  Print as PrintIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  HealthAndSafety as HealthIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

//
const FLASK_BACKEND_URL = "http://127.0.0.1:5001";

// All API endpoints are built from this ngrok base URL.
const RAG_API_BASE_URL = `${FLASK_BACKEND_URL}/api/rag_query`;
const HEALTH_API_URL = `${FLASK_BACKEND_URL}/health`;
const MODELS_API_URL = `${FLASK_BACKEND_URL}/api/models`;
const CLEAR_MEMORY_API_URL = `${FLASK_BACKEND_URL}/api/clear_memory`;
const quickQuestions = [
  { text: "My computer is running slowly", icon: <SpeedIcon /> },
  { text: "I cannot connect to the internet", icon: <WifiIcon /> },
  { text: "My software won't open", icon: <BugReportIcon /> },
  { text: "Blue screen error", icon: <ComputerIcon /> },
  { text: "Printer not working", icon: <PrintIcon /> },
];

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(""); // Start with empty string
  const [availableModels, setAvailableModels] = useState([]); // Start with an empty array
  const [healthStatus, setHealthStatus] = useState(null);
  const healthCheckInterval = useRef(null);
  const [showHealthDialog, setShowHealthDialog] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const { messages, isLoading, error } = useSelector((state) => state.chat);
  const { user: authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 6000,
        position: "bottom-center",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const checkHealthStatus = async () => {
    try {
      // The fetch call now uses ngrok URL with the required headers
      const response = await fetch(HEALTH_API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Health check failed.");
      }
      const health = await response.json();
      setHealthStatus(health);

      if (health.rag_initialized) {
        toast.success("System is healthy and ready!", { id: "health-toast" });
        if (healthCheckInterval.current) {
          clearInterval(healthCheckInterval.current);
        }
      } else {
        toast.loading("Backend is initializing... Please wait.", {
          id: "health-toast",
        });
      }
    } catch (error) {
      console.error("Failed to fetch health status:", error);
      toast.error(`Connection Error: ${error.message}`, {
        id: "health-toast",
      });
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
    }
  };

  const fetchAvailableModels = async () => {
    try {
      // The fetch call now uses ngrok URL with the required headers
      const response = await fetch(MODELS_API_URL, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
          // Set the default model to the first one in the list if no model is selected
          if (!selectedModel) {
            setSelectedModel(data.models[0].name);
          }
          toast.success("Models updated successfully", { duration: 2000 });
        } else {
          // If no models available, set fallback
          setAvailableModels([]);
          setSelectedModel("");
          toast.warn("No models available", { duration: 2000 });
        }
      } else {
        throw new Error(
          `Failed to fetch models: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Failed to fetch available models:", error);
      toast.error(`Failed to fetch available models: ${error.message}`, {
        duration: 5000,
      });
      // Set fallback values on error
      setAvailableModels([]);
      setSelectedModel("");
    }
  };

  // --- STEP 3: SIMPLIFIED useEffect TO RUN ON COMPONENT MOUNT ---
  // This now runs once when the component loads, and starts polling for health.
  useEffect(() => {
    const initializeApp = async () => {
      await fetchAvailableModels(); // Fetch models on load
      await checkHealthStatus(); // Initial health check
    };

    initializeApp();
    healthCheckInterval.current = setInterval(checkHealthStatus, 5000); // Poll every 5 seconds

    // Cleanup function to stop polling when the component is unmounted
    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
    };
  }, []); // Empty dependency array means this runs only once.

  const clearMemory = async () => {
    const toastId = toast.loading("Clearing conversation memory...");
    try {
      const response = await fetch(CLEAR_MEMORY_API_URL, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      if (response.ok) {
        dispatch(clearError());
        dispatch(
          addBotResponse({
            response: "Conversation memory has been cleared. Starting fresh!",
            type: "system",
            id: Date.now() + Math.random(),
          })
        );
        toast.success("Conversation memory cleared successfully!", {
          id: toastId,
        });
      } else {
        throw new Error(
          `Failed to clear memory: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Failed to clear memory:", error);
      toast.error(`Failed to clear conversation memory: ${error.message}`, {
        id: toastId,
      });
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50;
      setAutoScroll(isAtBottom);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!healthStatus || !healthStatus.rag_initialized) {
      toast.error(
        "The backend is still initializing or not ready. Please wait.",
        { duration: 5000 }
      );
      return;
    }

    if (!selectedModel) {
      toast.error("Please select an AI model first.", { duration: 3000 });
      return;
    }

    const userMessage = {
      content: input,
      isUser: true,
      type: "user_input",
    };
    dispatch(addMessage(userMessage));
    const messageText = input;
    setInput("");
    setAutoScroll(true);
    dispatch(setLoading(true));
    dispatch(clearError());

    let accumulatedResponse = "";
    let botMessageId = Date.now() + Math.random();

    dispatch(
      addBotResponse({ response: "", type: "ai_model", id: botMessageId })
    );

    try {
      // --- STEP 4: NGROK FETCH CALL WITH REQUIRED HEADERS FOR CORS ---
      const response = await fetch(RAG_API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          question: messageText,
          model: selectedModel,
        }),
      });

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment.");
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          accumulatedResponse += chunk;
        }
        dispatch(
          addBotResponse({
            response: accumulatedResponse,
            type: "ai_model",
            id: botMessageId,
          })
        );
      }
    } catch (error) {
      console.error("Error communicating with RAG server:", error);
      toast.error(error.message, { duration: 6000 });
      dispatch(
        addBotResponse({
          response: `Sorry, an error occurred: ${error.message}`,
          type: "error",
          id: botMessageId,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    toast.success(`Quick question selected: ${question}`, {
      duration: 2000,
      icon: "💡",
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getMessageIcon = (message) => {
    if (message.isUser) return null;

    switch (message.type) {
      case "greeting":
        return <BotIcon sx={{ fontSize: 20, color: "#ffffff" }} />;
      case "troubleshooting":
        return <BugReportIcon sx={{ fontSize: 20, color: "#ffffff" }} />;
      case "ai_model":
        return <PsychologyIcon sx={{ fontSize: 20, color: "#ffffff" }} />;
      case "system":
        return <InfoIcon sx={{ fontSize: 20, color: "#ffffff" }} />;
      case "rate_limit":
        return <SpeedIcon sx={{ fontSize: 20, color: "#ffffff" }} />;
      default:
        return <BotIcon sx={{ fontSize: 20, color: "#ffffff" }} />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (!confidence) return "#9ca3af";
    if (confidence > 0.8) return "#22c55e"; // Green
    if (confidence > 0.6) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  const getHealthStatusColor = (status) => {
    if (!status) return "#9ca3af";
    switch (status.status) {
      case "healthy":
        return "#22c55e";
      case "initializing":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "100vh",
          background: "#f0f2f5",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                color: "#333333",
                mb: 1,
                fontWeight: 600,
                fontSize: "2.5rem",
                "@media (max-width:600px)": {
                  fontSize: "2rem",
                },
              }}
            >
              Hi there,{" "}
              <Box component="span" sx={{ color: "#4CAF50" }}>
                {authUser?.username || "Assistant"}
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "#555555",
                mb: 4,
                fontWeight: 400,
                fontSize: "1.25rem",
              }}
            >
              What would you like to know?
            </Typography>

            {/* System Status and Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mb: 3,
                flexWrap: "wrap",
              }}
            >
              <Tooltip title="Check system health">
                <IconButton
                  onClick={() => setShowHealthDialog(true)}
                  sx={{
                    color: getHealthStatusColor(healthStatus),
                    border: `2px solid ${getHealthStatusColor(healthStatus)}`,
                  }}
                >
                  <HealthIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Refresh models">
                <IconButton onClick={fetchAvailableModels}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Clear conversation memory">
                <IconButton onClick={clearMemory} sx={{ color: "#f59e0b" }}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Quick Questions */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "center",
                mb: 2,
              }}
            >
              {quickQuestions.map((question, index) => (
                <Chip
                  key={index}
                  icon={question.icon}
                  label={question.text}
                  onClick={() => handleQuickQuestion(question.text)}
                  sx={{
                    backgroundColor: "#e0e0e0",
                    color: "#333333",
                    border: "1px solid #cccccc",
                    "&:hover": {
                      backgroundColor: "#d0d0d0",
                      borderColor: "#bbbbbb",
                    },
                    "& .MuiChip-icon": {
                      color: "#4CAF50",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Model Selection */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <FormControl
              sx={{ minWidth: 200, backgroundColor: "white", borderRadius: 1 }}
            >
              <InputLabel id="model-select-label">AI Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={selectedModel}
                label="AI Model"
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  toast.success(`Model changed to ${e.target.value}`, {
                    duration: 2000,
                    icon: "🤖",
                  });
                }}
                size="small"
                disabled={availableModels.length === 0}
                displayEmpty
                sx={{
                  "& .MuiSelect-select": {
                    py: 1,
                  },
                }}
              >
                {availableModels.length === 0 && (
                  <MenuItem value="" disabled>
                    No models available
                  </MenuItem>
                )}
                {availableModels.map((model) => (
                  <MenuItem key={model.name} value={model.name}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Chat Interface */}
          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              overflow: "hidden",
              height: "70vh",
              display: "flex",
              flexDirection: "column",
              mt: 3,
            }}
          >
            {/* Messages Area */}
            <Box
              ref={messagesContainerRef}
              onScroll={handleScroll}
              sx={{
                flex: 1,
                p: 3,
                overflowY: "auto",
                backgroundColor: "#f8f8f8",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                maxHeight: "calc(70vh - 120px)",
                scrollBehavior: "smooth",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#e0e0e0",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#cccccc",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "#bbbbbb",
                  },
                },
                scrollbarWidth: "thin",
                scrollbarColor: "#cccccc #e0e0e0",
              }}
            >
              {messages.length === 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#4CAF50",
                      width: 64,
                      height: 64,
                      border: "2px solid #81C784",
                    }}
                  >
                    <BotIcon sx={{ fontSize: 32, color: "#ffffff" }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#555555",
                      textAlign: "center",
                    }}
                  >
                    Welcome! Ask me anything about computer troubleshooting.
                  </Typography>
                </Box>
              )}

              {messages.map((message, index) => (
                <Box
                  key={message.id || index}
                  sx={{
                    display: "flex",
                    justifyContent: message.isUser ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    gap: 2,
                    opacity: 1,
                    animation: "fadeInUp 0.3s ease-out",
                    "@keyframes fadeInUp": {
                      "0%": {
                        opacity: 0,
                        transform: "translateY(20px)",
                      },
                      "100%": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  {!message.isUser && (
                    <Avatar
                      sx={{
                        bgcolor: "#4CAF50",
                        width: 36,
                        height: 36,
                        border: "2px solid #81C784",
                        flexShrink: 0,
                      }}
                    >
                      {getMessageIcon(message)}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: "70%", minWidth: "20%" }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2.5,
                        borderRadius: message.isUser
                          ? "15px 4px 15px 15px"
                          : "4px 15px 15px 15px",
                        backgroundColor: message.isUser ? "#e0e0e0" : "#e8f5e9",
                        color: "#333333",
                        border: message.isUser ? "none" : "1px solid #c8e6c9",
                        wordBreak: "break-word",
                        position: "relative",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          fontSize: "14px",
                        }}
                      >
                        {message.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          color: message.isUser ? "#666" : "#4CAF50",
                          mt: 1,
                          fontSize: "0.7rem",
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Paper>
                    {!message.isUser &&
                      (message.intent || message.confidence) && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          {message.intent && (
                            <Chip
                              label={message.intent}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: "20px",
                                backgroundColor: "#e0e0e0",
                                color: "#333333",
                              }}
                            />
                          )}
                          {message.confidence && (
                            <Chip
                              label={`${(message.confidence * 100).toFixed(
                                1
                              )}%`}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: "20px",
                                backgroundColor: getConfidenceColor(
                                  message.confidence
                                ),
                                color: "white",
                              }}
                            />
                          )}
                        </Box>
                      )}
                  </Box>
                  {message.isUser && (
                    <Avatar
                      sx={{
                        bgcolor: "#bdbdbd",
                        width: 36,
                        height: 36,
                        border: "2px solid #e0e0e0",
                        flexShrink: 0,
                      }}
                    >
                      {authUser?.username?.charAt(0)?.toUpperCase() || (
                        <PersonIcon sx={{ fontSize: 20, color: "#ffffff" }} />
                      )}
                    </Avatar>
                  )}
                </Box>
              ))}

              {isLoading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 2,
                    opacity: 1,
                    animation: "fadeInUp 0.3s ease-out",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#4CAF50",
                      width: 36,
                      height: 36,
                      border: "2px solid #81C784",
                      flexShrink: 0,
                    }}
                  >
                    <BotIcon sx={{ fontSize: 20, color: "#ffffff" }} />
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      maxWidth: "70%",
                      p: 2.5,
                      borderRadius: "4px 15px 15px 15px",
                      backgroundColor: "#e8f5e9",
                      border: "1px solid #c8e6c9",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <CircularProgress size={16} sx={{ color: "#4CAF50" }} />
                      <Typography
                        variant="body1"
                        sx={{ color: "#333333", fontSize: "14px" }}
                      >
                        Analyzing your message...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
              sx={{
                p: 3,
                backgroundColor: "#ffffff",
                borderTop: "1px solid #e0e0e0",
                flexShrink: 0,
              }}
            >
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-end",
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  variant="outlined"
                  placeholder="Describe your computer issue or ask a technical question..."
                  value={input}
                  onKeyPress={handleKeyPress}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 12,
                      backgroundColor: "#f0f0f0",
                      "& fieldset": {
                        borderColor: "#cccccc",
                      },
                      "&:hover fieldset": {
                        borderColor: "#bbbbbb",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4CAF50",
                      },
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "14px",
                      color: "#333333",
                      "&::placeholder": {
                        color: "#777777",
                        opacity: 1,
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!input.trim() || isLoading}
                  startIcon={<SendIcon />}
                  sx={{
                    backgroundColor: "#4CAF50",
                    color: "#ffffff",
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    borderRadius: 12,
                    fontWeight: 500,
                    minWidth: "auto",
                    "&:hover": {
                      backgroundColor: "#388E3C",
                    },
                    "&:disabled": {
                      backgroundColor: "#cccccc",
                      color: "#999999",
                    },
                  }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Health Status Dialog */}
      <Dialog
        open={showHealthDialog}
        onClose={() => setShowHealthDialog(false)}
      >
        <DialogTitle>System Health Status</DialogTitle>
        <DialogContent>
          {healthStatus ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2">Overall Status:</Typography>
                <Chip
                  label={healthStatus.status}
                  size="small"
                  sx={{
                    backgroundColor: getHealthStatusColor(healthStatus),
                    color: "white",
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2">Ollama Connected:</Typography>
                <Chip
                  label={healthStatus.ollama_connected ? "Yes" : "No"}
                  size="small"
                  sx={{
                    backgroundColor: healthStatus.ollama_connected
                      ? "#22c55e"
                      : "#ef4444",
                    color: "white",
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2">Vectorstore Ready:</Typography>
                <Chip
                  label={healthStatus.vectorstore_ready ? "Yes" : "No"}
                  size="small"
                  sx={{
                    backgroundColor: healthStatus.vectorstore_ready
                      ? "#22c55e"
                      : "#ef4444",
                    color: "white",
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2">RAG Initialized:</Typography>
                <Chip
                  label={healthStatus.rag_initialized ? "Yes" : "No"}
                  size="small"
                  sx={{
                    backgroundColor: healthStatus.rag_initialized
                      ? "#22c55e"
                      : "#ef4444",
                    color: "white",
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Typography>Loading health status...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={checkHealthStatus}>Refresh</Button>
          <Button onClick={() => setShowHealthDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default Chatbot;
