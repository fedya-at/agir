import { useSelector, useDispatch } from "react-redux";
import {
  fetchInterventionParts,
  addInterventionPart,
  updateInterventionPart,
  deleteInterventionPart,
  resetOperationStatus,
  clearCurrentPart,
} from "../store/interventionPartSlice";
import { useCallback } from "react";

export const useInterventionParts = () => {
  const dispatch = useDispatch();
  const { parts, currentPart, status, error } = useSelector(
    (state) => state.interventionParts
  );

  const getParts = useCallback(
    async (interventionId) => {
      dispatch(fetchInterventionParts(interventionId));
    },
    [dispatch]
  );

  const createPart = (interventionId, partId, quantity) => {
    if (!partId) {
      throw new Error("Part ID is required");
    }
    return dispatch(addInterventionPart({ interventionId, partId, quantity }));
  };

  const modifyPart = (partId, updateData) => {
    return dispatch(updateInterventionPart({ partId, updateData }));
  };

  const deletePart = (partId) => {
    return dispatch(deleteInterventionPart(partId));
  };

  const resetStatus = () => {
    dispatch(resetOperationStatus());
  };

  return {
    parts,
    currentPart,
    isLoading: status === "loading",
    isOperationLoading: status === "loading",
    isSuccess: status === "succeeded",
    error,
    getParts,
    createPart,
    modifyPart,
    deletePart,
    resetStatus,
    clearCurrentPart: () => dispatch(clearCurrentPart()),
  };
};
