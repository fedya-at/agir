// src/screens/LandingScreen.jsx
import React, { lazy, Suspense, useEffect } from "react";
import { Box, Divider, CircularProgress } from "@mui/material";
import Navbar from "../components/Navbar"; // Static import for critical component

// Lazy load non-critical components
const Hero = lazy(() => import("../components/Hero"));
const Services = lazy(() => import("../components/Services"));
const Contact = lazy(() => import("../components/Contact"));
const Footer = lazy(() => import("../components/Footer"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const Pricing = lazy(() => import("../components/Pricing"));

// Simple loading component
const SectionLoading = () => (
  <Box display="flex" justifyContent="center" py={10}>
    <CircularProgress />
  </Box>
);

export default function LandingScreen() {
  // Preload other sections after initial render
  useEffect(() => {
    const preloadComponents = async () => {
      const components = [
        import("../components/Hero"),
        import("../components/Services"),
        import("../components/Testimonials"),
      ];

      // Silent preload - errors won't break the app
      await Promise.all(
        components.map((component) =>
          component.catch((e) => console.debug("Preload warning:", e))
        )
      );
    };

    const timer = setTimeout(preloadComponents, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        overflowX: "hidden", // Prevent layout shifts
      }}
    >
      {/* Critical component rendered immediately */}
      <Navbar />

      {/* Lazy-loaded sections with suspense boundaries */}
      <Suspense fallback={<SectionLoading />}>
        <Hero />
        <Divider sx={{ my: 6 }} />

        <Suspense fallback={<SectionLoading />}>
          <Services />
          <Divider sx={{ my: 6 }} />

          <Testimonials />
          <Divider sx={{ my: 6 }} />

          <Pricing />
        </Suspense>

        <Footer />
      </Suspense>
    </Box>
  );
}
