/* eslint-disable no-unused-vars */
import React, { lazy, Suspense, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  fetchInterventions,
  fetchInterventionsByStatus,
} from "../../store/interventionsSlice";
import InterventionStats from "../../components/InterventionStats";
import InterventionList from "../../components/InterventionList";
import { Box, CssBaseline, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const Navbar = lazy(() => import("../../components/Navbar"));
const Footer = lazy(() => import("../../components/Footer"));

export default function ManageInterventions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { interventions, status, error } = useSelector(
    (state) => state.interventions
  );

  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const toastId = toast.loading("Chargement des données...");
      try {
        await dispatch(fetchInterventions()).unwrap();
        toast.success("Données chargées avec succès !", { id: toastId });
      } catch (err) {
        toast.error(`Échec du chargement des données : ${err.message}`, {
          id: toastId,
        });
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredInterventions(interventions);
    } else if (filterStatus === "active") {
      setFilteredInterventions(
        interventions.filter((i) => i.status === 0 || i.status === 1)
      );
    } else {
      setFilteredInterventions(
        interventions.filter((i) => i.status === filterStatus)
      );
    }
  }, [filterStatus, interventions]);

  const handleFilter = (status) => {
    setFilterStatus(status);
  };

 

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline enableColorScheme />
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <Box sx={{ flexGrow: 1, p: 3,width:"100%" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <InterventionStats
            interventions={interventions || []}
            onFilter={handleFilter}
          />
        
        </Stack>
        <InterventionList interventions={filteredInterventions} />
      </Box>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </Box>
  );
}
