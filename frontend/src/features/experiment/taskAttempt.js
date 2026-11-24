export const TASK_LABELS = { 'kiosk-order': '키오스크 주문', 'resident-registration': '주민등록 신청', 'moving-in-report': '전입신고', 'family-relationship': '가족관계증명', 'tax-payment': '납세증명' };

// 화면 방문 여러 개를 하나의 과제 수행으로 묶는다. 시간은 엔진의 활성 시간이다.
export function createTaskAttemptTracker() {
  let current = null;
  let errors = new Set();
  let helpVisible = false;
  let lastSavedAt = 0;
  return {
    get current() { return current; },
    start(taskCode, activeTime) {
      if (current || !Object.hasOwn(TASK_LABELS, taskCode)) return false;
      current = { attemptId: crypto.randomUUID(), taskCode, status: 'in_progress', startedAt: Date.now(), endedAt: null,
        startActiveTime: activeTime, durationMs: 0, clicks: 0, errors: 0, automaticHelpCount: 0, manualHelpCount: 0, maxHelpLevel: 0 };
      errors = new Set(); helpVisible = false; lastSavedAt = activeTime;
      return true;
    },
    consume(log) {
      if (!current || current.status !== 'in_progress') return;
      if (log.type === 'screen_enter') helpVisible = false;
      if (log.type === 'behavior') {
        const event = log.event;
        if (event.type === 'click') current.clicks++;
        if (event.type === 'validation_error' && !errors.has(event.attemptId)) {
          errors.add(event.attemptId); current.errors++;
        }
      }
      if (log.type === 'help') {
        if (log.status === 'visible') {
          if (!helpVisible) {
            if (log.reason === 'manualRequest') current.manualHelpCount++;
            else current.automaticHelpCount++;
          }
          current.maxHelpLevel = Math.max(current.maxHelpLevel, log.level);
        }
        helpVisible = log.status === 'visible';
      }
    },
    snapshot(activeTime, force = false) {
      if (!current || (!force && activeTime - lastSavedAt < 5000)) return null;
      if (current.status === 'in_progress') current.durationMs = Math.max(0, activeTime - current.startActiveTime);
      lastSavedAt = activeTime;
      return { ...current };
    },
    finish(status, activeTime) {
      if (!current || current.status !== 'in_progress') return null;
      current.durationMs = Math.max(0, activeTime - current.startActiveTime);
      current.status = status; current.endedAt = Date.now();
      return { ...current };
    },
    reset() { current = null; },
  };
}
