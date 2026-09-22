// Service Type utility functions

export const serviceTypeConfig = {
  0: {
    label: "Hardware Repair",
    color: "primary",
    description: "Physical repair with parts",
    defaultHasParts: true,
    icon: "🔧",
  },
  1: {
    label: "Software Service",
    color: "success",
    description: "Software installation/configuration",
    defaultHasParts: false,
    icon: "💻",
  },
  2: {
    label: "Mixed Service",
    color: "secondary",
    description: "Hardware + Software service",
    defaultHasParts: true,
    icon: "⚙️",
  },
  3: {
    label: "Consultation",
    color: "warning",
    description: "Diagnostic and consulting",
    defaultHasParts: false,
    icon: "🤔",
  },
  4: {
    label: "Maintenance",
    color: "info",
    description: "Cleaning and maintenance",
    defaultHasParts: false,
    icon: "🧹",
  },
  5: {
    label: "Other Service",
    color: "default",
    description: "Custom service",
    defaultHasParts: false,
    icon: "❓",
  },
};

export const getServiceTypeInfo = (serviceType) => {
  return serviceTypeConfig[serviceType] || serviceTypeConfig[0];
};

export const shouldShowPartsSection = (intervention) => {
  // Show parts section if:
  // 1. Service type typically needs parts (priority), OR
  // 2. hasParts is explicitly true, OR
  // 3. There are already intervention parts

  // Get service type info first
  const serviceInfo = getServiceTypeInfo(intervention.serviceType);

  // If service type typically needs parts, show parts section
  if (serviceInfo.defaultHasParts) return true;

  // If hasParts is explicitly true, show parts section
  if (intervention.hasParts === true) return true;

  // If there are already parts, show parts section
  if (intervention.interventionParts?.length > 0) return true;

  // Otherwise, don't show parts section
  return false;
};

export const getServiceTypeLabel = (serviceType) => {
  return getServiceTypeInfo(serviceType).label;
};

export const getServiceTypeIcon = (serviceType) => {
  return getServiceTypeInfo(serviceType).icon;
};

export const getServiceTypeColor = (serviceType) => {
  return getServiceTypeInfo(serviceType).color;
};

export const formatCurrency = (amount) => {
  return `${(amount || 0).toFixed(2)} DT`;
};
