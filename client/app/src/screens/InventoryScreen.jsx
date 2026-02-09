/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchParts,
  deletePart,
  searchParts,
  fetchLowStockParts,
  clearCurrentPart,
  selectAllParts,
  selectLowStockParts,
  selectPartsStatus,
  selectPartsError,
  addStock,
  removeStock,
} from "../store/partsSlice";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  LinearProgress,
  InputAdornment,
  DialogContentText,
  MenuItem,
  Select,
} from "@mui/material";
import {
  Add,
  Search,
  Delete,
  Edit,
  Inventory,
  Warning,
  Close,
  Refresh,
  Notifications,
  AddCircle,
  RemoveCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorScreen from "../components/ErrorScreen";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const InventoryScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPart, setCurrentPart] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const parts = useSelector(selectAllParts);
  const lowStockParts = useSelector(selectLowStockParts);
  const status = useSelector(selectPartsStatus);
  const error = useSelector(selectPartsError);

  const displayedParts = useMemo(() => {
    return tabValue === 0 ? parts : lowStockParts;
  }, [tabValue, parts, lowStockParts]);

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const loadData = useCallback(() => {
    if (tabValue === 0) {
      dispatch(fetchParts())
        .unwrap()
        .catch((err) => {
          showSnackbar("Failed to load parts", "error");
        });
    } else {
      dispatch(fetchLowStockParts())
        .unwrap()
        .catch((err) => {
          showSnackbar("Failed to load low stock parts", "error");
        });
    }
  }, [dispatch, tabValue, showSnackbar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      dispatch(searchParts(searchQuery))
        .unwrap()
        .then(() => showSnackbar("Search completed", "success"))
        .catch((err) => showSnackbar(err || "Search failed", "error"));
    } else {
      loadData(); // Reload all parts if the search query is empty
    }
  }, [searchQuery, dispatch, loadData, showSnackbar]);

  const handleDelete = useCallback((id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    dispatch(deletePart(deleteId))
      .unwrap()
      .then(() => {
        showSnackbar("Part deleted successfully", "success");
        loadData();
      })
      .catch((err) => showSnackbar("Failed to delete part", "error"));
    setDeleteDialogOpen(false);
    setDeleteId(null);
  }, [dispatch, deleteId, showSnackbar, loadData]);

  const handleEdit = (id) => {
    navigate(`/inventory/edit/${id}`);
  };

  const handleAddNew = () => {
    dispatch(clearCurrentPart());
    navigate("/inventory/new");
  };

  const handleStockAdjustment = (part, type) => {
    setCurrentPart(part);
    setAdjustmentType(type);
    setAdjustmentQuantity(1);
    setStockDialogOpen(true);
  };

  const confirmStockAdjustment = () => {
    // Validation for stock removal
    if (adjustmentType === "remove") {
      const newStock = currentPart.stockQuantity - adjustmentQuantity;
      if (newStock < 0) {
        showSnackbar(
          `Cannot remove ${adjustmentQuantity} units. Only ${currentPart.stockQuantity} units available in stock.`,
          "error"
        );
        return;
      }
      if (newStock < currentPart.minStockLevel) {
        showSnackbar(
          `Warning: Removing ${adjustmentQuantity} units will bring stock below minimum level (${currentPart.minStockLevel}). Current stock: ${currentPart.stockQuantity}`,
          "warning"
        );
        // Still allow the operation but with warning
      }
    }

    const action = adjustmentType === "add" ? addStock : removeStock;
    dispatch(action({ id: currentPart.id, quantity: adjustmentQuantity }))
      .unwrap()
      .then(() => {
        showSnackbar(
          `Stock ${
            adjustmentType === "add" ? "added" : "removed"
          } successfully`,
          "success"
        );
        loadData();
      })
      .catch((err) => {
        // Handle specific error messages from backend
        const errorMessage =
          err?.message ||
          err ||
          `Failed to ${adjustmentType === "add" ? "add" : "remove"} stock`;
        showSnackbar(errorMessage, "error");
      });
    setStockDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    loadData();
    showSnackbar("Inventory data refreshed", "success");
  };

  const getStockPercentage = useCallback((part) => {
    return Math.min(100, (part.stockQuantity / part.minStockLevel) * 100);
  }, []);

  if (status === "loading" && parts.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          mt: 4,
          padding: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Gestion du Stock
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddNew}
          >
            Ajouter Pièce
          </Button>
        </Box>
      </Box>

      {lowStockParts.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setTabValue(1)}
              endIcon={<Notifications />}
            >
              Voir Tout
            </Button>
          }
        >
          {lowStockParts.length} pièce(s) en stock faible nécessitent attention!
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher des pièces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={status === "loading"}
          >
            Rechercher
          </Button>
        </Box>
      </Paper>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Inventory sx={{ mr: 1 }} />
              Toutes les Pièces
            </Box>
          }
        />
        <Tab
          label={
            <Badge
              badgeContent={lowStockParts.length}
              color="error"
              overlap="circular"
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Warning sx={{ mr: 1 }} />
                Stock Faible
              </Box>
            </Badge>
          }
        />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Prix (DT)</TableCell>
              <TableCell align="right">Stock Actuel</TableCell>
              <TableCell align="right">Stock Minimum</TableCell>
              <TableCell align="center">Niveau de Stock</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedParts.map((part) => (
              <TableRow
                key={part.id}
                sx={{
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.description}</TableCell>
                <TableCell align="right">{part.price.toFixed(3)} DT</TableCell>
                <TableCell align="right">{part.stockQuantity}</TableCell>
                <TableCell align="right">{part.minStockLevel}</TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={getStockPercentage(part)}
                    color={
                      part.stockQuantity <= part.minStockLevel
                        ? "error"
                        : part.stockQuantity <= part.minStockLevel * 1.5
                        ? "warning"
                        : "success"
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      part.stockQuantity === 0
                        ? "En Rupture"
                        : part.isLowStock
                        ? "Stock Faible"
                        : "En Stock"
                    }
                    color={
                      part.stockQuantity === 0
                        ? "error"
                        : part.isLowStock
                        ? "warning"
                        : "success"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Ajouter Stock">
                    <IconButton
                      onClick={() => handleStockAdjustment(part, "add")}
                      color="success"
                    >
                      <AddCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Retirer Stock">
                    <IconButton
                      onClick={() => handleStockAdjustment(part, "remove")}
                      color="error"
                    >
                      <RemoveCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton onClick={() => handleEdit(part.id)}>
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={() => handleDelete(part.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la Suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cette pièce? Cette action est
          irréversible.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            startIcon={<Close />}
          >
            Annuler
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)}>
        <DialogTitle>
          {adjustmentType === "add" ? "Ajouter Stock" : "Retirer Stock"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {adjustmentType === "add"
              ? `Ajouter du stock pour ${currentPart?.name}`
              : `Retirer du stock pour ${currentPart?.name}`}
            <br />
            Stock actuel: {currentPart?.stockQuantity}
            <br />
            Stock minimum: {currentPart?.minStockLevel}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Quantité"
            type="number"
            fullWidth
            variant="standard"
            value={adjustmentQuantity}
            onChange={(e) =>
              setAdjustmentQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            InputProps={{
              inputProps: {
                min: 1,
                max:
                  adjustmentType === "remove"
                    ? currentPart?.stockQuantity
                    : undefined,
              },
              endAdornment: (
                <InputAdornment position="end">unités</InputAdornment>
              ),
            }}
          />
          {adjustmentType === "remove" && (
            <>
              {adjustmentQuantity > currentPart?.stockQuantity && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Quantité invalide: Vous ne pouvez pas retirer plus de{" "}
                  {currentPart?.stockQuantity} unités
                </Alert>
              )}
              {adjustmentQuantity <= currentPart?.stockQuantity &&
                currentPart?.stockQuantity - adjustmentQuantity <
                  currentPart?.minStockLevel && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Attention: Le stock restant (
                    {currentPart?.stockQuantity - adjustmentQuantity}) sera en
                    dessous du minimum requis ({currentPart?.minStockLevel})
                  </Alert>
                )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={confirmStockAdjustment}
            variant="contained"
            disabled={
              adjustmentType === "remove" &&
              adjustmentQuantity > currentPart?.stockQuantity
            }
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryScreen;
