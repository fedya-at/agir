/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createIntervention } from "../store/interventionsSlice";

const ConsultScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); // Accéder aux données utilisateur depuis auth slice
  const { status } = useSelector((state) => state.interventions);

  const [formData, setFormData] = useState({
    description: "",
    startDate: new Date().toISOString(),
    technicianId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!formData.description) {
      toast.error("Veuillez fournir une description du problème.");
      setIsSubmitting(false);
      return;
    }

    const submissionData = {
      description: formData.description,
      startDate: new Date().toISOString(),
      clientId: user.id, // Utiliser user.id depuis UserDto
      technicianId: null,
    };

    toast.loading("Envoi de la demande d'intervention...");

    try {
      const resultAction = await dispatch(createIntervention(submissionData));

      if (createIntervention.fulfilled.match(resultAction)) {
        toast.success("Demande d'intervention soumise avec succès !");
        setFormData({ description: "" });
        setTimeout(() => navigate(`/client/interventions`), 3000); // Redirection vers /client/interventions
      } else if (createIntervention.rejected.match(resultAction)) {
        const errorMessage =
          resultAction.payload ||
          resultAction.error.message ||
          "Échec de la soumission de la demande d'intervention";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Erreur de soumission:", err);
      toast.error(err.message || "Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Veuillez vous connecter pour demander une intervention.
        </Typography>
        <Button variant="contained" color="primary" href="/login">
          Aller à la connexion
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box component="section" id="consult" sx={{ bgcolor: "#fff", py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="overline" color="primary">
              Assistance Technique
            </Typography>
            <Typography variant="h4" fontWeight={700} mb={4}>
              Demander une Intervention
            </Typography>

            <Paper
              elevation={3}
              sx={{
                p: 4,
                maxWidth: 800,
                mx: "auto",
                textAlign: "left",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Votre Informations
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography>
                  <strong>Nom d'utilisateur :</strong> {user.username}
                </Typography>
                <Typography>
                  <strong>Email :</strong> {user.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "grid",
                  gap: 2,
                }}
              >
                <TextField
                  label="Description du problème"
                  name="description"
                  required
                  multiline
                  rows={6}
                  fullWidth
                  variant="outlined"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Veuillez décrire votre problème en détail..."
                />

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={status === "loading"}
                    sx={{
                      borderRadius: 5,
                      px: 5,
                      py: 1.5,
                      textTransform: "uppercase",
                      fontWeight: 600,
                      minWidth: 200,
                      backgroundColor: "#b8ff00",
                      color: "#000000",
                      "&:hover": {
                        backgroundColor: "#a3e600",
                      },
                    }}
                  >
                    {status === "loading" ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Soumettre la Demande"
                    )}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default ConsultScreen;
