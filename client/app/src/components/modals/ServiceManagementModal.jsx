import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Divider,
  Grid,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Computer,
  Code,
  Build,
  Psychology,
  CleaningServices,
  Help,
  Save,
  Cancel,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import {
  updateInterventionService,
  updateInterventionLaborCost,
} from "../../services/serviceManagementApi";

const serviceTypeOptions = [
  {
    value: 0,
    label: "Hardware Repair",
    icon: <Computer fontSize="small" />,
    description: "Physical repair requiring parts",
    defaultHasParts: true,
  },
  {
    value: 1,
    label: "Software Service",
    icon: <Code fontSize="small" />,
    description: "Software installation, configuration, or troubleshooting",
    defaultHasParts: false,
  },
  {
    value: 2,
    label: "Mixed Service",
    icon: <Build fontSize="small" />,
    description: "Combined hardware and software service",
    defaultHasParts: true,
  },
  {
    value: 3,
    label: "Consultation",
    icon: <Psychology fontSize="small" />,
    description: "Diagnostic, consulting, or advisory service",
    defaultHasParts: false,
  },
  {
    value: 4,
    label: "Maintenance",
    icon: <CleaningServices fontSize="small" />,
    description: "Cleaning, updates, or maintenance service",
    defaultHasParts: false,
  },
  {
    value: 5,
    label: "Other Service",
    icon: <Help fontSize="small" />,
    description: "Custom or uncategorized service",
    defaultHasParts: false,
  },
];

const ServiceManagementModal = ({ open, onClose, intervention, onUpdate }) => {
  const [formData, setFormData] = useState({
    serviceType: 0,
    serviceDetails: "",
    laborCost: 0,
    hasParts: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (intervention && open) {
      setFormData({
        serviceType: intervention.serviceType ?? 0,
        serviceDetails: intervention.serviceDetails || "",
        laborCost: intervention.laborCost || 0,
        hasParts: intervention.hasParts ?? true,
      });
      setErrors({});
    }
  }, [intervention, open]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.laborCost <= 0) {
      newErrors.laborCost = "Labor cost must be greater than 0";
    }

    // Service details required for software and consultation services
    if (
      [1, 3].includes(formData.serviceType) &&
      !formData.serviceDetails?.trim()
    ) {
      newErrors.serviceDetails =
        "Service details are required for this service type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleServiceTypeChange = (newServiceType) => {
    const selectedOption = serviceTypeOptions.find(
      (opt) => opt.value === newServiceType
    );
    setFormData((prev) => ({
      ...prev,
      serviceType: newServiceType,
      hasParts: selectedOption?.defaultHasParts ?? false,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    const toastId = toast.loading("Updating service information...");
    setIsLoading(true);
    try {
      // Update service information
      const serviceData = {
        serviceType: formData.serviceType,
        serviceDetails: formData.serviceDetails,
      };

      await updateInterventionService(intervention.id, serviceData);

      // Update labor cost separately if it changed
      if (formData.laborCost !== intervention.laborCost) {
        await updateInterventionLaborCost(intervention.id, formData.laborCost);
      }

      onUpdate({
        ...intervention,
        ...formData,
      });

      toast.success("Service information updated successfully!", {
        id: toastId,
      });
    } catch (error) {
      console.error("Service update error:", error);
      toast.error("Failed to update service information: " + error.message, {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedServiceType = serviceTypeOptions.find(
    (opt) => opt.value === formData.serviceType
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Build />
          Manage Service & Parts Configuration
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure the service type and details. Parts management will be
            available based on your selection.
          </Alert>

          <Grid container spacing={3}>
            {/* Service Type Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Service Type *</InputLabel>
                <Select
                  value={formData.serviceType}
                  label="Service Type *"
                  onChange={(e) => handleServiceTypeChange(e.target.value)}
                >
                  {serviceTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {option.icon}
                        <Box>
                          <Typography variant="body1">
                            {option.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Selected Service Type Display */}
            {selectedServiceType && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "primary.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "primary.200",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      icon={selectedServiceType.icon}
                      label={selectedServiceType.label}
                      color="primary"
                      variant="filled"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {selectedServiceType.description}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            )}

            {/* Service Details */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Details"
                multiline
                rows={3}
                value={formData.serviceDetails}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceDetails: e.target.value,
                  }))
                }
                error={!!errors.serviceDetails}
                helperText={
                  errors.serviceDetails ||
                  "Describe the specific service to be performed (required for software and consultation services)"
                }
                placeholder="E.g., Windows 10 installation with driver setup, motherboard replacement, diagnostic analysis..."
              />
            </Grid>

            <Divider sx={{ width: "100%", my: 2 }} />

            {/* Labor Cost */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Labor Cost *"
                type="number"
                value={formData.laborCost}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    laborCost: parseFloat(e.target.value) || 0,
                  }))
                }
                error={!!errors.laborCost}
                helperText={errors.laborCost || "Cost for the service labor"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">DT</InputAdornment>
                  ),
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>

            {/* Parts Management Toggle */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  pt: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.hasParts}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hasParts: e.target.checked,
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="This service requires parts"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {formData.hasParts
                    ? "Parts section will be available for this intervention"
                    : "This service will not include physical parts"}
                </Typography>
              </Box>
            </Grid>

            {/* Cost Preview */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Cost Summary
                </Typography>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Labor Cost:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formData.laborCost.toFixed(2)} DT
                    </Typography>
                  </Box>
                  {formData.hasParts && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Parts Cost:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (Will be calculated when parts are added)
                      </Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="subtitle2">
                      {formData.hasParts ? "Base Total:" : "Service Total:"}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {formData.laborCost.toFixed(2)} DT
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} startIcon={<Cancel />} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Save />}
          disabled={isLoading}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceManagementModal;
