import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { fr } from "date-fns/locale";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  fetchClientById,
  fetchClientInterventions,
} from "../store/clientsSlice";
import BackButton from "../components/BackButton";

const statusConfig = {
  0: { label: "En attente", color: "default" },
  1: { label: "En cours", color: "primary" },
  2: { label: "Terminé", color: "success" },
  3: { label: "Annulé", color: "error" },
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
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Get user from Redux auth state
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      let loadingToast;
      try {
        setLoading(true);
        loadingToast = toast.loading("Chargement de vos interventions...");

        // 1. Fetch client by user ID
        const client = await dispatch(fetchClientById(userId)).unwrap();
        setCurrentClient(client);

        // 2. Fetch interventions using the client's ID
        const interventionsData = await dispatch(
          fetchClientInterventions(client.id)
        ).unwrap();
        setInterventions(interventionsData);

        toast.success("Interventions chargées avec succès !", {
          id: loadingToast,
        });
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des données");
        toast.error("Erreur lors du chargement des données", {
          id: loadingToast,
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, dispatch]);

  // Filtered and sorted interventions
  const filteredAndSortedInterventions = useMemo(() => {
    let filtered = interventions.filter((intervention) =>
      intervention.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);

      if (sortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return filtered;
  }, [interventions, searchTerm, sortOrder]);

  const handleSortToggle = useCallback(() => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  }, [sortOrder]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box
          component="section"
          sx={{ bgcolor: "#fff", py: 8, minHeight: "80vh" }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Chargement en cours...
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
              backgroundColor: "#b8ff00",
              color: "#000000",
              "&:hover": {
                backgroundColor: "#a3e600",
              },
            }}
          >
            Réessayer
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
            Profil client non trouvé pour cet utilisateur.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate("/profile")}
            sx={{
              mt: 2,
              backgroundColor: "#b8ff00",
              color: "#000000",
              "&:hover": {
                backgroundColor: "#a3e600",
              },
            }}
          >
            Compléter le profil
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
                Mes Interventions
              </Typography>
              <Typography variant="subtitle1">
                Client: {currentClient.name || user?.username || "Non spécifié"}
              </Typography>
            </div>
            <Typography variant="body2" color="text.secondary">
              {filteredAndSortedInterventions.length} sur {interventions.length}{" "}
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
                placeholder="Rechercher par description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 300 },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#b8ff00",
                    },
                  },
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
                title={`Trier par date ${
                  sortOrder === "asc" ? "croissante" : "décroissante"
                }`}
              >
                <Button
                  variant="outlined"
                  onClick={handleSortToggle}
                  startIcon={
                    sortOrder === "asc" ? <SortAscIcon /> : <SortIcon />
                  }
                  sx={{
                    borderColor: "#b8ff00",
                    color: "#000000",
                    "&:hover": {
                      borderColor: "#a3e600",
                      backgroundColor: "rgba(184, 255, 0, 0.1)",
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
                        Date de début
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", bgcolor: "background.paper" }}
                      >
                        Statut
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
                              ? format(new Date(intervention.startDate), "PP", {
                                  locale: fr,
                                })
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
                                borderColor: "#b8ff00",
                                color: "#000000",
                                "&:hover": {
                                  borderColor: "#a3e600",
                                  backgroundColor: "rgba(184, 255, 0, 0.1)",
                                },
                              }}
                            >
                              Voir détails
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
                ? `Aucune intervention trouvée pour "${searchTerm}"`
                : "Aucune intervention trouvée pour ce client."}
            </Alert>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default ClientInterventionsScreen;
