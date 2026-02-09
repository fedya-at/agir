import React from "react";
import { Box, Button, Grid, Typography, Stack } from "@mui/material";
import {
  Description as DescriptionIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import StyledCard from "./StyledCard";
import SectionHeader from "./SectionHeader";
import StatusChip from "./StatusChip";
import dayjs from "dayjs";
import DetailRow from "./DetailRow";
import DetailLabel from "./DetailLabel";
import DetailValue from "./DetailValue";
import { useDispatch, useSelector } from "react-redux";
import {
  issueInvoice,
  markInvoiceAsPaid,
  cancelInvoice,
} from "../store/invoiceSlice";
import { toast } from "react-hot-toast";

const InvoiceSection = ({
  currentInvoice,
  onViewInvoiceClick,
  onDownloadClick,
  onGenerateClick,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleIssueInvoice = async () => {
    try {
      await dispatch(issueInvoice(currentInvoice.id)).unwrap();
      toast.success("Invoice issued successfully");
    } catch (error) {
      toast.error(error.message || "Failed to issue invoice");
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await dispatch(markInvoiceAsPaid(currentInvoice.id)).unwrap();
      toast.success("Invoice marked as paid successfully");
    } catch (error) {
      toast.error(error.message || "Failed to mark invoice as paid");
    }
  };

  const handleCancelInvoice = async () => {
    try {
      await dispatch(cancelInvoice(currentInvoice.id)).unwrap();
      toast.success("Invoice canceled successfully");
    } catch (error) {
      toast.error(error.message || "Failed to cancel invoice");
    }
  };

  // Check if user has admin role (0)
  const isAdmin = user?.role === 0;
  // Check if user has technician role (1)
  const isTechnician = user?.role === 1;

 
  return (
    <StyledCard sx={{ maxWidth: "1000px", margin: "0 auto",mt: 3 }}>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 3,
            alignItems: "center",
            mb: 3,
          }}
        >
          <SectionHeader variant="h5">
            <DescriptionIcon fontSize="small" /> Invoice
          </SectionHeader>

          {currentInvoice ? (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={onViewInvoiceClick}
                startIcon={<DescriptionIcon />}
              >
                View
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={onDownloadClick}
              >
                <FileDownloadIcon />
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={onGenerateClick}
              startIcon={<AddIcon />}
              disabled={!onGenerateClick}
            >
              Generate Invoice
            </Button>
          )}
        </Box>

        {currentInvoice ? (
          <>
            <InvoiceDetails invoice={currentInvoice} />
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              {/* Issue button - visible for Admin (0) and Technician (1) */}
              {(isAdmin || isTechnician) && (
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleIssueInvoice}
                  disabled={currentInvoice.status !== 0} // 0 = Draft
                  startIcon={<SendIcon />}
                >
                  Issue Invoice
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleMarkAsPaid}
                  disabled={currentInvoice.status !== 1} // 1 = Issued
                  startIcon={<CheckIcon />}
                >
                  Mark as Paid
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCancelInvoice}
                  disabled={[2, 3].includes(currentInvoice.status)} // 2 = Paid, 3 = Cancelled
                  startIcon={<CloseIcon />}
                >
                  Cancel Invoice
                </Button>
              )}
            </Stack>
          </>
        ) : (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No invoice has been generated for this intervention
          </Typography>
        )}
      </Box>
    </StyledCard>
  );
};

const InvoiceDetails = ({ invoice }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <DetailRow>
          <DetailLabel>Invoice Number:</DetailLabel>
          <DetailValue>{invoice.invoiceNumber}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Status:</DetailLabel>
          <DetailValue>
            <StatusChip status={invoice.status} type="invoice" />
          </DetailValue>
        </DetailRow>
      </Grid>
      <Grid item xs={12} sm={6}>
        <DetailRow>
          <DetailLabel>Total Amount:</DetailLabel>
          <DetailValue>{invoice.totalAmount?.toFixed(2)} DT</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Due Date:</DetailLabel>
          <DetailValue>
            {dayjs(invoice.dueDate).format("MMM D, YYYY")}
          </DetailValue>
        </DetailRow>
      </Grid>
    </Grid>
  );
};

export default InvoiceSection;
