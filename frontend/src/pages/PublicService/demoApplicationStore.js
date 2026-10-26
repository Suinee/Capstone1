// ADAPTI 공공서비스 체험용 저장소 (실제 민원 접수 아님)
// 저장 대상: 서비스명, 접수시각, 모의 접수번호만. 개인정보는 저장하지 않습니다.
const KEY = "adapti-public-service-demo-v1";

const sampleHistory = [
  { receiptNo: "DEMO-20260930-001", receivedAt: "2026-09-30 17:23:14", name: "주민등록표 등본 발급", count: 1, status: "모의 처리완료" },
  { receiptNo: "DEMO-20260930-002", receivedAt: "2026-09-30 17:21:57", name: "주민등록표 등본 발급", count: 1, status: "모의 처리완료" },
  { receiptNo: "DEMO-20260930-003", receivedAt: "2026-09-30 17:21:36", name: "주민등록표 등본 발급", count: 1, status: "모의 처리완료" },
];

export function dateToInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateTimeText(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${dateToInput(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function readSaved() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function getDemoApplications() {
  return [...readSaved(), ...sampleHistory];
}

export function saveDemoApplication(name) {
  if (!name || typeof name !== "string") throw new Error("서비스명이 필요합니다.");
  const now = new Date();
  const record = {
    receiptNo: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    receivedAt: dateTimeText(now),
    name,
    count: 1,
    status: "모의 신청 완료",
  };
  const old = readSaved();
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify([record, ...old]));
    return record;
  } catch (error) {
    console.error("체험 신청 내역 저장 실패", error);
    return null;
  }
}
