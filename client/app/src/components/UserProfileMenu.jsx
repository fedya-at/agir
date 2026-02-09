// src/components/UserProfileMenu.jsx
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import OptionsMenu from "./OptionsMenu";

export default function UserProfileMenu({ user, onLogout }) {
  return (
    <Stack
      direction="row"
      sx={{
        p: 2,
        gap: 1,
        alignItems: "center",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ mr: "auto" }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, lineHeight: "16px" }}
        >
          {user?.username}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {user?.email}
        </Typography>
      </Box>
      <OptionsMenu onLogout={onLogout} />
    </Stack>
  );
}
