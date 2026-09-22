import React, { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

const Navbar = lazy(() => import("../components/Navbar"));
const Footer = lazy(() => import("../components/Footer"));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const LoadingPlaceholder = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

export default React.memo(function Dashboard() {
  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <CssBaseline enableColorScheme />

      <Suspense fallback={<LoadingPlaceholder />}>
        <Box sx={{ display: "flex", flex: 1 }}>
          <Navbar />

          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.palette.background.default,
              overflow: "auto",
            })}
          >
            <Stack
              spacing={2}
              sx={{
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
              component={motion.div}
              variants={containerVariants}
            >
              <Suspense fallback={<div />}>
                <motion.div variants={itemVariants}>
                </motion.div>
              </Suspense>
            </Stack>
          </Box>
        </Box>

        <Footer />
      </Suspense>
    </Box>
  );
});
