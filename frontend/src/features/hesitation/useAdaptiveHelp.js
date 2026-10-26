// 도움 표시, 닫기, 30초 대기, 행동 완료 시 해제 관리

import { useCallback, useEffect, useReducer, useRef } from "react";

const initialState = {
  screenVisitId: null,

  // hidden / visible / suppressed
  status: "hidden",

  level: 0,
  targetId: null,
  suppressedUntil: 0,

  reason: "initial",
  version: 0,
};

function helpReducer(state, action) {
  switch (action.type) {
    case "SCREEN": {
      if (state.screenVisitId === action.screenVisitId) {
        return state;
      }

      return {
        ...initialState,
        screenVisitId: action.screenVisitId,
        reason: "screenChanged",
        version: state.version + 1,
      };
    }

    case "SIGNAL": {
      if (state.screenVisitId !== action.screenVisitId) {
        return state;
      }

      if (action.level === 0) return state;
      if (action.at < state.suppressedUntil) return state;

      return {
        ...state,
        status: "visible",
        level: action.level,
        targetId: action.targetId,
        reason: "newSignal",
        version: state.version + 1,
      };
    }

    case "CLOSE": {
      if (state.status !== "visible") return state;

      return {
        ...state,
        status: "suppressed",
        suppressedUntil: action.until,
        reason: "userClosed",
        version: state.version + 1,
      };
    }

    case "RESOLVE": {
      return {
        ...state,
        status: "hidden",
        level: 0,
        targetId: null,

        // 같은 방문 안에서는 사용자가 닫은 대기시간을 유지
        reason: "actionCompleted",
        version: state.version + 1,
      };
    }

    case "MANUAL_OPEN": {
      return {
        ...state,
        status: "visible",
        level: Math.max(1, action.level),
        targetId: action.targetId,
        reason: "manualRequest",
        version: state.version + 1,
      };
    }

    default:
      return state;
  }
}

export default function useAdaptiveHelp(engine, automatic = true) {
  const [help, dispatch] = useReducer(helpReducer, initialState);
  const lastLoggedVersion = useRef(0);

  useEffect(() => {
    const syncScreen = (snapshot) => {
      dispatch({
        type: "SCREEN",
        screenVisitId: snapshot.screenVisitId,
      });
    };

    const unsubscribe = engine.subscribe((message) => {
      const snapshot = message.snapshot;

      if (message.type === "screen") {
        syncScreen(snapshot);
      }

      if (message.type === "resolved") {
        dispatch({ type: "RESOLVE" });
      }

      if (message.type === "signal" && automatic) {
        dispatch({
          type: "SIGNAL",
          screenVisitId: snapshot.screenVisitId,
          level: snapshot.level,

          // 초기 버전에서는 현재 과제의 도움 대상을 사용
          targetId: snapshot.task.targetId,
          at: message.at,
        });
      }
    });

    // 자식 화면 Effect가 먼저 실행됐어도 현재 방문을 동기화
    syncScreen(engine.getSnapshot());

    return unsubscribe;
  }, [engine, automatic]);

  useEffect(() => {
    if (!help.screenVisitId) return;
    if (help.version === lastLoggedVersion.current) return;

    lastLoggedVersion.current = help.version;

    engine.logHelp({
      helpScreenVisitId: help.screenVisitId,
      status: help.status,
      level: help.level,
      targetId: help.targetId,
      reason: help.reason,
    });
  }, [engine, help]);

  const closeHelp = useCallback(() => {
    dispatch({
      type: "CLOSE",
      until: Date.now() + engine.config.helpDismissMs,
    });
  }, [engine]);

  const openHelp = useCallback(() => {
    const snapshot = engine.getSnapshot();

    if (!snapshot.screenVisitId || snapshot.task.phase === "done") {
      return;
    }

    dispatch({
      type: "MANUAL_OPEN",
      level: snapshot.level,
      targetId: snapshot.task.targetId,
    });
  }, [engine]);

  return {
    help,
    closeHelp,
    openHelp,
  };
}
