import { Box, Typography, Card, styled } from "@mui/material";

const StyledCard = styled(Card)(() => ({
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: theme.spacing(1.5),
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const DetailValue = styled(Typography)(() => ({
  fontWeight: 500,
}));

// PersonInfoCard Component
const PersonInfoCard = ({ title, person, icon, action }) => {
  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <SectionHeader variant="h5">
          {icon} {title}
        </SectionHeader>
        {person ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <DetailRow>
              <DetailLabel>Name</DetailLabel>
              <DetailValue>{person.name}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Email</DetailLabel>
              <DetailValue>{person.email}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Phone</DetailLabel>
              <DetailValue>{person.phone || "N/A"}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>
                {title.includes("Technician") ? "Specialization" : "Address"}
              </DetailLabel>
              <DetailValue>
                {title.includes("Technician")
                  ? person.specialization
                  : person.address}
              </DetailValue>
            </DetailRow>
          </Box>
        ) : (
          <Typography color="text.secondary">
            No {title.includes("Technician") ? "technician" : "client"} assigned
          </Typography>
        )}
        {action && <Box sx={{ mt: 3, textAlign: "right" }}>{action}</Box>}
      </Box>
    </StyledCard>
  );
};

export default PersonInfoCard;
