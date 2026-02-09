import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const InvoiceManager = ({
  interventionId = null,
  invoiceId = null,
  mode = "view", // 'view', 'create', 'edit', 'generate'
  currentInvoice = null,
  onFetchInvoiceById,
  onGenerateInvoice,
  onCreateInvoice,
  onUpdateInvoice,
  onIssueInvoice,
  onSuccess = () => {},
  onClose = () => {},
}) => {
  const [formData, setFormData] = useState({
    interventionId: interventionId || "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    laborCost: 0,
    totalPartsCost: 0,
  });

  useEffect(() => {
    if (invoiceId && onFetchInvoiceById) {
      onFetchInvoiceById(invoiceId);
    } else if (mode === "edit" && interventionId && currentInvoice) {
      setFormData({
        interventionId: currentInvoice.interventionId,
        invoiceNumber: currentInvoice.invoiceNumber,
        issueDate: currentInvoice.issueDate.split("T")[0],
        dueDate: currentInvoice.dueDate.split("T")[0],
        laborCost: currentInvoice.laborCost,
        totalPartsCost: currentInvoice.totalPartsCost,
      });
    } else if (interventionId) {
      setFormData((prev) => ({
        ...prev,
        interventionId,
      }));
    }
  }, [invoiceId, interventionId, mode, currentInvoice, onFetchInvoiceById]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;

      if (mode === "generate" && interventionId && onGenerateInvoice) {
        result = await onGenerateInvoice(interventionId);
      } else if (mode === "create" && onCreateInvoice) {
        result = await onCreateInvoice(formData);
      } else if (mode === "edit" && invoiceId && onUpdateInvoice) {
        result = await onUpdateInvoice(invoiceId, formData);
      } else if (mode === "issue" && invoiceId && onIssueInvoice) {
        result = await onIssueInvoice(invoiceId);
      }

      if (result) {
        toast.success(`Invoice ${getActionVerb()} successfully!`);
        onSuccess(result);
      }
    } catch (error) {
      toast.error(`Failed to ${getActionVerb()} invoice: ${error.message}`);
    }
  };

  const getActionVerb = () => {
    switch (mode) {
      case "generate":
        return "generate";
      case "create":
        return "create";
      case "edit":
        return "update";
      case "issue":
        return "issue";
      default:
        return "process";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "laborCost" || name === "totalPartsCost"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  return (
    <div className="invoice-manager">
      <h2>{`${mode.charAt(0).toUpperCase() + mode.slice(1)} Invoice`}</h2>

      <form onSubmit={handleSubmit}>
        {mode !== "generate" && mode !== "issue" && (
          <>
            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                required
                disabled={mode === "view" || mode === "edit"}
              />
            </div>

            <div className="form-group">
              <label>Issue Date</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="form-group">
              <label>Labor Cost</label>
              <input
                type="number"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="form-group">
              <label>Parts Cost</label>
              <input
                type="number"
                name="totalPartsCost"
                value={formData.totalPartsCost}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                disabled={mode === "view"}
              />
            </div>
          </>
        )}

        {mode === "generate" && (
          <p>Generate invoice for intervention #{interventionId}?</p>
        )}

        {mode === "issue" && <p>Issue invoice #{invoiceId}?</p>}

        <div className="actions">
          {mode !== "view" && (
            <button type="submit">
              {getActionVerb().charAt(0).toUpperCase() +
                getActionVerb().slice(1)}
            </button>
          )}
          <button type="button" onClick={onClose}>
            {mode === "view" ? "Close" : "Cancel"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceManager;
