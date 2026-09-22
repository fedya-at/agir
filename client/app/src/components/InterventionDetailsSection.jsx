import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { Edit } from "@mui/icons-material";
import StyledCard from "./StyledCard";
import SectionHeader from "./SectionHeader";
import DetailLabel from "./DetailLabel";
import DetailValue from "./DetailValue";
import DetailRow from "./DetailRow";
import dayjs from "dayjs";

const InterventionDetailsSection = ({ intervention }) => {
  return (
    <StyledCard sx={{ mb: 3 }}>
      <Box sx={{ p: 3 }}>
        <SectionHeader variant="h5">
          <Edit fontSize="small" /> Intervention Details
        </SectionHeader>
        <Typography paragraph sx={{ mb: 3 }}>
          {intervention.description}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DetailRow>
              <DetailLabel>Start Date:</DetailLabel>
              <DetailValue>
                {dayjs(intervention.startDate).format("MMM D, YYYY h:mm A")}
              </DetailValue>
            </DetailRow>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailRow>
              <DetailLabel>End Date:</DetailLabel>
              <DetailValue>
                {intervention.endDate
                  ? dayjs(intervention.endDate).format("MMM D, YYYY h:mm A")
                  : "Ongoing"}
              </DetailValue>
            </DetailRow>
          </Grid>
        </Grid>
      </Box>
    </StyledCard>
  );
};

export default InterventionDetailsSection;
