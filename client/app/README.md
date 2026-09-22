# AGIR - Frontend Client Application

This is the React 18 + Vite frontend for the AGIR Repair Shop Management System.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the backend API URL in `.env`:
```env
VITE_API_BASE_URL=https://localhost:7143
VITE_CHATBOT_URL=http://localhost:5000/api/chatbot
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🌐 Netlify Deployment
The app is preconfigured for Netlify deployment via `netlify.toml` and `public/_redirects` to handle Single Page Application (SPA) client-side routing.
