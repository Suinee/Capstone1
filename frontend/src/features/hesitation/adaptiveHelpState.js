const emptyTarget = {
  observedTargetId: null,
  highlightTargetId: null,
  helpKey: null,
  sourceSignalKey: null,
  sourceAddedScore: 0,
};
export const initialState = {
  screenVisitId: null,
  status: "hidden",
  level: 0,
  ...emptyTarget,
  suppressedUntil: 0,
  reason: "initial",
  version: 0,
};

export function helpReducer(state, action) {
  switch (action.type) {
    case "SCREEN":
      if (state.screenVisitId === action.screenVisitId) return state;
      return { ...initialState, screenVisitId: action.screenVisitId,
        reason: "screenChanged", version: state.version + 1 };
    case "SIGNAL":
      if (state.screenVisitId !== action.screenVisitId || action.level === 0 ||
          action.at < state.suppressedUntil) return state;
      return { ...state, ...action.target, status: "visible", level: state.status === "visible" && state.highlightTargetId === action.target.highlightTargetId ? Math.max(state.level, action.level) : action.level,
        sourceAddedScore: action.addedScore, reason: "newSignal", version: state.version + 1 };
    case "CLOSE":
      if (state.status !== "visible") return state;
      return { ...state, status: "suppressed", suppressedUntil: action.until,
        reason: "userClosed", version: state.version + 1 };
    case "RESOLVE":
      if (state.screenVisitId !== action.screenVisitId || state.status === "hidden") return state;
      return { ...state, ...emptyTarget, status: "hidden", level: 0,
        reason: "actionCompleted", version: state.version + 1 };
    case "EXPAND":
      if (state.screenVisitId !== action.screenVisitId || state.status !== "visible" || state.level >= 3) return state;
      return { ...state, level: state.level + 1, reason: "manualExpansion", version: state.version + 1 };
    case "MANUAL_OPEN":
      if (state.screenVisitId !== action.screenVisitId) return state;
      return { ...state, ...emptyTarget, ...action.target, status: "visible",
        level: Math.max(1, action.level), reason: "manualRequest", version: state.version + 1 };
    default:
      return state;
  }
}

