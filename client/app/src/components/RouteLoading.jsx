import { CircularProgress, Box, Typography } from "@mui/material";

export default function RouteLoading() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <div className="loader"></div>
    </Box>
  );
}
