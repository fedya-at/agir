import { Chip } from "@mui/material";

// Status mapping for interventions
const interventionStatusMap = {
  0: { label: "Pending", color: "warning" },
  1: { label: "In Progress", color: "info" },
  2: { label: "Completed", color: "success" },
  3: { label: "Cancelled", color: "error" },
};

// Status mapping for invoices
const invoiceStatusMap = {
  0: { label: "Draft", color: "default" },
  1: { label: "Issued", color: "info" },
  2: { label: "Paid", color: "success" },
  3: { label: "Cancelled", color: "error" },
};

const StatusChip = ({ status, type = "intervention" }) => {
  const statusInfo =
    type === "invoice"
      ? invoiceStatusMap[status] || { label: "Unknown", color: "default" }
      : interventionStatusMap[status] || { label: "Unknown", color: "default" };

  return (
    <Chip
      label={statusInfo.label}
      color={statusInfo.color}
      size="medium"
      sx={{
        borderRadius: 1,
        fontWeight: 500,
        textTransform: "capitalize",
        minWidth: 100, // Ensures consistent width for different statuses
      }}
    />
  );
};

export default StatusChip;
