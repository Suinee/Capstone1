import { useCallback, useMemo, useState } from "react";
import { ExperimentContext } from "./useExperiment.js";
import { createExperiment, readExperiment, saveExperiment } from "./experimentSession.js";

export default function ExperimentProvider({ children }) {
  const [experiment, setExperiment] = useState(() => {
    try { return readExperiment(window.sessionStorage); }
    catch { return null; }
  });
  const startExperiment = useCallback((mode, service, dataset) => {
    const next = saveExperiment(window.sessionStorage, createExperiment(mode, service, dataset));
    setExperiment(next);
    return next;
  }, []);
  const value = useMemo(() => ({ experiment, startExperiment }), [experiment, startExperiment]);
  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}
