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
import { fr } from "date-fns/locale";
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
    label: "En attente",
    color: "warning",
    value: 25,
    icon: <AccessTime color="warning" />,
  },
  1: {
    label: "En cours",
    color: "primary",
    value: 50,
    icon: <Build color="primary" />,
  },
  2: {
    label: "Terminé",
    color: "success",
    value: 100,
    icon: <CheckCircle color="success" />,
  },
  3: {
    label: "Annulé",
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
          "Chargement des détails de l'intervention..."
        );

        await dispatch(fetchInterventionById(interventionId)).unwrap();

        toast.success("Détails chargés avec succès !", { id: loadingToast });
      } catch (err) {
        setError(err.message || "Erreur lors du chargement de l'intervention");
        toast.error("Erreur lors du chargement de l'intervention", {
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
          invoiceLoadingToast = toast.loading("Chargement de la facture...");

          await dispatch(
            fetchInterventionInvoice(currentIntervention.id)
          ).unwrap();

          toast.success("Facture chargée avec succès !", {
            id: invoiceLoadingToast,
          });
        } catch (err) {
          setInvoiceError(
            err?.message || "Erreur lors du chargement de la facture"
          );
          toast.error("Erreur lors du chargement de la facture", {
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
          component="section"
          sx={{ bgcolor: "#fff", py: 8, minHeight: "80vh" }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Chargement en cours...
              </Typography>
            </Box>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              mt: 2,
              backgroundColor: "#b8ff00",
              color: "#000000",
              "&:hover": {
                backgroundColor: "#a3e600",
              },
            }}
          >
            Réessayer
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  if (!currentIntervention) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Intervention non trouvée
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/client/interventions")}
            sx={{
              backgroundColor: "#b8ff00",
              color: "#000000",
              "&:hover": {
                backgroundColor: "#a3e600",
              },
            }}
          >
            Retour aux interventions
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const status = statusConfig[currentIntervention.status] || statusConfig[0];
  const interventionStatusInt = currentIntervention.status;
  const interventionStatusStr =
    interventionStatusInt === 0
      ? "Pending"
      : interventionStatusInt === 1
      ? "InProgress"
      : interventionStatusInt === 2
      ? "Completed"
      : "Cancelled";

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: "background.default", py: 4, minHeight: "80vh" }}>
        <Container maxWidth="lg">
          {/* Header with Back Button */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton
              onClick={() => navigate("/client/interventions")}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1">
              Détails de l'intervention #
              {currentIntervention.id?.slice(0, 8) || ""}
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
                Désolé, votre demande a été annulée.
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
                🎉 Félicitations ! Votre intervention a été réalisée avec
                succès.
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
                      ? "En attente"
                      : label === "InProgress"
                      ? "En cours"
                      : "Terminé"}
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
                    Détails techniques
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography paragraph>
                        {currentIntervention.description ||
                          "Aucune description fournie"}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Période
                      </Typography>
                      <Typography>
                        Début:{" "}
                        {currentIntervention.startDate
                          ? format(
                              new Date(currentIntervention.startDate),
                              "PP",
                              {
                                locale: fr,
                              }
                            )
                          : "Non spécifié"}
                      </Typography>
                      <Typography>
                        Fin:{" "}
                        {currentIntervention.endDate
                          ? format(
                              new Date(currentIntervention.endDate),
                              "PP",
                              {
                                locale: fr,
                              }
                            )
                          : "En cours"}
                      </Typography>
                    </Grid>

                    {currentIntervention.interventionParts?.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Pièces utilisées
                        </Typography>
                        <List dense>
                          {currentIntervention.interventionParts.map((part) => (
                            <ListItem key={part.id}>
                              <ListItemText
                                primary={
                                  part.part?.name || "Pièce non spécifiée"
                                }
                                secondary={`${part.quantity} × ${
                                  part.unitPrice || part.price
                                } DT = ${(
                                  part.quantity * (part.unitPrice || part.price)
                                ).toFixed(2)} DT`}
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
                    Technicien
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
                    <Alert severity="info">Aucun technicien assigné</Alert>
                  )}
                </CardContent>
              </Card>

              {/* Invoice Card */}
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    <Receipt sx={{ verticalAlign: "middle", mr: 1 }} />
                    Facture
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {invoiceLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Chargement de la facture...
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
                            Numéro
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
                            Statut
                          </Typography>
                          <Chip
                            label={currentInvoice.paid ? "Payée" : "En attente"}
                            color={currentInvoice.paid ? "success" : "warning"}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Main d'œuvre
                          </Typography>
                          <Typography>{currentInvoice.laborCost} DT</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Pièces
                          </Typography>
                          <Typography>
                            {currentInvoice.totalPartsCost} DT
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Total
                          </Typography>
                          <Typography variant="h6">
                            {currentInvoice.totalAmount} DT
                          </Typography>
                        </Grid>
                      </Grid>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Receipt />}
                        sx={{
                          mt: 2,
                          backgroundColor: "#b8ff00",
                          color: "#000000",
                          "&:hover": {
                            backgroundColor: "#a3e600",
                          },
                        }}
                        onClick={() => setInvoiceModalOpen(true)}
                      >
                        Voir la facture complète
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
                    <Alert severity="info">Aucune facture générée</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            {currentIntervention.status === 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  // TODO: Implement cancel intervention functionality
                }}
              >
                Annuler l'intervention
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/client/interventions")}
              sx={{
                borderColor: "#b8ff00",
                color: "#000000",
                "&:hover": {
                  borderColor: "#a3e600",
                  backgroundColor: "rgba(184, 255, 0, 0.1)",
                },
              }}
            >
              Retour à la liste
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default ClientInterventionDetailsScreen;
