import { useLocation } from "react-router-dom";
import { Fragment } from "react";
import useExperiment from "./useExperiment.js";
import ExperimentSetup from "./ExperimentSetup.jsx";

// 주소 직접 입력도 설정 화면을 거친다. 설정 전에는 수집 Provider를 마운트하지 않는다.
export default function ExperimentBoundary({ service, children }) {
  const { experiment } = useExperiment();
  const location = useLocation();
  if (!experiment || experiment.service !== service) {
    return <ExperimentSetup key={service} service={service}
      destination={`${location.pathname}${location.search}${location.hash}`} />;
  }
  return <Fragment key={experiment.runId}>{children}</Fragment>;
}
