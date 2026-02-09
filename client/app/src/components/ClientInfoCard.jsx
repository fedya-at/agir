// ClientInfoCard.js
import React, { useEffect, useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Person, History } from "@mui/icons-material";
import StyledCard from "./StyledCard";
import SectionHeader from "./SectionHeader";
import DetailRow from "./DetailRow";
import DetailLabel from "./DetailLabel";
import DetailValue from "./DetailValue";
import ClientInterventionsModal from "./modals/ClientInterventionsModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchInterventionsByClientId } from "../store/interventionsSlice";
import toast from "react-hot-toast";

const ClientInfoCard = ({ person, modalOpen, setModalOpen }) => {
  const dispatch = useDispatch();
  const { interventions } = useSelector((state) => state.interventions);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleOpenModal = async (e) => {
    e?.stopPropagation();
    if (!person?.id) {
      toast.error("No client ID found.");
      return;
    }

    // Only update state if component is mounted
    if (isMounted.current) {
      setModalOpen(true);
    }

    const toastId = toast.loading("Loading interventions...");
    try {
      await dispatch(fetchInterventionsByClientId(person.id)).unwrap();
      toast.success("Interventions loaded!", { id: toastId });
    } catch (err) {
      toast.error(err?.message || "Failed to load interventions.", {
        id: toastId,
      });
    }
  };

  if (!person) {
    return (
      <StyledCard>
        <Box sx={{ p: 3 }}>
          <SectionHeader variant="h5">
            <Person fontSize="small" /> Client Information
          </SectionHeader>
          <Typography color="text.secondary">
            No client information available
          </Typography>
        </Box>
      </StyledCard>
    );
  }

  return (
    <>
      <StyledCard>
        <Box sx={{ p: 3 }}>
          <SectionHeader variant="h5">
            <Person fontSize="small" /> Client Information
          </SectionHeader>

          <DetailRow>
            <DetailLabel>Name:</DetailLabel>
            <DetailValue>{person.name}</DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>Email:</DetailLabel>
            <DetailValue>{person.email}</DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>Phone:</DetailLabel>
            <DetailValue>{person.phone || "N/A"}</DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>Address:</DetailLabel>
            <DetailValue>
              {person.address
                ? `${person.address.street}, ${person.address.city}`
                : "N/A"}
            </DetailValue>
          </DetailRow>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={(e) => {
                
                handleOpenModal(e);
              }}
              fullWidth
            >
              View All Interventions
            </Button>
          </Box>
        </Box>
      </StyledCard>

      <ClientInterventionsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        interventions={interventions}
      />
    </>
  );
};

export default ClientInfoCard;
