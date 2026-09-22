import { useEffect } from "react";
import { useInterventionParts } from "../services/useInterventionParts";
import PartsTable from "./PartsTable";
import AddPartForm from "./AddPartForm";
import LoadingSpinner from "./LoadingSpinner";

const PartsList = ({ interventionId }) => {
  const {
    parts,
    isLoading,
    isOperationLoading,
    isSuccess,
    error,
    getParts,
    resetStatus,
  } = useInterventionParts();

  useEffect(() => {
    if (interventionId) {
      getParts(interventionId);
    }
  }, [interventionId, getParts]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        resetStatus();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, resetStatus]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Parts Used</h2>

      {error && (
        <div className="alert alert-error shadow-lg">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="alert alert-success shadow-lg">
          <div>
            <span>Operation completed successfully!</span>
          </div>
        </div>
      )}

      <AddPartForm interventionId={interventionId} />

      <PartsTable
        parts={parts}
        interventionId={interventionId}
        isLoading={isOperationLoading}
      />
    </div>
  );
};

export default PartsList;
