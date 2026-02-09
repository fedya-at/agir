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
