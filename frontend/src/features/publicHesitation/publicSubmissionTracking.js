// 비동기 응답이 도착하기 전에 화면을 나가면 새 화면의 측정 상태를 바꾸지 않는다.
export function beginPublicSubmission(actions, serviceCode) {
  const { getSnapshot, recordLifecycleEvent, setPaused, completeAction, flushLogs } = actions;
  const visit = getSnapshot().screenVisitId;
  recordLifecycleEvent({ type: "submission_started", serviceCode });
  setPaused("publicSubmission", true);
  return (receipt) => {
    if (getSnapshot().screenVisitId !== visit) return;
    setPaused("publicSubmission", false);
    recordLifecycleEvent({ type: receipt ? "submission_succeeded" : "submission_failed",
      serviceCode, ...(receipt ? { requestId: receipt.requestId } : {}) });
    if (receipt) completeAction();
    flushLogs().catch((error) => console.warn("[공공서비스 감지 로그 전송]", error));
  };
}
