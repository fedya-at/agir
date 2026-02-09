import React from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.selected,
    borderRight: `3px solid ${theme.palette.primary.main}`,
  },
  "&.Mui-selected:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

export default function SidebarItem({ icon, text, to, open }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Tooltip title={!open ? text : ""} placement="right">
      <StyledListItem
        button
        component={RouterLink}
        to={to}
        selected={isActive}
        sx={{
          minHeight: 48,
          justifyContent: open ? "initial" : "center",
          px: 2.5,
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 3 : "auto",
            justifyContent: "center",
            color: isActive ? "primary.main" : "inherit",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          sx={{
            opacity: open ? 1 : 0,
            "& span": {
              fontWeight: isActive ? "bold" : "normal",
            },
          }}
        />
      </StyledListItem>
    </Tooltip>
  );
}
