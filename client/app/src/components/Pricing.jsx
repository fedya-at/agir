// components/Pricing.js
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

const pricingPlans = [
  {
    title: "Starter",
    price: "599",
    features: [
      "Basic Website",
      "5 Pages",
      "Responsive Design",
      "1 Month Support",
    ],
    recommended: false,
  },
  {
    title: "Professional",
    price: "1299",
    features: [
      "E-commerce Site",
      "Up to 50 Products",
      "SEO Setup",
      "3 Months Support",
    ],
    recommended: true,
  },
];

const Pricing = () => (
  <Box
    component="section"
    id="pricing"
    sx={{ py: 8, bgcolor: "background.default" }}
  >
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        component="h2"
        sx={{ fontWeight: 700, mb: 6, textAlign: "center" }}
      >
        Transparent Pricing
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {pricingPlans.map((plan, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card
              sx={{
                p: 4,
                height: "100%",
                border: plan.recommended ? "2px solid" : undefined,
                borderColor: plan.recommended ? "primary.main" : undefined,
              }}
            >
              <Stack spacing={3}>
                {plan.recommended && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    sx={{ alignSelf: "center" }}
                  />
                )}
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ textAlign: "center" }}
                >
                  {plan.title}
                </Typography>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    component="span"
                    variant="h3"
                    sx={{ fontWeight: 700 }}
                  >
                    {plan.price} TND
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    /one-time
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  {plan.features.map((feature, fIndex) => (
                    <Typography
                      key={fIndex}
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      ✓ {feature}
                    </Typography>
                  ))}
                </Stack>
                <Button
                  variant={plan.recommended ? "contained" : "outlined"}
                  size="large"
                  fullWidth
                >
                  Get Started
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);
export default Pricing;
