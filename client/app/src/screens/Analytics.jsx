/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  CircularProgress,
  Avatar,
  Button,
  Fade,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchUsers } from "../store/usersSlice";
import {
  fetchParts,
  selectAllParts,
  selectPartsStatus,
} from "../store/partsSlice";
import { fetchClients } from "../store/clientsSlice";
import { fetchInterventions } from "../store/interventionsSlice";
import { fetchInvoices, fetchGlobalLaborCost } from "../store/invoiceSlice";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const Analytics = () => {
  const dispatch = useDispatch();

  // Redux selectors
  const users = useSelector((state) => state.users.users);
  const usersStatus = useSelector((state) => state.users.status);
  const parts = useSelector(selectAllParts);
  const partsStatus = useSelector(selectPartsStatus);
  const clients = useSelector((state) => state.clients.clients);
  const clientsStatus = useSelector((state) => state.clients.status);
  const interventions = useSelector(
    (state) => state.interventions.interventions
  );
  const interventionsStatus = useSelector(
    (state) => state.interventions.status
  );
  const invoices = useSelector((state) => state.invoices.items);
  const invoicesStatus = useSelector((state) => state.invoices.status);
  const globalLaborCost = useSelector(
    (state) => state.invoices.globalLaborCost
  );
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchParts());
    dispatch(fetchClients());
    dispatch(fetchInterventions());
    dispatch(fetchInvoices());
    dispatch(fetchGlobalLaborCost());
  }, [dispatch]);

  const isLoading = useMemo(
    () =>
      usersStatus === "loading" ||
      partsStatus === "loading" ||
      clientsStatus === "loading" ||
      interventionsStatus === "loading" ||
      invoicesStatus === "loading",
    [
      usersStatus,
      partsStatus,
      clientsStatus,
      interventionsStatus,
      invoicesStatus,
    ]
  );

  // Analytics calculations - memoized for performance
  const userRolesCount = useMemo(
    () =>
      users.reduce(
        (acc, user) => {
          if (user.role === 0) acc.admins += 1;
          else if (user.role === 1) acc.technicians += 1;
          else acc.clients += 1;
          return acc;
        },
        { admins: 0, technicians: 0, clients: 0 }
      ),
    [users]
  );

  const interventionsByStatus = useMemo(
    () =>
      interventions.reduce(
        (acc, i) => {
          if (i.status === 0) acc.pending += 1;
          else if (i.status === 1) acc.inProgress += 1;
          else if (i.status === 2) acc.completed += 1;
          else if (i.status === 3) acc.cancelled += 1;
          return acc;
        },
        { pending: 0, inProgress: 0, completed: 0, cancelled: 0 }
      ),
    [interventions]
  );

  const partsLowStock = useMemo(
    () => parts.filter((p) => p.quantity <= 5),
    [parts]
  );
  const invoicesPaid = useMemo(
    () => invoices.filter((inv) => inv.paid).length,
    [invoices]
  );
  const invoicesUnpaid = useMemo(
    () => invoices.length - invoicesPaid,
    [invoices.length, invoicesPaid]
  );

  // Chart data
  const interventionsStatusData = {
    labels: ["En attente", "En cours", "Terminée", "Annulée"],
    datasets: [
      {
        label: "Interventions",
        data: [
          interventionsByStatus.pending,
          interventionsByStatus.inProgress,
          interventionsByStatus.completed,
          interventionsByStatus.cancelled,
        ],
        backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
      },
    ],
  };

  const usersRoleData = {
    labels: ["Admins", "Techniciens", "Clients"],
    datasets: [
      {
        label: "Utilisateurs",
        data: [
          userRolesCount.admins,
          userRolesCount.technicians,
          userRolesCount.clients,
        ],
        backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
      },
    ],
  };

  const invoicesPieData = {
    labels: ["Payées", "Non payées"],
    datasets: [
      {
        data: [invoicesPaid, invoicesUnpaid],
        backgroundColor: ["#4ECDC4", "#FF6B6B"],
      },
    ],
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F9FAFB",
        color: "#1F2937",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <Box
        sx={{
          flexGrow: 1,
          py: 6,
          padding: "20px",
          width: "90%",
          height: "100vh",
          mb: 4,
        }}
      >
        <Fade in timeout={800}>
          <Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ mb: 2, color: "#1F2937" }}
            >
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: "#6B7280" }}>
              Comprehensive overview of users, interventions, parts, clients,
              and invoices.
            </Typography>
          </Box>
        </Fade>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} sx={{ color: "#4ECDC4" }} />
          </Box>
        ) : (
          <Grid
            container
            direction="row"
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    mr: 2,
                    bgcolor: "#4ECDC4",
                    color: "#FFFFFF",
                  }}
                >
                  {currentUser?.username?.charAt(0)?.toUpperCase() || "?"}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: "#1F2937" }}>
                    {currentUser?.username || "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Email: {currentUser?.email || "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    Role:{" "}
                    {currentUser?.role === 0
                      ? "Admin"
                      : currentUser?.role === 1
                      ? "Technician"
                      : "Client"}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            {/* Key Metrics */}
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#E0E7FF",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" color="#4B5563">
                  Total Users
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#1F2937">
                  {users.length}
                </Typography>
                <Typography variant="caption" color="#6B7280">
                  From all records
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#D1FAE5",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" color="#4B5563">
                  Total Clients
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#1F2937">
                  {clients.length}
                </Typography>
                <Typography variant="caption" color="#6B7280">
                  Registered clients
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#FEF3C7",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" color="#4B5563">
                  Total Interventions
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#1F2937">
                  {interventions.length}
                </Typography>
                <Typography variant="caption" color="#6B7280">
                  Active interventions
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#C4B5FD",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" color="#4B5563">
                  Total Parts
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#1F2937">
                  {parts.length}
                </Typography>
                <Typography variant="caption" color="#6B7280">
                  Low Stock: {partsLowStock.length}
                </Typography>
              </Paper>
            </Grid>
            {/* Charts and Analysis */}
            <Grid item xs={6} md={6}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#1F2937", mb: 2 }}
                >
                  Interventions by Status
                </Typography>
                <Bar
                  data={interventionsStatusData}
                  options={{
                    plugins: { legend: { labels: { color: "#1F2937" } } },
                    scales: {
                      x: { ticks: { color: "#6B7280" } },
                      y: { ticks: { color: "#6B7280" } },
                    },
                  }}
                />
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    variant="outlined"
                    sx={{ color: "#4ECDC4", borderColor: "#4ECDC4" }}
                  >
                    Export
                  </Button>
                  <Typography variant="body2" color="#6B7280">
                    More Analysis
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="#1F2937"
                >
                  Users by Role
                </Typography>
                <Doughnut
                  data={usersRoleData}
                  options={{
                    plugins: { legend: { labels: { color: "#1F2937" } } },
                  }}
                />
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="#1F2937"
                >
                  Invoices: Paid vs Unpaid
                </Typography>
                <Pie
                  data={invoicesPieData}
                  options={{
                    plugins: { legend: { labels: { color: "#1F2937" } } },
                  }}
                />
              </Paper>
            </Grid>
            {/* Connected User */}
          </Grid>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default Analytics;
