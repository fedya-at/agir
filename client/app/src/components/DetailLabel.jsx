// DetailLabel.js
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

const DetailLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

export default DetailLabel;
