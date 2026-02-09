// components/Pricing.js - Services de Réparation Informatique LAB-IT Sousse
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  Stack,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const repairServices = [
  {
    title: "Diagnostic Gratuit",
    price: "0",
    category: "Évaluation",
    features: [
      "Diagnostic complet gratuit",
      "Identification des pannes",
      "Devis transparent",
      "Conseil personnalisé",
      "Aucun engagement",
    ],
    recommended: false,
    popular: true,
    description:
      "Évaluation professionnelle gratuite de votre ordinateur portable ou PC",
  },
  {
    title: "Réparation Standard",
    price: "80-150",
    category: "Réparation Courante",
    features: [
      "Réparation logicielle",
      "Nettoyage système",
      "Suppression virus/malware",
      "Optimisation performances",
      "Garantie 3 mois",
    ],
    recommended: true,
    popular: false,
    description: "Solutions pour pannes courantes et problèmes logiciels",
  },
  {
    title: "Réparation Avancée",
    price: "150-300",
    category: "Réparation Matérielle",
    features: [
      "Remplacement composants",
      "Réparation carte mère",
      "Changement écran LCD",
      "Réparation connectique",
      "Garantie 6 mois",
    ],
    recommended: false,
    popular: false,
    description: "Interventions techniques complexes et remplacement de pièces",
  },
  {
    title: "Maintenance Préventive",
    price: "50-80",
    category: "Entretien",
    features: [
      "Nettoyage interne complet",
      "Vérification composants",
      "Mise à jour système",
      "Sauvegarde données",
      "Rapport détaillé",
    ],
    recommended: false,
    popular: false,
    description:
      "Entretien préventif pour prolonger la durée de vie de votre matériel",
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleRequestQuote = (serviceTitle) => {
    // Navigate to register screen with service info as state
    navigate("/register", {
      state: {
        serviceRequested: serviceTitle,
        from: "pricing",
      },
    });
  };

  return (
    <Box
      component="section"
      id="pricing-reparation-informatique-sousse"
      sx={{ py: 8, bgcolor: "background.default" }}
    >
      <Container maxWidth="lg">
        {/* SEO-optimized heading */}
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
            Tarifs Réparation Informatique
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 2, maxWidth: 700, mx: "auto" }}
          >
            Services de réparation d'ordinateurs portables et PC à Sousse -
            LAB-IT
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Tarifs transparents pour la réparation, maintenance et dépannage
            informatique. Diagnostic gratuit et devis sans engagement.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {repairServices.map((service, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: "100%",
                  border: service.recommended ? "2px solid" : undefined,
                  borderColor: service.recommended ? "primary.main" : undefined,
                  position: "relative",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <Stack spacing={3} height="100%">
                  {/* Service badges */}
                  <Box
                    display="flex"
                    gap={1}
                    flexWrap="wrap"
                    justifyContent="center"
                  >
                    {service.recommended && (
                      <Chip label="Recommandé" color="primary" size="small" />
                    )}
                    {service.popular && (
                      <Chip label="Populaire" color="success" size="small" />
                    )}
                  </Box>

                  {/* Service title */}
                  <Typography
                    variant="h5"
                    component="h3"
                    fontWeight="bold"
                    sx={{ textAlign: "center" }}
                  >
                    {service.title}
                  </Typography>

                  {/* Category */}
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{ textAlign: "center", fontWeight: 600 }}
                  >
                    {service.category}
                  </Typography>

                  {/* Price */}
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      component="span"
                      variant="h4"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      {service.price === "0"
                        ? "Gratuit"
                        : `${service.price} TND`}
                    </Typography>
                    {service.price !== "0" && (
                      <Typography variant="body2" color="text.secondary">
                        /intervention
                      </Typography>
                    )}
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", fontStyle: "italic" }}
                  >
                    {service.description}
                  </Typography>

                  {/* Features list */}
                  <Stack spacing={1} sx={{ flexGrow: 1 }}>
                    {service.features.map((feature, fIndex) => (
                      <Typography
                        key={fIndex}
                        variant="body2"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          "&::before": {
                            content: '"✓"',
                            color: "success.main",
                            fontWeight: "bold",
                            marginRight: 1,
                          },
                        }}
                      >
                        {feature}
                      </Typography>
                    ))}
                  </Stack>

                  {/* CTA Button */}
                  <Button
                    variant={service.recommended ? "contained" : "outlined"}
                    size="large"
                    fullWidth
                    sx={{ mt: "auto" }}
                    onClick={() => handleRequestQuote(service.title)}
                  >
                    {service.price === "0"
                      ? "Demander un diagnostic"
                      : "Demander un devis"}
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional SEO content */}
        <Box textAlign="center" mt={8}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🔧 Pourquoi choisir LAB-IT pour vos réparations ?
          </Typography>
          <Grid container spacing={3} mt={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                Expertise Technique
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Techniciens certifiés spécialisés dans la réparation
                d'ordinateurs portables et PC de toutes marques (HP, Dell, Asus,
                Lenovo, Acer, etc.)
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                Garantie Qualité
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toutes nos réparations sont garanties. Pièces d'origine et
                interventions couvertes jusqu'à 6 mois selon le service.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                Service Rapide
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Diagnostic en 24h, réparations express possibles. Intervention
                sur site disponible pour les entreprises.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};
export default Pricing;
