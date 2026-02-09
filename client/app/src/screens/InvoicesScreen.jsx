/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  Send as SendIcon,
  CheckCircle as PaidIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  issueInvoice,
  markInvoiceAsPaid,
  cancelInvoice,
  downloadInvoicePdf,
  clearCurrentInvoice,
  fetchGlobalLaborCost,
  updateGlobalLaborCost,
} from "../store/invoiceSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import InvoiceModal from "../components/modals/InvoiceModal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useInterventionParts } from "../services/useInterventionParts";

// Status constants
const INVOICE_STATUS = {
  DRAFT: 0,
  ISSUED: 1,
  PAID: 2,
  CANCELLED: 3,
};

const STATUS_MAP = {
  [INVOICE_STATUS.DRAFT]: { label: "Draft", color: "default" },
  [INVOICE_STATUS.ISSUED]: { label: "Issued", color: "primary" },
  [INVOICE_STATUS.PAID]: { label: "Paid", color: "success" },
  [INVOICE_STATUS.CANCELLED]: { label: "Cancelled", color: "error" },
};

const STATUS_OPTIONS = [
  { value: INVOICE_STATUS.DRAFT, label: "Draft" },
  { value: INVOICE_STATUS.ISSUED, label: "Issued" },
  { value: INVOICE_STATUS.PAID, label: "Paid" },
  { value: INVOICE_STATUS.CANCELLED, label: "Cancelled" },
];

const InvoicesScreen = () => {
  const dispatch = useDispatch();
  const {
    items: invoices,
    currentInvoice,
    status,
    error,
  } = useSelector((state) => state.invoices);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState("create");
  const [formData, setFormData] = useState({
    interventionId: "",
    invoiceNumber: "",
    issueDate: dayjs(),
    dueDate: dayjs().add(30, "day"),
    laborCost: 0,
    totalPartsCost: 0,
    status: INVOICE_STATUS.DRAFT,
  });
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { globalLaborCost } = useSelector((state) => state.invoices);
  const [laborCostDialogOpen, setLaborCostDialogOpen] = useState(false);
  const [newLaborCost, setNewLaborCost] = useState(0);
  const {
    parts: interventionParts,
    getParts,
    isLoading: partsLoading,
  } = useInterventionParts();

  const [selectedInterventionId, setSelectedInterventionId] = useState(null);
  // When an invoice is selected, get its intervention ID and fetch parts
  useEffect(() => {
    if (selectedInvoice?.interventionId) {
      setSelectedInterventionId(selectedInvoice.interventionId);
      getParts(selectedInvoice.interventionId);
    }
  }, [selectedInvoice, getParts]);

  const invoiceModalProps = {
    open: modalOpen,
    onClose: () => setModalOpen(false),
    action: "view",
    invoiceId: selectedInvoice?.id,
    currentInvoice: selectedInvoice,
    client: selectedInvoice?.intervention?.client,
    parts: interventionParts, // Now using the parts from useInterventionParts
    onSuccess: (updatedInvoice) => {
      dispatch(fetchInvoices());
    },
  };

  // Fetch invoices on component mount
  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleOpenCreateDialog = () => {
    setCurrentAction("create");
    setFormData({
      interventionId: "",
      invoiceNumber: "",
      issueDate: dayjs(),
      dueDate: dayjs().add(30, "day"),
      laborCost: globalLaborCost || 0, // Use global labor cost as default
      totalPartsCost: 0,
      status: INVOICE_STATUS.DRAFT,
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (invoice) => {
    setCurrentAction("edit");
    setSelectedInvoiceId(invoice.id);
    setFormData({
      interventionId: invoice.interventionId,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: dayjs(invoice.issueDate), // Convert to Dayjs
      dueDate: dayjs(invoice.dueDate),
      laborCost: invoice.laborCost,
      totalPartsCost: invoice.totalPartsCost,
      status: invoice.status,
    });
    setOpenDialog(true);
  };

  const handleOpenViewDialog = (invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(clearCurrentInvoice());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === "status" ? Number(value) : value;
    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleSubmit = async () => {
    toast.loading(
      currentAction === "create" ? "Creating invoice..." : "Updating invoice..."
    );
    try {
      const formattedData = {
        ...formData,
        issueDate: format(formData.issueDate, "yyyy-MM-dd"),
        dueDate: format(formData.dueDate, "yyyy-MM-dd"),
      };

      if (currentAction === "create") {
        await dispatch(createInvoice(formattedData)).unwrap();
        toast.success("Invoice created successfully!");
      } else {
        await dispatch(
          updateInvoice({
            id: selectedInvoiceId,
            invoiceData: formattedData,
          })
        ).unwrap();
        toast.success("Invoice updated successfully!");
      }
      dispatch(fetchInvoices());
      handleCloseDialog();
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      toast.dismiss();
    }
  };

  const handleDelete = async (id) => {
    toast.loading("Cancelling invoice...");
    try {
      await dispatch(cancelInvoice(id)).unwrap();
      toast.success("Invoice cancelled successfully!");
      dispatch(fetchInvoices());
    } catch (error) {
      toast.error(error.message || "Failed to delete invoice");
    } finally {
      toast.dismiss();
    }
  };

  const handleIssueInvoice = async (id) => {
    toast.loading("Issuing invoice...");
    try {
      await dispatch(issueInvoice(id)).unwrap();
      toast.success("Invoice issued successfully!");
      dispatch(fetchInvoices());
    } catch (error) {
      toast.error(error.message || "Failed to issue invoice");
    } finally {
      toast.dismiss();
    }
  };

  const handleMarkAsPaid = async (id) => {
    toast.loading("Marking as paid...");
    try {
      await dispatch(markInvoiceAsPaid(id)).unwrap();
      toast.success("Invoice marked as paid!");
      dispatch(fetchInvoices());
    } catch (error) {
      toast.error(error.message || "Failed to mark invoice as paid");
    } finally {
      toast.dismiss();
    }
  };

  const handleCancelInvoice = async (id) => {
    toast.loading("Cancelling invoice...");
    try {
      await dispatch(cancelInvoice(id)).unwrap();
      toast.success("Invoice cancelled!");
      dispatch(fetchInvoices());
    } catch (error) {
      toast.error(error.message || "Failed to cancel invoice");
    } finally {
      toast.dismiss();
    }
  };

  const handleDownloadPdf = async (id) => {
    toast.loading("Downloading PDF...");
    try {
      await dispatch(downloadInvoicePdf(id)).unwrap();
      toast.success("PDF downloaded!");
    } catch (error) {
      toast.error(error.message || "Failed to download PDF");
    } finally {
      toast.dismiss();
    }
  };

  const handleRefresh = () => {
    toast.loading("Refreshing invoices...");
    dispatch(fetchInvoices()).finally(() => toast.dismiss());
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.intervention?.id &&
        invoice.intervention.id
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      STATUS_MAP[invoice.status]?.label === statusFilter;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    dispatch(fetchGlobalLaborCost());
  }, [dispatch]);

  const handleOpenLaborCostDialog = () => {
    setNewLaborCost(globalLaborCost || 0);
    setLaborCostDialogOpen(true);
  };

  const handleSaveLaborCost = async () => {
    try {
      await dispatch(updateGlobalLaborCost(newLaborCost)).unwrap();
      toast.success("Global labor cost updated successfully!");
      setLaborCostDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update global labor cost");
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",

          flexDirection: "column",
          background: "#f7f7f7",
        }}
      >
        <Navbar />
        <Box
          sx={{
            flex: 1,
            px: { xs: 1, md: 4 },
            py: { xs: 2, md: 4 },
            maxWidth: 1400,
            mx: "auto",
            width: "100%",
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 4, mt: 2 }}>
            Invoice Management
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Search Invoices"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.label}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
              >
                New Invoice
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleOpenLaborCostDialog}
              >
                Set Labor Cost
              </Button>
            </Box>
          </Box>
          {status === "loading" && invoices.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Intervention</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Labor Cost</TableCell>
                    <TableCell>Parts Cost</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        {invoice.intervention
                          ? `INT-${invoice.intervention.id.substring(0, 8)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.issueDate), "MM/dd/yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.dueDate), "MM/dd/yyyy")}
                      </TableCell>
                      <TableCell>${invoice.laborCost.toFixed(2)}</TableCell>
                      <TableCell>
                        ${invoice.totalPartsCost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        $
                        {(invoice.laborCost + invoice.totalPartsCost).toFixed(
                          2
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_MAP[invoice.status]?.label || "Unknown"}
                          color={STATUS_MAP[invoice.status]?.color || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                          }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenViewDialog(invoice)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPdf(invoice.id)}
                            >
                              <PdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(invoice)}
                              disabled={invoice.status !== INVOICE_STATUS.DRAFT}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(invoice.id)}
                              disabled={invoice.status !== INVOICE_STATUS.DRAFT}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {invoice.status === INVOICE_STATUS.DRAFT && (
                            <Tooltip title="Issue Invoice">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleIssueInvoice(invoice.id)}
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {invoice.status === INVOICE_STATUS.ISSUED && (
                            <Tooltip title="Mark as Paid">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleMarkAsPaid(invoice.id)}
                              >
                                <PaidIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(invoice.status === INVOICE_STATUS.DRAFT ||
                            invoice.status === INVOICE_STATUS.ISSUED) && (
                            <Tooltip title="Cancel Invoice">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelInvoice(invoice.id)}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {/* Create/Edit Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {currentAction === "create"
                ? "Create New Invoice"
                : "Edit Invoice"}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Invoice Number"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Intervention ID"
                    name="interventionId"
                    value={formData.interventionId}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Issue Date"
                    value={formData.issueDate}
                    onChange={(date) => handleDateChange("issueDate", date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Due Date"
                    value={formData.dueDate}
                    onChange={(date) => handleDateChange("dueDate", date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Labor Cost"
                    name="laborCost"
                    type="number"
                    value={formData.laborCost}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: "$",
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parts Cost"
                    name="totalPartsCost"
                    type="number"
                    value={formData.totalPartsCost}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: "$",
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleInputChange}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
              >
                {currentAction === "create" ? "Create" : "Update"}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={laborCostDialogOpen}
            onClose={() => setLaborCostDialogOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Set Global Labor Cost</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Labor Cost"
                  type="number"
                  value={newLaborCost}
                  onChange={(e) => setNewLaborCost(Number(e.target.value))}
                  InputProps={{
                    startAdornment: "$",
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLaborCostDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveLaborCost}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
          <InvoiceModal {...invoiceModalProps} />
        </Box>
        <Footer />
      </Box>
    </LocalizationProvider>
  );
};

export default InvoicesScreen;
