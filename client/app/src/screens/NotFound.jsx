// src/screens/NotFound.jsx
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import image from "../assets/404.png";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MotionButton = motion.create(Button);

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          textAlign: "center",
        }}
      >
        <Box
          component={motion.div}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ maxWidth: 800, width: "50%" }}
        >
          <img
            src={image}
            alt="404 Not Found"
            style={{
              width: "50%",
              maxWidth: "600px",
              height: "auto",
            }}
          />
        </Box>

        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          component={motion.h1}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Oops! Page Not Found
        </Typography>

        <Typography
          variant="h7"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600 }}
          component={motion.p}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </Typography>

        <MotionButton
          variant="contained"
          size="large"
          component={Link}
          to="/"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: "bold",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go Back Home
        </MotionButton>
      </Box>

      <Footer />
    </Box>
  );
};

export default NotFound;
