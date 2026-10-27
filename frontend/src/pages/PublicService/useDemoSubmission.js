import { useRef, useState } from "react";
import { saveDemoApplication } from "./demoApplicationStore";

export default function useDemoSubmission(serviceCode) {
  const busy = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  async function submit(name) {
    if (busy.current) return null;
    busy.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      return await saveDemoApplication(name, serviceCode);
    } catch (error) {
      setSubmitError(error.message || "신청을 저장하지 못했습니다. 다시 시도해 주세요.");
      return null;
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }
  return { submit, submitting, submitError };
}
