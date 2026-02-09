import * as React from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Link as RouterLink, useLocation } from "react-router-dom";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center",
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  // Split the current path into segments
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography
        component={RouterLink}
        to="/"
        variant="body1"
        sx={{ textDecoration: "none", color: "inherit" }}
      >
        Dashboard
      </Typography>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography
            key={to}
            variant="body1"
            sx={{ color: "text.primary", fontWeight: 200 }}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Typography>
        ) : (
          <Typography
            key={to}
            component={RouterLink}
            to={to}
            variant="body1"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Typography>
        );
      })}
    </StyledBreadcrumbs>
  );
}
