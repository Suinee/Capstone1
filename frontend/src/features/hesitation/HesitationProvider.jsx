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
import HesitationDebugPanel from "./components/HesitationDebugPanel.jsx";
import { subscribeKioskHesitation } from "./kioskHesitationEvents.js";

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

  const { help, closeHelp, openHelp } = useAdaptiveHelp(engine, automaticHelp);

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

    document.addEventListener("visibilitychange", handleVisibility);

    const timer = setInterval(() => {
      engine.tick();
    }, engine.config.tickMs);

    return () => {
      clearInterval(timer);

      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [engine]);

  // 키오스크에서 보낸 화면/상태 이벤트를 실제 점수 엔진에 연결합니다.
  // 구독 시 이벤트 채널에 저장된 초기 화면 상태도 재생됩니다.
  useEffect(() => {
    let resetSequence = 0;

    function onKioskEvent(event) {
      const message = event.detail;
      if (!message) return;

      const { type, screenId, task, measurementEnabled, itemId } = message;

      switch (type) {
        case "SESSION_START": {
          // /kiosk 진입 시 Provider와 엔진은 새로 생성됩니다.
          engine.setPaused("sessionEnded", false);
          break;
        }
        case "SCREEN_CHANGE": {
          if (!screenId || !task) return;
          // 새 화면은 우선 정지 상태로 등록하고, 로딩이 완료됐을 때만 시작.
          engine.enterScreen(screenId, { ...task, ready: false });
          // 이전 결제 처리 화면의 일시정지 플래그가 다음 화면에 남지 않도록 함.
          engine.setPaused("kioskPaymentPhase", false);
          engine.setReady(measurementEnabled === true);
          break;
        }
        case "UI_STATE": {
          // 자식 effect가 부모의 SCREEN_CHANGE effect보다 먼저 올 수 있으므로
          // 이전 화면에 다음 화면의 상태를 덮어쓰지 않도록 검사합니다.
          if (engine.getSnapshot().screenId !== screenId) return;
          if (task) engine.setTask(task);
          engine.setReady(measurementEnabled === true);
          break;
        }
        case "SELECTION_COMPLETE": {
          if (engine.getSnapshot().screenId !== screenId) return;
          engine.recordSelection(
            String(itemId ?? engine.getSnapshot().task.targetId),
          );
          break;
        }
        case "CART_ADDED":
        case "CART_UPDATED": {
          if (engine.getSnapshot().screenId !== screenId) return;
          engine.completeAction();
          break;
        }
        case "TASK_RESET": {
          if (engine.getSnapshot().screenId !== screenId || !task) return;
          // MENU에서 사이드/음료를 장바구니에 바로 추가한 뒤,
          // 다음 선택의 경과 시간과 누적 점수를 새로 시작합니다.
          engine.enterScreen(screenId, {
            ...task,
            visitKey: `${screenId}:task-reset:${++resetSequence}`,
            ready: true,
          });
          break;
        }
        case "MEASUREMENT_CHANGE": {
          if (engine.getSnapshot().screenId !== screenId) return;
          // 결제 processing/complete 상태에서는 실제 평가도 중단합니다.
          engine.setPaused("kioskPaymentPhase", message.enabled !== true);
          break;
        }
        case "SESSION_END": {
          engine.completeAction();
          engine.setPaused("sessionEnded", true);
          break;
        }
        default:
          break;
      }
    }

    return subscribeKioskHesitation(onKioskEvent);
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
      <div ref={rootRef} style={{ display: "contents" }}>
        {children}
        <HesitationDebugPanel />
      </div>
    </HesitationContext.Provider>
  );
}
