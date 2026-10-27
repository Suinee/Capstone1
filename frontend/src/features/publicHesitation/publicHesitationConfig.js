import { RULE_IDS } from "../hesitation/config.js";

// 사전 사용자 실험 전의 초기값. 단순 대기만으로 망설임을 확정하지 않는다.
export const PUBLIC_CONFIG = Object.freeze({ ruleVersion: "public-help-1.0" });
const screen = (serviceCode, phase, targetId, delayMs, ready = true) => ({
  serviceCode, phase, targetId, delayMs, ready,
});
export const PUBLIC_SCREENS = Object.freeze({
  "public:home": screen(null, "browse", "public-home", null, false),
  "public:history": screen(null, "done", "public-history", null, false),
  "public:resident:detail": screen("resident-registration", "read", "resident-detail", null, false),
  "public:resident:apply": screen("resident-registration", "form", "resident-submit", 60_000),
  "public:family:apply": screen("family-relationship", "form", "family-submit", 60_000),
  "public:tax:detail": screen("tax-payment", "read", "tax-detail", null, false),
  "public:tax:apply": screen("tax-payment", "form", "tax-submit", 45_000),
  "public:moving:0": screen("moving-in-report", "read", "moving-detail", null, false),
  "public:moving:1": screen("moving-in-report", "read", "moving-agreement", 90_000),
  "public:moving:2": screen("moving-in-report", "form", "moving-phone-middle", 60_000),
  "public:moving:3": screen("moving-in-report", "form", "moving-address-lookup", 60_000),
  "public:moving:4": screen("moving-in-report", "form", "moving-submit", 60_000),
  "public:moving:5": screen("moving-in-report", "done", "moving-complete", null, false),
});
export function publicScreenTask(screenId, applicationSessionId) {
  const settings = PUBLIC_SCREENS[screenId];
  if (!settings) throw new Error(`Unknown public screen: ${screenId}`);
  const { serviceCode, ...task } = settings;
  return { ...task, enabledRules: settings.ready ? [...RULE_IDS] : [],
    context: { domain: "public-service", serviceCode, applicationSessionId } };
}
