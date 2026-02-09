import React from "react";
import MuiChip from "@mui/material/Chip";

// Status maps for invoice and intervention statuses
const invoiceStatusMap = {
  0: { label: "Draft", color: "default" },
  1: { label: "Issued", color: "primary" },
  2: { label: "Paid", color: "success" },
  3: { label: "Cancelled", color: "error" },
};

const interventionStatusMap = {
  0: { label: "Pending", color: "default" },
  1: { label: "In Progress", color: "primary" },
  2: { label: "Completed", color: "success" },
  3: { label: "Cancelled", color: "error" },
};

const InvoiceStatusChip = ({ status, type = "intervention", ...props }) => {
  // Determine the appropriate status map
  const statusMap =
    type === "invoice" ? invoiceStatusMap : interventionStatusMap;

  // Get the configuration for the given status
  const config = statusMap[status] || { label: "Unknown", color: "default" };

  return (
    <MuiChip
      label={config.label}
      color={config.color}
      variant="outlined"
      size="small"
      {...props}
    />
  );
};

export default InvoiceStatusChip;
