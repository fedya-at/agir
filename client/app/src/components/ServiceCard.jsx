import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import "animate.css";

const ServiceCard = ({ icon, title, description, keywords }) => (
  <Card
    border="10px solid red"
    sx={{
      borderRadius: 1,
      bgcolor: "background.paper",
      color: "text.primary",
      textAlign: "center",
      p: 2,
      width: "100%", // Ensure the card takes full width of its container
      maxWidth: 280, // Fixed width for consistent size
      minHeight: 300, // Fixed height for consistent size
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      },
    }}
  >
    <CardContent>
      {/* Icon Section */}
      <Box
        sx={{
          width: 50,
          height: 50,
          bgcolor: "#b8ff0020",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        {icon}
      </Box>

      {/* Title Section */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 1,
          fontSize: "1rem",
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>

      {/* Description Section */}
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.85rem",
          lineHeight: 1.5,
          color: "text.secondary",
          mb: 2,
        }}
      >
        {description}
      </Typography>

      {/* Keywords Section */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 1,
          mt: 2,
        }}
      >
        {keywords.map((keyword, index) => (
          <Chip
            key={index}
            label={keyword}
            sx={{
              fontSize: "0.7rem",
              bgcolor: "#f0f0f0",
              color: "#333",
              borderRadius: 1,
            }}
          />
        ))}
      </Box>
    </CardContent>
  </Card>
);

export default ServiceCard;
