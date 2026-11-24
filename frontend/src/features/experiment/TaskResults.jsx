import { useEffect, useState } from "react";
import { TASK_LABELS } from "./taskAttempt.js";
import { createLogUploader } from "../hesitation/hesitationApi.js";
import "./TaskResults.css";
import TaskTrendCharts from "./TaskTrendCharts.jsx";

const API = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const pendingLogs = createLogUploader(() => []);
const number = (value, suffix = "") => value == null ? "—" : `${Number(value).toFixed(1)}${suffix}`;

export default function TaskResults() {
  const [dataset, setDataset] = useState("study");
  const [taskCode, setTaskCode] = useState("kiosk-order");
  const [reload, setReload] = useState(0);
  const [state, setState] = useState({ loading: true, rows: [], error: "" });
  useEffect(() => {
    const timer = setInterval(() => setReload(value => value + 1), 5000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let active = true;
    pendingLogs.flush().then(() => fetch(`${API}/api/results/summary?dataset=${dataset}`, { signal: controller.signal }))
      .then(response => { if (!response.ok) throw Error("결과를 불러오지 못했습니다. 백엔드 실행 상태를 확인해 주세요."); return response.json(); })
      .then(rows => { if (!Array.isArray(rows)) throw Error("결과 응답 형식이 올바르지 않습니다."); if (active) setState({ loading: false, rows, error: "" }); })
      .catch(() => { if (active) setState({ loading: false, rows: [], error: "결과를 불러오지 못했습니다. 백엔드 연결을 확인하고 다시 불러와 주세요." }); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [dataset, reload]);
  const rows = ["baseline", "adaptive"].map(mode => state.rows.find(row => row.taskCode === taskCode && row.mode === mode));
  const metrics = [
    ["평균 완료시간", row => number(row?.durationMs == null ? null : row.durationMs / 1000, "초")],
    ["평균 조작 클릭", row => number(row?.clicks, "회")],
    ["평균 입력 오류", row => number(row?.errors, "회")],
    ["평균 자동 도움", row => number(row?.automaticHelpCount, "회")],
    ["평균 수동 도움", row => number(row?.manualHelpCount, "회")],
    ["완료율", row => row?.started ? number(row.completed / row.started * 100, "%") : "—"],
  ];
  function refresh() { setState({ loading: true, rows: [], error: "" }); setReload(value => value + 1); }
  function download() {
    const lines = [["과제", "조건", "시작", "완료", "중단", "진행중/종료미확인", "평균시간(ms)", "평균클릭", "평균오류", "평균자동도움", "평균수동도움"],
      ...state.rows.map(row => [TASK_LABELS[row.taskCode], row.mode, row.started, row.completed, row.interrupted, row.inProgress, row.durationMs, row.clicks, row.errors, row.automaticHelpCount, row.manualHelpCount])];
    const url = URL.createObjectURL(new Blob(["\uFEFF", lines.map(line => line.join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `adapti-results-${dataset}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="result-section" id="result"><div className="container task-results">
    <div className="section-heading"><h2>RESULT</h2><p>과제별 수행 결과 비교</p></div>
    <div className="task-results__filters">
      <label>과제 <select value={taskCode} onChange={event => setTaskCode(event.target.value)}>{Object.entries(TASK_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label>기록 <select value={dataset} onChange={event => { setState({ loading: true, rows: [], error: "" }); setDataset(event.target.value); }}><option value="study">사용자 실험</option><option value="practice">연습·개발 확인</option></select></label>
      <button type="button" onClick={refresh}>새로 불러오기</button>
      <button type="button" onClick={download} disabled={state.loading || !state.rows.length}>집계 CSV 저장</button>
    </div>
    {state.loading ? <p role="status">결과를 불러오는 중입니다…</p> : state.error ? <p role="alert">{state.error}</p> : !rows.some(Boolean) ? <p className="task-results__empty">선택한 과제의 데이터 수집 중입니다. 실험 설정에서 기록 용도를 선택하고 과제를 수행해 주세요.</p> : <>
      <div className="task-results__table"><table><caption>{TASK_LABELS[taskCode]} · {dataset === "study" ? "사용자 실험" : "연습 기록"}</caption>
        <thead><tr><th>지표</th><th>기본 모드</th><th>적응형 모드</th></tr></thead>
        <tbody><tr><th>시작 / 완료 / 중단 / 진행·종료미확인</th>{rows.map((row, i) => <td key={i}>{row ? `${row.started} / ${row.completed} / ${row.interrupted} / ${row.inProgress}` : "0 / 0 / 0 / 0"}</td>)}</tr>
          {metrics.map(([label, format]) => <tr key={label}><th>{label}</th>{rows.map((row, i) => <td key={i}>{format(row)}</td>)}</tr>)}
        </tbody></table></div>
      <div className="task-results__chart" aria-label="평균 완료시간 비교">
        {rows.map((row, i) => <div key={i}><span>{i === 0 ? "기본" : "적응형"}</span><div className="task-results__track"><div style={{ width: `${row?.durationMs == null ? 0 : row.durationMs / Math.max(1, ...rows.map(item => item?.durationMs ?? 0)) * 100}%`, background: i === 0 ? "#64748b" : "#167682" }} /></div><span>{number(row?.durationMs == null ? null : row.durationMs / 1000, "초")}</span></div>)}
      </div>
      <TaskTrendCharts dataset={dataset} taskCode={taskCode} reload={reload} />
    </>}
    <p className="task-results__note">시간·횟수 평균은 완료한 수행 기준이며, 완료율은 전체 시작 건수 기준입니다. 시간은 숨겨진 탭·서버 대기·결제 처리·완료 안내 시간을 제외한 활성 조작 시간입니다. 오류는 입력 검증 실패를 시도당 한 번 셉니다. 클릭은 서비스 조작 기준이며 도움 UI 클릭은 제외합니다.</p>
    <p className="task-results__note">수행 수는 참가자 수와 다릅니다. 진행·종료미확인은 아직 수행 중이거나 종료 기록이 도착하지 않은 건입니다. 표본과 과제 조건을 고려해 비교해 주세요.</p>
  </div></section>;
}
