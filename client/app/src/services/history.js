import { fetchClientById } from "../store/clientsSlice";
import { getTechnicianById } from "../store/techniciansSlice";
import { fetchUserById } from "../store/usersSlice";
import { fetchPartById } from "../store/partsSlice";
import { fetchInterventionById } from "../store/interventionsSlice";
import { fetchInvoiceById } from "../store/invoiceSlice";

// Cache for names to avoid repeated API calls
const nameCache = new Map();

const getCachedName = async (id, type, fetchFn) => {
  const cacheKey = `${type}_${id}`;

  if (nameCache.has(cacheKey)) {
    return nameCache.get(cacheKey);
  }

  try {
    const name = await fetchFn(id);
    const displayName =
      name?.name || name?.username || `${type} ${id.substring(0, 4)}`;

    nameCache.set(cacheKey, displayName);
    return displayName;
  } catch (error) {
    console.error(`Error fetching ${type} ${id}:`, error);
    return `${type} ${id.substring(0, 4)}`;
  }
};

const fetchHumanReadableNames = async (entityName, entityId) => {
  try {
    let result;

    switch (entityName) {
      case "Client":
        result = await getCachedName(entityId, "Client", fetchClientById);
        break;
      case "Technician":
        result = await getCachedName(entityId, "Tech", getTechnicianById);
        break;
      case "User":
        result = await getCachedName(entityId, "User", fetchUserById);
        break;
      case "Part":
        result = await getCachedName(entityId, "Part", fetchPartById);
        break;
      case "Intervention": {
        const intervention = await fetchInterventionById(entityId);
        result =
          intervention?.title || `Intervention ${entityId.substring(0, 4)}`;
        break;
      }
      case "Invoice":
        result = await getCachedName(entityId, "Invoice", fetchInvoiceById);
        break;
      default:
        result = `${entityName} ${entityId.substring(0, 4)}`;
    }

    return result;
  } catch (error) {
    return `${entityName} ${entityId.substring(0, 4)}`;
  }
};

const fetchUserName = async (userId) => {
  const result = await getCachedName(userId, "User", fetchUserById);
  return result;
};

const formatAction = (action) => {
  const actionMap = {
    Created: "🆕 Created",
    Updated: "✏️ Updated",
    Deleted: "❌ Deleted",
    StatusChanged: "🔄 Status Changed",
    TechnicianAssigned: "👨‍🔧 Technician Assigned",
    ClientAssigned: "👥 Client Assigned",
    Generated: "🧾Invoice Generated",
    PaymentAdded: "💳 Payment Added",
    InvoiceIssued: "📤 Invoice Issued",
    InvoicePaid: "💰 Invoice Paid",
    InvoiceCancelled: "❌ Invoice Cancelled",
  };
  return actionMap[action] || action;
};

const resolveIdToName = async (id, type, dispatch) => {
  if (!id) {
    console.groupEnd();
    return "Unknown";
  }

  try {
    let result;

    switch (type) {
      case "Technician": {
        const technician = await dispatch(getTechnicianById(id)).unwrap();
        if (technician?.name) {
          result = technician.name;
          break;
        }

        // For technicians, we don't need user ID fallback since we have direct ID mapping
        result = `⚠️ Unknown Technician (${id.substring(0, 8)})`;
        break;
      }

      case "Client": {
        const client = await dispatch(fetchClientById(id)).unwrap();

        if (client?.name) {
          result = client.name;
          break;
        }

        result = `⚠️ Unknown Client (${id.substring(0, 8)})`;
        break;
      }

      case "User": {
        const user = await fetchUserById(id);

        if (user?.username) {
          result = user.username;
        } else if (user?.firstName && user?.lastName) {
          result = `${user.firstName} ${user.lastName}`;
        } else {
          result = `⚠️ Unknown User (${id.substring(0, 8)})`;
        }
        break;
      }
      case "Invoice": {
        const invoice = await dispatch(fetchInvoiceById(id)).unwrap();
        result = invoice?.invoiceNumber
          ? `Invoice #${invoice.invoiceNumber}`
          : `⚠️ Unknown Invoice (${id.substring(0, 8)})`;
        break;
      }

      default:
        result = `⚠️ Unknown ${type} (${id.substring(0, 8)})`;
    }

    return result;
  } catch (error) {
    console.error(`[Resolution Error] Failed to resolve ${type} ${id}:`, error);
    return `⚠️ Unknown ${type} (${id.substring(0, 8)})`;
  } finally {
    console.groupEnd();
  }
};

const enhanceChanges = async (changes, entityName, dispatch) => {
  if (!changes) {
    return "No changes detected";
  }

  if (typeof changes === "string") {
    try {
      changes = JSON.parse(changes);
    } catch {
      return changes;
    }
  }

  if (typeof changes !== "object") {
    return "Modified";
  }

  const enhancedEntries = await Promise.all(
    Object.entries(changes).map(async ([key, value]) => {
      let result;
      try {
        if (key.endsWith("TechnicianId")) {
          const name = await resolveIdToName(value, "Technician", dispatch);
          result = `👨‍🔧 ${key.replace("Id", "")}: ${name}`;
        } else if (key.endsWith("ClientId")) {
          const name = await resolveIdToName(value, "Client", dispatch);
          result = `👥 ${key.replace("Id", "")}: ${name}`;
        } else if (key.endsWith("UserId")) {
          const name = await resolveIdToName(value, "User", dispatch);
          result = `👤 ${key.replace("Id", "")}: ${name}`;
        } else if (key.endsWith("Date")) {
          if (value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              result = `• ${key}: Invalid Date`;
            } else {
              // Show full date and time
              result = `• ${key}: ${date.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}`;
            }
          } else {
            result = `• ${key}: None`;
          }
        } else if (key.endsWith("Status")) {
          const statusMap = {
            0: "🟡 Pending",
            1: "🔵 In Progress",
            2: "🟢 Completed",
            3: "🔴 Cancelled",
            4: "⚪ On Hold",
          };
          result = `• ${key}: ${statusMap[value] || value}`;
        } else if (key === "Description" || key === "Notes") {
          result = `• ${key}: "${value}"`;
        } else if (typeof value === "boolean") {
          result = `• ${key}: ${value ? "✅ Yes" : "❌ No"}`;
        } else if (value == null) {
          result = `• ${key}: None`;
        } else if (key === "InvoiceNumber") {
          result = `📄 Invoice #: ${value}`;
        } else if (
          key === "LaborCost" ||
          key === "TotalPartsCost" ||
          key === "TotalAmount"
        ) {
          result = `💰 ${key}: $${value?.toFixed(2) || "0.00"}`;
        } else if (key === "PaymentMethod") {
          const methodMap = {
            CreditCard: "💳 Credit Card",
            BankTransfer: "🏦 Bank Transfer",
            Cash: "💵 Cash",
            Check: "✏️ Check",
            Other: "🔘 Other",
          };
          result = `• Payment Method: ${methodMap[value] || value}`;
        } else if (key === "InvoiceStatus") {
          const statusMap = {
            0: "📝 Draft",
            1: "📤 Issued",
            2: "💰 Paid",
            3: "❌ Cancelled",
          };
          result = `• Status: ${statusMap[value] || value}`;
        } else if (
          key === "PaymentDate" ||
          key === "DueDate" ||
          key === "IssueDate"
        ) {
          if (value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              result = `• ${key}: Invalid Date`;
            } else {
              result = `• ${key}: ${date.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}`;
            }
          } else {
            result = `• ${key}: None`;
          }
        } else {
          result = `• ${key}: ${value}`;
        }
      } catch (error) {
        console.error(`Error processing key ${key}:`, error);
        result = `• ${key}: [Error]`;
      }

      return result;
    })
  );

  const finalResult = enhancedEntries.join("\n");
  return finalResult;
};

export {
  fetchHumanReadableNames,
  fetchUserName,
  formatAction,
  resolveIdToName,
  enhanceChanges,
};
