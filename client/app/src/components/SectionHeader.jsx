import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export default SectionHeader;
