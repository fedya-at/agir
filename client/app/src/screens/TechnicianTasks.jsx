import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// CORRECT: Keep the import from the interventions slice as you requested
import { fetchInterventionsByTechnicianId } from "../store/interventionsSlice";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import InterventionStats from "../components/InterventionStats";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingIndicator from "../components/LoadingIndicator";

const TechnicianTasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get the user from the auth slice
  const { user } = useSelector((state) => state.auth);

  // Get the interventions and their status from the CORRECT slice
  const { interventionsByTechnician, status, error } = useSelector(
    (state) => state.interventions
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // This single, streamlined useEffect handles data fetching.
  // It runs only when `user.id` becomes available.
  useEffect(() => {
    // Check if the user exists and is a technician (role 1)
    if (user?.id && user.role === 1) {
      // We don't need to fetch the technician details again.
      // We can use the user.id directly to get the interventions.
      dispatch(fetchInterventionsByTechnicianId(user.id));
    }
  }, [dispatch, user]); // Dependency array ensures this runs when user object is populated

  // This useEffect for filtering remains the same.
  // It will run whenever interventionsByTechnician changes.
  const filteredInterventions = React.useMemo(() => {
    if (!interventionsByTechnician) return [];
    return interventionsByTechnician.filter((intervention) => {
      const searchLower = searchTerm.toLowerCase();
      // Since your API returns the nested client object, this search will work.
      return (
        intervention.description?.toLowerCase().includes(searchLower) ||
        intervention.client?.name?.toLowerCase().includes(searchLower) ||
        intervention.status?.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [interventionsByTechnician, searchTerm]);

  const handleViewDetails = (interventionId) => {
    navigate(`/interventions/${interventionId}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // A function to get the string representation of the status
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "In Progress";
      case 2:
        return "Completed";
      case 3:
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  if (status === "loading") {
    return <LoadingIndicator />;
  }

  // Display error if the fetch failed
  if (error) {
    return (
      <>
      <Navbar/>
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Error loading tasks: {error}
        </Typography>
      </Box>
      <Footer/>
      </>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Assigned Tasks
        </Typography>

        <InterventionStats interventions={interventionsByTechnician || []} />

        <Paper sx={{ p: 2, mb: 2, mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by description, client name, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInterventions && filteredInterventions.length > 0 ? (
                  filteredInterventions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((intervention) => (
                      <TableRow key={intervention.id}>
                        <TableCell>#{intervention.id.slice(0, 8)}</TableCell>
                        <TableCell>{intervention.description}</TableCell>
                        <TableCell>
                          {/* This works because your API provides the nested client object */}
                          {intervention.client?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            intervention.startDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusText(intervention.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => handleViewDetails(intervention.id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      You have no assigned tasks.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInterventions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default TechnicianTasks;
