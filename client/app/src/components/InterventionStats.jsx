import React, { useState } from "react";
import { Stack, Typography, Box, Button } from "@mui/material";
import { useSelector } from "react-redux";
import {
  Assignment,
  Schedule,
  CheckCircle,
  Cancel,
  AddCircleOutline,
} from "@mui/icons-material";
import StatCard from "./StatCard";
import AddInterventionModal from "./modals/AddInterventionModal";

const InterventionStats = React.memo(({ interventions, onFilter }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { clients } = useSelector((state) => state.clients);
  const { technicians } = useSelector((state) => state.technicians);

  const stats = React.useMemo(() => {
    const total = interventions?.length || 0;
    const pending = interventions?.filter((i) => i.status === 0)?.length || 0;
    const inProgress =
      interventions?.filter((i) => i.status === 1)?.length || 0;
    const completed = interventions?.filter((i) => i.status === 2)?.length || 0;
    const cancelled = interventions?.filter((i) => i.status === 3)?.length || 0;

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      active: total - cancelled,
    };
  }, [interventions]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
          position: "relative",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des Interventions
          </Typography>
          <Typography variant="subtitle1">
            Suivi et gestion des interventions en cours
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={handleOpenModal}
            sx={{
              height: "fit-content",
              alignSelf: "flex-end",
              mt: 2,
            }}
          >
            Nouvelle Intervention
          </Button>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            mt: { xs: 2, md: 0 },
            flexWrap: "wrap",
            justifyContent: { xs: "center", md: "flex-end" },
          }}
        >
          <StatCard
            icon={<Assignment color="primary" />}
            label="Total"
            value={stats.total}
            bgColor="#e3f2fd"
            onClick={() => onFilter("all")}
          />
          <StatCard
            icon={<Assignment color="info" />}
            label="Actives"
            value={stats.active}
            bgColor="#e1f5fe"
            onClick={() => onFilter("active")}
          />
          <StatCard
            icon={<Schedule color="warning" />}
            label="En attente"
            value={stats.pending}
            bgColor="#fff3e0"
            onClick={() => onFilter(0)}
          />
          <StatCard
            icon={<Schedule color="info" />}
            label="En cours"
            value={stats.inProgress}
            bgColor="#e1f5fe"
            onClick={() => onFilter(1)}
          />
          <StatCard
            icon={<CheckCircle color="success" />}
            label="Terminées"
            value={stats.completed}
            bgColor="#e8f5e9"
            onClick={() => onFilter(2)}
          />
          <StatCard
            icon={<Cancel color="error" />}
            label="Annulées"
            value={stats.cancelled}
            bgColor="#ffebee"
            onClick={() => onFilter(3)}
          />
        </Stack>
      </Box>

      <AddInterventionModal
        open={modalOpen}
        handleClose={handleCloseModal}
        clients={clients}
        technicians={technicians}
      />
    </>
  );
});

export default InterventionStats;
