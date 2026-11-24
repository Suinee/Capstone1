import { useEffect, useState } from "react";

const API = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const SERIES = [
  { mode: "baseline", label: "기본 모드", color: "#4169d6" },
  { mode: "adaptive", label: "적응형 모드", color: "#c44943" },
];
const format = value => Number.isInteger(value) ? String(value) : value.toFixed(1);

function LineChart({ records, metric, title, unit }) {
  const series = SERIES.map(item => ({ ...item, values: records.filter(row => row.mode === item.mode)
    .map(row => ({ ...row, value: metric === "durationMs" ? row.durationMs / 1000 : row.errors })) }));
  const count = Math.max(1, ...series.map(item => item.values.length));
  const maxValue = Math.max(1, ...series.flatMap(item => item.values.map(row => row.value)));
  const step = Math.max(1, Math.ceil(maxValue / 4));
  const ceiling = step * 4;
  const x = index => count === 1 ? 282 : 64 + index / (count - 1) * 436;
  const y = value => 228 - value / ceiling * 180;
  const ticks = [...new Set([0, Math.floor((count - 1) / 2), count - 1])];
  return <figure className="task-trend">
    <figcaption>{title}</figcaption>
    <svg viewBox="0 0 540 285" role="img" aria-label={`${title}. 가로축은 각 모드의 완료 순서, 세로축은 ${unit}. 아래 기록 표에서 수치를 확인할 수 있습니다.`}>
      <text x="64" y="24" className="task-trend__axis">{unit}</text>
      {[0, 1, 2, 3, 4].map(index => <g key={index}>
        <line x1="64" x2="500" y1={y(index * step)} y2={y(index * step)} stroke="#dce5e9" />
        <text x="54" y={y(index * step) + 4} textAnchor="end" className="task-trend__axis">{format(index * step)}</text>
      </g>)}
      {ticks.map(index => <text key={index} x={x(index)} y="249" textAnchor="middle" className="task-trend__axis">{index + 1}</text>)}
      <text x="282" y="276" textAnchor="middle" className="task-trend__axis">최근 완료 기록 내 순서</text>
      {series.map(item => <g key={item.mode}>
        {item.values.length > 1 && <polyline points={item.values.map((row, index) => `${x(index)},${y(row.value)}`).join(" ")}
          fill="none" stroke={item.color} strokeWidth="2.5" strokeDasharray={item.mode === "adaptive" ? "7 4" : undefined} />}
        {item.values.map((row, index) => <circle key={row.attemptId} cx={x(index)} cy={y(row.value)}
          r={item.mode === "adaptive" ? 3 : 5} fill={item.mode === "adaptive" ? item.color : "white"} stroke={item.color} strokeWidth="2">
          <title>{item.label} {index + 1}번째 완료: {format(row.value)}{unit}</title>
        </circle>)}
      </g>)}
    </svg>
    <div className="task-trend__legend">{series.map(item => <span key={item.mode}>
      <i style={{ borderColor: item.color, borderTopStyle: item.mode === "adaptive" ? "dashed" : "solid" }} />
      {item.label} ({item.values.length}건)
    </span>)}</div>
  </figure>;
}

export default function TaskTrendCharts({ dataset, taskCode, reload }) {
  const key = `${dataset}:${taskCode}`;
  const [state, setState] = useState({ key: "", records: [], error: "" });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 10000);
    fetch(`${API}/api/results/trends?dataset=${encodeURIComponent(dataset)}&taskCode=${encodeURIComponent(taskCode)}`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw Error("조회 실패"); return response.json(); })
      .then(records => {
        if (!Array.isArray(records) || records.some(row => !Number.isFinite(row.durationMs) || !Number.isFinite(row.errors))) throw Error("잘못된 결과");
        if (active) setState({ key, records, error: "" });
      })
      .catch(() => { if (active) setState({ key, records: [], error: "꺾은선 그래프를 불러오지 못했습니다. 백엔드를 재시작한 뒤 새로 불러오기를 눌러 주세요." }); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [dataset, taskCode, key, reload]);
  if (state.key !== key) return <p role="status">수행별 그래프를 불러오는 중입니다…</p>;
  if (state.error) return <p role="alert">{state.error}</p>;
  if (!state.records.length) return <p className="task-results__empty">완료한 수행이 생기면 꺾은선 그래프가 표시됩니다.</p>;
  return <div>
    <div className="task-trends">
      <LineChart records={state.records} metric="durationMs" title="수행별 완료시간" unit="초" />
      <LineChart records={state.records} metric="errors" title="수행별 오류 횟수" unit="회" />
    </div>
    <p className="task-results__note">각 모드의 최근 완료 기록 최대 30건을 오래된 순서부터 표시합니다. 한 건이면 점으로 표시됩니다. 같은 가로축 번호가 같은 참가자나 같은 시각을 뜻하지는 않습니다. 위 평균은 전체 완료 기록 기준입니다.</p>
    <details className="task-trend__records"><summary>그래프 수치 보기</summary>
      <div className="task-results__table"><table><thead><tr><th>모드</th><th>순서</th><th>완료시간(초)</th><th>오류(회)</th></tr></thead>
        <tbody>{SERIES.flatMap(item => state.records.filter(row => row.mode === item.mode).map((row, index) => <tr key={`${item.mode}:${row.attemptId}`}>
          <td>{item.label}</td><td>{index + 1}</td><td>{format(row.durationMs / 1000)}</td><td>{row.errors}</td>
        </tr>))}</tbody></table></div>
    </details>
  </div>;
}
