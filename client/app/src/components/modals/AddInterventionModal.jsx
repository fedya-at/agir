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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import AddCircleIcon from "@mui/icons-material/AddCircle";

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
  });
  const [errors, setErrors] = useState({});
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Fetch clients and technicians when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchClients());
      dispatch(fetchTechnicians());
      if (currentUser?.role === 0) {
        dispatch(fetchTechnicians());
      }

      // If the current user is a technician, pre-select them in the form
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
  };

  const handleCreateClient = async () => {
    try {
      const resultAction = await dispatch(createClient(newClient));
      const createdClient = resultAction.payload;

      toast.success("Client created successfully!");
      setFormData((prev) => ({ ...prev, clientId: createdClient.id }));
      setClientDialogOpen(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (error) {
      toast.error("Failed to create client");
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
      >
        <DialogTitle>Create New Client</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Name"
              value={newClient.name}
              onChange={handleNewClientChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              value={newClient.email}
              onChange={handleNewClientChange}
              fullWidth
            />
            <TextField
              name="phone"
              label="Phone"
              value={newClient.phone}
              onChange={handleNewClientChange}
              fullWidth
            />
            <TextField
              name="address"
              label="Address"
              value={newClient.address}
              onChange={handleNewClientChange}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateClient}
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddInterventionModal;
