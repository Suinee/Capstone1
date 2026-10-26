// 계산된 지표가 망설임 신호 조건을 만족하는지 판정

import { buildMetrics, groupBy, recentEvents } from "./metrics.js";

function makeSignal({
    ruleId,
    targetId,
    score,
    evidence = [],
    mode = "event",
    suffix = "",
}) {
    return {
        ruleId,
        targetId,
        score,
        evidence,
        mode,
        key: `${ruleId}:${targetId}:${suffix}`,
    };
}

export function evaluateRules ({
    events,
    navigation,
    now,
    task,
    config,
    isConsumed,
}) {
    const signals =[];
    const enabled = new Set(task.enabledRules);
    const recent = recentEvents(events, now, config.windowMs);
    const metrics = buildMetrics(events, now, task, config);

    // 같은 규칙에서 이미 사용한 이벤트는 다시 사용 X
    const fresh = (ruleId, items) =>
        items.filter((event) => !isConsumed(ruleId, event.id));

    // 시간 지연
    if (
        enabled.has("timeDelay") &&
        Number.isFinite(task.delayMs) &&
        metrics.taskElapsedMs > task.delayMs &&
        metrics.auxiliaryTypes.length > 0
    ) {
        signals.push (
            makeSignal({
                ruleId: "timeDelay",
                targetId: task.targetId,
                score: config.weakScore,
                mode: "persistent",
                suffix: task.phase,
            }),
        );
    }

    // 서로 다른 종류의 보조 행동이 함께 발생
    if (
        enabled.has("complexExploration") &&
        metrics.auxiliaryTypes.length >= 2
    ) {
        signals.push(
            makeSignal({
                ruleId: "complexExploration",
                targetId: task.targetId,
                score: config.weakScore,
                mode: "persistent",
            }),
        );
    }

    // 반복 클릭
    if (enabled.has("repeatedClick")) {
        const clicks = fresh(
            "repeatedClick",
            recentEvents(events, now, config.clickWindowMs).filter(
                (event) =>
                    event.type === "click" && !event.repeatClickExcluded,
            ),
        );

        for (const [targetId, items] of groupBy(
            clicks,
            (event) => event.targetId,
        )) {
            if (items.length >= config.repeatClickCount) {
                signals.push(
                    makeSignal({
                        ruleId: "repeatedClick",
                        targetId,
                        score: config.strongScore,
                        evidence: items.map((event) => event.id),
                    }),
                );
            }
        }
    }

    // 과도한 Hover
    if (enabled.has("excessiveHover")) {
        const enters = fresh(
            "excessiveHover",
            recent.filter((event) => event.type === "hover_enter"),
        );

        for (const [targetId, items] of groupBy(
            enters,
            (event) => event.targetId,
        )) {
            const hoverIds = new Set(items.map((event) => event.hoverIds));

            const duration = recent.filter(
                (event) =>
                    event.type === "hover_slice" && hoverIds.has(event.hoverIds),
            )
            .reduce((total, event) => {
                const clippedStart = Math.max(
                    event.startTime,
                    now - config.windowMs,
                );

                return total + Math.max(0, event.time - clippedStart);
            }, 0);

            if (
                items.length >= config.hoverCount &&
                duration >= config.hoverDurationMs
            ) {
                signals.push(
                    makeSignal({
                        ruleId: "excessiveHover",
                        targetId,
                        score: config.weakScore,
                        evidence: items.map((event) => event.id),
                    }),
                );
            }
        }
    }
    // 입력 중단 이후 반복 수정
    if (enabled.has("inputRevision")) {
        const inputEvents = fresh(
            "inputRevision",
            recent.filter((event) =>
            ["input_pause", "input_revision"].includes(event.type)),
        );

        for (const [targetId, items] of groupBy(
            inputEvents,
            (event) => event.targetId,
        )) {
            const pauses = items.filter(
                (event) => event.type === "input_pause",
            );

            const firstPause = pauses[0];

            const revisions = items.filter(
                (event) =>
                    event.type === "input_revision" &&
                firstPause &&
                event.time >= firstPause.time,
            );

            if (firstPause && revisions.length >= config.revisionCount) {
                signals.push(
                    makeSignal({
                        ruleId: "inputRevision",
                        targetId,
                        score: config.strongScore,
                        evidence: [
                            ...pauses.map((event) => event.id),
                            ...revisions.map((event) => event.id),
                        ],
                    }),
                );
            }
        }
    }

    // 같은 항목의 같은 오류가 독립된 시도에서 반복
    if (enabled.has("repeatedError")) {
        const errors = fresh(
            "repeatedError",
            recent.filter((event) => event.type === "validation_error"),
        );

        for (const items of groupBy(
            errors,
            (event) => JSON.stringify([event.targetId, event.code]),
        ).values()) {
            const attempts = new Set(
                items.map((event) => event.attemptId),
            );

            if (attempts.size >= config.errorCount) {
                signals.push(
                    makeSignal({
                        ruleId: "repeatedError",
                        targetId: items[0].targetId,
                        score: config.strongScore,
                        evidence: items.map((event) => event.id),
                        suffix: items[0].code,
                    }),
                );
            }
        }
    }

    // A → B → A → B → A: 왕복 2회
  if (enabled.has("navigationLoop")) {
    const visits = recentEvents(
      navigation,
      now,
      config.navigationWindowMs,
    ).slice(-5);

    if (visits.length === 5) {
      const [a, b, c, d, e] = visits;

      const isLoop =
        a.screenId !== b.screenId &&
        a.screenId === c.screenId &&
        c.screenId === e.screenId &&
        b.screenId === d.screenId;

      // 첫 방문은 시작점, 이후 4개의 이동을 사용
      const evidence = visits.slice(1).map((event) => event.id);

      const allFresh = evidence.every(
        (id) => !isConsumed("navigationLoop", id),
      );

      if (isLoop && allFresh) {
        signals.push(
          makeSignal({
            ruleId: "navigationLoop",
            targetId: task.targetId,
            score: config.strongScore,
            evidence,
            suffix: [a.screenId, b.screenId].sort().join("|"),
          }),
        );
      }
    }
  }
  
  return { signals, metrics };
}