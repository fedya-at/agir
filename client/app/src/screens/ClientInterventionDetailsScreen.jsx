import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchInterventionById } from "../store/interventionsSlice";
import { fetchInterventionInvoice } from "../store/invoiceSlice";
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  Divider,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Stack,
  Alert,
  Badge,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { format } from "date-fns";
import {
  ArrowBack,
  Receipt,
  Person,
  Build,
  Cancel,
  CheckCircle,
  AccessTime,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import InvoiceModal from "../components/modals/InvoiceModal";
import BackButton from "../components/BackButton";

const statusConfig = {
  0: {
    label: "Pending",
    color: "warning",
    value: 25,
    icon: <AccessTime color="warning" />,
  },
  1: {
    label: "In Progress",
    color: "primary",
    value: 50,
    icon: <Build color="primary" />,
  },
  2: {
    label: "Completed",
    color: "success",
    value: 100,
    icon: <CheckCircle color="success" />,
  },
  3: {
    label: "Cancelled",
    color: "error",
    value: 0,
    icon: <Cancel color="error" />,
  },
};

const statusSteps = ["Pending", "InProgress", "Completed"];

const ClientInterventionDetailsScreen = () => {
  const { interventionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [invoiceError, setInvoiceError] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const { currentIntervention } = useSelector((state) => state.interventions);
  const { currentInvoice } = useSelector((state) => state.invoices);

  useEffect(() => {
    const loadIntervention = async () => {
      let loadingToast;
      try {
        setLoading(true);
        loadingToast = toast.loading(
          "Loading intervention details..."
        );

        await dispatch(fetchInterventionById(interventionId)).unwrap();

        toast.success("Details loaded successfully!", { id: loadingToast });
      } catch (err) {
        setError(err.message || "Failed to load intervention details");
        toast.error("Failed to load intervention details", {
          id: loadingToast,
        });
      } finally {
        setLoading(false);
      }
    };

    loadIntervention();
  }, [interventionId, dispatch]);

  useEffect(() => {
    if (currentIntervention?.id) {
      const loadInvoice = async () => {
        let invoiceLoadingToast;
        try {
          setInvoiceLoading(true);
          invoiceLoadingToast = toast.loading("Loading invoice...");

          await dispatch(
            fetchInterventionInvoice(currentIntervention.id)
          ).unwrap();

          toast.success("Invoice loaded successfully!", {
            id: invoiceLoadingToast,
          });
        } catch (err) {
          setInvoiceError(
            err?.message || "Failed to load invoice"
          );
          toast.error("Failed to load invoice", {
            id: invoiceLoadingToast,
          });
        } finally {
          setInvoiceLoading(false);
        }
      };

      loadInvoice();
    }
  }, [dispatch, currentIntervention?.id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <BackButton />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Typography variant="h6">Loading intervention...</Typography>
        </Box>
        <Footer />
      </>
    );
  }

  if (error || !currentIntervention) {
    return (
      <>
        <Navbar />
        <BackButton />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Intervention not found"}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate("/client/interventions")}
            sx={{
              backgroundColor: "#1976d2",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#115293",
              },
            }}
          >
            Back to Interventions
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const status =
    statusConfig[currentIntervention.status] || statusConfig[0];
  const interventionStatusStr =
    currentIntervention.status === 0
      ? "Pending"
      : currentIntervention.status === 1
      ? "InProgress"
      : currentIntervention.status === 2
      ? "Completed"
      : "Cancelled";

  return (
    <>
      <Navbar />

      <Box
        component="section"
        sx={{ bgcolor: "#fff", py: 8, minHeight: "80vh" }}
      >
        <Container maxWidth="lg">
          <BackButton />

          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton
              onClick={() => navigate("/client/interventions")}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1">
              Intervention Details #
              {currentIntervention.id?.toString().slice(0, 8) || ""}
            </Typography>
          </Box>

          {/* Status display using Stepper and colored boxes */}
          {interventionStatusStr === "Cancelled" ? (
            <Box
              sx={{
                border: "2px solid red",
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                p: 3,
                my: 3,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="error">
                This intervention request has been cancelled.
              </Typography>
            </Box>
          ) : interventionStatusStr === "Completed" ? (
            <Box
              sx={{
                border: "2px solid green",
                backgroundColor: "rgba(0, 128, 0, 0.1)",
                p: 3,
                my: 3,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: "green" }}>
                🎉 Your repair intervention has been completed successfully!
              </Typography>
            </Box>
          ) : (
            <Stepper
              activeStep={statusSteps.indexOf(interventionStatusStr)}
              alternativeLabel
              sx={{ my: 3 }}
            >
              {statusSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    {label === "Pending"
                      ? "Pending"
                      : label === "InProgress"
                      ? "In Progress"
                      : "Completed"}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          <Grid container spacing={3}>
            {/* Left Column - Intervention Details */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    <Build sx={{ verticalAlign: "middle", mr: 1 }} />
                    Technical Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography paragraph>
                        {currentIntervention.description ||
                          "No description provided"}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Timeline
                      </Typography>
                      <Typography>
                        Start:{" "}
                        {currentIntervention.startDate
                          ? format(
                              new Date(currentIntervention.startDate),
                              "PP"
                            )
                          : "Not specified"}
                      </Typography>
                      <Typography>
                        End:{" "}
                        {currentIntervention.endDate
                          ? format(
                              new Date(currentIntervention.endDate),
                              "PP"
                            )
                          : "Ongoing"}
                      </Typography>
                    </Grid>

                    {currentIntervention.interventionParts?.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Parts Used
                        </Typography>
                        <List dense>
                          {currentIntervention.interventionParts.map((part) => (
                            <ListItem key={part.id}>
                              <ListItemText
                                primary={
                                  part.part?.name || "Part item"
                                }
                                secondary={`${part.quantity} × $${
                                  part.price
                                } = $${(part.quantity * part.price).toFixed(
                                  2
                                )}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Technician and Invoice */}
            <Grid item xs={12} md={4}>
              {/* Technician Card */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    <Person sx={{ verticalAlign: "middle", mr: 1 }} />
                    Assigned Technician
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {currentIntervention.technician ? (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Badge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        badgeContent={status.icon}
                      >
                        <Avatar sx={{ width: 56, height: 56 }}>
                          {currentIntervention.technician.name?.charAt(0) ||
                            "T"}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {currentIntervention.technician.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentIntervention.technician.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentIntervention.technician.phone}
                        </Typography>
                      </Box>
                    </Stack>
                  ) : (
                    <Alert severity="info">No technician assigned yet</Alert>
                  )}
                </CardContent>
              </Card>

              {/* Invoice Card */}
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    <Receipt sx={{ verticalAlign: "middle", mr: 1 }} />
                    Invoice
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {invoiceLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading invoice...
                    </Typography>
                  ) : invoiceError ? (
                    <Alert severity="error">{invoiceError}</Alert>
                  ) : currentInvoice ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Invoice Number
                          </Typography>
                          <Typography>
                            {currentInvoice.invoiceNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Status
                          </Typography>
                          <Chip
                            label={currentInvoice.paid ? "Paid" : "Pending"}
                            color={currentInvoice.paid ? "success" : "warning"}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Labor Cost
                          </Typography>
                          <Typography>${currentInvoice.laborCost}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Parts Cost
                          </Typography>
                          <Typography>
                            ${currentInvoice.totalPartsCost}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Total Amount
                          </Typography>
                          <Typography variant="h6">
                            ${currentInvoice.totalAmount}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Receipt />}
                        sx={{
                          mt: 2,
                          backgroundColor: "#1976d2",
                          color: "#ffffff",
                          "&:hover": {
                            backgroundColor: "#115293",
                          },
                        }}
                        onClick={() => setInvoiceModalOpen(true)}
                      >
                        View Full Invoice
                      </Button>
                      <InvoiceModal
                        open={invoiceModalOpen}
                        onClose={() => setInvoiceModalOpen(false)}
                        action="view"
                        invoiceId={currentInvoice.id}
                        interventionId={currentIntervention.id}
                        currentInvoice={currentInvoice}
                        client={currentIntervention.client}
                        parts={currentIntervention.interventionParts}
                        onSuccess={() => setInvoiceModalOpen(false)}
                      />
                    </>
                  ) : (
                    <Alert severity="info">No invoice generated yet</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/client/interventions")}
              sx={{
                borderColor: "#1976d2",
                color: "#1976d2",
                "&:hover": {
                  borderColor: "#115293",
                  backgroundColor: "rgba(25, 118, 210, 0.05)",
                },
              }}
            >
              Back to List
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default ClientInterventionDetailsScreen;
