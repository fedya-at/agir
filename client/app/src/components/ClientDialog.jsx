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
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  createClient,
  updateClient,
  fetchClients,
} from "../store/clientsSlice";

export default function ClientDialog({
  open,
  onClose,
  client,
  onSuccess,
  onError,
}) {
  const dispatch = useDispatch();
  const { clients } = useSelector((state) => state.clients);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (open) {
      dispatch(fetchClients());
    }
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      });
    } else {
      setFormData({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
    setErrors({});
    setTouched({});
  }, [client, open, dispatch]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value.trim()) {
          error = "Username is required";
        } else if (value.length < 3) {
          error = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Username can only contain letters, numbers, and underscores";
        } else if (
          clients?.some((c) => c.username === value && c.id !== client?.id)
        ) {
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
        } else if (
          clients?.some((c) => c.email === value && c.id !== client?.id)
        ) {
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

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!client && (key === "username" || key === "password")) {
        newErrors[key] = validateField(key, formData[key]);
      } else if (key !== "username" && key !== "password") {
        newErrors[key] = validateField(key, formData[key]);
      }
    });

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const isFormValid = () => {
    const requiredFields = client
      ? ["name", "email", "phone", "address"]
      : ["username", "password", "name", "email", "phone", "address"];

    return requiredFields.every((field) => {
      const value = formData[field];
      return value && value.trim() && !validateField(field, value);
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setTouched(
        Object.keys(formData).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      );
      return;
    }

    setIsLoading(true);
    try {
      if (client) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        };
        await dispatch(
          updateClient({ id: client.id, clientData: updateData })
        ).unwrap();
        onSuccess("Client updated successfully");
      } else {
        await dispatch(createClient(formData)).unwrap();
        onSuccess("Client created successfully");
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{client ? "Edit Client" : "Add Client"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {Object.values(errors).some((error) => error) && (
            <Alert severity="error">
              Please fix the errors below before submitting
            </Alert>
          )}

          {!client && (
            <>
              <TextField
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                required
                error={touched.username && !!errors.username}
                helperText={touched.username && errors.username}
              />
              <TextField
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                required
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
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
            onBlur={handleBlur}
            fullWidth
            margin="normal"
            required
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            margin="normal"
            required
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
          />
          <TextField
            name="phone"
            label="Phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            margin="normal"
            required
            error={touched.phone && !!errors.phone}
            helperText={touched.phone && errors.phone}
          />
          <TextField
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            margin="normal"
            required
            multiline
            rows={3}
            error={touched.address && !!errors.address}
            helperText={touched.address && errors.address}
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
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : client ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
