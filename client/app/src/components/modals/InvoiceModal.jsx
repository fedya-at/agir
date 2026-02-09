/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Typography,
  Modal,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import {
  Close,
  FileDownload,
  Receipt,
  Paid,
  Cancel,
  Edit,
  Save,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import StyledCard from "../StyledCard";
import InvoiceManager from "../InvoiceManager";
import StatusChip from "../StatusChip";
import dayjs from "dayjs";
import {
  fetchInvoiceById,
  issueInvoice,
  markInvoiceAsPaid,
  cancelInvoice,
  updateInvoice,
  downloadInvoicePdf,
} from "../../store/invoiceSlice";
import { getServiceTypeLabel } from "../../utils/serviceTypes";

const InvoiceModal = ({
  open,
  onClose,
  action,
  invoiceId,
  interventionId,
  onSuccess,
  client,
  parts,
  currentInvoice,
  intervention, // Add intervention prop
}) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.invoices);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(null);
  const [localInvoiceAction, setLocalInvoiceAction] = useState(action);

  useEffect(() => {
    if (open && invoiceId && localInvoiceAction === "view" && !currentInvoice) {
      dispatch(fetchInvoiceById(invoiceId));
    }
    if (currentInvoice) {
      setEditedInvoice({ ...currentInvoice });
    }
  }, [open, invoiceId, localInvoiceAction, dispatch, currentInvoice]);

  const handleAction = async (type) => {
    try {
      let result;
      switch (type) {
        case "issue":
          result = await dispatch(issueInvoice(invoiceId)).unwrap();
          break;
        case "markPaid":
          result = await dispatch(markInvoiceAsPaid(invoiceId)).unwrap();
          break;
        case "cancel":
          result = await dispatch(cancelInvoice(invoiceId)).unwrap();
          break;
        case "download":
          setIsDownloading(true);
          try {
            await dispatch(downloadInvoicePdf(invoiceId)).unwrap();
            toast.success("Invoice downloaded successfully!");
          } finally {
            setIsDownloading(false);
          }
          return;
        case "edit":
          setIsEditing(true);
          return;
        case "save":
          result = await dispatch(
            updateInvoice({
              id: invoiceId,
              invoiceData: editedInvoice,
            })
          ).unwrap();
          setIsEditing(false);
          break;
        default:
          break;
      }
      onSuccess(result);
      toast.success(`Invoice ${type}d successfully!`);
      if (type !== "edit" && type !== "save") onClose();
    } catch (error) {
      toast.error(`Failed to ${type} invoice: ${error.message}`);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === "loading") {
    return <CircularProgress />;
  }
  // In InvoiceModal component
  const actualParts =
    parts ||
    currentInvoice?.intervention?.interventionParts ||
    currentInvoice?.parts ||
    [];
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <StyledCard sx={{ width: 900, maxWidth: "95vw", p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            {localInvoiceAction === "generate"
              ? "Generate Invoice"
              : "Invoice Management"}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {localInvoiceAction === "view" && currentInvoice ? (
          <>
            <InvoiceHeader
              invoice={isEditing ? editedInvoice : currentInvoice}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
            <Divider sx={{ my: 2 }} />
            <InvoiceDetails
              invoice={isEditing ? editedInvoice : currentInvoice}
              client={client}
              parts={parts}
              intervention={intervention}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
            <Divider sx={{ my: 2 }} />
            <InvoiceActions
              invoice={currentInvoice}
              onAction={handleAction}
              isEditing={isEditing}
              isDownloading={isDownloading}
            />
          </>
        ) : (
          <InvoiceManager
            interventionId={interventionId}
            invoiceId={invoiceId}
            mode={action}
            currentInvoice={currentInvoice}
            onSuccess={(invoice) => {
              onSuccess(invoice);
              onClose();
            }}
            onClose={onClose}
          />
        )}
      </StyledCard>
    </Modal>
  );
};

const InvoiceHeader = ({ invoice, isEditing, onFieldChange }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
    <Box>
      {isEditing ? (
        <TextField
          label="Invoice Number"
          value={invoice.invoiceNumber}
          onChange={(e) => onFieldChange("invoiceNumber", e.target.value)}
          fullWidth
          margin="normal"
        />
      ) : (
        <Typography variant="h6" fontWeight={600}>
          Invoice #{invoice.invoiceNumber}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        Created: {dayjs(invoice.createdAt).format("MMM D, YYYY")}
      </Typography>
    </Box>
    <Box sx={{ textAlign: "right" }}>
      <StatusChip status={invoice.status} type="invoice" size="medium" />
      <Typography variant="body2" color="text.secondary">
        Intervention: #{invoice.interventionId?.split("-")[0] || "N/A"}
      </Typography>
    </Box>
  </Box>
);

const InvoiceDetails = ({
  invoice,
  client,
  parts,
  intervention,
  isEditing,
  onFieldChange,
}) => {
  const tvaRate = 0.2;
  const laborCost = invoice.laborCost;
  const partsCost = invoice.totalPartsCost;
  const subtotal = laborCost + partsCost;
  const tvaAmount = subtotal * tvaRate;
  const totalWithTva = subtotal + tvaAmount;

  const serviceInfo = intervention
    ? {
        serviceType: getServiceTypeLabel(intervention.serviceType),
        serviceDetails: intervention.serviceDetails || "No details provided",
      }
    : null;

  return (
    <Grid container spacing={3}>
      {/* Client Information (keep existing) */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Client Information
        </Typography>
        <Typography>Name: {client?.name || "N/A"}</Typography>
        <Typography>Email: {client?.email || "N/A"}</Typography>
      </Grid>

      {/* Invoice Dates (keep existing) */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Invoice Dates
        </Typography>
        {isEditing ? (
          <>
            <TextField
              label="Issue Date"
              type="date"
              value={dayjs(invoice.issueDate).format("YYYY-MM-DD")}
              onChange={(e) => onFieldChange("issueDate", e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Due Date"
              type="date"
              value={dayjs(invoice.dueDate).format("YYYY-MM-DD")}
              onChange={(e) => onFieldChange("dueDate", e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </>
        ) : (
          <>
            <Typography>
              Issue Date: {dayjs(invoice.issueDate).format("MMM D, YYYY")}
            </Typography>
            <Typography>
              Due Date: {dayjs(invoice.dueDate).format("MMM D, YYYY")}
            </Typography>
          </>
        )}
        {invoice.paymentDate && (
          <Typography>
            Payment Date: {dayjs(invoice.paymentDate).format("MMM D, YYYY")}
          </Typography>
        )}
      </Grid>

      {/* Service Information - Full width on its own row */}
      {serviceInfo && (
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Service Details
          </Typography>
          <Box
            sx={{
              bgcolor: "grey.50",
              p: 4,
              borderRadius: 2,
              mb: 3,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  Service Type:
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {serviceInfo.serviceType}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  Service Details:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: 1.6,
                    minHeight: "60px",
                    p: 2,
                    bgcolor: "white",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  {serviceInfo.serviceDetails}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      )}

      {/* Parts Used */}
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Parts Used
        </Typography>
        {parts && parts.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Part Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>{part.part?.name || "N/A"}</TableCell>
                    <TableCell align="right">{part.quantity}</TableCell>
                    <TableCell align="right">
                      {part.unitPrice?.toFixed(2) || "0.00"} DT
                    </TableCell>
                    <TableCell align="right">
                      {((part.quantity || 0) * (part.unitPrice || 0)).toFixed(
                        2
                      )}{" "}
                      DT
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              bgcolor: "grey.50",
              p: 3,
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No parts were used for this service
            </Typography>
          </Box>
        )}
      </Grid>

      {/* Updated Invoice Summary with Service and Parts Breakdown */}
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 350 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Invoice Summary
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Service Cost:</Typography>
              <Typography>{laborCost.toFixed(2)} DT</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Parts Cost:</Typography>
              <Typography>{partsCost.toFixed(2)} DT</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal:</Typography>
              <Typography>{subtotal.toFixed(2)} DT</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>TVA (20%):</Typography>
              <Typography>{tvaAmount.toFixed(2)} DT</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight={700}>
                Total Amount:
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {totalWithTva.toFixed(2)} DT
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
const InvoiceActions = ({ invoice, onAction, isEditing, isDownloading }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 1,
    }}
  >
    <Box sx={{ display: "flex", gap: 1 }}>
      <Tooltip title="Download PDF">
        <IconButton
          color="primary"
          onClick={() => onAction("download")}
          size="large"
          disabled={isDownloading}
        >
          {isDownloading ? <CircularProgress size={24} /> : <FileDownload />}
        </IconButton>
      </Tooltip>
    </Box>

    <Box sx={{ display: "flex", gap: 1 }}>
      {isEditing ? (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={() => onAction("save")}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onAction("cancelEdit")}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          {invoice.status === "draft" && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Receipt />}
                onClick={() => onAction("issue")}
              >
                Issue Invoice
              </Button>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => onAction("edit")}
              >
                Edit
              </Button>
            </>
          )}
          {invoice.status === "issued" && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Paid />}
              onClick={() => onAction("markPaid")}
            >
              Mark as Paid
            </Button>
          )}
          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => onAction("cancel")}
            >
              Cancel
            </Button>
          )}
        </>
      )}
    </Box>
  </Box>
);

export default InvoiceModal;
