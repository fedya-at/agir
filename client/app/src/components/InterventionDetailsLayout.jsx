// InterventionDetailsLayout.jsx
import { Box, Container } from "@mui/material";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const InterventionDetailsLayout = ({ children, title, description }) => {
  return (
    <HelmetProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          Height: "100vh",
          bgcolor: "#f5f5f7",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Helmet>

        <Navbar />
        <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 8 } }}>{children}</Box>

        <Footer />
      </Box>
    </HelmetProvider>
  );
};

export default InterventionDetailsLayout;
