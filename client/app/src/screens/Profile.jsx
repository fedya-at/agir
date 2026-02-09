import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import Footer from "../components/Footer";
import ChangePasswordDialog from "../components/ChangePasswordDialog"; // Import the new dialog

import { updateUserProfile } from "../store/usersSlice";
import toast from "react-hot-toast";

const Profile = () => {
  const dispatch = useDispatch();
  // We only need the user from the auth slice. It has all the data.
  const { user, status } = useSelector((state) => state.auth);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false); // State for the dialog

  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  // A single form state is now sufficient
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    address: "", // For clients
    specialization: "", // For technicians
  });

  // When the user object is available, populate the form
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        specialization: user.specialization || "",
      });
    }
  }, [user]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Prepare the correct DTO based on the user's role
    let updateDto;
    if (user.role === 1) {
      // Technician
      updateDto = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
      };
    } else {
      // Client or admin
      updateDto = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };
    }

    const resultAction = await dispatch(
      updateUserProfile({ id: user.id, userData: updateDto })
    );

    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } else {
      toast.error(`Update failed: ${resultAction.payload}`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
        }}
      >
        <Navbar />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Alert
            severity="error"
            sx={{
              bgcolor: "transparent",
              border: "1px solid #000000",
              color: "#000000",
              "& .MuiAlert-icon": { color: "#000000" },
            }}
          >
            Veuillez vous connecter pour voir votre profil
          </Alert>
        </Box>
        <Footer />
      </Box>
    );
  }
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  if ((status === status) === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
        }}
      >
        <Navbar />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ color: "#000000" }} />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
        }}
      >
        <Navbar />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Alert
            severity="warning"
            sx={{
              bgcolor: "transparent",
              border: "1px solid #000000",
              color: "#000000",
              "& .MuiAlert-icon": { color: "#000000" },
            }}
          >
            Utilisateur non trouvé
          </Alert>
        </Box>
        <Footer />
      </Box>
    );
  }
  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <BackButton />
          <Card sx={{ boxShadow: "none" }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 3, bgcolor: "primary.main" }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {getTimeBasedGreeting()}, {user?.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {user?.role === 0
                      ? "Administrateur"
                      : user?.role === 1
                      ? "Technicien"
                      : "Client"}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                {activeTab !== 2 && // Hide edit buttons on security tab
                  (editMode ? (
                    <>
                      <Button variant="contained" onClick={handleSave}>
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleEditToggle}
                        sx={{ ml: 2 }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="contained" onClick={handleEditToggle}>
                      Edit Profile
                    </Button>
                  ))}
              </Box>

              <Divider sx={{ my: 4 }} />

              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
                <Tab label="Account Details" />
                <Tab label="Profile Details" />
                <Tab label="Security" />
              </Tabs>

              {/* Tab 0: Account Details */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Username"
                      value={user.username}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Role"
                      value={
                        user.role === 0
                          ? "Admin"
                          : user.role === 1
                          ? "Technician"
                          : "Client"
                      }
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Status"
                      value={user.isActive ? "Active" : "Inactive"}
                      fullWidth
                      disabled
                    />
                  </Grid>
                </Grid>
              )}

              {/* Tab 1: Profile Details */}
              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      fullWidth
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      fullWidth
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      fullWidth
                      disabled={!editMode}
                    />
                  </Grid>

                  {(user.role === 0 || user.role === 2) && (
                    <Grid item xs={12}>
                      <TextField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
                        fullWidth
                        disabled={!editMode}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  )}
                  {user.role === 1 && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Specialization"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleFormChange}
                          fullWidth
                          disabled={!editMode}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Hire Date"
                          value={new Date(user.hireDate).toLocaleDateString()}
                          fullWidth
                          disabled
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              )}

              {/* Tab 2: Security */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
        <Footer />
      </Box>

      {/* The Change Password Dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        userId={user.id}
      />
    </>
  );
};

export default Profile;
