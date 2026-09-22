import { styled } from "@mui/material/styles";
import { Card } from "@mui/material";

// eslint-disable-next-line no-unused-vars
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#fff", // Lighter background color
  transition: "all 0.3s ease",
  maxWidth: "1000px", // Increase the width
  margin: "0 auto", // Center the card
  "&:hover": {
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
}));

export default StyledCard;
