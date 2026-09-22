import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
      // neon green
    },
    secondary: {
      main: "#000000", // black
    },
    background: {
      default: "#ffffff", // white background
      paper: "#f9f9f9", // slightly gray for cards
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "3rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2.5rem",
    },
    body1: {
      fontSize: "1rem",
    },
  },
  shape: {
    borderRadius: 9, // rounded cards
  },
});

export default theme;
