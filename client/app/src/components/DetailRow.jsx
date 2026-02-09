import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const DetailRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: theme.spacing(1.5),
}));

export default DetailRow;
