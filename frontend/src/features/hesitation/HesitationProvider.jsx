// 세션, 화면 방문, 점수, 기록을 관리하고 각 기능 연결

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { createScoreEngine } from "./scoreEngine.js";
import { HesitationContext } from "./useHesitation.js";
import useBehaviorCollector from "./useBehaviorCollector.js";
import useAdaptiveHelp from "./useAdaptiveHelp.js";

export default function HesitationProvider({
  children,
  config,
  evaluate,
  automaticHelp = true,
}) {
  const rootRef = useRef(null);

  // Provider가 유지되는 동안 같은 엔진과 세션을 사용
  // config와 evaluate는 세션 시작 시 적용
  const [engine] = useState(() =>
    createScoreEngine({
      config,
      evaluate,
    }),
  );

  // Observer: 엔진 변경을 구독하여 React 화면에 반영
  const snapshot = useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot,
    engine.getSnapshot,
  );

  const {
    help,
    closeHelp,
    openHelp,
  } = useAdaptiveHelp(engine, automaticHelp);

  useBehaviorCollector({
    rootRef,
    engine,
    screenVisitId: snapshot.screenVisitId,
    measuring: snapshot.measuring,
  });

  useEffect(() => {
    function handleVisibility() {
      engine.setPaused("documentHidden", document.hidden);
    }

    handleVisibility();

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
    );

    const timer = setInterval(() => {
      engine.tick();
    }, engine.config.tickMs);

    return () => {
      clearInterval(timer);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );
    };
  }, [engine]);

  // 화면에서 useEffect 의존성으로 사용해도 바뀌지 않는 함수
  const actions = useMemo(
    () => ({
      enterScreen: engine.enterScreen,
      setReady: engine.setReady,
      setPaused: engine.setPaused,
      setTask: engine.setTask,
      recordSelection: engine.recordSelection,
      recordError: engine.recordError,
      completeAction: engine.completeAction,
      getLogs: engine.getLogs,
    }),
    [engine],
  );

  const value = useMemo(
    () => ({
      ...snapshot,
      ...actions,
      help,
      closeHelp,
      openHelp,
    }),
    [snapshot, actions, help, closeHelp, openHelp],
  );

  return (
    <HesitationContext.Provider value={value}>
      {/* 기존 레이아웃에 별도 박스를 추가하지 않도록 설정 */}
      <div ref={rootRef} style={{ display: "contents" }}>
        {children}
      </div>
    </HesitationContext.Provider>
  );
}