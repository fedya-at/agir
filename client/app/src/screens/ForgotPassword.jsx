/* eslint-disable no-unused-vars */
// src/screens/ForgotPassword.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../store/authSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import image from "../assets/Computer troubleshooting-bro.png";
import { ArrowBack, Email } from "@mui/icons-material";

// Animation variants
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forgotPasswordStatus, forgotPasswordError } = useSelector(
    (state) => state.auth
  );

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Use the real API from auth slice
      const resultAction = await dispatch(forgotPassword(email));

      if (forgotPassword.fulfilled.match(resultAction)) {
        setIsSubmitted(true);
      } else if (forgotPassword.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload;
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Failed to send password reset email. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />

        <Box
          display="flex"
          flex={1}
          justifyContent="center"
          alignItems="center"
          sx={{ backgroundColor: "#f8f7fc", px: 2 }}
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card
            sx={{ maxWidth: 500, width: "100%" }}
            component={motion.div}
            variants={itemVariants}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <motion.div variants={itemVariants}>
                <Email sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Email Sent Successfully!
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  We've sent a password reset email to <strong>{email}</strong>.
                  Please check your inbox and follow the instructions to reset
                  your password.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> You will receive a temporary
                    password that must be changed upon your first login for
                    security reasons.
                  </Typography>
                </Alert>
              </motion.div>

              <motion.div variants={itemVariants}>
                <MotionButton
                  variant="contained"
                  onClick={() => navigate("/login")}
                  startIcon={<ArrowBack />}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Login
                </MotionButton>
              </motion.div>
            </CardContent>
          </Card>
        </Box>

        <Footer />
      </Box>
    );
  }

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
            alt="forgot password illustration"
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
          sx={{ px: 2 }}
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
                  Mot de passe oublié ?
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  Entrez votre adresse email et nous vous enverrons un nouveau
                  mot de passe
                </Typography>
              </motion.div>

              {/* Error Alert */}
              {error && (
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
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <TextField
                  label="Adresse email"
                  type="email"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(""); // Clear error when user starts typing
                  }}
                  required
                  error={!!error}
                  placeholder="exemple@email.com"
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
                disabled={forgotPasswordStatus === "loading"}
              >
                {forgotPasswordStatus === "loading" ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Envoyer le nouveau mot de passe"
                )}
              </MotionButton>

              <motion.div variants={itemVariants}>
                <Box mt={3} textAlign="center">
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <Typography
                      component="span"
                      color="primary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <ArrowBack fontSize="small" />
                      Retour à la connexion
                    </Typography>
                  </Link>
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
