// 이벤트를 이용해 횟수, 체류시간, 방향 전환 등의 지표 계산

export function recentEvents(events, now, windowMs) {
  return events.filter(
    (event) => event.time >= now - windowMs && event.time <= now,
  );
}

export function groupBy(events, getKey) {
  const groups = new Map();

  for (const event of events) {
    const key = getKey(event);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(event);
  }

  return groups;
}

// 방향 전환 횟수: 미세한 이동 제외
// 일정 거리 이상 이동한 뒤 방향이 크게 바뀌었는지 계산
export function countDirectionChanges(events, config) {
  const points = events.filter((event) => event.type === "pointer_move");

  let count = 0;
  let previous = null;
  let previousVector = null;
  let distance = 0;

  for (const point of points) {
    if (!previous) {
      previous = point;
      continue;
    }

    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    const length = Math.hypot(dx, dy);

    previous = point;

    // 같은 좌표이면 방향을 계산하지 않음
    if (length === 0) continue;

    if (previousVector && distance >= config.directionMinDistance) {
      const previousLength = Math.hypot(previousVector.x, previousVector.y);

      const cosine =
        (previousVector.x * dx + previousVector.y * dy) /
        (previousLength * length);

      // 소수점 계산 오차로 acos 범위를 벗어나지 않도록 제한
      const angle =
        (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;

      if (angle >= config.directionMinAngle) {
        count++;
        distance = 0;
      }
    }

    distance += length;
    previousVector = { x: dx, y: dy };
  }

  return count;
}

// 같은 스크롤 영역에서 한 방향으로 50px 이상 이동한 뒤, 반대 방향으로도 이동했을 때 왕복 계산
export function countScrollReversals(events, config) {
  const group = groupBy(
    events.filter((event) => event.type === "scroll"),
    (event) => event.targetId,
  );

  let count = 0;

  for (const items of group.values()) {
    let direction = 0;
    let distance = 0;
    let previousRunQulified = false;

    for (const event of items) {
      const nextDirection = Math.sign(event.deltaY);

      if (nextDirection === 0) continue;

      if (nextDirection !== direction) {
        previousRunQulified =
          distance !== 0 && distance >= config.scrollMinDistance;

        direction = nextDirection;
        distance = 0;
      }

      distance += Math.abs(event.deltaY);

      if (previousRunQulified && distance >= config.scrollMinDistance) {
        count++;
        previousRunQulified = false;
      }
    }
  }

  return count;
}

// 현재 과제에서 실제 관찰한 버튼별 지표. 시간 단위는 활성 시간(ms).
export function buildTargetMetrics(events, now, task, config) {
  const start = Math.max(task.startedAt, now - config.windowMs);
  const targets = {};
  for (const event of recentEvents(events, now, config.windowMs)) {
    if (event.time < start || !event.targetId || event.targetId === "screen") continue;
    const item = targets[event.targetId] ??= {
      hoverDurationMs: 0,
      hoverCount: 0,
      clickCount: 0,
      pointerPauseCount: 0,
      lastInteractionAt: -Infinity,
      evidence: [],
    };
    if (event.type === "hover_slice") {
      item.hoverDurationMs += Math.max(0, event.time - Math.max(start, event.startTime));
    }
    if (event.type === "hover_enter") item.hoverCount++;
    if (event.type === "click" && !event.repeatClickExcluded) item.clickCount++;
    if (event.type === "pointer_pause") item.pointerPauseCount++;
    if (["hover_slice", "hover_enter", "click", "pointer_pause"].includes(event.type)) {
      item.lastInteractionAt = event.time;
      item.evidence.push(event.id);
    }
  }
  return targets;
}

export function getDominantTarget(targetMetrics, now, config) {
  return Object.entries(targetMetrics)
    .filter(([id, item]) =>
      !id.startsWith("quantity-") &&
      now - item.lastInteractionAt <= config.targetRecentMs &&
      (item.hoverDurationMs >= config.targetAttributionMs || item.clickCount >= 2))
    .sort((a, b) => b[1].hoverDurationMs - a[1].hoverDurationMs ||
      b[1].clickCount - a[1].clickCount || b[1].lastInteractionAt - a[1].lastInteractionAt)
    .map(([targetId, item]) => ({ targetId, ...item }))[0] ?? null;
}

// 수집한 이벤트를 현재 과제의 판단 지표로 변환
export function buildMetrics(events, now, task, config) {
  const recent = recentEvents(events, now, config.windowMs).filter(
    (event) => event.time >= task.startedAt,
  );

  const directionChanges = countDirectionChanges(recent, config);

  const scrollReversals = countScrollReversals(recent, config);

  const auxiliaryTypes = [];

  if (recent.some((event) => event.type === "pointer_pause")) {
    auxiliaryTypes.push("pointerPause");
  }

  if (directionChanges > 0) {
    auxiliaryTypes.push("directionChange");
  }

  if (recent.some((event) => event.type === "input_pause")) {
    auxiliaryTypes.push("inputPause");
  }

  if (scrollReversals > 0) {
    auxiliaryTypes.push("scrollReversal");
  }

  const operations = events.filter((event) =>
    ["click", "input", "selection"].includes(event.type),
  );

  const lastOperation = operations.at(-1);
  const lastOperationTime = lastOperation?.time ?? task.startedAt;

  return {
    targetMetrics: buildTargetMetrics(events, now, task, config),
    auxiliaryTypes,
    directionChanges,
    scrollReversals,

    // 현재 과제를 시작한 뒤 측정된 시간
    taskElapsedMs: Math.max(0, now - task.startedAt),

    // 마지막 클릭·입력·선택 이후 측정된 시간
    inactivityMs: Math.max(0, now - lastOperationTime),
  };

}
