import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useExperiment from "./useExperiment.js";
import { EXPERIMENT_MODES, EXPERIMENT_SERVICES } from "./experimentSession.js";
import "./ExperimentSetup.css";

export default function ExperimentSetup({ service: requiredService, destination }) {
  const [params] = useSearchParams();
  const requestedService = params.get("service");
  const [selectedService, setSelectedService] = useState(
    Object.hasOwn(EXPERIMENT_SERVICES, requestedService) ? requestedService : "kiosk",
  );
  const service = requiredService ?? selectedService;
  const [mode, setMode] = useState("");
  const [dataset, setDataset] = useState("practice");
  const [error, setError] = useState("");
  const { experiment, startExperiment } = useExperiment();
  const navigate = useNavigate();

  function start(event) {
    event.preventDefault();
    try {
      startExperiment(mode, service, dataset);
      navigate(destination ?? EXPERIMENT_SERVICES[service].path, { replace: true });
    } catch {
      setError("실험 설정을 저장하지 못했습니다. 브라우저의 사이트 저장소 허용 여부를 확인한 뒤 다시 시도해 주세요.");
    }
  }

  return <main className="experiment-setup">
    <div className="experiment-setup__card">
      <Link to="/" className="experiment-setup__brand">ADAPTI</Link>
      <p className="experiment-setup__eyebrow">서비스 체험 설정</p>
      <h1>실험 모드를 선택해 주세요</h1>
      <p className="experiment-setup__intro">같은 화면에서 자동 도움 제공 여부를 비교합니다. 시작 후에는 선택한 조건이 유지됩니다.</p>
      {experiment && <p className="experiment-setup__previous">
        이전 설정: {EXPERIMENT_SERVICES[experiment.service].label} · {EXPERIMENT_MODES[experiment.mode].label}
        <br />시작하기를 누르면 새 실험으로 기록합니다.
      </p>}
      <form onSubmit={start}>
        <fieldset>
          <legend>체험할 서비스</legend>
          {requiredService ? <p>{EXPERIMENT_SERVICES[service].label}</p> :
            <div className="experiment-setup__services">
              {Object.entries(EXPERIMENT_SERVICES).map(([id, item]) => <label key={id}>
                <input type="radio" name="service" value={id} checked={service === id}
                  onChange={() => setSelectedService(id)} />{item.label}
              </label>)}
            </div>}
        </fieldset>
        <fieldset>
          <legend>실험 조건</legend>
          <div className="experiment-setup__modes">
            {Object.entries(EXPERIMENT_MODES).map(([id, item]) => <label key={id}
              className={`experiment-setup__mode${mode === id ? " is-selected" : ""}`}>
              <input type="radio" name="mode" value={id} required checked={mode === id}
                onChange={() => { setMode(id); setError(""); }} />
              <span><strong>{item.label}</strong><span>
                {item.automaticHelp ? "망설임 수준에 따라 자동으로 도움을 제공합니다." : "자동 도움 없이 기본 화면으로 진행합니다."}
              </span></span>
            </label>)}
          </div>
        </fieldset>
        <div className="experiment-setup__note">
          <label>기록 용도 <select value={dataset} onChange={event => setDataset(event.target.value)}>
            <option value="practice">연습·개발 확인</option><option value="study">사용자 실험</option>
          </select></label>
          <p>신청·주문 조작 화면에 들어가면 과제 측정이 시작됩니다. 연습 기록은 기본 RESULT 집계에서 제외합니다.</p>
          <strong>두 모드의 공통 조건</strong>
          <ul><li>행동과 망설임 판단 결과를 동일하게 기록합니다.</li>
            <li>필요할 때 도움 버튼을 눌러 안내를 받을 수 있습니다.</li></ul>
        </div>
        {error && <p className="experiment-setup__error" role="alert">{error}</p>}
        <button className="experiment-setup__start" type="submit" disabled={!mode}>선택한 모드로 시작하기</button>
      </form>
      <Link to="/" className="experiment-setup__back">홈으로 돌아가기</Link>
    </div>
  </main>;
}
