# Repair Shop Management System

A comprehensive web application for managing repair shop operations, including interventions, inventory, invoicing, and user management with real-time notifications.

## 🚀 Project Overview

This is a full-stack repair shop management system built with modern React technologies. The application provides a complete solution for:

- **Client Management**: Register and manage client information
- **Intervention Tracking**: Create, assign, and track repair interventions
- **Inventory Management**: Monitor parts stock levels with low-stock alerts
- **Invoice Generation**: Automated invoice creation with PDF export
- **User Management**: Role-based access for admins, technicians, and clients
- **Real-time Notifications**: Live updates via SignalR
- **Analytics Dashboard**: Business insights and performance metrics

## 🏗️ Architecture

### Frontend

- **Framework**: React 18.3.1 with functional components and hooks
- **UI Library**: Material-UI (MUI) v7.0.2 with modern design components
- **State Management**: Redux Toolkit 2.8.1 for global state management
- **Routing**: React Router DOM 7.5.2 for client-side navigation
- **Build Tool**: Vite 6.3.1 for fast development and optimized builds

### Backend Integration

- **API Communication**: Axios 1.9.0 for HTTP requests
- **Real-time Updates**: Microsoft SignalR 8.0.7 for live notifications
- **Authentication**: JWT-based authentication with role-based access control

## 📦 Technology Stack & Versions

### Core Technologies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "vite": "^6.3.1",
  "@vitejs/plugin-react": "^4.3.4"
}
```

### UI & Styling

```json
{
  "@mui/material": "^7.0.2",
  "@mui/icons-material": "^7.0.2",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.0",
  "animate.css": "^4.1.1",
  "framer-motion": "^12.10.5"
}
```

### State Management & Data

```json
{
  "@reduxjs/toolkit": "^2.8.1",
  "react-redux": "^9.2.0",
  "redux": "^5.0.1",
  "redux-thunk": "^3.1.0"
}
```

### Data Visualization & Charts

```json
{
  "@mui/x-charts": "^8.9.0",
  "@mui/x-data-grid": "^8.9.1",
  "@mui/x-date-pickers": "^8.3.1",
  "@mui/x-tree-view": "^8.9.0",
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0"
}
```

### Date & Time Management

```json
{
  "date-fns": "^4.1.0",
  "dayjs": "^1.11.13",
  "react-big-calendar": "^1.19.4"
}
```

### HTTP & Real-time Communication

```json
{
  "axios": "^1.9.0",
  "@microsoft/signalr": "^8.0.7"
}
```

### Routing & Navigation

```json
{
  "react-router-dom": "^7.5.2"
}
```

### UI Enhancements

```json
{
  "react-hot-toast": "^2.5.2",
  "react-helmet-async": "^2.0.5",
  "react-slick": "^0.30.3",
  "slick-carousel": "^1.8.1",
  "@react-spring/web": "^10.0.1",
  "lucide-react": "^0.525.0"
}
```

### Development Tools

```json
{
  "@eslint/js": "^9.22.0",
  "eslint": "^9.22.0",
  "eslint-plugin-react-hooks": "^5.2.0",
  "eslint-plugin-react-refresh": "^0.4.19",
  "@types/react": "^19.0.10",
  "@types/react-dom": "^19.0.4",
  "globals": "^16.0.0"
}
```

## 🌟 Key Features

### 1. **Multi-Language Support**

- French/English language switching
- Complete UI translation system

### 2. **Role-Based Access Control**

- **Admin (Role 0)**: Full system access, user management, analytics
- **Technician (Role 1)**: Intervention management, parts handling
- **Client (Role 2)**: View interventions, profile management

### 3. **Intervention Management**

- Service type classification (Hardware, Software, Mixed, Consultation, Maintenance)
- Dynamic parts section based on service type
- Status tracking (Pending, In Progress, Completed)
- Technician assignment and scheduling

### 4. **Inventory System**

- Real-time stock monitoring
- Low-stock alerts and notifications
- Parts addition/removal with validation
- Stock adjustment with quantity controls

### 5. **Invoice Management**

- Automated invoice generation
- PDF export functionality
- Service and parts itemization
- Tax calculations and total summaries

### 6. **Real-time Notifications**

- SignalR integration for live updates
- Stock alerts for administrators
- Intervention status notifications
- Role-based notification filtering

### 7. **Analytics Dashboard**

- Performance metrics and KPIs
- Interactive charts and graphs
- Revenue tracking and reporting
- User activity monitoring

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Page components (routes)
├── store/              # Redux store and slices
├── services/           # API services and utilities
├── contexts/           # React contexts (Language, etc.)
├── utils/              # Utility functions
├── assets/             # Static assets (images, icons)
└── shared-theme/       # Material-UI theme configuration
```

## 🔧 Configuration

### Environment Variables

```env
VITE_API_BASE_URL=https://localhost:7143/api
VITE_SIGNALR_HUB_URL=https://localhost:7143/notificationHub
```

### Vite Configuration

- Hot Module Replacement (HMR) enabled
- Proxy configuration for API requests
- Optimized build settings for production

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Material-UI Grid system
- **Dark/Light Theme**: Consistent theming across all components
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Toast Notifications**: Real-time feedback for user actions
- **Modal Dialogs**: Confirmation dialogs and form modals
- **Data Tables**: Sortable, filterable tables with pagination

## 🔒 Security Features

- JWT-based authentication
- Role-based route protection
- Input validation and sanitization
- CSRF protection
- Secure API communication

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Development Guidelines

### Code Style

- ESLint configuration for code consistency
- React best practices and hooks usage
- Material-UI design system compliance
- Modular component architecture

### State Management

- Redux Toolkit for efficient state management
- Normalized state structure
- Async thunks for API calls
- Optimistic updates where appropriate

## 📧 Support

For technical support or questions about the project, please contact the development team.

---

**Built with ❤️ using modern React ecosystem**
