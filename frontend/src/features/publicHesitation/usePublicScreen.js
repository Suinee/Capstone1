import { useLayoutEffect } from "react";
import useHesitation from "../hesitation/useHesitation.js";
import { getPublicSessionId } from "../../pages/PublicService/demoApplicationStore.js";
import { publicScreenTask } from "./publicHesitationConfig.js";

export default function usePublicScreen(screenId, attempt = 0) {
  const { enterScreen, setReady, setPaused, getSnapshot, recordError } = useHesitation();
  useLayoutEffect(() => {
    const task = publicScreenTask(screenId, getPublicSessionId());
    const visit = enterScreen(screenId, { ...task, visitKey: `${screenId}:${attempt}` });
    setPaused("publicSubmission", false);
    setReady(task.ready);
    return () => {
      if (getSnapshot().screenVisitId === visit) setReady(false);
    };
  }, [screenId, attempt, enterScreen, setReady, setPaused, getSnapshot]);

  // 오류 메시지나 입력값은 기록하지 않고 정해진 코드와 항목만 기록한다.
  return (targetId, code) => recordError(targetId, code, crypto.randomUUID());
}
