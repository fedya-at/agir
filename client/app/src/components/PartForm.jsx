/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchPartById,
  createPart,
  updatePart,
  addStock,
  removeStock,
  selectPartsStatus,
  selectCurrentPart,
  selectPartsError,
} from "../store/partsSlice";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  Stack,
} from "@mui/material";
import { Save, Cancel, Add, Remove, Inventory } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackButton from "./BackButton";

const PartForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const currentPart = useSelector(selectCurrentPart);
  const status = useSelector(selectPartsStatus);
  const error = useSelector(selectPartsError);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    minStockLevel: 0,
  });
  const [stockAdjustment, setStockAdjustment] = useState(1);
  const [stockError, setStockError] = useState("");

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchPartById(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && currentPart) {
      setFormData({
        name: currentPart.name,
        description: currentPart.description,
        price: currentPart.price,
        stockQuantity: currentPart.stockQuantity,
        minStockLevel: currentPart.minStockLevel,
      });
    }
  }, [currentPart, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const validateStockAdjustment = (operation) => {
    const adjustment = parseInt(stockAdjustment) || 0;
    if (adjustment <= 0) {
      setStockError("Quantity must be greater than 0");
      return false;
    }

    if (operation === "remove" && adjustment > formData.stockQuantity) {
      setStockError(
        `Cannot remove more than current stock (${formData.stockQuantity})`
      );
      return false;
    }

    setStockError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await dispatch(
          updatePart({
            id,
            partData: {
              name: formData.name,
              description: formData.description,
              price: formData.price,
              minStockLevel: formData.minStockLevel,
            },
          })
        ).unwrap();
        toast.success("Pièce mise à jour avec succès");
      } else {
        await dispatch(createPart(formData)).unwrap();
        toast.success("Pièce créée avec succès");
      }
      navigate("/inventory");
    } catch (error) {
      toast.error(error.message || "Échec de l'enregistrement de la pièce");
    }
  };

  const handleAddStock = async () => {
    const adjustment = parseInt(stockAdjustment, 10); // Ensure quantity is a number

    if (isNaN(adjustment) || adjustment <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    try {
      await dispatch(
        addStock({
          id,
          quantity: adjustment, // Pass quantity as a number
        })
      ).unwrap();

      // Refresh the part data
      await dispatch(fetchPartById(id));
      toast.success(`Added ${adjustment} units to stock`);
      setStockAdjustment(1);
    } catch (error) {
      console.error("Add stock error:", error);
      toast.error(error.message || "Failed to add stock");
    }
  };

  const handleRemoveStock = async () => {
    const adjustment = parseInt(stockAdjustment, 10); // Ensure quantity is a number

    if (isNaN(adjustment) || adjustment <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    if (adjustment > formData.stockQuantity) {
      toast.error("Cannot remove more stock than available");
      return;
    }

    try {
      await dispatch(
        removeStock({
          id,
          quantity: adjustment, // Pass quantity as a number
        })
      ).unwrap();

      // Refresh the part data
      await dispatch(fetchPartById(id));
      toast.success(`Removed ${adjustment} units from stock`);
      setStockAdjustment(1);
    } catch (error) {
      console.error("Remove stock error:", error);
      toast.error(error.message || "Failed to remove stock");
    }
  };

  if (isEditing && status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEditing && status === "failed") {
    return (
      <ErrorScreen
        type="server"
        message={error || "Échec du chargement des données de la pièce"}
        onRetry={() => dispatch(fetchPartById(id))}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Navbar />
      <BackButton />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditing ? "Modifier la Pièce" : "Ajouter une Nouvelle Pièce"}
        </Typography>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prix"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">DT</InputAdornment>
                    ),
                    inputProps: { min: 0, step: 0.001 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quantité en Stock"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleNumericChange}
                  required
                  disabled={isEditing}
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Niveau Minimum de Stock"
                  name="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={handleNumericChange}
                  required
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  <Inventory sx={{ verticalAlign: "middle", mr: 1 }} />
                  Gestion du Stock
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Quantité d'ajustement"
                      type="number"
                      value={stockAdjustment}
                      onChange={(e) => setStockAdjustment(e.target.value)}
                      InputProps={{
                        inputProps: { min: 1 },
                      }}
                      error={!!stockError}
                      helperText={stockError}
                    />
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<Add />}
                        onClick={handleAddStock}
                        disabled={status === "loading"}
                      >
                        Ajouter Stock
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        startIcon={<Remove />}
                        onClick={handleRemoveStock}
                        disabled={status === "loading"}
                      >
                        Retirer Stock
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>

                {formData.stockQuantity <= formData.minStockLevel && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Attention: Le stock actuel est en dessous ou égal au niveau
                    minimum!
                  </Alert>
                )}
              </>
            )}

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate("/inventory")}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <CircularProgress size={24} />
                ) : isEditing ? (
                  "Mettre à Jour"
                ) : (
                  "Créer Pièce"
                )}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default PartForm;
