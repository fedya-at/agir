import React from "react";
import { Container, Grid, Typography, Box } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import CodeIcon from "@mui/icons-material/Code";
import ComputerIcon from "@mui/icons-material/Computer";
import SchoolIcon from "@mui/icons-material/School";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ServiceCard from "./ServiceCard";
import "animate.css";

const services = [
  {
    icon: <BuildIcon sx={{ fontSize: 30, color: "#b8ff00" }} />,
    title: "Maintenance Informatique Express",
    description:
      "Réparation urgente PC/Imprimantes en 2h - Installation système & logiciels - Garantie 6 mois",
    keywords: ["réparation ordinateur", "formatage PC"],
  },
  {
    icon: <SettingsEthernetIcon sx={{ fontSize: 30, color: "#b8ff00" }} />,
    title: "Installation Réseau Professionnel",
    description:
      "Câblage structuré - Configuration LAN/WAN - Solutions sur mesure pour entreprises",
    keywords: ["installation réseau local", "câblage informatique"],
  },
  {
    icon: <CodeIcon sx={{ fontSize: 30, color: "#b8ff00" }} />,
    title: "Développement Web Sur Mesure",
    description:
      "Création de sites vitrine/e-commerce - Applications web - Solutions digitales clés en main",
    keywords: ["développement e-commerce", "application web"],
  },
  {
    icon: <ComputerIcon sx={{ fontSize: 30, color: "#b8ff00" }} />,
    title: "Installation Logiciels Professionnels",
    description:
      "Suite bureautique - Antivirus - Solutions métiers - Configuration optimisée",
    keywords: ["logiciels professionnels", "configuration PC"],
  },
  {
    icon: <SchoolIcon sx={{ fontSize: 30, color: "#b8ff00" }} />,
    title: "Formations Tech Accélérées",
    description:
      "PHP/CSS/HTML - Administration réseau - Certifications reconnues - Cours particuliers",
    keywords: ["formation web", "cours programmation"],
  },
  {
    icon: <ShoppingCartIcon sx={{ fontSize: 30, color: "#b8ff00" }} />,
    title: "Boutique Tech & Accessoires",
    description:
      "Composants PC - Périphériques - Câbles réseau - Matériel neuf et certifié",
    keywords: [
      "accessoires informatiques Sousse",
      "pièces ordinateur",
      "boutique tech",
    ],
  },
];

const Services = () => (
  <Box
    id="services"
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      bgcolor: "background.paper",
      py: 4,
    }}
  >
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        className="animate__animated animate__fadeInDown"
        sx={{
          textAlign: "center",
          fontWeight: 700,
          mb: 2,
          color: "text.primary",
          position: "relative",
          "&:after": {
            content: '""',
            display: "block",
            width: "60px",
            height: "4px",
            bgcolor: "#b8ff00",
            mx: "auto",
            mt: 2,
            borderRadius: 2,
          },
        }}
      >
        Nos Services
      </Typography>
      <Typography
        variant="body1"
        className="animate__animated animate__fadeIn"
        sx={{
          textAlign: "center",
          mb: 8,
          maxWidth: "800px",
          mx: "auto",
          color: "#000000",
          fontSize: "1.1rem",
          lineHeight: 1.7,
        }}
      >
        Découvrez nos services de réparation d'ordinateurs à Sousse, combinant
        expertise technique et solutions innovantes pour répondre à tous vos
        besoins technologiques.
      </Typography>
      <Grid
        container
        spacing={3}
        sx={{
          mt: 4,
          justifyContent: "center",
        }}
      >
        {services.map((service, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={index}>
            <Box
              className="animate__animated animate__fadeInUp"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: "0.8s",
                borderRadius: "8px",
                border: "1px solid #000",
              }}
            >
              <ServiceCard {...service} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default Services;
