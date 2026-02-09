import React from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { Add, Inventory } from "@mui/icons-material";
import StyledCard from "./StyledCard";
import SectionHeader from "./SectionHeader";
import DetailLabel from "./DetailLabel";
import DetailValue from "./DetailValue";

const PartsSection = ({
  intervention,
  isTechnician,
  onAddPartClick,
  onDeletePart,
  isLoading,
}) => {
  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <SectionHeader variant="h5">
            <Inventory fontSize="small" /> Parts Used
          </SectionHeader>
          {isTechnician && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddPartClick}
              disabled={isLoading}
            >
              Add Part
            </Button>
          )}
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : intervention.interventionParts?.length > 0 ? (
          <PartsTable
            parts={intervention.interventionParts}
            isTechnician={isTechnician}
            onDeletePart={onDeletePart}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              px: 2,
            }}
          >
            <Inventory
              sx={{
                fontSize: 48,
                color: "text.disabled",
                mb: 2,
              }}
            />
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 1 }}
            >
              No parts required yet
            </Typography>
            <Typography
              variant="body2"
              color="text.disabled"
              textAlign="center"
            >
              {isTechnician
                ? "Click 'Add Part' when parts are needed for this intervention"
                : "Parts will appear here when added by the technician"}
            </Typography>
          </Box>
        )}
      </Box>
    </StyledCard>
  );
};

const PartsTable = ({ parts, isTechnician, onDeletePart }) => {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "8px 16px" }}>
              <DetailLabel>Part Name</DetailLabel>
            </th>
            <th style={{ textAlign: "left", padding: "8px 16px" }}>
              <DetailLabel>Quantity</DetailLabel>
            </th>
            <th style={{ textAlign: "left", padding: "8px 16px" }}>
              <DetailLabel>Unit Price</DetailLabel>
            </th>
            <th style={{ textAlign: "right", padding: "8px 16px" }}>
              <DetailLabel>Total</DetailLabel>
            </th>
            {isTechnician && (
              <th style={{ textAlign: "right", padding: "8px 16px" }}>
                <DetailLabel>Actions</DetailLabel>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <PartRow
              key={part.partId}
              part={part}
              isTechnician={isTechnician}
              onDeletePart={onDeletePart}
            />
          ))}
        </tbody>
      </table>
    </Box>
  );
};

const PartRow = ({ part, isTechnician, onDeletePart }) => {
  return (
    <tr style={{ borderBottom: "1px solid #eee" }}>
      <td style={{ padding: "12px 16px" }}>
        <DetailValue>{part.part?.name || "N/A"}</DetailValue>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <DetailValue>{part.quantity}</DetailValue>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <DetailValue>{part.unitPrice?.toFixed(2) || "0.00"} DT</DetailValue>
      </td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <DetailValue>
          {(part.quantity * (part.unitPrice || 0)).toFixed(2)} DT
        </DetailValue>
      </td>
      {isTechnician && (
        <td style={{ padding: "12px 16px", textAlign: "right" }}>
          <Button
            color="error"
            size="small"
            onClick={() => onDeletePart(part.id)}
          >
            Remove
          </Button>
        </td>
      )}
    </tr>
  );
};

export default PartsSection;
