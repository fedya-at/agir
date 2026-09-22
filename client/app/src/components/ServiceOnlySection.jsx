import React from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import {
  Code,
  Psychology,
  CleaningServices,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import StyledCard from "./StyledCard";
import SectionHeader from "./SectionHeader";
import { getServiceTypeInfo, formatCurrency } from "../utils/serviceUtils";

const ServiceOnlySection = ({ intervention }) => {
  const serviceInfo = getServiceTypeInfo(intervention.serviceType);

  const getServiceIcon = () => {
    switch (intervention.serviceType) {
      case 1:
        return <Code fontSize="large" color="success" />;
      case 3:
        return <Psychology fontSize="large" color="warning" />;
      case 4:
        return <CleaningServices fontSize="large" color="info" />;
      default:
        return <Info fontSize="large" color="primary" />;
    }
  };

  return (
    <StyledCard>
      <Box sx={{ p: 3, textAlign: "center" }}>
        <SectionHeader variant="h5" sx={{ mb: 3 }}>
          {getServiceIcon()} Service Information
        </SectionHeader>

        <Stack spacing={3} alignItems="center">
          <Chip
            label={serviceInfo.label}
            color={serviceInfo.color}
            variant="filled"
            size="large"
            sx={{ fontSize: "1rem", py: 2, px: 3 }}
          />

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 400 }}
          >
            {serviceInfo.description}
          </Typography>

          {intervention.serviceDetails && (
            <Box
              sx={{
                width: "100%",
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "success.50",
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            <CheckCircle color="success" fontSize="small" />
            <Typography variant="body2" color="success.main" fontWeight={600}>
              No physical parts required for this service
            </Typography>
          </Box>

          {intervention.laborCost > 0 && (
            <Box
              sx={{
                width: "100%",
                bgcolor: "primary.50",
                p: 2,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "primary.200",
              }}
            >
              <Typography variant="subtitle2" color="primary.main" gutterBottom>
                Service Cost:
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                {formatCurrency(intervention.laborCost)}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </StyledCard>
  );
};

export default ServiceOnlySection;
