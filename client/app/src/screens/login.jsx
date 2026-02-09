/* eslint-disable no-unused-vars */
// src/screens/Login.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/authSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import image from "../assets/Computer login-bro.png";
import toast from "react-hot-toast";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Animation variants (keep your existing animations)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};
const MotionButton = motion.create(Button);

export default function Login() {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(""); // State for login error
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    toast.dismiss();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setLoginError("");
    toast.dismiss();

    // Basic client-side validation
    if (!loginIdentifier.trim() || !password.trim()) {
      setLoginError("Please enter both email/username and password");
      return;
    }

    try {
      const resultAction = await dispatch(
        loginUser({ loginIdentifier, password })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Login successful!");
        navigate("/");
      } else if (loginUser.rejected.match(resultAction)) {
        // The payload is now just a string (the error message)
        const errorMessage = resultAction.payload;
        setLoginError(errorMessage);
        toast.error(errorMessage, { id: "login-error" });
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred";
      setLoginError(errorMessage);
      toast.error(errorMessage, { id: "login-error" });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <Box
        display="flex"
        flex={1}
        sx={{ flexGrow: 1, backgroundColor: "#f8f7fc" }}
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Side Illustration */}
        <Box
          flex={1}
          display={{ xs: "none", md: "flex" }}
          justifyContent="center"
          alignItems="center"
          bgcolor="#f8f7fc"
          component={motion.div}
          variants={itemVariants}
        >
          <motion.img
            src={image}
            alt="illustration"
            style={{ width: "80%", maxWidth: "600px" }}
            loading="eager"
            fetchpriority="high"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          />
        </Box>

        {/* Right Side Form */}
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Paper
            elevation={0}
            sx={{ px: 6, py: 8, width: "100%", maxWidth: 400 }}
            component={motion.div}
            variants={containerVariants}
          >
            <form onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Bienvenue !
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  Connectez-vous à votre compte
                </Typography>
              </motion.div>

              {/* Red Error Alert */}
              {loginError && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: "#ffebee",
                      border: "1px solid #f44336",
                      "& .MuiAlert-icon": {
                        color: "#f44336",
                      },
                    }}
                  >
                    {typeof loginError === "string"
                      ? loginError
                      : "Login error occurred"}
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <TextField
                  label="Email ou Nom d'utilisateur"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    if (loginError) setLoginError(""); // Clear error when user starts typing
                  }}
                  required
                  error={!!loginError}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError(""); // Clear error when user starts typing
                  }}
                  required
                  error={!!loginError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <MotionButton
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Se connecter"
                )}
              </MotionButton>

              <motion.div variants={itemVariants}>
                <Box mt={2} textAlign="center">
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <Link
                      to="/forgot-password"
                      style={{ textDecoration: "none" }}
                    >
                      <Typography component="span" color="primary">
                        Mot de passe oublié ?
                      </Typography>
                    </Link>
                  </Typography>
                  <Typography variant="body2">
                    Vous n'avez pas de compte ?{" "}
                    <Link to="/register" style={{ textDecoration: "none" }}>
                      <Typography component="span" color="primary">
                        Inscrivez-vous
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </motion.div>
            </form>
          </Paper>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
