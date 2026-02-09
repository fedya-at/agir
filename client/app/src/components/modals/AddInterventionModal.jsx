/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { createIntervention } from "../../store/interventionsSlice";
import { fetchClients, createClient } from "../../store/clientsSlice";
import { fetchTechnicians } from "../../store/techniciansSlice";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1300,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

const contentStyle = {
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
};

const AddInterventionModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { status: interventionStatus } = useSelector(
    (state) => state.interventions
  );
  const { clients, status: clientsStatus } = useSelector(
    (state) => state.clients
  );
  const { technicians, status: techsStatus } = useSelector(
    (state) => state.technicians
  );

  const [formData, setFormData] = useState({
    description: "",
    startDate: dayjs(),
    clientId: "",
    technicianId: "",
    serviceType: 0,
    serviceDetails: "",
  });
  const [errors, setErrors] = useState({});
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [clientErrors, setClientErrors] = useState({});
  const [clientTouched, setClientTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const serviceTypeOptions = [
    { value: 0, label: "Hardware" },
    { value: 1, label: "Software" },
    { value: 2, label: "Mixed" },
    { value: 3, label: "Consultation" },
    { value: 4, label: "Maintenance" },
    { value: 5, label: "Other" },
  ];

  // Fetch clients and technicians when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchClients());
      dispatch(fetchTechnicians());
      if (currentUser?.role === 0) {
        dispatch(fetchTechnicians());
      }

      if (currentUser?.role === 1) {
        // Role 1 is Technician
        setFormData((prev) => ({
          ...prev,
          technicianId: currentUser.id,
        }));
      }
    }
  }, [open, dispatch, currentUser]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.clientId) newErrors.clientId = "Client is required";
    if (!formData.technicianId)
      newErrors.technicianId = "Technician is required";
    if (formData.serviceType === undefined || formData.serviceType === null)
      newErrors.serviceType = "Service type is required";
    if (!formData.serviceDetails)
      newErrors.serviceDetails = "Service details are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, startDate: date }));
    if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: "" }));
  };

  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateClientField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value.trim()) {
          error = "Username is required";
        } else if (value.length < 3) {
          error = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Username can only contain letters, numbers, and underscores";
        } else if (clients?.some((c) => c.username === value)) {
          error = "Username already exists";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error =
            "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        break;

      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        } else if (clients?.some((c) => c.email === value)) {
          error = "Email already exists";
        }
        break;

      case "phone":
        if (!value.trim()) {
          error = "Phone is required";
        } else if (!/^[+]?[\d\s\-()]{8,}$/.test(value)) {
          error = "Please enter a valid phone number";
        }
        break;

      case "address":
        if (!value.trim()) {
          error = "Address is required";
        } else if (value.trim().length < 5) {
          error = "Address must be at least 5 characters";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateClientForm = () => {
    const newErrors = {};
    Object.keys(newClient).forEach((key) => {
      newErrors[key] = validateClientField(key, newClient[key]);
    });

    setClientErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const isClientFormValid = () => {
    const requiredFields = [
      "username",
      "password",
      "name",
      "email",
      "phone",
      "address",
    ];
    return requiredFields.every((field) => {
      const value = newClient[field];
      return value && value.trim() && !validateClientField(field, value);
    });
  };

  const handleClientBlur = (e) => {
    const { name, value } = e.target;
    setClientTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateClientField(name, value);
    setClientErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleCreateClient = async () => {
    if (!validateClientForm()) {
      setClientTouched(
        Object.keys(newClient).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      );
      return;
    }

    try {
      const resultAction = await dispatch(createClient(newClient));
      const createdClient = resultAction.payload;

      toast.success("Client created successfully!");
      setFormData((prev) => ({ ...prev, clientId: createdClient.id }));
      setClientDialogOpen(false);
      setNewClient({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        address: "",
      });
      setClientErrors({});
      setClientTouched({});
    } catch (error) {
      toast.error(error.message || "Failed to create client");
      console.error("Create Client Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate.toISOString(),
      };
      await dispatch(createIntervention(payload)).unwrap();
      toast.success("Intervention created successfully!");
      handleClose();
      setFormData({
        description: "",
        startDate: dayjs(),
        clientId: "",
        technicianId: "",
        serviceType: 0,
        serviceDetails: "",
      });
    } catch (error) {
      toast.error("Failed to create intervention");
    }
  };
  const technicianOptions = React.useMemo(() => {
    // If the current user is a technician...
    if (currentUser?.role === 1) {
      // ...the list of options is just themselves.
      // We create an object that matches the structure of a technician from the list.
      return [{ id: currentUser.id, name: currentUser.name }];
    }
    // If the user is an Admin or any other role, return the full list fetched from the state.
    return technicians;
  }, [technicians, currentUser]);
  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-intervention-modal"
        aria-describedby="add-new-intervention"
        sx={modalStyle}
      >
        <Box sx={contentStyle}>
          <Typography variant="h6" component="h2" mb={3}>
            New Intervention
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={3}
                fullWidth
                required
              />

              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                    fullWidth: true,
                  },
                }}
              />

              <FormControl fullWidth error={!!errors.clientId}>
                <InputLabel>Client *</InputLabel>
                <Select
                  name="clientId"
                  value={formData.clientId}
                  label="Client *"
                  onChange={handleChange}
                  disabled={clientsStatus === "loading"}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
                <IconButton
                  onClick={() => setClientDialogOpen(true)}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                >
                  <AddCircleIcon color="primary" />
                </IconButton>
                {errors.clientId && (
                  <Typography variant="caption" color="error">
                    {errors.clientId}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.technicianId}>
                <InputLabel>Technician *</InputLabel>
                <Select
                  name="technicianId"
                  value={formData.technicianId}
                  label="Technician *"
                  onChange={handleChange}
                  // The dropdown is disabled if the user is a technician
                  // or if the technicians are still loading (for admins).
                  disabled={
                    techsStatus === "loading" || currentUser?.role === 1
                  }
                >
                  {/* We map over the conditionally created technicianOptions array */}
                  {technicianOptions.map((tech) => (
                    <MenuItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.technicianId && (
                  <Typography variant="caption" color="error">
                    {errors.technicianId}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.serviceType}>
                <InputLabel>Service Type *</InputLabel>
                <Select
                  name="serviceType"
                  value={formData.serviceType}
                  label="Service Type *"
                  onChange={handleChange}
                >
                  {serviceTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.serviceType && (
                  <Typography variant="caption" color="error">
                    {errors.serviceType}
                  </Typography>
                )}
              </FormControl>

              <TextField
                label="Service Details"
                name="serviceDetails"
                value={formData.serviceDetails}
                onChange={handleChange}
                error={!!errors.serviceDetails}
                helperText={errors.serviceDetails}
                multiline
                rows={2}
                fullWidth
                required
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={status === "loading"}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Creating..." : "Create"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Modal>

      {/* New Client Dialog */}
      <Dialog
        open={clientDialogOpen}
        onClose={() => setClientDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Client</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {Object.values(clientErrors).some((error) => error) && (
              <Alert severity="error">
                Please fix the errors below before submitting
              </Alert>
            )}

            <TextField
              name="username"
              label="Username"
              value={newClient.username}
              onChange={handleNewClientChange}
              onBlur={handleClientBlur}
              fullWidth
              required
              error={clientTouched.username && !!clientErrors.username}
              helperText={clientTouched.username && clientErrors.username}
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={newClient.password}
              onChange={handleNewClientChange}
              onBlur={handleClientBlur}
              fullWidth
              required
              error={clientTouched.password && !!clientErrors.password}
              helperText={clientTouched.password && clientErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="name"
              label="Name"
              value={newClient.name}
              onChange={handleNewClientChange}
              onBlur={handleClientBlur}
              fullWidth
              required
              error={clientTouched.name && !!clientErrors.name}
              helperText={clientTouched.name && clientErrors.name}
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              value={newClient.email}
              onChange={handleNewClientChange}
              onBlur={handleClientBlur}
              fullWidth
              required
              error={clientTouched.email && !!clientErrors.email}
              helperText={clientTouched.email && clientErrors.email}
            />

            <TextField
              name="phone"
              label="Phone"
              value={newClient.phone}
              onChange={handleNewClientChange}
              onBlur={handleClientBlur}
              fullWidth
              required
              error={clientTouched.phone && !!clientErrors.phone}
              helperText={clientTouched.phone && clientErrors.phone}
            />

            <TextField
              name="address"
              label="Address"
              value={newClient.address}
              onChange={handleNewClientChange}
              onBlur={handleClientBlur}
              fullWidth
              required
              multiline
              rows={3}
              error={clientTouched.address && !!clientErrors.address}
              helperText={clientTouched.address && clientErrors.address}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateClient}
            variant="contained"
            color="primary"
            disabled={!isClientFormValid()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddInterventionModal;
