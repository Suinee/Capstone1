import { useCallback, useEffect, useReducer, useRef } from "react";
import { resolveKioskHelp } from "./resolveKioskHelp.js";

const emptyTarget = {
  observedTargetId: null,
  highlightTargetId: null,
  helpKey: null,
  sourceSignalKey: null,
  sourceAddedScore: 0,
};
const initialState = {
  screenVisitId: null,
  status: "hidden",
  level: 0,
  ...emptyTarget,
  suppressedUntil: 0,
  reason: "initial",
  version: 0,
};

function helpReducer(state, action) {
  switch (action.type) {
    case "SCREEN":
      if (state.screenVisitId === action.screenVisitId) return state;
      return { ...initialState, screenVisitId: action.screenVisitId,
        reason: "screenChanged", version: state.version + 1 };
    case "SIGNAL":
      if (state.screenVisitId !== action.screenVisitId || action.level === 0 ||
          action.at < state.suppressedUntil) return state;
      return { ...state, ...action.target, status: "visible", level: action.level,
        sourceAddedScore: action.addedScore, reason: "newSignal", version: state.version + 1 };
    case "CLOSE":
      if (state.status !== "visible") return state;
      return { ...state, status: "suppressed", suppressedUntil: action.until,
        reason: "userClosed", version: state.version + 1 };
    case "RESOLVE":
      if (state.screenVisitId !== action.screenVisitId) return state;
      return { ...state, ...emptyTarget, status: "hidden", level: 0,
        reason: "actionCompleted", version: state.version + 1 };
    case "MANUAL_OPEN":
      if (state.screenVisitId !== action.screenVisitId) return state;
      return { ...state, ...emptyTarget, ...action.target, status: "visible",
        level: Math.max(1, action.level), reason: "manualRequest", version: state.version + 1 };
    default:
      return state;
  }
}

export default function useAdaptiveHelp(engine, automatic = true) {
  const [help, dispatch] = useReducer(helpReducer, initialState);
  const lastLoggedVersion = useRef(0);

  useEffect(() => {
    const syncScreen = (snapshot) => dispatch({ type: "SCREEN", screenVisitId: snapshot.screenVisitId });
    const unsubscribe = engine.subscribe((message) => {
      const snapshot = message.snapshot;
      if (message.type === "screen") syncScreen(snapshot);
      if (message.type === "resolved") dispatch({ type: "RESOLVE", screenVisitId: snapshot.screenVisitId });
      // 0점짜리 중복 신호나 단순 마우스 이동으로 도움 대상을 바꾸지 않습니다.
      if (message.type === "signal" && automatic && message.addedScore > 0) {
        dispatch({
          type: "SIGNAL", screenVisitId: snapshot.screenVisitId,
          level: snapshot.level, at: message.at, addedScore: message.addedScore,
          target: resolveKioskHelp({
            screenId: snapshot.screenId, signals: message.signals,
            task: snapshot.task, metrics: snapshot.metrics,
          }),
        });
      }
    });
    syncScreen(engine.getSnapshot());
    return unsubscribe;
  }, [engine, automatic]);

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
    const snapshot = engine.getSnapshot();
    if (!snapshot.measuring) return;
    dispatch({ type: "SCREEN", screenVisitId: snapshot.screenVisitId });
    dispatch({
      type: "MANUAL_OPEN", screenVisitId: snapshot.screenVisitId, level: snapshot.level,
      target: resolveKioskHelp({ screenId: snapshot.screenId, task: snapshot.task }),
    });
  }, [engine]);
  return { help, closeHelp, openHelp };
}
