import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      include: "**/*.{jsx,tsx,js,ts}",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
  ],
  base: "/", // Set this to your subdirectory if not deploying to root
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".ts": "tsx",
      },
    },
    include: [
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "axios",
      "react-hot-toast",
      "framer-motion",
      "@mui/x-date-pickers",
      "date-fns",
      "dayjs",
      "react-big-calendar",
      "chart.js",
      "react-chartjs-2",
    ],
    exclude: [
      "@mui/x-charts",
      "@mui/x-data-grid",
      "@mui/x-tree-view",
      "@react-spring/web",
    ],
    force: true, // Force re-optimization on restart
  },
  build: {
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
          redux: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  server: {
    hmr: {
      overlay: false,
    },
    proxy: {
      // Proxy main backend API requests to localhost:7143 (your main app)
      "^/api/(?!chatbot)": {
        target: "https://localhost:7143",
        changeOrigin: true,
        secure: false, // Set to false for self-signed certificates
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Proxying to MAIN backend:", req.method, req.url);
          });
        },
      },
      // Proxy all /api/chatbot requests to ngrok
      "/api/chatbot": {
        target: "https://38f798020ff0.ngrok-free.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/chatbot/, "/api"),
      },
      // Proxy health check
      "/chatbot-health": {
        target: "https://38f798020ff0.ngrok-free.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/chatbot-health/, "/health"),
      },
    },
  },
});
