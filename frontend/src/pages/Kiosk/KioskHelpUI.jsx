import { useEffect, useRef } from "react";
import useHesitation from "../../features/hesitation/useHesitation";
import {
  HELP_CONTENT,
  DEFAULT_HELP_CONTENT,
} from "../../features/hesitation/helpContent";
import AIHelpPanel from "../../features/hesitation/components/AIHelpPanel";
import "./KioskHelpUI.css";

export default function KioskHelpUI() {
  const {
    screenId,
    screenVisitId,
    score,
    task,
    lastSignals,
    help,
    openHelp,
    closeHelp,

    helpDialogMode: dialogMode,
    setHelpDialogMode: setDialogMode,
  } = useHesitation();

  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (dialogMode !== null) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [dialogMode]);

  useEffect(() => {
    if (dialogMode !== "staff") return;

    const timer = window.setTimeout(() => {
      setDialogMode(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [dialogMode, setDialogMode]);

  const content = HELP_CONTENT[screenId] ?? DEFAULT_HELP_CONTENT;
  const level = Math.max(1, Math.min(3, help.level));

  // 이전 화면의 도움 상태가 잠깐 남아 있어도 표시하지 않습니다.
  const showHelp =
    help.status === "visible" &&
    help.screenVisitId === screenVisitId &&
    dialogMode === null;

  const handleScreenHelp = () => {
    setDialogMode(null);
    openHelp();
  };

  const handleStaffCall = () => {
    closeHelp();
    setDialogMode("staff");
  };

  // 추후 AI에 전달할 화면 맥락입니다.
  // 입력값 원문이나 전체 행동 로그는 포함하지 않습니다.
  const aiContext = {
    screenId,
    screenVisitId,
    screenTitle: content.title,
    targetId: help.targetId ?? task.targetId,
    phase: task.phase,
    score,
    recentSignals: lastSignals.map((signal) => ({
      ruleId: signal.ruleId,
      targetId: signal.targetId,
    })),
  };

  return (
    <div className="kiosk-help-ui" data-hesitation-ignore>
      <dialog
        ref={dialogRef}
        className="kiosk-help-dialog"
        aria-labelledby="kiosk-help-dialog-title"
        onCancel={() => setDialogMode(null)}
      >
        {dialogMode === "request" && (
          <>
            <h2 id="kiosk-help-dialog-title">어떤 도움이 필요하신가요?</h2>

            <p>화면 안내를 받거나 직원을 호출할 수 있습니다.</p>

            <div className="kiosk-help-actions">
              <button
                type="button"
                className="kiosk-help-primary"
                onClick={handleScreenHelp}
              >
                화면 도움 받기
              </button>

              <button type="button" onClick={handleStaffCall}>
                직원 호출
              </button>

              <button type="button" onClick={() => setDialogMode(null)}>
                닫기
              </button>
            </div>
          </>
        )}

        {dialogMode === "staff" && (
          <div role="status">
            <h2 id="kiosk-help-dialog-title">직원을 호출하였습니다.</h2>
            <p>잠시만 기다려 주세요.</p>
          </div>
        )}
      </dialog>

      {showHelp && (
        <section
          className="kiosk-help-panel"
          aria-label={`${level}단계 도움 안내`}
        >
          <div className="kiosk-help-heading">
            <span className="kiosk-help-badge">{level}단계</span>

            <h2>{level === 3 ? "상세 도움" : content.title}</h2>
          </div>

          <div aria-live="polite">
            {level < 3 ? (
              <p>{content.levels[level - 1]}</p>
            ) : (
              <AIHelpPanel
                key={`${screenVisitId}:${task.phase}:${task.targetId}`}
                context={aiContext}
                fallbackText={content.levels[1]}
              />
            )}
          </div>

          <div className="kiosk-help-panel-actions">
            <button type="button" onClick={handleStaffCall}>
              직원 호출
            </button>

            <button type="button" onClick={closeHelp}>
              닫기
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
