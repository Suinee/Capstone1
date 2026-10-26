// 공통 시간, 횟수, 점수 기준

export const DEFAULT_CONFIG = Object.freeze({
    ruleVersion: "initial-1.0",

    // 엔진이 시간 기반 조건을 확인하는 간격
    tickMs: 250,

    // 행동을 함께 살펴보는 시간 범위
    windowMs: 20_000,
    navigationWindowMs: 30_000,

    // 같은 상황의 점수 중복 방지
    groupMs: 5_000,
    cooldownMs: 5_000,
    rearmMs: 3_000,

    // 마우스
    pointerSampleMs: 80,
    pointerPauseMs: 500,
    pointerPauseRadius: 3,
    directionMinDistance: 100,
    directionMinAngle: 90,

    // 스크롤
    scrollMinDistance: 50,

    // 반복 클릭
    clickWindowMs: 2_000,
    repeatClickCount: 3,

    // Hover
    hoverCount: 5,
    hoverDurationMs: 3_000,

    // 입력
    inputPauseMs: 2_000,
    revisionCount: 2,
    errorCount: 2,

    // 상황 해석용 지표: 단독 점수 없음
    inactivityMs: 10_000,

    // 기본 점수
    weakScore: 1,
    strongScore: 2,

    // 단계별 도움 기준
    helpThresholds: [3, 6, 9],
    helpDismissMs: 30_000,
});

export const RULE_IDS = Object.freeze([
    "timeDelay",
    "excessiveHover",
    "complexExploration",
    "repeatedClick",
    "inputRevision",
    "repeatedError",
    "navigationLoop",
]);

export function createConfig(overrides = {}) {
    return {
        ...DEFAULT_CONFIG,
        ...overrides,
        helpThresholds: [
            ...(overrides.helpThresholds ?? DEFAULT_CONFIG.helpThresholds)
        ],
    };
}

export function getHelpLevel(score, config = DEFAULT_CONFIG) {
    const [level1, level2, level3] = config.helpThresholds;

    if (score >= level3) return 3;
    if (score >= level2) return 2;
    if (score >= level1) return 1;
    
    return 0;
}