/* eslint-disable no-unused-vars */
// src/screens/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, validateResetToken } from "../store/authSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import image from "../assets/Computer troubleshooting-bro.png";
import {
  ArrowBack,
  Visibility,
  VisibilityOff,
  Lock,
} from "@mui/icons-material";

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

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get token and email from URL parameters
  const resetToken = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const {
    resetPasswordStatus,
    resetPasswordError,
    validateTokenStatus,
    validateTokenError,
  } = useSelector((state) => state.auth);

  // Validate token on component mount
  useEffect(() => {
    if (resetToken) {
      dispatch(validateResetToken(resetToken)).then((result) => {
        if (validateResetToken.fulfilled.match(result)) {
          setIsTokenValid(true);
          if (emailParam) {
            setFormData((prev) => ({ ...prev, email: emailParam }));
          }
        } else {
          setIsTokenValid(false);
        }
      });
    } else {
      setIsTokenValid(false);
    }
  }, [dispatch, resetToken, emailParam]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasNonalphas) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!formData.newPassword) {
      setError("Please enter a new password");
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const resultAction = await dispatch(
        resetPassword({
          email: formData.email,
          resetToken,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        })
      );

      if (resetPassword.fulfilled.match(resultAction)) {
        navigate("/login", {
          state: {
            message:
              "Password reset successfully! Please login with your new password.",
          },
        });
      } else if (resetPassword.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload;
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Failed to reset password. Please try again.");
    }
  };

  // Show loading while validating token
  if (isTokenValid === null) {
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
          sx={{ backgroundColor: "#f8f7fc" }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Validating reset token...
          </Typography>
        </Box>
        <Footer />
      </Box>
    );
  }

  // Show error if token is invalid
  if (isTokenValid === false) {
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
        >
          <Paper sx={{ p: 4, maxWidth: 400, textAlign: "center" }}>
            <Lock sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="error"
            >
              Invalid or Expired Token
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The password reset link is invalid or has expired. Please request
              a new password reset.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/forgot-password"
              startIcon={<ArrowBack />}
            >
              Request New Reset
            </Button>
          </Paper>
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
            alt="reset password illustration"
            style={{ width: "80%", maxWidth: "600px" }}
            loading="eager"
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
                  Réinitialiser le mot de passe
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  Entrez votre nouveau mot de passe
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
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                  error={!!error}
                  placeholder="exemple@email.com"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  label="Nouveau mot de passe"
                  type={showNewPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={formData.newPassword}
                  onChange={handleChange("newPassword")}
                  required
                  error={!!error}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  label="Confirmer le mot de passe"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  required
                  error={!!error}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
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
                disabled={resetPasswordStatus === "loading"}
              >
                {resetPasswordStatus === "loading" ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Réinitialiser le mot de passe"
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
