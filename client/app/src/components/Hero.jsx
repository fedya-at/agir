import React, { useEffect } from "react";
import { Container, Button, Typography, Grid, Box } from "@mui/material";
import "animate.css/animate.min.css";
import img from "../assets/Bug fixing-bro.png";

const Hero = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(".animate-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "animate__animated",
              "animate__fadeInUp"
            );
            entry.target.style.opacity = 1;
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    // Cleanup
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <Container
      maxWidth="xl"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Text Content */}
      <Grid size={{ xs: 12, md: 10 }} component="section">
        <Box
          className="animate-on-scroll"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: 0,
          }}
          role="region"
          aria-label="Store Presentation"
        >
          <Typography
            component="h2"
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            Réparation Express d'Ordinateurs à{" "}
            <span style={{ color: "#b8ff00" }}>Sousse</span> - Service en
            Atelier & Sur Place
          </Typography>

          <Typography
            component="div" // Changed from <p> to <div>
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: "1.1rem",
              fontWeight: 500,
            }}
          >
            ✨ <strong>Pourquoi choisir notre atelier ?</strong>
            <Box component="ul" sx={{ pl: 3, mt: 2 }}>
              <li>✔️ Diagnostic gratuit en magasin</li>
              <li>✔️ Techniciens certifiés à votre service</li>
              <li>
                ✔️ Réparation express (1h chrono pour la plupart des pannes)
              </li>
              <li>✔️ Garantie 6 mois sur toutes réparations</li>
            </Box>
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                borderRadius: 8,
                px: 4,
              }}
              href="#contact"
            >
              📍 Nous localiser
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              sx={{
                borderRadius: 8,
                px: 4,
              }}
              href="tel:+21612345678"
            >
              📞 Appeler maintenant
            </Button>
          </Box>

          {/* Trust Elements */}
          <Box sx={{ mt: 4, display: "flex", gap: 3, alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              ⭐⭐⭐⭐⭐ 4.9/5 (285 avis Google)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🕒 Ouvert 7j/7 • 8h-20h
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Image Section */}
      <Grid size={{ xs: 12, md: 10, lg: 6 }}>
        <Box
          className="animate-on-scroll"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            opacity: 0,
          }}
        >
          <Box
            component="img"
            src={img}
            alt="Repair Animation"
            loading="eager"
            sx={{
              width: "150%",
              height: "100%",
              maxWidth: 600,
            }}
          />
        </Box>
      </Grid>
    </Container>
  );
};

export default Hero;
