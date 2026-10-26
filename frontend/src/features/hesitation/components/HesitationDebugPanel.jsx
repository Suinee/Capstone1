import useHesitation from "../useHesitation.js";

const RULE_LABELS = {
  timeDelay: "시간 지연",
  excessiveHover: "과도한 Hover",
  complexExploration: "복합 탐색",
  repeatedClick: "반복 클릭",
  inputRevision: "입력 중단 + 반복 수정",
  repeatedError: "오류 반복",
  navigationLoop: "이전 단계 반복",
};

export default function HesitationDebugPanel() {
  const {
    screenId,
    screenVisitId,
    measuring,
    score,
    level,
    task,
    metrics,
    lastSignals,
    help,
    getLogs,
  } = useHesitation();

  if (!import.meta.env.DEV) return null;

  return (
    <aside
      data-hesitation-ignore
      aria-label="망설임 감지 개발용 패널"
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        width: 280,
        maxHeight: "55vh",
        overflowY: "auto",
        padding: 16,
        borderRadius: 12,
        background: "#17211d",
        color: "#ffffff",
        boxShadow: "0 4px 20px #0004",
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      <strong>망설임 감지 확인</strong>

      <div>화면: {screenId ?? "미등록"}</div>
      <div>방문: {screenVisitId?.slice(0, 8) ?? "-"}</div>
      <div>측정: {measuring ? "진행 중" : "중단"}</div>
      <div>과제: {task.phase}</div>
      <div>도움 대상: {task.targetId}</div>

      <hr />

      <div>
        과제 경과:{" "}
        {((metrics.taskElapsedMs ?? 0) / 1000).toFixed(1)}초
      </div>

      <div>
        기준시간:{" "}
        {Number.isFinite(task.delayMs)
          ? `${task.delayMs / 1000}초`
          : "-"}
      </div>

      <div>방향 전환: {metrics.directionChanges ?? 0}회</div>
      <div>스크롤 왕복: {metrics.scrollReversals ?? 0}회</div>
      <div>
        보조 행동: {metrics.auxiliaryTypes?.join(", ") || "없음"}
      </div>

      <hr />

      <div>누적 점수: {score}점</div>
      <div>지원 수준: {level}단계</div>
      <div>도움 상태: {help.status}</div>

      <div style={{ marginTop: 8 }}>최근 반영 신호:</div>

      {lastSignals.length === 0 ? (
        <div>없음</div>
      ) : (
        lastSignals.map((signal) => (
          <div key={signal.key}>
            {RULE_LABELS[signal.ruleId] ?? signal.ruleId}
            {" · "}
            {signal.targetId}
            {" · "}
            후보 {signal.score}점
          </div>
        ))
      )}

      <small>
        같은 5초 묶음에서는 가장 높은 점수만 반영합니다.
      </small>

      <button
        type="button"
        onClick={() => console.table(getLogs())}
        style={{
          display: "block",
          marginTop: 12,
          padding: "6px 10px",
          cursor: "pointer",
        }}
      >
        콘솔에서 로그 보기
      </button>
    </aside>
  );
}