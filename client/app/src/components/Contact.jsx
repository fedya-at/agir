// components/Contact.js
import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Divider,
  Stack,
  Card,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";

const Contact = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LAB-IT",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rue des Catacombes, Cité Ezzahra",
      addressLocality: "Sousse",
      addressCountry: "TN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+216-12-345-678",
      contactType: "customer service",
      email: "contact@lab-it.tn",
      availableLanguage: ["French", "English"],
    },
  };
  return (
    <Box component="section" id="contact" sx={{ bgcolor: "#fff", py: 8 }}>
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      <Container maxWidth="lg">
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

        {/* Divider */}
        <Box sx={{ my: 6 }}>
          <Divider />
        </Box>

        {/* Write a Message */}
        <Box textAlign="center">
          <Typography
            variant="overline"
            sx={{ color: "primary.main", letterSpacing: 1 }}
          >
            Contactez-nous
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
            Write a Message
          </Typography>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{
              maxWidth: 900,
              mx: "auto",
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <TextField label="Full name" fullWidth variant="outlined" />
            <TextField label="Email address" fullWidth variant="outlined" />
            <TextField label="Phone" fullWidth variant="outlined" />
            <TextField label="Subject" fullWidth variant="outlined" />
            <TextField
              label="Write a message"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}
            />
            <Box
              sx={{
                gridColumn: { xs: "span 1", sm: "span 2" },
                textAlign: "center",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  borderRadius: 5,
                  px: 5,
                  py: 1.5,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Send a Message
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
