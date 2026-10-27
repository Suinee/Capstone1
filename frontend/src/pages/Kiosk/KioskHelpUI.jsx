import { useEffect, useLayoutEffect, useRef } from "react";
import useHesitation from "../../features/hesitation/useHesitation";
import { getKioskHelpContent } from "../../features/hesitation/helpContent";
import useKioskHelpHighlight from "../../features/hesitation/useKioskHelpHighlight";
import AIHelpPanel from "../../features/hesitation/components/AIHelpPanel";
import "./KioskHelpUI.css";

export default function KioskHelpUI({ rootRef }) {
  const {
    screenId,
    screenVisitId,
    measuring,
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
  const panelRef = useRef(null);

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

  const content = getKioskHelpContent(screenId, help.helpKey, task);
  const level = Math.max(1, Math.min(3, help.level));

  // 이전 화면의 도움 상태가 잠깐 남아 있어도 표시하지 않습니다.
  const showHelp =
    measuring &&
    help.status === "visible" &&
    help.screenVisitId === screenVisitId &&
    dialogMode === null;

  // 실제 키오스크의 보이는 영역을 기준으로 안내창을 배치합니다.
  // 화면별 축소 배율, 브라우저 크기 및 스크롤도 반영합니다.
  useLayoutEffect(() => {
    if (!showHelp) return;
    const panel = panelRef.current;
    const page = rootRef.current?.querySelector(
      ".kiosk-page, .kiosk-payment-page, .kiosk-settlement-page",
    );
    if (!panel || !page) return;

    const positionPanel = () => {
      const rect = page.getBoundingClientRect();
      const viewportHeight = document.documentElement.clientHeight;
      const inset = window.innerWidth <= 600 ? 16 : 24;
      const left = Math.max(0, rect.left);
      const right = Math.min(document.documentElement.clientWidth, rect.right);
      const bottom = Math.min(viewportHeight, rect.bottom);
      panel.style.left = `${left + inset}px`;
      panel.style.bottom = `${Math.max(0, viewportHeight - bottom) + 100}px`;
      panel.style.maxWidth = `${Math.max(0, right - left - inset * 2)}px`;
      panel.style.maxHeight = `${Math.max(0, Math.min(viewportHeight * 0.65,
        bottom - Math.max(0, rect.top) - 100 - inset))}px`;
    };

    positionPanel();
    const observer = new ResizeObserver(positionPanel);
    observer.observe(page);
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel);
    };
  }, [showHelp, rootRef, screenVisitId]);

  useKioskHelpHighlight({
    rootRef,
    targetId: help.highlightTargetId,
    enabled: showHelp,
    level,
  });

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
    targetId: help.highlightTargetId ?? task.targetId,
    observedTargetId: help.observedTargetId,
    helpKey: help.helpKey,
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
          ref={panelRef}
          className={`kiosk-help-panel kiosk-help-panel--level-${level}`}
          aria-label={`${level}단계 도움 안내`}
        >
          <div className="kiosk-help-heading">
            <span className="kiosk-help-badge">{level}단계</span>

            <h2>{level === 3 ? "상세 도움" : content.title}</h2>
          </div>

          <div id="kiosk-context-help-text" aria-live="polite">
            {level < 3 ? (
              <p>{content.levels[level - 1]}</p>
            ) : (
              <AIHelpPanel
                key={`${screenVisitId}:${task.phase}:${help.helpKey}:${help.highlightTargetId}`}
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
