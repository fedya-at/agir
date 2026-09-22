// InterventionDetailsCard.jsx
import { Box, Typography, Card, CardContent, Divider } from "@mui/material";
import dayjs from "dayjs";
import StatusChip from "./StatusChip";

const InterventionDetailsCard = ({ intervention }) => {
  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)", // Increased shadow for emphasis
        border: "1px solid #000000FF",
        backgroundColor: "#fff",
        width: "100%",
        minHeight: "400px", // Increased height
      }}
    >
      <CardContent sx={{ p: 6 }}>
        {" "}
        {/* Increased padding */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4, // Increased margin
          }}
        >
          <Typography variant="h4">Details</Typography>{" "}
          {/* Increased font size */}
          <StatusChip status={intervention.status} />
        </Box>
        <Divider sx={{ mb: 5 }} /> {/* Increased spacing after divider */}
        <Typography variant="body1" paragraph sx={{ fontSize: "1.2rem" }}>
          {intervention.description}
        </Typography>
        <Box sx={{ display: "flex", gap: 10, mb: 4 }}>
          {" "}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: "text.secondary", mb: 1, fontSize: "1.1rem" }} // Increased font size
            >
              Start Date
            </Typography>
            <Typography sx={{ fontSize: "1.1rem" }}>
              {dayjs(intervention.startDate).format("DD/MM/YYYY HH:mm")}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: "text.secondary", mb: 1, fontSize: "1.1rem" }} // Increased font size
            >
              End Date
            </Typography>
            <Typography sx={{ fontSize: "1.1rem" }}>
              {intervention.endDate
                ? dayjs(intervention.endDate).format("DD/MM/YYYY HH:mm")
                : "N/A"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InterventionDetailsCard;
