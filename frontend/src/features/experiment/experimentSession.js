export const EXPERIMENT_STORAGE_KEY = "adapti:experiment:v1";
export const EXPERIMENT_POLICY_VERSION = "automatic-help-ab-1.0";
export const EXPERIMENT_SERVICES = Object.freeze({
  kiosk: { label: "키오스크", path: "/kiosk" },
  "public-service": { label: "공공서비스", path: "/public-service" },
});
export const EXPERIMENT_MODES = Object.freeze({
  baseline: { label: "기본 모드", automaticHelp: false },
  adaptive: { label: "적응형 모드", automaticHelp: true },
});

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const has = (values, key) => Object.hasOwn(values, key);

// 저장소의 값은 검증하고 필요한 필드만 복원한다. 조건은 실행 중 변경하지 않는다.
export function normalizeExperiment(value) {
  if (!value || !uuid.test(value.runId) ||
      !has(EXPERIMENT_MODES, value.mode) || !has(EXPERIMENT_SERVICES, value.service) ||
      value.policyVersion !== EXPERIMENT_POLICY_VERSION ||
      !Number.isSafeInteger(value.startedAt) || value.startedAt < 0 ||
      value.automaticHelp !== EXPERIMENT_MODES[value.mode].automaticHelp ||
      value.manualHelp !== true) return null;
  return Object.freeze({
    runId: value.runId,
    mode: value.mode,
    service: value.service,
    automaticHelp: value.automaticHelp,
    manualHelp: true,
    policyVersion: value.policyVersion,
    startedAt: value.startedAt,
    dataset: value.dataset === "study" ? "study" : "practice",
  });
}

export function createExperiment(mode, service, dataset = "practice") {
  if (!has(EXPERIMENT_MODES, mode) || !has(EXPERIMENT_SERVICES, service)) {
    throw new Error("서비스와 실험 모드를 선택해 주세요.");
  }
  return normalizeExperiment({
    runId: crypto.randomUUID(), mode, service, dataset,
    automaticHelp: EXPERIMENT_MODES[mode].automaticHelp,
    manualHelp: true, policyVersion: EXPERIMENT_POLICY_VERSION, startedAt: Date.now(),
  });
}

export function readExperiment(storage) {
  try {
    return normalizeExperiment(JSON.parse(storage.getItem(EXPERIMENT_STORAGE_KEY)));
  } catch {
    return null;
  }
}

export function saveExperiment(storage, experiment) {
  const normalized = normalizeExperiment(experiment);
  if (!normalized) throw new Error("실험 설정이 올바르지 않습니다.");
  // 저장 실패 시 시작하지 않는다. 새로고침으로 실험 조건이 사라지는 것을 방지한다.
  storage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
