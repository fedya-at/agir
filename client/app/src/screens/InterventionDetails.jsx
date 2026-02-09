/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {
  fetchInterventionById,
  updateInterventionStatus,
  assignTechnician,
} from "../store/interventionsSlice";

import {
  fetchInterventionInvoice,
  downloadInvoicePdf,
  generateInvoiceForIntervention,
} from "../store/invoiceSlice";
import { useInterventionParts } from "../services/useInterventionParts";
import { fetchParts } from "../store/partsSlice";
import ErrorScreen from "../components/ErrorScreen";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InterventionHeader from "../components/InterventionHeader";
import InterventionDetailsSection from "../components/InterventionDetailsSection";
import PartsSection from "../components/PartsSection";
import InvoiceSection from "../components/InvoiceSection";
import StatusChangeModal from "../components/modals/StatusChangeModal";
import AddPartModal from "../components/modals/AddPartModal";
import AssignTechnicianModal from "../components/modals/AssignTechnicianModal";
import InvoiceModal from "../components/modals/InvoiceModal";
import { fetchActiveTechnicians } from "../store/techniciansSlice";
import ClientInfoCard from "../components/ClientInfoCard";
import TechnicianInfoCard from "../components/TechnicianInfoCard";
import ServiceOnlySection from "../components/ServiceOnlySection";
import { shouldShowPartsSection } from "../utils/serviceUtils";

const roleMap = {
  0: "admin",
  1: "technician",
  2: "client",
};

const InterventionDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [technicianModalOpen, setTechnicianModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [invoiceAction, setInvoiceAction] = useState("view");
  const [modalOpen, setModalOpen] = useState(false);
  const {
    currentIntervention,
    status: interventionStatus,
    error,
  } = useSelector((state) => state.interventions);

  const {
    parts: interventionParts,
    createPart,
    deletePart,
    getParts,
    isLoading: partsLoading,
    isOperationLoading,
    error: partsError,
  } = useInterventionParts();

  const { user } = useSelector((state) => state.auth);
  const isTechnician = roleMap[user?.role] === "technician";
  const isAdmin = roleMap[user?.role] === "admin";

  // Memoize the getParts function to prevent unnecessary recreations
  const fetchInterventionData = useCallback(async () => {
    try {
      setIsInitialLoad(true);
      await dispatch(fetchInterventionById(id)).unwrap();

      if (isTechnician) {
        const [parts] = await Promise.all([
          dispatch(fetchParts()).unwrap(),
          getParts(id),
        ]);
        setAvailableParts(parts);
      }
    } catch (err) {
      console.error("Error fetching intervention data:", err);
      toast.error(`Failed to load intervention: ${err.message}`);
    } finally {
      setIsInitialLoad(false);
    }
  }, [dispatch, id, isTechnician, getParts]);

  useEffect(() => {
    fetchInterventionData();
    // Ensure dependencies are stable
  }, [fetchInterventionData]);

  useEffect(() => {
    const checkExistingInvoice = async () => {
      try {
        const invoice = await dispatch(fetchInterventionInvoice(id)).unwrap();
        setCurrentInvoice(invoice);
      } catch (error) {
        setCurrentInvoice(null);
      }
    };

    if (
      currentIntervention?.status === 2 && // Only check if intervention is completed
      (isAdmin || isTechnician) // Admin, Client, or Technician
    ) {
      checkExistingInvoice();
    }
  }, [
    id,
    currentIntervention?.status,
    dispatch,
    isAdmin,
    isTechnician,
    user?.role,
  ]);

  const handleAddPart = async (formData) => {
    const toastId = toast.loading("Adding part...");
    try {
      if (!currentIntervention?.id) {
        throw new Error("Current intervention not loaded yet");
      }

      await createPart(
        currentIntervention.id,
        formData.partId,
        formData.quantity
      );

      toast.success("Part added successfully!", { id: toastId });
      setPartModalOpen(false);

      // Re-fetch the parts to refresh the table
      await getParts(currentIntervention.id);
      await dispatch(fetchInterventionById(currentIntervention.id));
    } catch (err) {
      console.error("Error adding part:", err);
      toast.error(`Failed to add part: ${err.message}`, { id: toastId });
    }
  };
  useEffect(() => {
    const fetchTechnicians = async () => {
      if (technicianModalOpen) {
        try {
          const result = await dispatch(fetchActiveTechnicians()).unwrap();
          setAvailableTechnicians(result);
        } catch (err) {
          console.error("Failed to fetch technicians:", err);
          toast.error("Failed to load available technicians");
        }
      }
    };

    fetchTechnicians();
  }, [technicianModalOpen, dispatch]);

  const handleDeletePart = async (partId) => {
    const toastId = toast.loading("Removing part...");
    try {
      await deletePart(partId);
      toast.success("Part removed successfully!", { id: toastId });

      // Re-fetch the parts to refresh the table
      await getParts(currentIntervention.id);
      await dispatch(fetchInterventionById(currentIntervention.id));
    } catch (err) {
      console.error("Error removing part:", err);
      toast.error(`Failed to remove part: ${err.message}`, { id: toastId });
    }
  };

  const handleStatusChange = async () => {
    const toastId = toast.loading("Updating status...");
    try {
      if (!currentIntervention?.id) {
        throw new Error("Current intervention not loaded yet");
      }

      await dispatch(
        updateInterventionStatus({
          id: currentIntervention.id,
          newStatus: parseInt(selectedStatus, 10),
        })
      ).unwrap();

      toast.success("Status updated successfully!", { id: toastId });
      setStatusModalOpen(false);

      await dispatch(fetchInterventionById(currentIntervention.id));
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("You do not have permission to update this intervention.", {
          id: toastId,
        });
      } else {
        toast.error(`Failed to update status: ${err.message}`, { id: toastId });
      }
      console.error("Error updating intervention status:", err);
    }
  };

  const handleAssignTechnician = async () => {
    const toastId = toast.loading("Assigning technician...");
    try {
      if (!currentIntervention?.id || !selectedTechnician) {
        throw new Error("Intervention or technician not selected");
      }

      await dispatch(
        assignTechnician({
          interventionId: currentIntervention.id,
          technicianId: selectedTechnician,
        })
      ).unwrap();

      toast.success("Technician assigned successfully!", { id: toastId });
      setTechnicianModalOpen(false);
      setSelectedTechnician("");

      // Refresh the intervention data
      await dispatch(fetchInterventionById(currentIntervention.id));
    } catch (err) {
      console.error("Error assigning technician:", err);
      toast.error(`Failed to assign technician: ${err.message}`, {
        id: toastId,
      });
    }
  };

  // Combined loading state
  const isLoading =
    isInitialLoad || interventionStatus === "loading" || partsLoading;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (interventionStatus === "failed") {
    return (
      <ErrorScreen
        message={error || "Failed to load intervention details"}
        onRetry={() => dispatch(fetchInterventionById(id))}
      />
    );
  }

  if (!currentIntervention) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Button startIcon={<ArrowBack />} onClick={() => window.history.back()}>
          Back
        </Button>
        <Typography>No data found for this intervention.</Typography>
      </Box>
    );
  }
  const handleDownloadInvoice = async () => {
    try {
      if (!currentInvoice?.id) {
        throw new Error("No invoice available to download.");
      }
      await dispatch(downloadInvoicePdf(currentInvoice.id)).unwrap();
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      toast.error(`Failed to download invoice: ${error.message}`);
    }
  };
  const handleGenerateInvoice = async () => {
    const toastId = toast.loading("Generating invoice...");
    try {
      const invoice = await dispatch(
        generateInvoiceForIntervention(id)
      ).unwrap();
      setCurrentInvoice(invoice);
      toast.success("Invoice generated successfully!", { id: toastId });
      setInvoiceModalOpen(false);
    } catch (error) {
      toast.error(`Failed to generate invoice: ${error.message}`, {
        id: toastId,
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        p: 3,
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <Navbar />
      <Button
        startIcon={<ArrowBack />}
        onClick={() => window.history.back()}
        sx={{ mb: 3, minWidth: 0, alignSelf: "flex-start", mt: 3 }}
      >
        Back
      </Button>

      <InterventionHeader
        intervention={currentIntervention}
        isTechnician={isTechnician}
        isAdmin={isAdmin}
        onStatusChangeClick={() => {
          setSelectedStatus(currentIntervention.status);
          setStatusModalOpen(true);
        }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Info Cards Row */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ClientInfoCard
              key={currentIntervention.client.id}
              person={currentIntervention.client}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
            />
          </Grid>

          {!isTechnician && (
            <Grid item xs={12} md={6}>
              <TechnicianInfoCard
                person={currentIntervention.technician}
                onAssignClick={() => setTechnicianModalOpen(true)}
              />
            </Grid>
          )}
        </Grid>

        {/* Full Width Main Content */}
        <Box sx={{ width: "100%" }}>
          <Stack spacing={4}>
            <InterventionDetailsSection
              intervention={currentIntervention}
              isTechnician={isTechnician}
              onServiceUpdate={(updatedIntervention) => {
                dispatch(fetchInterventionById(currentIntervention.id));
              }}
            />

            {/* Conditionally show Parts Section or Service-Only Section */}
            {shouldShowPartsSection(currentIntervention) ? (
              <PartsSection
                intervention={currentIntervention}
                isTechnician={isTechnician}
                onAddPartClick={() => setPartModalOpen(true)}
                onDeletePart={handleDeletePart}
                isLoading={partsLoading || isOperationLoading}
              />
            ) : (
              <ServiceOnlySection intervention={currentIntervention} />
            )}

            {/* Invoice Section */}
            {(isAdmin || isTechnician) && currentIntervention.status === 2 && (
              <InvoiceSection
                currentInvoice={currentInvoice}
                onViewInvoiceClick={() => {
                  setInvoiceAction("view");
                  setInvoiceModalOpen(true);
                }}
                onDownloadClick={handleDownloadInvoice}
                onGenerateClick={handleGenerateInvoice}
              />
            )}
          </Stack>
        </Box>
      </Box>

      <StatusChangeModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={currentIntervention.status}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onUpdate={handleStatusChange}
        isAdmin={isAdmin}
      />

      <AddPartModal
        open={partModalOpen}
        onClose={() => setPartModalOpen(false)}
        availableParts={availableParts}
        onAddPart={handleAddPart}
        isLoading={isOperationLoading}
      />

      <AssignTechnicianModal
        open={technicianModalOpen}
        onClose={() => setTechnicianModalOpen(false)}
        availableTechnicians={availableTechnicians}
        selectedTechnician={selectedTechnician}
        onTechnicianSelect={setSelectedTechnician}
        onAssign={handleAssignTechnician}
      />

      <InvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        action={invoiceAction}
        invoiceId={currentInvoice?.id}
        interventionId={id}
        currentInvoice={currentInvoice}
        onSuccess={setCurrentInvoice}
        client={currentIntervention.client} // Pass client data
        parts={currentIntervention.interventionParts}
        intervention={currentIntervention} // Pass full intervention data for services
      />

      <Footer />
    </Box>
  );
};

export default InterventionDetails;
