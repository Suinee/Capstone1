import { createContext, useContext } from "react";

export const ExperimentContext = createContext(null);

export default function useExperiment() {
  return useContext(ExperimentContext);
}
