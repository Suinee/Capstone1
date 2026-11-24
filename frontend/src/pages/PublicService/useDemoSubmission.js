import useHesitation from "../../features/hesitation/useHesitation.js";
import { beginPublicSubmission } from "../../features/publicHesitation/publicSubmissionTracking.js";
import { useEffect, useRef, useState } from "react";
import { saveDemoApplication } from "./demoApplicationStore";

export default function useDemoSubmission(serviceCode) {
  const tracking = useHesitation();
  const busy = useRef(false);
  const mounted = useRef(true);
  const completed = useRef(false);
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  async function submit(name) {
    if (busy.current || completed.current) return null;
    busy.current = true;
    setSubmitting(true);
    setSubmitError("");
    const visit = tracking.getSnapshot().screenVisitId;
    const finish = beginPublicSubmission(tracking, serviceCode);
    try {
      const receipt = await saveDemoApplication(name, serviceCode);
      finish(receipt);
      // 응답을 기다리는 동안 사용자가 떠난 화면의 완료 안내를 열지 않는다.
      if (!mounted.current || tracking.getSnapshot().screenVisitId !== visit) return null;
      completed.current = true;
      setReceipt(receipt);
      return receipt;
    } catch (error) {
      finish(null);
      if (mounted.current && tracking.getSnapshot().screenVisitId === visit) {
        setSubmitError(error.message || "신청을 저장하지 못했습니다. 다시 시도해 주세요.");
      }
      return null;
    } finally {
      busy.current = false;
      if (mounted.current) setSubmitting(false);
    }
  }
  return { submit, submitting, submitError, receipt };
}
