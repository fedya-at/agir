/* eslint-disable no-unused-vars */
import React, { useState, useCallback, memo } from "react";
import { useInterventionParts } from "../services/useInterventionParts";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const PartsTable = memo(({ parts = [], interventionId, isLoading }) => {
  const { deletePart } = useInterventionParts();
  const [editingPart, setEditingPart] = useState(null);
  const [quantity, setQuantity] = useState("");

  const handleDelete = useCallback(
    async (partId) => {
      if (window.confirm("Are you sure you want to delete this part?")) {
        await deletePart(interventionId, partId);
      }
    },
    [deletePart, interventionId]
  );

  const handleEdit = useCallback((part) => {
    setEditingPart(part.id);
    setQuantity(part.quantity);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingPart(null);
    setQuantity("");
  }, []);

  const handleUpdate = useCallback(async (partId) => {
    setEditingPart(null);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Part Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.id}>
              <td>{part.part?.name || "N/A"}</td>
              <td>
                {editingPart === part.id ? (
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input input-bordered w-20"
                  />
                ) : (
                  part.quantity
                )}
              </td>
              <td>{part.unitPrice.toFixed(2)} DT</td>
              <td>{(part.quantity * part.unitPrice).toFixed(2)} DT</td>
              <td>
                <div className="flex space-x-2">
                  {editingPart === part.id ? (
                    <>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdate(part.id)}
                        disabled={isLoading}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleEdit(part)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => handleDelete(part.id)}
                        disabled={isLoading}
                      >
                        <DeleteIcon />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

PartsTable.displayName = "PartsTable";

export default PartsTable;
