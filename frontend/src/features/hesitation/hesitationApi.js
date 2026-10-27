const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

const STORAGE_KEY = `adapti:hesitation:pending:v1:${API_BASE_URL}`;
const encoder = new TextEncoder();

// Provider가 새로 생성되어도 같은 탭의 전송 대기열을 공유합니다.
let pending = null;
let inFlight = null;
let blocked = false;
let storageWarningShown = false;

function warnStorage(error) {
  if (storageWarningShown) return;

  storageWarningShown = true;

  console.warn(
    "[망설임 로그] 임시 보관 실패. 새로고침 시 미전송 로그가 유실될 수 있습니다.",
    error,
  );
}

// 새로고침 전에 보관했던 로그를 복구합니다.
function getQueue() {
  if (pending !== null) return pending;

  try {
    const saved = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? "[]",
    );

    if (!Array.isArray(saved)) {
      throw new Error("대기열 형식 오류");
    }

    pending = saved;
  } catch (error) {
    warnStorage(error);
    pending = [];
  }

  return pending;
}

function saveQueue() {
  try {
    if (getQueue().length) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(pending),
      );
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    warnStorage(error);
  }
}

// 실제 HTTP 요청을 담당합니다.
export async function postHesitationLogs(
  logs,
  { keepalive = false } = {},
) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, 10_000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hesitation/logs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs }),
        signal: controller.signal,
        keepalive,
      },
    );

    if (!response.ok) {
      const error = new Error(
        `로그 저장 실패: HTTP ${response.status}`,
      );

      error.status = response.status;
      throw error;
    }

    const result = await response.json();

    // 저장된 개수와 중복으로 처리된 개수를 모두 확인합니다.
    if (
      result.received !== logs.length ||
      !Number.isInteger(result.inserted) ||
      !Number.isInteger(result.duplicates) ||
      result.inserted < 0 ||
      result.duplicates < 0 ||
      result.inserted + result.duplicates !== result.received
    ) {
      throw new Error(
        "로그 저장 응답 형식이 올바르지 않습니다.",
      );
    }

    return result;
  } finally {
    clearTimeout(timer);
  }
}

// 백엔드의 요청당 최대 1000개 제한에 맞춰 나눕니다.
function nextBatch(logs, keepalive) {
  const batch = [];
  let bytes = encoder.encode('{"logs":[]}').length;

  for (const log of logs) {
    const addedBytes =
      encoder.encode(JSON.stringify(log)).length +
      (batch.length ? 1 : 0);

    // 종료 시에는 keepalive 용량 제한을 고려합니다.
    if (
      bytes + addedBytes > 48_000 &&
      (batch.length || keepalive)
    ) {
      break;
    }

    batch.push(log);
    bytes += addedBytes;

    if (batch.length === 1000) break;
  }

  return batch;
}

// 엔진의 로그를 대기열에 넣고 순서대로 전송합니다.
export function createLogUploader(
  getLogs,
  send = postHesitationLogs,
) {
  let capturedCount = 0;

  function capture() {
    const logs = getLogs();

    if (logs.length <= capturedCount) return;

    const queue = getQueue();

    for (
      let index = capturedCount;
      index < logs.length;
      index++
    ) {
      queue.push(logs[index]);
    }

    capturedCount = logs.length;
    saveQueue();
  }

  function flush({ keepalive = false } = {}) {
    // 요청이 이미 진행 중이어도 새 로그는 먼저 보관합니다.
    capture();

    if (inFlight) return inFlight;

    if (blocked || !getQueue().length) {
      return Promise.resolve();
    }

    inFlight = (async () => {
      // 이번 전송을 시작할 때 있던 로그까지만 처리합니다.
      let remaining = getQueue().length;

      while (remaining > 0) {
        const batch = nextBatch(
          getQueue().slice(0, remaining),
          keepalive,
        );

        if (!batch.length) break;

        await send(batch, { keepalive });

        // 서버가 성공을 확인한 로그만 제거합니다.
        getQueue().splice(0, batch.length);
        remaining -= batch.length;

        saveQueue();

        // 종료 시에는 한 묶음만 전송을 시도합니다.
        if (keepalive) break;
      }
    })()
      .catch((error) => {
        // 데이터나 API 설정 오류는 무한 재시도하지 않습니다.
        if (
          [400, 401, 403, 404, 409, 413, 422].includes(
            error.status,
          )
        ) {
          blocked = true;
        }

        // 통신 오류·서버 오류는 대기열에 남겨 다음 주기에 재시도합니다.
        throw error;
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  }

  return {
    flush,

    retry() {
      blocked = false;
      return flush();
    },
  };
}