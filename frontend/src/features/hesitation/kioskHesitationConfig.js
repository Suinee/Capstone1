// 입력창이 없는 키오스크에서 사용할 규칙
const KIOSK_RULES = [
  "timeDelay",
  "excessiveHover",
  "targetDwell",
  "complexExploration",
  "repeatedClick",
  "navigationLoop",
];

export const KIOSK_SCREEN_IDS = Object.freeze({
  MENU: "KIOSK_MENU",
  ORDER_TYPE: "KIOSK_ORDER_TYPE",
  SET_SIZE: "KIOSK_SET_SIZE",
  SIDE: "KIOSK_SIDE",
  DRINK: "KIOSK_DRINK",
  REVIEW: "KIOSK_REVIEW",
  PAYMENT_METHOD: "KIOSK_PAYMENT_METHOD",
});

// 화면별 설정
export const KIOSK_SCREEN_CONFIG = {
  [KIOSK_SCREEN_IDS.MENU]: {
    initialPhase: "select",
    selectionDelayMs: 10_000,
    selectionTargetId: "menu-options",
  },

  [KIOSK_SCREEN_IDS.ORDER_TYPE]: {
    initialPhase: "select",
    selectionDelayMs: 9_000,
    selectionTargetId: "order-type-options",
  },

  [KIOSK_SCREEN_IDS.SET_SIZE]: {
    initialPhase: "select",
    selectionDelayMs: 10_000,
    selectionTargetId: "set-size-options",
  },

  [KIOSK_SCREEN_IDS.SIDE]: {
    initialPhase: "select",
    selectionDelayMs: 10_000,
    selectionTargetId: "side-options",

    progressDelayMs: 9_000,
    progressTargetId: "side-next",
  },

  [KIOSK_SCREEN_IDS.DRINK]: {
    initialPhase: "select",
    selectionDelayMs: 10_000,
    selectionTargetId: "drink-options",

    progressDelayMs: 9_000,
    progressTargetId: "drink-next",
  },

  [KIOSK_SCREEN_IDS.REVIEW]: {
    initialPhase: "proceed",
    progressDelayMs: 19_000,
    progressTargetId: "order-add",
  },

  [KIOSK_SCREEN_IDS.PAYMENT_METHOD]: {
    initialPhase: "select",
    selectionDelayMs: 9_000,
    selectionTargetId: "payment-method-options",
  },
};

// 현재 화면과 선택 상태에 맞는 과제 설정을 반환
// 엔진의 setTask()에 전달할 데이터 형식
export function getKioskTask(screenId, selectionComplete = false, ui = {}) {
  const screen = KIOSK_SCREEN_CONFIG[screenId];
  if (!screen) throw new Error(`등록되지 않은 키오스크 화면: ${screenId}`);

  const context = {
    isEditing: Boolean(ui.isEditing),
    isCartEditing: Boolean(ui.isCartEditing),
    selectionComplete,
    canProceed: Boolean(ui.canProceed),
    category: ui.category ?? null,
  };
  const editConfirm = context.isEditing && selectionComplete &&
    [KIOSK_SCREEN_IDS.ORDER_TYPE, KIOSK_SCREEN_IDS.SET_SIZE].includes(screenId);
  const proceed = editConfirm || screen.initialPhase === "proceed" ||
    (selectionComplete && Number.isFinite(screen.progressDelayMs));

  return {
    phase: proceed ? "proceed" : "select",
    targetId: editConfirm ? "order-edit-confirm" :
      proceed ? screen.progressTargetId : screen.selectionTargetId,
    delayMs: editConfirm ? 9_000 :
      proceed ? screen.progressDelayMs : screen.selectionDelayMs,
    enabledRules: [...KIOSK_RULES],
    context,
  };
}
