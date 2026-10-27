// 체험 신청 결과는 서버에 보관합니다. 주소·전화번호·주민번호는 전송하지 않습니다.
const API = (import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const SESSION_KEY = "adapti-public-service-session-v2";
const PENDING_KEY = `adapti-public-service-pending-v2:${API}`;

export function dateToInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
export function getPublicSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API}/api/public-service/applications${path}`, {
      ...options, signal: controller.signal,
    });
    if (!response.ok) throw new Error(`요청 실패 (${response.status}). 입력 내용을 확인하거나 잠시 후 다시 시도해 주세요.`);
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError" || error instanceof TypeError) {
      throw new Error("서버에 연결하지 못했습니다. 백엔드 실행 상태를 확인하고 다시 시도해 주세요.", { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
export async function getDemoApplications() {
  const result = await request(`?sessionId=${encodeURIComponent(getPublicSessionId())}`);
  if (!Array.isArray(result)) throw new Error("신청 내역 응답 형식이 올바르지 않습니다.");
  return result;
}
export async function saveDemoApplication(name, serviceCode) {
  const sessionId = getPublicSessionId();
  const key = JSON.stringify([sessionId, serviceCode, name]);
  let pending;
  try { pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "{}"); }
  catch { pending = {}; }
  if (!pending || typeof pending !== "object" || Array.isArray(pending)) pending = {};
  const requestId = pending[key] || crypto.randomUUID();
  pending[key] = requestId;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  const result = await request("", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, sessionId, serviceCode, name }),
  });
  if (result.requestId !== requestId || !result.receiptNo) throw new Error("신청 결과를 확인할 수 없습니다. 다시 시도해 주세요.");
  delete pending[key];
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  return result;
}
