// 점수 계산은 항상 실행하고 자동 도움의 표시만 실험 조건에 따라 제한한다.
export function subscribeHelp(engine, dispatch, {
  automatic = true, clearOnPause = false, resolveHelp,
}) {
  const syncScreen = (snapshot) => dispatch({ type: "SCREEN", screenVisitId: snapshot.screenVisitId });
  const unsubscribe = engine.subscribe((message) => {
    const snapshot = message.snapshot;
    if (message.type === "screen") syncScreen(snapshot);
    if (clearOnPause && message.type === "measurement" && !snapshot.measuring) {
      dispatch({ type: "RESOLVE", screenVisitId: snapshot.screenVisitId });
    }
    if (message.type === "resolved") dispatch({ type: "RESOLVE", screenVisitId: snapshot.screenVisitId });
    if (message.type === "signal" && automatic && message.addedScore > 0) {
      dispatch({
        type: "SIGNAL", screenVisitId: snapshot.screenVisitId,
        level: snapshot.level, at: message.at, addedScore: message.addedScore,
        target: resolveHelp({
          screenId: snapshot.screenId, signals: message.signals,
          task: snapshot.task, metrics: snapshot.metrics,
        }),
      });
    }
  });
  syncScreen(engine.getSnapshot());
  return unsubscribe;
}
