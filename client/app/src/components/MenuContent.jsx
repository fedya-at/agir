import * as React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import { lazy, Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";

// Lazy load icons (keep your existing imports)
const HomeRoundedIcon = lazy(() => import("@mui/icons-material/HomeRounded"));
const AnalyticsRoundedIcon = lazy(() =>
  import("@mui/icons-material/AnalyticsRounded")
);
const PeopleRoundedIcon = lazy(() =>
  import("@mui/icons-material/PeopleRounded")
);
const AssignmentRoundedIcon = lazy(() =>
  import("@mui/icons-material/AssignmentRounded")
);
const SettingsRoundedIcon = lazy(() =>
  import("@mui/icons-material/SettingsRounded")
);
const InfoRoundedIcon = lazy(() => import("@mui/icons-material/InfoRounded"));
const HelpRoundedIcon = lazy(() => import("@mui/icons-material/HelpRounded"));
const AdminPanelSettingsRoundedIcon = lazy(() =>
  import("@mui/icons-material/AdminPanelSettingsRounded")
);
const BuildRoundedIcon = lazy(() => import("@mui/icons-material/BuildRounded"));
const SupportAgentRoundedIcon = lazy(() =>
  import("@mui/icons-material/SupportAgentRounded")
);
const WorkHistoryRoundedIcon = lazy(() =>
  import("@mui/icons-material/WorkHistoryRounded")
);

// Memoize the role mapping
const ROLE_MAP = Object.freeze({
  0: "admin",
  1: "technician",
  2: "client",
});

// Pre-calculate menu items outside component
const MENU_ITEMS = Object.freeze({
  admin: Object.freeze([
    { text: "Dashboard", icon: HomeRoundedIcon, path: "/admin/dashboard" },
    { text: "Analytics", icon: AnalyticsRoundedIcon, path: "/analytics" },
    { text: "Users", icon: PeopleRoundedIcon, path: "/admin/manage-users" },
    { text: "Tasks", icon: AssignmentRoundedIcon, path: "/tasks" },
    {
      text: "Admin Tools",
      icon: AdminPanelSettingsRoundedIcon,
      path: "/admin-tools",
    },
  ]),
  technician: Object.freeze([
    { text: "Dashboard", icon: HomeRoundedIcon, path: "/technician-dashboard" },
    { text: "My Tasks", icon: BuildRoundedIcon, path: "/my-tasks" },
    { text: "Schedule", icon: WorkHistoryRoundedIcon, path: "/schedule" },
    { text: "Clients", icon: PeopleRoundedIcon, path: "/clients" },
  ]),
  client: Object.freeze([
    { text: "Dashboard", icon: HomeRoundedIcon, path: "/client-dashboard" },
    {
      text: "My Requests",
      icon: SupportAgentRoundedIcon,
      path: "/my-requests",
    },
    { text: "Status", icon: AnalyticsRoundedIcon, path: "/status" },
  ]),
});

const COMMON_ITEMS = Object.freeze([
  { text: "Settings", icon: SettingsRoundedIcon, path: "/settings" },
  { text: "Help", icon: HelpRoundedIcon, path: "/help" },
  { text: "About", icon: InfoRoundedIcon, path: "/about" },
]);

// Memoized component for menu items
const MenuItemComponent = React.memo(({ item, selected, onClick }) => {
  return (
    <Suspense fallback={<CircularProgress size={24} />}>
      <ListItemButton selected={selected} onClick={() => onClick(item.path)}>
        <ListItemIcon>
          <item.icon />
        </ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItemButton>
    </Suspense>
  );
});

export default React.memo(function MenuContent({ onItemClick }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Optimized role detection
  const roleKey = ROLE_MAP[user?.role] ?? "client";
  const roleItems = MENU_ITEMS[roleKey] ?? [];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isItemSelected = (path) => {
    return location.pathname === path;
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {roleItems.map((item, index) => (
          <ListItem
            key={`${roleKey}-${index}`}
            disablePadding
            sx={{ display: "block" }}
          >
            <MenuItemComponent
              item={item}
              selected={isItemSelected(item.path)}
              onClick={onItemClick}
            />
          </ListItem>
        ))}
      </List>
      <List dense>
        {COMMON_ITEMS.map((item, index) => (
          <ListItem
            key={`common-${index}`}
            disablePadding
            sx={{ display: "block" }}
          >
            <MenuItemComponent
              item={item}
              selected={isItemSelected(item.path)}
              onClick={() => handleNavigation(item.path)}
            />
          </ListItem>
        ))}
      </List>
    </Stack>
  );
});
