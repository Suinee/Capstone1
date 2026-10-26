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

        if (previousVector && distance >= config.directionMinDistance) { 
            const previousLength = Math.hypot(
                previousVector.x,
                previousVector.y,
            );

            const cosine =
                (previousVector.x * dx + previousVector.y * dy) /
                (previousLength * length);

                const angle =
                    (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;
            if (angle > config.directionChangeThreshold) {
                count++;
                distance = 0;
            }
        }

        distance += length;
        previousVector = { x: dx, y: dy };
        previous = point;
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

            if (
                previousRunQulified &&
                distance >= config.scrollMinDistance
            ) {
                count++;
                previousRunQulified = false;
            }
        }
    }

    return count;
}

export function buildMetrics(events, now, config) {
    const recent = recentEvents(events, now, config.windowMs);

    const directionChanges = countDirectionChanges(recent, config);
    const scrollReversals = countScrollReversals(recent, config);

    const auxiliaryTypes = [];

    if (recent.some((event) => event.type === "pointer_pause")) {
        auxiliaryTypes.push("pointerPause");
    }

    if (directionChanges > 0) {
        auxiliaryTypes.push("directionChange");
    }

    if (recent.some((event) => event.type === "Input_pause")) {
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
        auxiliaryTypes,
        directionChanges,
        scrollReversals,
        taskElapsedMs: Math.max(0, now - task.startedAt),
        inactivityMs: Math.max(0, now - lastOperationTime),
    };
}