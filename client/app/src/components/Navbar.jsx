/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Analytics,
  People,
  Build,
  Inventory,
  History,
  Receipt,
  Assignment,
  CalendarToday,
  RequestQuote,
  Engineering,
  RoomService,
  Chat,
  ContactMail,
  Person,
  Settings,
} from "@mui/icons-material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Role Config
const ROLE_CONFIG = {
  0: {
    name: "Admin",
    dashboardPath: "/admin/dashboard",
    navItems: [
      { label: "Chatbot", path: "/chatbot", icon: <SmartToyIcon /> },
      { label: "Analytique", path: "/analytics", icon: <Analytics /> },
      { label: "Utilisateurs", path: "/admin/users", icon: <People /> },
      { label: "Interventions", path: "/admin/interventions", icon: <Build /> },
      { label: "Inventaire", path: "/inventory", icon: <Inventory /> },
      { label: "Historique", path: "/history", icon: <History /> },
      { label: "Factures", path: "/invoices", icon: <Receipt /> },
    ],
    menuItems: [
      { label: "Profil", path: "/profile", icon: <Person /> },
      { label: "Paramètres", path: "/settings", icon: <Settings /> },
    ],
  },
  1: {
    name: "Technicien",
    dashboardPath: "/technician-dashboard",
    navItems: [
      { label: "Chatbot", path: "/chatbot", icon: <SmartToyIcon /> },

      { label: "Tâches", path: "/technician/tasks", icon: <Assignment /> },
      { label: "Calendrier", path: "/calendar", icon: <CalendarToday /> },
    ],
    menuItems: [
      { label: "Profil", path: "/profile", icon: <Person /> },
      { label: "Paramètres", path: "/settings", icon: <Settings /> },
    ],
  },
  2: {
    name: "Client",
    dashboardPath: "/client-dashboard",
    navItems: [
      { label: "Chatbot", path: "/chatbot", icon: <SmartToyIcon /> },
      { label: "Ask for consult", path: "/Consult", icon: <RequestQuote /> },
      {
        label: "My intervention",
        path: "/client/interventions",
        icon: <Engineering />,
      },
    ],
    menuItems: [
      { label: "Profil", path: "/profile", icon: <Person /> },
      { label: "Paramètres", path: "/settings", icon: <Settings /> },
    ],
  },
};

const UNAUTH_NAV_ITEMS = [
  { label: "Services", path: "#services", icon: <RoomService /> },
  { label: "Contact", path: "#contact", icon: <ContactMail /> },
];

// Helper function to check token expiration
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    console.error("Token validation error:", e);
    return true;
  }
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State declarations
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] =
    React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [moreAnchorEl, setMoreAnchorEl] = React.useState(null); // State for "More" menu

  // Get auth state
  const { user, token: reduxToken } = useSelector((state) => state.auth);
  const localStorageToken = localStorage.getItem("token");
  const token = localStorageToken || reduxToken;

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        // Token expired, clear storage and logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(logout());
        // REMOVE THIS LINE: navigate("/login");
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, dispatch]);

  // Memoized authentication check
  const isAuthenticated = useMemo(() => {
    if (!token) return false;
    return !isTokenExpired(token);
  }, [token]);

  // Get role config based on authentication
  const getRoleConfig = useCallback(() => {
    if (!isAuthenticated) return null;

    const localStorageUser = JSON.parse(localStorage.getItem("user"));
    const currentUser = user || localStorageUser;

    if (currentUser?.role === undefined) return null;
    return ROLE_CONFIG[currentUser.role] || ROLE_CONFIG[2];
  }, [isAuthenticated, user]);

  const roleConfig = getRoleConfig();
  const authNavItems = isAuthenticated ? roleConfig?.navItems || [] : [];
  const showAuthContent = isAuthenticated;

  // Event handlers
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotificationsClose = () => setNotificationsAnchorEl(null);
  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/login");
    handleMenuClose();
  };

  const currentUser = user || JSON.parse(localStorage.getItem("user"));

  // Check if user is admin or technician for notifications
  const canViewNotifications =
    currentUser?.role === 0 || currentUser?.role === 1;

  // Split nav items for Admin
  let mainNavItems = authNavItems;
  let moreNavItems = [];
  if (roleConfig?.name === "Admin" && authNavItems.length > 3) {
    mainNavItems = authNavItems.slice(0, 3); // Show first 3
    moreNavItems = authNavItems.slice(3); // Rest in "More"
  }

  return (
    <>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.default" }}
      >
        <Toolbar>
          {isMobile && showAuthContent && (
            <IconButton
              edge="start"
              color="primary"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h5"
            color="primary"
            sx={{ flexGrow: 1, fontWeight: 700, fontSize: "1.8rem" }} // Increased font size
          >
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              LAB-IT
            </Link>
          </Typography>

          {!isMobile && (
            <>
              {showAuthContent ? (
                <>
                  {mainNavItems.map((item) => (
                    <Button
                      key={item.path}
                      color="inherit"
                      component={Link}
                      to={item.path}
                      startIcon={item.icon}
                      sx={{ mx: 1 }}
                    >
                      {item.label}
                    </Button>
                  ))}
                  {moreNavItems.length > 0 && (
                    <>
                      <Button
                        color="primary"
                        sx={{ mx: 1, fontSize: "1rem" }}
                        onClick={(e) => setMoreAnchorEl(e.currentTarget)}
                        endIcon={<MoreVertIcon />}
                      >
                        Utils
                      </Button>
                      <Menu
                        anchorEl={moreAnchorEl}
                        open={Boolean(moreAnchorEl)}
                        onClose={() => setMoreAnchorEl(null)}
                      >
                        {moreNavItems.map((item) => (
                          <MenuItem
                            key={item.path}
                            component={Link}
                            to={item.path}
                            onClick={() => setMoreAnchorEl(null)}
                          >
                            {item.label}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  )}
                </>
              ) : (
                UNAUTH_NAV_ITEMS.map((item) => (
                  <Button
                    key={item.path}
                    color="primary"
                    href={item.path}
                    sx={{ mx: 1, fontSize: "1rem" }} // Increased font size
                  >
                    {item.label}
                  </Button>
                ))
              )}
            </>
          )}

          {showAuthContent ? (
            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              {canViewNotifications && (
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/notifications"
                  sx={{ mr: 1 }}
                >
                  <NotificationsIcon />
                </IconButton>
              )}
              <IconButton
                color="inherit"
                component={Link}
                to="/settings"
                sx={{ mr: 2 }}
              >
                <SettingsIcon />
              </IconButton>

              <Button
                onClick={handleMenuOpen}
                sx={{ display: "flex", alignItems: "center", fontSize: "1rem" }} // Increased font size
              >
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{ fontSize: "1rem" }} // Increased font size
                  >
                    {currentUser?.username} ({roleConfig?.name})
                  </Typography>
                )}
              </Button>
            </Box>
          ) : (
            <>
              <Button
                color="primary"
                component={Link}
                to="/login"
                sx={{ ml: 2 }}
              >
                Connexion
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                component={Link}
                to="/register"
              >
                Inscription
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      {showAuthContent && (
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 250, mt: 2 }}>
            <List>
              {authNavItems.map((item) => (
                <ListItem
                  button
                  key={item.path}
                  component={Link}
                  to={item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
      >
        <MenuItem onClick={handleNotificationsClose}>Notification 1</MenuItem>
        <MenuItem onClick={handleNotificationsClose}>Notification 2</MenuItem>
      </Menu>

      {/* User Menu */}
      {showAuthContent && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {roleConfig?.menuItems.map((item) => (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleMenuClose}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.label}
            </MenuItem>
          ))}

          <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
        </Menu>
      )}
    </>
  );
};

export default Navbar;
