import React, { useState } from "react";
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerClient } from "../store/authSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import image from "../assets/Add User-rafiki.png";
import toast from "react-hot-toast";

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

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registerStatus } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTogglePassword = () => {
    setShowPassword((show) => !show);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss(); // Clear any existing toasts

    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Veuillez entrer un email valide.");
      return;
    }

    if (formData.password.length < 8 || !/\d/.test(formData.password)) {
      toast.error(
        "Le mot de passe doit contenir au moins 8 caractères et un chiffre."
      );
      return;
    }
    const registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
    };

    const result = await dispatch(registerClient(registrationData));

    if (result.payload) {
      setTimeout(() => navigate("/login"), 1500); // Redirect after success
    }
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
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 3, sm: 4, md: 5 },
              width: "100%",
              maxWidth: 340,
              mx: "auto",
            }}
            component={motion.div}
            variants={containerVariants}
          >
            <form onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Bienvenue !
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Créez votre compte
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <TextField
                  label="Nom d'utilisateur"
                  name="username"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TextField
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  value={formData.password}
                  onChange={handleChange}
                  helperText="8+ caractères"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TextField
                  label="Nom complet"
                  name="name"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TextField
                  label="Numéro de téléphone"
                  name="phone"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TextField
                  label="Adresse"
                  name="address"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MotionButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={registerStatus === "loading"}
                >
                  {registerStatus === "loading" ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "S'inscrire"
                  )}
                </MotionButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Box mt={2} textAlign="center">
                  <Typography variant="body2">
                    Vous avez déjà un compte ?{" "}
                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <Typography component="span" color="primary">
                        Connectez-vous
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
