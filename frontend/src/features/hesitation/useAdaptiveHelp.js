import { useCallback, useEffect, useReducer, useRef } from "react";
import { resolveKioskHelp } from "./resolveKioskHelp.js";

import { helpReducer, initialState } from "./adaptiveHelpState.js";

export default function useAdaptiveHelp(engine, automatic = true, enabled = true, { resolveHelp = resolveKioskHelp, clearOnPause = false } = {}) {
  const [help, dispatch] = useReducer(helpReducer, initialState);
  const lastLoggedVersion = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const syncScreen = (snapshot) => dispatch({ type: "SCREEN", screenVisitId: snapshot.screenVisitId });
    const unsubscribe = engine.subscribe((message) => {
      const snapshot = message.snapshot;
      if (message.type === "screen") syncScreen(snapshot);
      if (clearOnPause && message.type === "measurement" && !snapshot.measuring) {
        dispatch({ type: "RESOLVE", screenVisitId: snapshot.screenVisitId });
      }
      if (message.type === "resolved") dispatch({ type: "RESOLVE", screenVisitId: snapshot.screenVisitId });
      // 0점짜리 중복 신호나 단순 마우스 이동으로 도움 대상을 바꾸지 않습니다.
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
  }, [engine, automatic, enabled, resolveHelp, clearOnPause]);

  useEffect(() => {
    if (!help.screenVisitId || help.version === lastLoggedVersion.current) return;
    lastLoggedVersion.current = help.version;
    if (help.screenVisitId !== engine.getSnapshot().screenVisitId) return;
    engine.logHelp({
      helpScreenVisitId: help.screenVisitId, status: help.status, level: help.level,
      // 기존 로그 소비자를 위한 호환 필드. 새로운 UI에서는 사용하지 않습니다.
      targetId: help.highlightTargetId,
      observedTargetId: help.observedTargetId,
      highlightTargetId: help.highlightTargetId,
      helpKey: help.helpKey,
      sourceSignalKey: help.sourceSignalKey,
      sourceAddedScore: help.sourceAddedScore,
      reason: help.reason,
    });
  }, [engine, help]);

  const closeHelp = useCallback(() => {
    dispatch({ type: "CLOSE", until: Date.now() + engine.config.helpDismissMs });
  }, [engine]);
  const openHelp = useCallback(() => {
    if (!enabled) return;
    const snapshot = engine.getSnapshot();
    if (!snapshot.measuring) return;
    dispatch({ type: "SCREEN", screenVisitId: snapshot.screenVisitId });
    dispatch({
      type: "MANUAL_OPEN", screenVisitId: snapshot.screenVisitId, level: snapshot.level,
      target: resolveHelp({ screenId: snapshot.screenId, task: snapshot.task }),
    });
  }, [engine, enabled, resolveHelp]);
  const expandHelp = useCallback(() => {
    const snapshot = engine.getSnapshot();
    if (snapshot.measuring) dispatch({ type: "EXPAND", screenVisitId: snapshot.screenVisitId });
  }, [engine]);
  const resolveCurrentHelp = useCallback(() => {
    dispatch({ type: "RESOLVE", screenVisitId: engine.getSnapshot().screenVisitId });
  }, [engine]);
  return { help, closeHelp, openHelp, expandHelp, resolveCurrentHelp };
}
