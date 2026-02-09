/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchInterventionsByDateRange } from "../store/interventionsSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, differenceInDays } from "date-fns";
import fr from "date-fns/locale/fr"; // Use French locale for Tunisia

// Setup date-fns localizer for react-big-calendar
const locales = { fr: fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const STATUS_COLORS = {
  Pending: "#ff9800", // orange
  InProgress: "#2196f3", // blue
  Completed: "#4caf50", // green
  Cancelled: "#f44336", // red
  0: "#ff9800",
  1: "#2196f3",
  2: "#4caf50",
  3: "#f44336",
};

const STATUS_LABELS = ["Pending", "InProgress", "Completed", "Cancelled"];

const CalendarScreens = () => {
  const dispatch = useDispatch();
  const { interventions, status } = useSelector((state) => state.interventions);
  const { user } = useSelector((state) => state.auth);

  // Date range state for filtering
  const [startDate, setStartDate] = useState(() =>
    format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(() =>
    format(new Date(new Date().getFullYear() + 1, 0, 1), "yyyy-MM-dd")
  );

  // Fetch interventions for the selected date range
  useEffect(() => {
    const fetchData = async () => {
      const result = await dispatch(
        fetchInterventionsByDateRange({ startDate, endDate })
      );
    };
    fetchData();
  }, [dispatch, startDate, endDate]);

  // Filter interventions assigned to the current technician (if technician)
  const myInterventions = useMemo(() => {
    if (!user) return [];
    if (user.role === 1) {
      // Technician
      return interventions.filter((i) => i.technicianId === user.id);
    }
    return interventions;
  }, [interventions, user]);

  // Prepare events for the calendar
  const calendarEvents = useMemo(
    () =>
      myInterventions
        .map((intervention) => {
          const start = new Date(intervention.startDate);
          const end = intervention.endDate
            ? new Date(intervention.endDate)
            : new Date(intervention.startDate);

          if (isNaN(start.getTime())) {
            console.error("Invalid startDate:", intervention.startDate);
            return null;
          }
          if (isNaN(end.getTime())) {
            console.error("Invalid endDate:", intervention.endDate);
            return null;
          }

          const status =
            typeof intervention.status === "number"
              ? STATUS_LABELS[intervention.status]
              : intervention.status;

          return {
            id: intervention.id,
            title: `${status}: ${
              intervention.description?.slice(0, 20) || "No description"
            }`,
            start,
            end,
            status,
            description: intervention.description,
          };
        })
        .filter(Boolean),
    [myInterventions]
  );

  // Find pending interventions older than 3 days
  const pendingAlerts = useMemo(
    () =>
      myInterventions.filter((intervention) => {
        const status =
          typeof intervention.status === "number"
            ? STATUS_LABELS[intervention.status]
            : intervention.status;
        if (status !== "Pending") return false;
        const days = differenceInDays(
          new Date(),
          new Date(intervention.startDate)
        );
        return days > 3;
      }),
    [myInterventions]
  );

  // Custom event style for calendar
  const eventStyleGetter = (event) => {
    const color = STATUS_COLORS[event.status] || "#757575";
    return {
      style: {
        backgroundColor: color,
        borderRadius: "8px",
        color: "#fff",
        border: "none",
        display: "flex",
        alignItems: "center",
        fontWeight: 600,
        fontSize: 15,
        padding: "2px 8px",
        minHeight: 36,
        minWidth: 120,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      },
    };
  };

  // Custom event rendering for react-big-calendar
  const EventComponent = ({ event }) => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Chip
        label={event.status}
        size="small"
        sx={{
          backgroundColor: STATUS_COLORS[event.status],
          color: "#fff",
          fontWeight: 600,
          mr: 1,
          height: 22,
        }}
      />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {event.description?.length > 20
          ? event.description.slice(0, 20) + "..."
          : event.description || "No description"}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f7f7f7",
      }}
    >
      <Navbar />
      <Box
        sx={{
          flex: 1,
          px: { xs: 1, md: 4 },
          py: { xs: 2, md: 4 },
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
          Interventions Calendar
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Date Range Filter */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="outlined"
            onClick={() =>
              dispatch(fetchInterventionsByDateRange({ startDate, endDate }))
            }
            sx={{ minWidth: 120 }}
          >
            Rechercher
          </Button>
        </Box>

        {/* Alert Section */}
        {pendingAlerts.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              ⚠️ Interventions pending for more than 3 days:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {pendingAlerts.map((intervention) => (
                <li key={intervention.id}>
                  <strong>ID:</strong> {intervention.id} &mdash;{" "}
                  <strong>Description:</strong>{" "}
                  {intervention.description || "No description"} &mdash;{" "}
                  <strong>Created:</strong>{" "}
                  {format(new Date(intervention.startDate), "MMM d, yyyy")}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Legend */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Status Legend:
          </Typography>
          <Grid container spacing={2}>
            {STATUS_LABELS.map((label) => (
              <Grid item key={label}>
                <Chip
                  label={label}
                  sx={{
                    backgroundColor: STATUS_COLORS[label],
                    color: "#fff",
                    fontWeight: 600,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Calendar */}
        <Paper sx={{ p: 2, mb: 4 }}>
          {status === "loading" ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent,
              }}
              popup
            />
          )}
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default CalendarScreens;
