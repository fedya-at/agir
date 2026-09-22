// Service type mapping based on backend enum
export const ServiceType = {
  0: "Hardware",
  1: "Software",
  2: "Mixed",
  3: "Consultation",
  4: "Maintenance",
  5: "Other",
};

export const getServiceTypeLabel = (serviceType) => {
  return ServiceType[serviceType] || "Unknown";
};
