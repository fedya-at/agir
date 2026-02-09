import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  IconButton,
  Divider,
  Link,
  Chip,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Computer as ComputerIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Language as WebsiteIcon,
  Copyright as CopyrightIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const FooterSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  padding: theme.spacing(6, 0, 2),
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "white",
  margin: theme.spacing(0, 0.5),
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: "scale(1.1)",
  },
}));

const FooterLink = styled(Link)(() => ({
  color: "rgba(255, 255, 255, 0.8)",
  textDecoration: "none",
  fontSize: "0.9rem",
  transition: "all 0.3s ease",
  "&:hover": {
    color: "white",
    textDecoration: "underline",
  },
}));

const BigFooter = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    "Réparation d'ordinateurs portables",
    "Réparation de PC de bureau",
    "Diagnostic gratuit",
    "Nettoyage et optimisation",
    "Récupération de données",
    "Installation logiciels",
    "Maintenance préventive",
    "Réparation écrans LCD",
  ];

  const quickLinks = [
    { label: "Accueil", href: "#hero" },
    { label: "Nos Services", href: "#services" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "Tarifs", href: "#pricing-reparation-informatique-sousse" },
    { label: "Localisation", href: "#location" },
    { label: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    {
      icon: <WebsiteIcon />,
      url: "https://lab-it.tn/",
      label: "Site Web",
    },
    {
      icon: <LinkedInIcon />,
      url: "https://www.linkedin.com/company/lab-it/",
      label: "LinkedIn",
    },
    {
      icon: <FacebookIcon />,
      url: "https://www.facebook.com/lab.it.Sousse",
      label: "Facebook",
    },
    {
      icon: <InstagramIcon />,
      url: "https://www.instagram.com/lab.it.sousse/",
      label: "Instagram",
    },
  ];

  const handleSocialClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleQuickLinkClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <FooterSection>
      <Container maxWidth="lg">
        <Grid container spacing={4} direction="row" alignItems="flex-start">
          {/* Company Info */}
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    background:
                      "linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "brightness(1.5)",
                  }}
                >
                  LAB-IT
                </Typography>
                <Typography
                  variant="h6"
                  color="rgba(255, 255, 255, 0.9)"
                  gutterBottom
                >
                  Expert en Réparation Informatique
                </Typography>
                <Typography
                  variant="body2"
                  color="rgba(255, 255, 255, 0.7)"
                  paragraph
                >
                  Votre partenaire de confiance à Sousse pour tous vos besoins
                  de réparation et maintenance informatique.
                </Typography>
              </Box>

              {/* Contact Info */}
              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <LocationIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    Sousse, Tunisie
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <PhoneIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    +216 50 234 911 | +216 99 439 306
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <EmailIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    contact@lab-it.tn
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <TimeIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    Lun-Ven: 8h-18h
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          {/* Services */}
          <Grid item xs={12} md={2.5}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              color="white"
            >
              Nos Services
            </Typography>
            <Stack spacing={0.8}>
              {services.map((service, index) => (
                <FooterLink key={index} href="#services">
                  • {service}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              color="white"
            >
              Liens Rapides
            </Typography>
            <Stack spacing={0.8}>
              {quickLinks.map((link, index) => (
                <FooterLink
                  key={index}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickLinkClick(link.href);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  {link.label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          {/* Why Choose Us */}
          <Grid item xs={12} md={2.5}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              color="white"
            >
              Pourquoi LAB-IT ?
            </Typography>
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <ComputerIcon sx={{ color: "#2196F3", fontSize: 18 }} />
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                  Expertise technique
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <SpeedIcon sx={{ color: "#2196F3", fontSize: 18 }} />
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                  Intervention rapide
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <SecurityIcon sx={{ color: "#2196F3", fontSize: 18 }} />
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                  Garantie qualité
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <BuildIcon sx={{ color: "#2196F3", fontSize: 18 }} />
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                  Pièces d'origine
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} md={2}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              color="white"
            >
              Suivez-nous
            </Typography>
            <Stack spacing={2}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {socialLinks.map((social, index) => (
                  <SocialIconButton
                    key={index}
                    onClick={() => handleSocialClick(social.url)}
                    title={social.label}
                  >
                    {social.icon}
                  </SocialIconButton>
                ))}
              </Box>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
                Restez connecté avec nous pour les dernières actualités et
                conseils.
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Certifications & Specialties */}
        <Box mt={4} mb={4}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            color="white"
            textAlign="center"
          >
            Spécialistes Certifiés - Toutes Marques
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            flexWrap="wrap"
            gap={1}
            mt={2}
          >
            {[
              "HP",
              "Dell",
              "Asus",
              "Lenovo",
              "Acer",
              "MSI",
              "Toshiba",
              "Apple",
            ].map((brand) => (
              <Chip
                key={brand}
                label={brand}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />

        {/* Bottom Section */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          py={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <CopyrightIcon
              sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.6)" }}
            />
            <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
              {currentYear} LAB-IT Sousse. Tous droits réservés.
            </Typography>
          </Box>

          <Box display="flex" gap={3} flexWrap="wrap">
            <FooterLink href="/privacy">
              Politique de confidentialité
            </FooterLink>
            <FooterLink href="/terms">Conditions d'utilisation</FooterLink>
            <FooterLink href="/warranty">Garantie</FooterLink>
          </Box>
        </Box>

        {/* SEO Text */}
        <Box mt={3} pt={2} borderTop="1px solid rgba(255, 255, 255, 0.1)">
          <Typography
            variant="body2"
            color="rgba(255, 255, 255, 0.5)"
            textAlign="center"
          >
            LAB-IT Sousse - Réparation ordinateur portable, PC, diagnostic
            gratuit, maintenance informatique, récupération données,
            installation logiciels, réparation écran, carte mère. Service rapide
            et garanti à Sousse, Tunisie.
          </Typography>
        </Box>
      </Container>
    </FooterSection>
  );
};

export default BigFooter;
