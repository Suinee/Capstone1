import { useEffect, useRef } from 'react';
import useHesitation from '../hesitation/useHesitation.js';
import { getPublicHelpContent } from './publicHelpContent.js';
import { findPublicTarget } from './resolvePublicHelp.js';
import usePublicHelpHighlight from './usePublicHelpHighlight.js';
import './PublicHelpUI.css';

export default function PublicHelpUI({ rootRef }) {
  const { help, measuring, screenVisitId, openHelp, closeHelp, expandHelp } = useHesitation();
  const panelRef = useRef(null);
  const titleRef = useRef(null);
  const launcherRef = useRef(null);
  const show = measuring && help.status === 'visible' && help.screenVisitId === screenVisitId;
  const content = getPublicHelpContent(help.helpKey);
  const level = Math.max(1, Math.min(3, help.level));
  usePublicHelpHighlight({ rootRef, targetId: help.highlightTargetId, enabled: show, level });

  useEffect(() => {
    if (show && ['manualRequest', 'manualExpansion'].includes(help.reason)) titleRef.current?.focus({ preventScroll: true });
  }, [show, help.reason, help.version]);
  useEffect(() => {
    if (!show) return;
    const onKey = event => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const restoreFocus = panelRef.current?.contains(document.activeElement);
      closeHelp();
      if (restoreFocus) requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, closeHelp]);

  function locateTarget() {
    const field = findPublicTarget(rootRef.current, help.highlightTargetId);
    if (!field || field.matches(':disabled')) return;
    const target = field.matches('input[type=radio], input[type=checkbox]') ? field.closest('label') ?? field : field;
    // 사용자 요청 때만 스크롤한다. 도움창 위쪽의 빈 공간으로 이동한다.
    const availableHeight = panelRef.current?.getBoundingClientRect().top ?? window.innerHeight;
    const rect = target.getBoundingClientRect();
    rootRef.current.dataset.hesitationIgnoreScrollUntil = String(performance.now() + 300);
    window.scrollBy({ top: rect.top - Math.max(100, availableHeight / 2 - Math.min(rect.height, 150) / 2), behavior: 'instant' });
    const focusable = field.matches('input, select, textarea, button, a') ? field : field.querySelector('input:not(:disabled), select:not(:disabled), button:not(:disabled)');
    focusable?.focus({ preventScroll: true });
  }
  function dismiss() {
    closeHelp();
    requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
  }
  return <div className={`public-help-ui ${show ? "public-help-ui--visible" : ""}`} data-hesitation-ignore>
    <div className="public-help-spacer" aria-hidden="true" />
    {!show && <button ref={launcherRef} className="public-help-launcher" type="button" onClick={() => openHelp()}>
      <span aria-hidden="true">?</span> 화면 도움 받기
    </button>}
    {show && <section ref={panelRef} className={`public-help-panel public-help-panel--${level}`}
      aria-label={`${level}단계 공공서비스 도움`}>
      <div className="public-help-heading">
        <span className="public-help-badge">{level}단계</span>
        <h2 ref={titleRef} tabIndex={-1}>{content.title}</h2>
        <button type="button" className="public-help-close" aria-label="도움 닫기" onClick={dismiss}>×</button>
      </div>
      <div id="public-context-help-text" aria-live="polite" aria-atomic="true">
        <p className="public-help-short">{content.short}</p>
        {level >= 2 && <p className="public-help-explanation">{content.explanation}</p>}
        {level === 3 && <ol className="public-help-steps">{content.steps.map(step => <li key={step}>{step}</li>)}</ol>}
      </div>
      <div className="public-help-actions">
        {help.highlightTargetId && <button type="button" onClick={locateTarget}>항목 위치 보기</button>}
        {level < 3 && <button type="button" className="public-help-more" onClick={expandHelp}>
          {level === 1 ? '설명 더 보기' : '순서대로 보기'}
        </button>}
      </div>
    </section>}
  </div>;
}
