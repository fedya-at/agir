// components/ServicesHover.jsx
import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { cn } from "@/lib/utils";
import {
  BuildIcon,
  InventoryIcon,
  PeopleIcon,
  ReceiptLongIcon,
  PersonIcon,
} from "@mui/icons-material";
import "animate.css";

const services = [
  {
    icon: <BuildIcon sx={{ fontSize: 40, color: "#b8ff00" }} />,
    title: "Réparation Express d'Ordinateurs",
    description: "Intervention rapide sous 1h à Sousse - Garantie 6 mois.",
    bgColor: "#000",
  },
  {
    icon: <InventoryIcon sx={{ fontSize: 40, color: "#000" }} />,
    title: "Pièces Détachées en Stock",
    description: "Stock de composants neufs à prix compétitifs.",
    bgColor: "#b8ff00",
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40, color: "#b8ff00" }} />,
    title: "Assistance Technique 7j/7",
    description: "Techniciens disponibles même le weekend.",
    bgColor: "#000",
  },
  {
    icon: <ReceiptLongIcon sx={{ fontSize: 40, color: "#000" }} />,
    title: "Devis Gratuit & Facturation",
    description: "Estimation immédiate sans engagement.",
    bgColor: "#f9f9f9",
  },
  {
    icon: <PersonIcon sx={{ fontSize: 40, color: "#000" }} />,
    title: "Service Client Premium",
    description: "Suivi personnalisé et historique complet.",
    bgColor: "#f9f9f9",
  },
];

const ServiceCard = ({ service, index }) => {
  return (
    <Box
      className={cn(
        "group/feature flex flex-col relative py-10",
        index < 2 && "md:border-b",
        index % 2 === 0 && "md:border-r",
        index >= 2 && "lg:border-t"
      )}
      sx={{
        borderColor: "divider",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
        },
      }}
    >
      {/* Hover gradient effect */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            index < 2
              ? "linear-gradient(to top, rgba(184,255,0,0.1) 0%, transparent 100%)"
              : "linear-gradient(to bottom, rgba(184,255,0,0.1) 0%, transparent 100%)",
          opacity: 0,
          transition: "opacity 0.3s ease",
          "&:hover": {
            opacity: 0.2,
          },
        }}
      />

      {/* Icon container */}
      <Box sx={{ mb: 4, position: "relative", zIndex: 1, px: 4 }}>
        {service.icon}
      </Box>

      {/* Title with animated line */}
      <Typography
        variant="h6"
        sx={{
          px: 4,
          mb: 2,
          position: "relative",
          zIndex: 1,
          "&:before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            height: "24px",
            width: "2px",
            bgcolor: "grey.300",
            transition: "all 0.3s ease",
          },
          "&:hover": {
            "&:before": {
              height: "32px",
              bgcolor: "primary.main",
            },
            transform: "translateX(8px)",
          },
        }}
      >
        {service.title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{ px: 4, position: "relative", zIndex: 1 }}
      >
        {service.description}
      </Typography>
    </Box>
  );
};

const ServicesHover = () => {
  return (
    <Container
      maxWidth="lg"
      id="services"
      sx={{
        py: 8,
        position: "relative",
        background:
          "linear-gradient(to bottom, rgba(184,255,0,0.05) 0%, transparent 50%)",
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mb: 6,
          textAlign: "center",
          fontWeight: 700,
          fontSize: { xs: "2rem", md: "2.8rem" },
        }}
      >
        Our Mission Is To Make Your{" "}
        <Box component="span" sx={{ color: "primary.main" }}>
          Business
        </Box>{" "}
        Better Through Technology
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {services.map((service, index) => (
          <ServiceCard key={index} service={service} index={index} />
        ))}
      </Box>
    </Container>
  );
};

export default ServicesHover;
