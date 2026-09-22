import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import {
  Language as WebsiteIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const SocialCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "all 0.3s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
  },
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  width: 60,
  height: 60,
  backgroundColor: theme.palette.primary.main,
  color: "white",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    transform: "scale(1.1)",
  },
}));

const socialLinks = [
  {
    id: 1,
    name: "Site Web Officiel",
    description: "Découvrez tous nos services et solutions IT",
    url: "https://lab-it.tn/",
    icon: <WebsiteIcon fontSize="large" />,
    platform: "Website",
  },
  {
    id: 2,
    name: "LinkedIn",
    description: "Suivez notre actualité professionnelle",
    url: "https://www.linkedin.com/company/lab-it/",
    icon: <LinkedInIcon fontSize="large" />,
    platform: "LinkedIn",
  },
  {
    id: 3,
    name: "Facebook",
    description: "Rejoignez notre communauté Facebook",
    url: "https://www.facebook.com/lab.it.Sousse",
    icon: <FacebookIcon fontSize="large" />,
    platform: "Facebook",
  },
  {
    id: 4,
    name: "Instagram",
    description: "Découvrez nos projets en images",
    url: "https://www.instagram.com/lab.it.sousse/",
    icon: <InstagramIcon fontSize="large" />,
    platform: "Instagram",
  },
];

const SocialMedia = () => {
  const handleSocialClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ py: 8, bgcolor: "background.paper" }}>
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
            Suivez-nous en ligne
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", mb: 2 }}
          >
            Restez connecté avec Lab-IT pour les dernières actualités, conseils
            techniques et solutions informatiques.
          </Typography>
          <Chip
            label="LAB-IT Sousse"
            color="primary"
            variant="outlined"
            sx={{ fontSize: "1rem", py: 2 }}
          />
        </Box>

        {/* Social Links Grid */}
        <Grid container spacing={4} justifyContent="center">
          {socialLinks.map((social) => (
            <Grid item xs={12} sm={6} md={3} key={social.id}>
              <SocialCard
                onClick={() => handleSocialClick(social.url)}
                elevation={2}
              >
                <CardContent
                  sx={{
                    textAlign: "center",
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Box mb={2}>
                    <SocialIconButton size="large">
                      {social.icon}
                    </SocialIconButton>
                  </Box>

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    color="text.primary"
                  >
                    {social.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {social.description}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Chip
                      label={social.platform}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: "bold" }}
                    />
                    <LaunchIcon fontSize="small" color="action" />
                  </Stack>
                </CardContent>
              </SocialCard>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box textAlign="center" mt={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🚀 Connectons-nous !
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Suivez-nous sur nos réseaux sociaux pour ne rien manquer de nos
            actualités, conseils techniques et nouveaux services.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SocialMedia;
