import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Sort as SortIcon,
  SortByAlpha as SortAscIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  fetchClientById,
  fetchClientInterventions,
} from "../store/clientsSlice";
import BackButton from "../components/BackButton";

const statusConfig = {
  0: { label: "Pending", color: "default" },
  1: { label: "In Progress", color: "primary" },
  2: { label: "Completed", color: "success" },
  3: { label: "Cancelled", color: "error" },
};

const ClientInterventionsScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentClient, setCurrentClient] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          throw new Error("User information not found. Please log in again.");
        }

        let clientId = user.id;

        try {
          const clientData = await dispatch(fetchClientById(clientId)).unwrap();
          setCurrentClient(clientData);
        } catch {
          setCurrentClient({
            id: clientId,
            name: user.username || user.name || "Client",
            email: user.email,
          });
        }

        const interventionsData = await dispatch(
          fetchClientInterventions(clientId)
        ).unwrap();
        setInterventions(interventionsData || []);
      } catch (err) {
        console.error("Error loading interventions:", err);
        setError(err.message || "Failed to load interventions");
        toast.error("Failed to load interventions");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadClientData();
    }
  }, [dispatch, user]);

  const filteredAndSortedInterventions = useMemo(() => {
    let result = [...interventions];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.description?.toLowerCase().includes(searchLower) ||
          item.id?.toString().includes(searchLower)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.startDate || 0);
      const dateB = new Date(b.startDate || 0);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [interventions, searchTerm, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ bgcolor: "#fff", py: 8, minHeight: "80vh" }}>
          <Container maxWidth="lg">
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="50vh"
            >
              <Typography variant="h6" color="text.secondary">
                Loading interventions...
              </Typography>
            </Box>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              mt: 2,
              backgroundColor: "#1976d2",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#115293",
              },
            }}
          >
            Retry
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  if (!currentClient) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Client profile not found for this user.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate("/profile")}
            sx={{
              mt: 2,
              backgroundColor: "#1976d2",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#115293",
              },
            }}
          >
            Complete Profile
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <Box
        component="section"
        sx={{ bgcolor: "#fff", py: 8, minHeight: "80vh" }}
      >
        <Container maxWidth="lg">
          <BackButton />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <div>
              <Typography variant="h4" gutterBottom>
                My Interventions
              </Typography>
              <Typography variant="subtitle1">
                Client: {currentClient.name || user?.username || "Not specified"}
              </Typography>
            </div>
            <Typography variant="body2" color="text.secondary">
              {filteredAndSortedInterventions.length} of {interventions.length}{" "}
              intervention(s)
            </Typography>
          </Stack>

          {/* Search and Sort Controls */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <TextField
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 300 },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClearSearch}
                        size="small"
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Tooltip
                title={`Sort by date (${
                  sortOrder === "asc" ? "Ascending" : "Descending"
                })`}
              >
                <Button
                  variant="outlined"
                  onClick={handleSortToggle}
                  startIcon={
                    sortOrder === "asc" ? <SortAscIcon /> : <SortIcon />
                  }
                  sx={{
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      borderColor: "#115293",
                      backgroundColor: "rgba(25, 118, 210, 0.05)",
                    },
                  }}
                >
                  Date {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </Tooltip>
            </Stack>
          </Paper>

          {filteredAndSortedInterventions.length > 0 ? (
            <Paper elevation={3} sx={{ overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
                      >
                        Description
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
                      >
                        Start Date
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSortedInterventions.map((intervention) => {
                      const status =
                        statusConfig[intervention.status] || statusConfig[0];
                      return (
                        <TableRow key={intervention.id} hover>
                          <TableCell sx={{ maxWidth: 300 }}>
                            {intervention.description || "—"}
                          </TableCell>
                          <TableCell>
                            {intervention.startDate
                              ? format(new Date(intervention.startDate), "PP")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              color={status.color}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                navigate(
                                  `/client/interventions/${intervention.id}`
                                )
                              }
                              sx={{
                                textTransform: "none",
                                borderColor: "#1976d2",
                                color: "#1976d2",
                                "&:hover": {
                                  borderColor: "#115293",
                                  backgroundColor: "rgba(25, 118, 210, 0.05)",
                                },
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Alert severity="info" sx={{ mt: 3 }}>
              {searchTerm
                ? `No interventions found matching "${searchTerm}"`
                : "No interventions found for this client."}
            </Alert>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default ClientInterventionsScreen;
