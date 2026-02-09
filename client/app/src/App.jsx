/* eslint-disable no-unused-vars */
import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth } from "./store/authSlice"; // Adjust the path as needed
import ErrorBoundary from "./components/ErrorBoundary";
import RouteLoading from "./components/RouteLoading";
import NotificationListener from "./components/NotificationListener";
import NotificationTestHelper from "./components/NotificationTestHelper";
import { LanguageProvider } from "./contexts/LanguageContext";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Improved lazy loading with retry mechanism
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem("page-has-been-force-refreshed") || "false"
    );

    try {
      const component = await componentImport();
      window.localStorage.setItem("page-has-been-force-refreshed", "false");
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.localStorage.setItem("page-has-been-force-refreshed", "true");
        return window.location.reload();
      }
      throw error;
    }
  });

// Lazy-loaded components
const LandingScreen = lazyWithRetry(() => import("./screens/LandingScreen"));
const Login = lazyWithRetry(() => import("./screens/Login"));
const Register = lazyWithRetry(() => import("./screens/Register"));
const ForgotPassword = lazyWithRetry(() => import("./screens/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("./screens/ResetPassword"));
const Dashboard = lazyWithRetry(() => import("./screens/Dashboard"));
const NotFound = lazyWithRetry(() => import("./screens/NotFound"));
const ManageUsers = lazyWithRetry(() => import("./screens/admin/ManageUsers"));
const ManageInterventions = lazyWithRetry(() =>
  import("./screens/admin/ManageInterventions")
);
const InterventionDetails = lazyWithRetry(() =>
  import("./screens/InterventionDetails")
);
const InventoryScreen = lazyWithRetry(() =>
  import("./screens/InventoryScreen")
);
const NotificationTestPanel = lazyWithRetry(() =>
  import("./components/NotificationTestPanel")
);
const PartForm = lazyWithRetry(() => import("./components/PartForm"));
const Analytics = lazyWithRetry(() => import("./screens/Analytics"));
const Settings = lazyWithRetry(() => import("./screens/Settings"));
const Profile = lazyWithRetry(() => import("./screens/Profile"));
const Consult = lazyWithRetry(() => import("./screens/ConsulteScreen"));
const Notification = lazyWithRetry(() => import("./screens/Notifications"));
const ClientInterventions = lazyWithRetry(() =>
  import("./screens/ClientInterventionsScreen")
);
const TechnicianTasks = lazyWithRetry(() =>
  import("./screens/TechnicianTasks")
);
const HistoryScreen = lazyWithRetry(() => import("./screens/HistoryScreen"));
const InvoicesScreen = lazyWithRetry(() => import("./screens/InvoicesScreen"));

const CalendarScreens = lazyWithRetry(() =>
  import("./screens/CalendarScreens")
);
const ClientInterventionDetailsScreen = lazyWithRetry(() =>
  import("./screens/ClientInterventionDetailsScreen")
);
const Chatbot = lazyWithRetry(() => import("./screens/Chatbot"));

const AuthRoute = ({ children }) => {
  const { token, user, status } = useSelector((state) => state.auth);
  if (status === "loading") {
    return <RouteLoading />;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { token, status } = useSelector((state) => state.auth);

  if (status === "loading") {
    return <RouteLoading />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());

    // Preload visible routes
    const preloadVisibleRoutes = async () => {
      try {
        await Promise.allSettled([
          import("./screens/Login"),
          import("./screens/Register"),
          import("./screens/ForgotPassword"),
          import("./screens/ResetPassword"),
          import("./screens/Dashboard"),
          import("./screens/admin/ManageUsers"),
          import("./screens/admin/ManageInterventions"),
          import("./screens/InterventionDetails"),
          import("./screens/InventoryScreen"),
          import("./components/PartForm"),
          import("./screens/LandingScreen"),
          import("./screens/NotFound"),
          import("./components/NotificationTestPanel"),
          import("./screens/Analytics"),
          import("./screens/Notifications"),
          import("./screens/Settings"),
          import("./screens/Profile"),
          import("./screens/ConsulteScreen"),
          import("./screens/Notifications"),
          import("./screens/ClientInterventionsScreen"),
          import("./screens/TechnicianTasks"),
          import("./screens/HistoryScreen"),
          import("./screens/InvoicesScreen"),
          import("./screens/CalendarScreens"),
          import("./screens/ClientInterventionDetailsScreen"),
          import("./screens/Chatbot"),
        ]);
      } catch (error) {
        // Silent fail for preloading
      }
    };

    preloadVisibleRoutes();

    // Intersection Observer for lazy preloading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const modulePath = entry.target.getAttribute("data-module");
          if (modulePath) {
            import(/* @vite-ignore */ `./${modulePath}`);
          }
        }
      });
    });

    document
      .querySelectorAll("[data-module]")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoading fullPage />}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {/* Initialize notification system */}
              <NotificationListener />

              <Routes>
                <Route path="/" element={<LandingScreen />} />
                <Route
                  path="/login"
                  element={
                    <AuthRoute>
                      <Login />
                    </AuthRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <AuthRoute>
                      <Register />
                    </AuthRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <AuthRoute>
                      <ForgotPassword />
                    </AuthRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <AuthRoute>
                      <ResetPassword />
                    </AuthRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/interventions"
                  element={
                    <ProtectedRoute>
                      <ManageInterventions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interventions/:id"
                  element={
                    <ProtectedRoute>
                      <InterventionDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute>
                      <InventoryScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory/new"
                  element={
                    <ProtectedRoute>
                      <PartForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory/edit/:id"
                  element={
                    <ProtectedRoute>
                      <PartForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/tasks"
                  element={
                    <ProtectedRoute>
                      <TechnicianTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notification />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consult"
                  element={
                    <ProtectedRoute>
                      <Consult />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/interventions"
                  element={
                    <ProtectedRoute>
                      <ClientInterventions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute>
                      <InvoicesScreen />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <CalendarScreens />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/interventions/:interventionId"
                  element={
                    <ProtectedRoute>
                      <ClientInterventionDetailsScreen />
                    </ProtectedRoute>
                  }
                />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route
                  path="/test-notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationTestPanel />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LocalizationProvider>
          </Suspense>

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: { background: "#363636", color: "#fff" },
              success: { duration: 3000 },
            }}
          />
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
