import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { createTechnician, updateTechnician } from "../store/techniciansSlice";

export default function TechnicianDialog({
  open,
  onClose,
  technician,
  onSuccess,
  onError,
}) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    specialization: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (technician) {
      setFormData({
        name: technician.name || "",
        email: technician.email || "",
        phone: technician.phone || "",
        specialization: technician.specialization || "",
      });
    } else {
      setFormData({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        specialization: "",
        hireDate: new Date().toISOString(),
      });
    }
  }, [technician, open]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (technician) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
        };
        await dispatch(
          updateTechnician({ id: technician.id, technicianData: updateData })
        ).unwrap();
        onSuccess("Technician updated successfully");
      } else {
        await dispatch(createTechnician(formData)).unwrap();
        onSuccess("Technician created successfully");
      }
      onClose();
    } catch (error) {
      onError(error.message || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {technician ? "Edit Technician" : "Add Technician"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {!technician && (
            <>
              <TextField
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
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
            </>
          )}
          <TextField
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="phone"
            label="Phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="specialization"
            label="Specialization"
            value={formData.specialization}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : technician ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
