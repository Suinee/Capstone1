/**
 * 키오스크에서 HesitationProvider로 보내는 통합 이벤트 채널.
 * 이 파일 자체는 망설임 점수를 계산하지 않습니다.
 * Provider에서 subscribeKioskHesitation()으로 연결해야 합니다.
 */
export const KIOSK_HESITATION_EVENT = "adapti:kiosk-hesitation";

// React effect 등록 순서 때문에 첫 이벤트를 놓치는 것을 방지하기 위한 상태 스냅샷.
// Provider가 뒤늦게 구독해도 활성 세션/화면/로딩 상태를 다시 전달할 수 있습니다.
let activeSession = null;
let currentScreen = null;
let currentUiState = null;
let currentMeasurement = null;

export function emitKioskHesitation(type, detail = {}) {
  if (typeof window === "undefined") return;
  const message = { type, ...detail };

  if (type === "SESSION_START") {
    activeSession = message;
  } else if (type === "SCREEN_CHANGE") {
    if (currentUiState?.screenId !== message.screenId) {
      currentUiState = null;
    }
    currentScreen = message;
    currentMeasurement = null;
  } else if (type === "UI_STATE") {
    currentUiState = message;
  } else if (type === "MEASUREMENT_CHANGE") {
    currentMeasurement = message;
  }

  window.dispatchEvent(new CustomEvent(KIOSK_HESITATION_EVENT, {
    detail: message,
  }));

  if (type === "SESSION_END") {
    activeSession = null;
    currentScreen = null;
    currentUiState = null;
    currentMeasurement = null;
  }
}

/**
 * Provider 내부에서 구독할 때 사용하세요.
 * handler(event)로 전달되며, event.detail.type으로 이벤트를 구분합니다.
 */
export function subscribeKioskHesitation(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(KIOSK_HESITATION_EVENT, handler);
  // 이 순서대로 재생하면 초기 UI_STATE가 SESSION_START보다 앞서 발생해도 안전합니다.
  if (activeSession) handler({ detail: activeSession });
  if (currentScreen) handler({ detail: currentScreen });
  if (currentUiState && currentScreen?.screenId === currentUiState.screenId) {
    handler({ detail: currentUiState });
  }
  if (currentMeasurement) handler({ detail: currentMeasurement });
  return () => window.removeEventListener(KIOSK_HESITATION_EVENT, handler);
}
