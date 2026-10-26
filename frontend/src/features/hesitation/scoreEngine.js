// 중복 방지, 5초 묶음, 점수 누적, 화면 방문 초기화

import {
  createConfig,
  getHelpLevel,
  RULE_IDS,
} from "./config.js";
import { evaluateRules } from "./rules.js";

export function createScoreEngine({
  config: overrides = {},
  evaluate = evaluateRules,
} = {}) {
  const config = createConfig(overrides);

  const listeners = new Set();

  const sessionId = crypto.randomUUID();
  const logs = [];
  const pauseReasons = new Set(["notReady"]);

  let activeTime = 0;
  let lastWallTime = performance.now();
  let sequence = 0;

  let screenId = null;
  let screenVisitId = null;
  let visitKey = null;

  let score = 0;
  let group = null;
  let events = [];
  let navigation = [];
  let lastSignals = [];
  let metrics = {};

  // 화면 방문 안에서만 유지하는 상태
  let gates = new Map();
  let consumed = new Map();

  // 화면 이동 후에도 유지해야 하는 상태
  const navigationConsumed = new Set();
  let navigationLastScoreAt = -Infinity;

  const validationAttempts = new Set();

  let task = {
    phase: "select",
    targetId: "screen",
    delayMs: null,
    enabledRules: [...RULE_IDS],
    startedAt: 0,
  };

  let snapshot;

  function advanceClock() {
    const wallTime = performance.now();

    if (screenVisitId && pauseReasons.size === 0) {
      activeTime += Math.max(0, wallTime - lastWallTime);
    }

    lastWallTime = wallTime;
    return activeTime;
  }

  function isMeasuring() {
    return Boolean(
      screenVisitId &&
      pauseReasons.size === 0 &&
      task.phase !== "done",
    );
  }

  function writeLog(type, data = {}) {
    const entry = {
      ...data,
      type,
      logId: `${sessionId}:log:${logs.length + 1}`,
      sessionId,
      screenId,
      screenVisitId,
      activeTime,
      recordedAt: Date.now(),
      ruleVersion: config.ruleVersion,
    };

    logs.push(entry);
    return entry;
  }

  function refreshSnapshot() {
    snapshot = {
      sessionId,
      screenId,
      screenVisitId,
      score,
      level: getHelpLevel(score, config),
      task: { ...task },
      metrics: { ...metrics },
      lastSignals: [...lastSignals],
      activeTime,
      measuring: isMeasuring(),
    };
  }

  function publish(type, detail = {}) {
    refreshSnapshot();

    const message = {
      ...detail,
      type,
      snapshot,
      at: Date.now(),
    };

    for (const listener of [...listeners]) {
      listener(message);
    }
  }

  function isConsumed(ruleId, eventId) {
    if (ruleId === "navigationLoop") {
      return navigationConsumed.has(eventId);
    }

    return consumed.get(ruleId)?.has(eventId) ?? false;
  }

  function consume(signal) {
    if (signal.ruleId === "navigationLoop") {
      signal.evidence.forEach((id) => navigationConsumed.add(id));
      return;
    }

    if (!consumed.has(signal.ruleId)) {
      consumed.set(signal.ruleId, new Set());
    }

    const used = consumed.get(signal.ruleId);
    signal.evidence.forEach((id) => used.add(id));
  }

  function tick() {
    const now = advanceClock();

    if (!isMeasuring()) return;

    const retentionMs = Math.max(
      config.windowMs,
      config.navigationWindowMs,
    );

    events = events.filter(
      (event) => event.time >= now - retentionMs,
    );

    navigation = navigation.filter(
      (event) => event.time >= now - config.navigationWindowMs,
    );

    const result = evaluate({
      events,
      navigation,
      now,
      task,
      config,
      isConsumed,
    });

    metrics = result.metrics;

    const currentKeys = new Set(
      result.signals.map((signal) => signal.key),
    );

    // 지속 조건이 3초 이상 해제되면 다시 점수를 받을 수 있음
    for (const [key, gate] of gates) {
      if (gate.mode !== "persistent") continue;

      if (currentKeys.has(key)) {
        gate.falseSince = null;
      } else {
        gate.falseSince ??= now;

        if (now - gate.falseSince >= config.rearmMs) {
          gate.armed = true;
        }
      }
    }

    const accepted = [];

    for (const signal of result.signals) {
      let gate = gates.get(signal.key);

      if (!gate) {
        gate = {
          ruleId: signal.ruleId,
          mode: signal.mode,
          armed: true,
          falseSince: null,
          lastAt: -Infinity,
        };

        gates.set(signal.key, gate);
      }

      // 같은 규칙은 다른 요소에서 발생했어도 5초 재점수 제한
      const ruleLastAt =
        signal.ruleId === "navigationLoop"
          ? navigationLastScoreAt
          : Math.max(
              -Infinity,
              ...[...gates.values()]
                .filter((item) => item.ruleId === signal.ruleId)
                .map((item) => item.lastAt),
            );

      if (now - ruleLastAt < config.cooldownMs) continue;

      if (signal.mode === "persistent" && !gate.armed) continue;

      if (
        signal.mode === "event" &&
        signal.evidence.some((id) => isConsumed(signal.ruleId, id))
      ) {
        continue;
      }

      gate.lastAt = now;
      gate.armed = false;

      if (signal.ruleId === "navigationLoop") {
        navigationLastScoreAt = now;
      }

      consume(signal);
      accepted.push(signal);
    }

    if (accepted.length === 0) {
      publish("tick");
      return;
    }

    if (!group || now - group.startedAt >= config.groupMs) {
      group = {
        id: crypto.randomUUID(),
        startedAt: now,
        maxScore: 0,
      };
    }

    const candidateMax = Math.max(
      ...accepted.map((signal) => signal.score),
    );

    const nextMax = Math.max(group.maxScore, candidateMax);
    const addedScore = nextMax - group.maxScore;

    group.maxScore = nextMax;
    score += addedScore;
    lastSignals = accepted;

    writeLog("judgment", {
      groupId: group.id,
      signals: accepted,
      addedScore,
      score,
      level: getHelpLevel(score, config),
    });

    // addedScore가 0이어도 새로운 신호가 발생 사실 전달
    publish("signal", { signals: accepted, addedScore });
  }

  function record(event) {
    advanceClock();

    if (!isMeasuring()) return null;

    // 이전 화면의 늦게 실행된 타이머가 현재 화면에 기록 X
    if (
      event.screenVisitId &&
      event.screenVisitId !== screenVisitId
    ) {
      return null;
    }

    if (event.type === "validation_error") {
      if (!event.attemptId) {
        throw new Error("검증 오류에는 attemptId가 필요합니다.");
      }

      const attemptKey = JSON.stringify([
        screenVisitId,
        event.targetId,
        event.code,
        event.attemptId,
      ]);

      if (validationAttempts.has(attemptKey)) return null;
      validationAttempts.add(attemptKey);
    }

    const normalized = {
      ...event,
      id: `${sessionId}:event:${++sequence}`,
      time: activeTime,
      screenId,
      screenVisitId,
    };

    events.push(normalized);
    writeLog("behavior", { event: normalized });

    return normalized;
  }

  function enterScreen(nextScreenId, options = {}) {
    advanceClock();

    const nextVisitKey = options.visitKey ?? nextScreenId;

    // React Effect 재실행으로 같은 방문이 중복 생성되는 것 방지
    if (
      screenId === nextScreenId &&
      visitKey === nextVisitKey
    ) {
      return screenVisitId;
    }

    if (screenVisitId) {
      writeLog("screen_exit", { finalScore: score });
    }

    screenId = nextScreenId;
    visitKey = nextVisitKey;
    screenVisitId = crypto.randomUUID();

    score = 0;
    group = null;
    events = [];
    gates = new Map();
    consumed = new Map();
    lastSignals = [];
    metrics = {};
    validationAttempts.clear();

    task = {
      phase: options.phase ?? "select",
      targetId: options.targetId ?? "screen",
      delayMs: options.delayMs ?? null,
      enabledRules: [...(options.enabledRules ?? RULE_IDS)],
      startedAt: activeTime,
    };

    // 새 화면은 로딩 완료 여부를 확인하기 전까지 측정을 멈춤
    if (options.ready === true) {
      pauseReasons.delete("notReady");
    } else {
      pauseReasons.add("notReady");
    }

    // 실제 화면이 변경된 경우에만 단계 이동 이력으로 기록
    if (navigation.at(-1)?.screenId !== screenId) {
      navigation.push({
        id: `${sessionId}:event:${++sequence}`,
        time: activeTime,
        screenId,
      });
    }

    writeLog("screen_enter", { task });
    publish("screen");

    return screenVisitId;
  }

  function setPaused(reason, paused) {
    advanceClock();

    const wasPaused = pauseReasons.has(reason);

    if (paused) {
      pauseReasons.add(reason);
    } else {
      pauseReasons.delete(reason);
    }

    if (wasPaused !== paused) {
      writeLog("measurement_state", { reason, paused });
      publish("measurement");
    }
  }

  function setTask(patch) {
    advanceClock();

    if (!screenVisitId) return;

    const next = { ...task, ...patch };

    const actionChanged =
      next.phase !== task.phase ||
      next.targetId !== task.targetId;

    const changed =
      actionChanged ||
      next.delayMs !== task.delayMs ||
      JSON.stringify(next.enabledRules) !==
        JSON.stringify(task.enabledRules);

    if (!changed) return;

    task = {
      ...next,
      startedAt: actionChanged ? activeTime : task.startedAt,
    };

    writeLog("task_change", { task });

    // 도움 해제
    publish(actionChanged ? "resolved" : "task");
  }

  refreshSnapshot();

  return {
    config,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    now: advanceClock,
    tick,
    record,
    enterScreen,
    setTask,
    setPaused,
    setReady: (ready) => setPaused("notReady", !ready),

    // 실제 화면에서 선택 완료·검증 결과를 알려줄 때
    recordSelection: (targetId) =>
      record({ type: "selection", targetId }),

    recordError: (targetId, code, attemptId) =>
      record({
        type: "validation_error",
        targetId,
        code,
        attemptId,
      }),

    completeAction() {
      setTask({ phase: "done" });
    },

    logHelp(data) {
      advanceClock();
      writeLog("help", data);
    },

    getLogs: () => [...logs],
  };
}