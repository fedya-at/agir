import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Paper,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Directions as DirectionsIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Launch as LaunchIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
const LocationCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const MapContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 400,
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  position: "relative",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[12],
  },
}));

const Location = () => {


  return (
    <Box sx={{ py: 8, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: "linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Notre Localisation
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", mb: 2 }}
          >
            Venez nous rendre visite dans nos locaux à Sousse pour tous vos
            besoins informatiques.
          </Typography>
          <Chip
            icon={<LocationIcon />}
            label="Sousse, Tunisie"
            color="primary"
            variant="outlined"
            sx={{ fontSize: "1rem", py: 2 }}
          />
        </Box>

        <Grid
          container
          spacing={4}
          display="flex"
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
        >
          {" "}
          {/* Map */}
          <Grid item xs={12} md={12}>
            <Paper elevation={3} sx={{ height: "100%" }}>
              <iframe
                title="Localisation LAB-IT Sousse"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.1569001187145!2d10.626090575693322!3d35.814353072544606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130275eaa17ec599%3A0xa38f664c208695da!2sLAB-IT!5e1!3m2!1sen!2stn!4v1745927878312!5m2!1sen!2stn"
                width="200%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </Paper>
          </Grid>
          {/* Contact Info */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 4,
                bgcolor: "#fff",
                width: "100%",
                borderRadius: 2,
                border: "1px solid #b8ff00",
              }}
            >
              <Typography
                component="h2"
                variant="h5"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Get in Touch
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                N'hésitez pas à nous contacter pour toute demande ou question.
              </Typography>
              <Stack spacing={2} component="address">
                <Box display="flex" alignItems="center">
                  <LocationOnIcon
                    aria-hidden="true"
                    sx={{ color: "primary.main", mr: 2 }}
                  />
                  <Typography>
                    Rue des Catacombes, Cité Ezzahra, Sousse
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <PhoneIcon
                    aria-hidden="true"
                    sx={{ color: "primary.main", mr: 2 }}
                  />
                  <Typography component="a" href="tel:+21612345678">
                    +216 12 345 678
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <EmailIcon
                    aria-hidden="true"
                    sx={{ color: "primary.main", mr: 2 }}
                  />
                  <Typography component="a" href="mailto:contact@lab-it.tn">
                    contact@lab-it.tn
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Box textAlign="center" mt={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📍 Nous vous attendons !
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
          >
            N'hésitez pas à nous rendre visite pour tous vos besoins en
            maintenance informatique, réparation d'ordinateurs portables, et
            solutions IT.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Location;
