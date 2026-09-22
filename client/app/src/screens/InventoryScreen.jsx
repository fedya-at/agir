/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    loadData();
  }, [dispatch, tabValue]);

  const loadData = () => {
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
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchParts(searchQuery));
    } else {
      loadData();
    }
  };

  const handleAddNew = () => {
    dispatch(clearCurrentPart());
    navigate("/inventory/add");
  };

  const handleEdit = (id) => {
    navigate(`/inventory/edit/${id}`);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deletePart(deleteId)).unwrap();
      showSnackbar("Part deleted successfully", "success");
      setDeleteDialogOpen(false);
      loadData();
    } catch (err) {
      showSnackbar(err || "Failed to delete part", "error");
    }
  };

  const handleStockAdjustment = (part, type) => {
    setCurrentPart(part);
    setAdjustmentType(type);
    setAdjustmentQuantity(1);
    setStockDialogOpen(true);
  };

  const confirmStockAdjustment = async () => {
    if (adjustmentQuantity <= 0) {
      showSnackbar("Quantity must be greater than zero", "error");
      return;
    }

    try {
      if (adjustmentType === "add") {
        await dispatch(
          addStock({ id: currentPart.id, quantity: parseInt(adjustmentQuantity) })
        ).unwrap();
        showSnackbar("Stock added successfully", "success");
      } else {
        await dispatch(
          removeStock({
            id: currentPart.id,
            quantity: parseInt(adjustmentQuantity),
          })
        ).unwrap();
        showSnackbar("Stock removed successfully", "success");
      }
      setStockDialogOpen(false);
      loadData();
    } catch (err) {
      showSnackbar(err || "Failed to adjust stock", "error");
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    loadData();
    showSnackbar("Inventory refreshed", "info");
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchQuery("");
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const getStockPercentage = (part) => {
    if (!part.minStockLevel || part.minStockLevel === 0) return 100;
    const percentage = (part.stockQuantity / (part.minStockLevel * 2)) * 100;
    return Math.min(percentage, 100);
  };

  const displayedParts = parts || [];

  if (status === "loading" && (!parts || parts.length === 0)) {
    return <LoadingIndicator message="Loading inventory..." />;
  }

  if (status === "failed" && (!parts || parts.length === 0)) {
    return (
      <ErrorScreen
        type="server"
        message={error || "Failed to load inventory"}
        onRetry={loadData}
      />
    );
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
          Inventory Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddNew}
          >
            Add Part
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
              View All
            </Button>
          }
        >
          {lowStockParts.length} part(s) are low in stock and require attention!
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search parts..."
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
            Search
          </Button>
        </Box>
      </Paper>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Inventory sx={{ mr: 1 }} />
              All Parts
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
                Low Stock
              </Box>
            </Badge>
          }
        />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Price ($)</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Min Stock</TableCell>
              <TableCell align="center">Stock Level</TableCell>
              <TableCell align="center">Status</TableCell>
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
                <TableCell align="right">${part.price.toFixed(2)}</TableCell>
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
                        ? "Out of Stock"
                        : part.isLowStock
                        ? "Low Stock"
                        : "In Stock"
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
                  <Tooltip title="Add Stock">
                    <IconButton
                      onClick={() => handleStockAdjustment(part, "add")}
                      color="success"
                    >
                      <AddCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove Stock">
                    <IconButton
                      onClick={() => handleStockAdjustment(part, "remove")}
                      color="error"
                    >
                      <RemoveCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(part.id)}>
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
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
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this part? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)}>
        <DialogTitle>
          {adjustmentType === "add" ? "Add Stock" : "Remove Stock"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {adjustmentType === "add"
              ? `Add stock for ${currentPart?.name}`
              : `Remove stock for ${currentPart?.name}`}
            <br />
            Current stock: {currentPart?.stockQuantity}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="standard"
            value={adjustmentQuantity}
            onChange={(e) => setAdjustmentQuantity(Math.max(1, e.target.value))}
            InputProps={{
              inputProps: { min: 1 },
              endAdornment: (
                <InputAdornment position="end">units</InputAdornment>
              ),
            }}
          />
          {adjustmentType === "remove" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Ensure that remaining stock will not become negative
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmStockAdjustment} variant="contained">
            Confirm
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
