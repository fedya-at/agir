// src/components/SideMenu.jsx
import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import toast from "react-hot-toast";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import OptionsMenu from "./OptionsMenu";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
    backgroundColor: "#fff", // White background
    color: "#000", // Black text
  },
});

export default function SideMenu() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    toast("See you soon!", { icon: "👋" });
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) {
    return null; // or a loading spinner
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "#fff", // White background
          color: "#000", // Black text
        },
      }}
    >
      <Box
        sx={{
          display: "center",
          p: 1.5,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            flexGrow: 1,
            color: "#000", // Black text
          }}
        >
          Lab-IT
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "#000" }} />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent
          sx={{
            "& .menu-item": {
              color: "#000", // Black text
              "&:hover": {
                backgroundColor: "#f0f0f0", // Light gray hover effect
              },
            },
          }}
        />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "#000", // Black border
        }}
      >
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px", color: "#000" }}
          >
            {user?.username}
          </Typography>
          <Typography variant="caption" sx={{ color: "#666" }}>
            {user?.email}
          </Typography>
        </Box>
        <OptionsMenu
          onLogout={handleLogout}
          sx={{
            "& .menu-item": {
              color: "#000", // Black text
              "&:hover": {
                backgroundColor: "#f0f0f0", // Light gray hover effect
              },
              "&.selected": {
                border: "1px solid #000", // Black border for selected item
              },
            },
          }}
        />
      </Stack>
    </Drawer>
  );
}
