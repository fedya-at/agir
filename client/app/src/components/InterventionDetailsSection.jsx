import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import {
  Edit,
  Settings,
  Computer,
  Code,
  Build,
  Psychology,
  CleaningServices,
  Help,
  AddCircle,
} from "@mui/icons-material";
import StyledCard from "./StyledCard";
import SectionHeader from "./SectionHeader";
import DetailLabel from "./DetailLabel";
import DetailValue from "./DetailValue";
import DetailRow from "./DetailRow";
import ServiceManagementModal from "./modals/ServiceManagementModal";
import { formatCurrency } from "../utils/serviceUtils";
import dayjs from "dayjs";

const serviceTypeConfig = {
  0: {
    label: "Hardware Repair",
    icon: <Computer />,
    color: "primary",
    description: "Physical repair with parts",
  },
  1: {
    label: "Software Service",
    icon: <Code />,
    color: "success",
    description: "Software installation/configuration",
  },
  2: {
    label: "Mixed Service",
    icon: <Build />,
    color: "secondary",
    description: "Hardware + Software service",
  },
  3: {
    label: "Consultation",
    icon: <Psychology />,
    color: "warning",
    description: "Diagnostic and consulting",
  },
  4: {
    label: "Maintenance",
    icon: <CleaningServices />,
    color: "info",
    description: "Cleaning and maintenance",
  },
  5: {
    label: "Other Service",
    icon: <Help />,
    color: "default",
    description: "Custom service",
  },
};

const InterventionDetailsSection = ({
  intervention,
  isTechnician,
  onServiceUpdate,
}) => {
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  const serviceType = intervention.serviceType ?? 0; // Default to Hardware
  const serviceConfig = serviceTypeConfig[serviceType] || serviceTypeConfig[0];

  const handleServiceUpdate = (updatedData) => {
    if (onServiceUpdate) {
      onServiceUpdate(updatedData);
    }
    setServiceModalOpen(false);
  };

  return (
    <>
      <StyledCard sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <SectionHeader variant="h5">
              <Edit fontSize="small" /> Intervention Details
            </SectionHeader>
            {isTechnician && (
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => setServiceModalOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "0.875rem",
                }}
              >
                Manage Service & Parts
              </Button>
            )}
          </Box>

          {/* Service Type Display */}
          <Box sx={{ mb: 3 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Chip
                icon={serviceConfig.icon}
                label={serviceConfig.label}
                color={serviceConfig.color}
                variant="filled"
                size="medium"
                sx={{ fontWeight: 600 }}
              />
              <Typography variant="body2" color="text.secondary">
                {serviceConfig.description}
              </Typography>
            </Stack>

            {/* Service Details */}
            {intervention.serviceDetails && (
              <Box
                sx={{
                  bgcolor: "grey.50",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Service Details:
                </Typography>
                <Typography variant="body2">
                  {intervention.serviceDetails}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <DetailLabel sx={{ mb: 1 }}>Description:</DetailLabel>
            <Typography paragraph sx={{ ml: 1, color: "text.secondary" }}>
              {intervention.description}
            </Typography>
          </Box>

          {/* Cost Information */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <DetailRow>
                <DetailLabel>Labor Cost:</DetailLabel>
                <DetailValue>
                  {intervention.laborCost
                    ? formatCurrency(intervention.laborCost)
                    : "Not set"}
                </DetailValue>
              </DetailRow>
            </Grid>
            <Grid item xs={12} sm={4}>
              <DetailRow>
                <DetailLabel>Total Cost:</DetailLabel>
                <DetailValue>
                  {intervention.totalCost
                    ? formatCurrency(intervention.totalCost)
                    : "Calculating..."}
                </DetailValue>
              </DetailRow>
            </Grid>
            <Grid item xs={12} sm={4}>
              <DetailRow>
                <DetailLabel>Has Parts:</DetailLabel>
                <DetailValue>
                  <Chip
                    label={intervention.hasParts ? "Yes" : "No"}
                    color={intervention.hasParts ? "success" : "default"}
                    size="small"
                  />
                </DetailValue>
              </DetailRow>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Date Information */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailRow>
                <DetailLabel>Start Date:</DetailLabel>
                <DetailValue>
                  {dayjs(intervention.startDate).format("MMM D, YYYY h:mm A")}
                </DetailValue>
              </DetailRow>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow>
                <DetailLabel>End Date:</DetailLabel>
                <DetailValue>
                  {intervention.endDate
                    ? dayjs(intervention.endDate).format("MMM D, YYYY h:mm A")
                    : "Ongoing"}
                </DetailValue>
              </DetailRow>
            </Grid>
          </Grid>
        </Box>
      </StyledCard>

      {/* Service Management Modal */}
      <ServiceManagementModal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        intervention={intervention}
        onUpdate={handleServiceUpdate}
      />
    </>
  );
};

export default InterventionDetailsSection;
