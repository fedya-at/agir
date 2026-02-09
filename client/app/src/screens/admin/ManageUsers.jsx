import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Tab,
  Tabs,
  Box,
  CircularProgress,
  Typography,
  Button,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchTechnicians } from "../../store/techniciansSlice";
import { fetchClients } from "../../store/clientsSlice";
import { fetchUsers } from "../../store/usersSlice";
import TechnicianDialog from "../../components/TechnicianDialog";
import ClientDialog from "../../components/ClientDialog";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";

import GroupIcon from "@mui/icons-material/Group";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { fetchAdmins } from "../../store/adminsSlice";

// Lazy load components
const TechnicianTable = lazy(() => import("../../components/TechnicianTable"));
const ClientTable = lazy(() => import("../../components/ClientTable"));
const UserTable = lazy(() => import("../../components/UserTable")); // New component for users
const Navbar = lazy(() => import("../../components/Navbar"));
const Footer = lazy(() => import("../../components/Footer"));
const AdminDialog = lazy(() => import("../../components/AdminDialog"));
const AdminsTable = lazy(() => import("../../components/AdminsTable")); // New component for admins
// Preload components
const preloadComponents = () => {
  import("../../components/TechnicianTable");
  import("../../components/ClientTable");
  import("../../components/UserTable"); // Preload user table
  import("../../components/Navbar");
  import("../../components/Footer");
  import("../../components/AdminDialog");
  import("../../components/AdminsTable"); // Preload admin table
};

const LoadingPlaceholder = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
    }}
  >
    <CircularProgress color="primary" />
  </Box>
);

export default function ManageUsers() {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("technician"); // Track dialog type
  const { admins, status: adminStatus } = useSelector((state) => state.admins);

  const { technicians, status: techStatus } = useSelector(
    (state) => state.technicians
  );
  const { clients, status: clientStatus } = useSelector(
    (state) => state.clients
  );
  const { users, status: userStatus } = useSelector((state) => state.users);

  useEffect(() => {
    // Preload components on mount
    preloadComponents();
  }, []);

  useEffect(() => {
    // Fetch data based on active tab
    switch (activeTab) {
      case 0: // All users
        dispatch(fetchUsers());
        break;
      case 1: // Admins
        dispatch(fetchAdmins());
        break;
      case 2: // Technicians
        dispatch(fetchTechnicians());
        break;
      case 3: // Clients
        dispatch(fetchClients());
        break;
      default:
        break;
    }
  }, [dispatch, activeTab]);

  const isLoading =
    userStatus === "loading" ||
    techStatus === "loading" ||
    clientStatus === "loading" ||
    adminStatus === "loading";

  const handleAddClick = () => {
    switch (activeTab) {
      case 1: // Admins
        setDialogType("admin");
        break;
      case 2: // Technicians
        setDialogType("technician");
        break;
      case 3: // Clients
        setDialogType("client");
        break;
      default:
        setDialogType("user");
    }
    setOpenDialog(true);
  };

  const handleDialogSuccess = (message) => {
    toast.success(message);
    setOpenDialog(false);
    // Refresh the data for the current tab
    handleReload();
  };

  const handleDialogError = (error) => {
    toast.error(error);
  };

  const handleReload = () => {
    switch (activeTab) {
      case 0: // All users
        dispatch(fetchUsers());
        break;
      case 1: // Admins
        dispatch(fetchAdmins());
        break;
      case 2: // Technicians
        dispatch(fetchTechnicians());
        break;
      case 3: // Clients
        dispatch(fetchClients());
        break;
      default:
        break;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f9f9f9",
      }}
    >
      <Suspense fallback={<LoadingPlaceholder />}>
        <Navbar />
      </Suspense>

      <Box sx={{ p: 4, flex: 1 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          {t("manageUsers")}
        </Typography>

        {/* Top Section: Tabs + Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: "auto" }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label={t("allUsers")}
            />
            <Tab
              icon={<AdminPanelSettingsIcon />}
              iconPosition="start"
              label={t("administrators")}
            />
            <Tab
              icon={<GroupIcon />}
              iconPosition="start"
              label={t("technicians")}
            />
            <Tab
              icon={<PeopleAltIcon />}
              iconPosition="start"
              label={t("clients")}
            />
          </Tabs>

          {activeTab >= 1 && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {activeTab >= 1 && (
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddClick}
                  sx={{
                    backgroundColor: "#1976d2",
                    "&:hover": { backgroundColor: "#115293" },
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    fontWeight: "bold",
                  }}
                >
                  {t("add")}{" "}
                  {activeTab === 1
                    ? t("administrators").slice(0, -1) // Remove 's' from administrators
                    : activeTab === 2
                    ? t("technicians").slice(0, -1) // Remove 's' from technicians
                    : t("clients").slice(0, -1)}{" "}
                  {/* Remove 's' from clients */}
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReload}
                sx={{
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2,
                  fontWeight: "bold",
                }}
              >
                {t("reload")}
              </Button>
            </Box>
          )}
        </Box>

        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <Suspense fallback={<LoadingPlaceholder />}>
            {activeTab === 0 && <UserTable users={users} />}
            {activeTab === 1 && <AdminsTable admins={admins} />}
            {activeTab === 2 && <TechnicianTable technicians={technicians} />}
            {activeTab === 3 && <ClientTable clients={clients} />}
          </Suspense>
        )}

        {/* Dialogs */}
        {openDialog && (
          <>
            {dialogType === "admin" && (
              <AdminDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSuccess={handleDialogSuccess}
                onError={handleDialogError}
              />
            )}
            {dialogType === "technician" && (
              <TechnicianDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSuccess={handleDialogSuccess}
                onError={handleDialogError}
              />
            )}
            {dialogType === "client" && (
              <ClientDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSuccess={handleDialogSuccess}
                onError={handleDialogError}
              />
            )}
          </>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
