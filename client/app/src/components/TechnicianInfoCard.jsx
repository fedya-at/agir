import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Build } from "@mui/icons-material";
import StyledCard from "./StyledCard";
import SectionHeader from "./SectionHeader";
import DetailRow from "./DetailRow";
import DetailLabel from "./DetailLabel";
import DetailValue from "./DetailValue";

const TechnicianInfoCard = ({ person, onAssignClick }) => {
  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <SectionHeader variant="h5">
          <Build fontSize="small" /> Assigned Technician
        </SectionHeader>

        {person ? (
          <>
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
              <DetailValue>{person.phoneNumber || "N/A"}</DetailValue>
            </DetailRow>
          </>
        ) : (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No technician assigned
          </Typography>
        )}

        {onAssignClick && (
          <Button
            variant="outlined"
            color="primary"
            onClick={onAssignClick}
            sx={{ mt: 2 }}
          >
            Assign Technician
          </Button>
        )}
      </Box>
    </StyledCard>
  );
};

export default TechnicianInfoCard;
