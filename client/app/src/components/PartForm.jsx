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
import ErrorScreen from "./ErrorScreen";

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
        toast.success("Part updated successfully");
      } else {
        await dispatch(createPart(formData)).unwrap();
        toast.success("Part created successfully");
      }
      navigate("/inventory");
    } catch (error) {
      toast.error(error.message || "Failed to save part");
    }
  };

  const handleAddStock = async () => {
    const adjustment = parseInt(stockAdjustment, 10);

    if (isNaN(adjustment) || adjustment <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    try {
      await dispatch(
        addStock({
          id,
          quantity: adjustment,
        })
      ).unwrap();

      await dispatch(fetchPartById(id));
      toast.success(`Added ${adjustment} units to stock`);
      setStockAdjustment(1);
    } catch (error) {
      console.error("Add stock error:", error);
      toast.error(error.message || "Failed to add stock");
    }
  };

  const handleRemoveStock = async () => {
    const adjustment = parseInt(stockAdjustment, 10);

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
          quantity: adjustment,
        })
      ).unwrap();

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
        message={error || "Failed to load part details"}
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
          {isEditing ? "Edit Part" : "Add New Part"}
        </Typography>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    inputProps: { min: 0, step: 0.01 },
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
                  label="Stock Quantity"
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
                  label="Minimum Stock Level"
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
                  Stock Management
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Adjustment Quantity"
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
                        Add Stock
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        startIcon={<Remove />}
                        onClick={handleRemoveStock}
                        disabled={status === "loading"}
                      >
                        Remove Stock
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>

                {formData.stockQuantity <= formData.minStockLevel && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Warning: Current stock is at or below the minimum threshold!
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
                Cancel
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
                  "Update Part"
                ) : (
                  "Create Part"
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
