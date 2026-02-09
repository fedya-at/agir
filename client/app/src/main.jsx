import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "animate.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { CssBaseline } from "@mui/material";

import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
