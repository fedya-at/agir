// src/screens/LandingScreen.jsx
import React, { lazy, Suspense, useEffect } from "react";
import { Box, Divider, CircularProgress } from "@mui/material";
import Navbar from "../components/Navbar"; // Static import for critical component

// Lazy load non-critical components
const Hero = lazy(() => import("../components/Hero"));
const Services = lazy(() => import("../components/Services"));
const Footer = lazy(() => import("../components/Footer"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const Pricing = lazy(() => import("../components/Pricing"));
const SocialMedia = lazy(() => import("../components/SocialMedia"));
const Location = lazy(() => import("../components/Location"));
const BigFooter = lazy(() => import("../components/BigFooter"));

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
        import("../components/SocialMedia"),
        import("../components/Location"),
        import("../components/BigFooter"),
      ];

      // Silent preload - errors won't break the app
      await Promise.all(
        components.map((component) =>
          component.catch(() => {
            // Silent preload failure
          })
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
      <Navbar />

      <Suspense fallback={<SectionLoading />}>
        <Hero />
        <Divider sx={{ my: 6 }} />

        <Suspense fallback={<SectionLoading />}>
          <Services />
          <Divider sx={{ my: 6 }} />

          <Testimonials />
          <Divider sx={{ my: 6 }} />

          <Pricing />
          <Divider sx={{ my: 6 }} />

          <SocialMedia />
          <Divider sx={{ my: 6 }} />

          <Location />
          <Divider sx={{ my: 6 }} />
        </Suspense>

        <BigFooter />
      </Suspense>
    </Box>
  );
}
