package com.adapti.backend.hesitation;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class HesitationLogService {
    private static final Set<String> TYPES = Set.of("screen_enter", "screen_exit", "behavior",
            "judgment", "task_change", "measurement_state", "help");
    private final HesitationLogRepository repository;
    private final ObjectMapper mapper;

    public HesitationLogService(HesitationLogRepository repository, ObjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public record BatchResult(int received, int inserted, int duplicates) {}
    public record LogPage(String sessionId, List<JsonNode> logs,
                          boolean hasMore, Long nextAfterSequence) {}
    public record ValidatedLog(String logId, String sessionId, long sequence,
            String screenId, String screenVisitId, String type, double activeTime,
            long recordedAt, String ruleVersion, JsonNode payload) {}

    /** 전체 요청을 먼저 검증하고 한 트랜잭션으로 저장한다. */
    @Transactional
    public BatchResult save(List<JsonNode> logs) {
        if (logs == null || logs.isEmpty() || logs.size() > 1000) {
            throw badRequest("logs는 1~1000개의 기록이어야 합니다.");
        }
        List<ValidatedLog> validated = logs.stream().map(this::validate).toList();
        int inserted = 0;
        for (ValidatedLog log : validated) {
            int count = repository.insert(log);
            if (count == 0 && !mapper.readTree(repository.findPayload(log.logId())).equals(log.payload())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "같은 logId에 다른 내용이 전달되었습니다: " + log.logId());
            }
            inserted += count;
        }
        return new BatchResult(logs.size(), inserted, logs.size() - inserted);
    }

    @Transactional(readOnly = true)
    public LogPage find(String sessionId, long afterSequence, int limit) {
        requireUuid(sessionId, "sessionId");
        if (afterSequence < 0 || limit < 1 || limit > 1000) {
            throw badRequest("afterSequence는 0 이상, limit은 1~1000이어야 합니다.");
        }
        List<String> rows = repository.findPage(sessionId, afterSequence, limit + 1);
        boolean hasMore = rows.size() > limit;
        List<JsonNode> logs = new ArrayList<>();
        for (String row : rows.subList(0, Math.min(limit, rows.size()))) {
            logs.add(mapper.readTree(row));
        }
        Long next = hasMore ? sequence(logs.get(logs.size() - 1), sessionId) : null;
        return new LogPage(sessionId, logs, hasMore, next);
    }

    private ValidatedLog validate(JsonNode log) {
        if (log == null || !log.isObject()) throw badRequest("각 로그는 JSON 객체여야 합니다.");
        if (log.toString().getBytes(StandardCharsets.UTF_8).length > 65536) {
            throw badRequest("로그 하나의 크기는 64 KiB 이하여야 합니다.");
        }
        String session = text(log, "sessionId", 36, false);
        requireUuid(session, "sessionId");
        String id = text(log, "logId", 128, false);
        long sequence = sequence(log, session);
        String screen = text(log, "screenId", 128, true);
        String visit = text(log, "screenVisitId", 36, true);
        if ((screen == null) != (visit == null)) throw badRequest("화면 ID와 방문 ID는 함께 지정해야 합니다.");
        if (visit != null) requireUuid(visit, "screenVisitId");
        String type = text(log, "type", 32, false);
        if (!TYPES.contains(type)) throw badRequest("지원하지 않는 로그 type입니다.");
        JsonNode active = log.get("activeTime");
        JsonNode recorded = log.get("recordedAt");
        if (active == null || !active.isNumber() || !Double.isFinite(active.doubleValue())
                || active.doubleValue() < 0) throw badRequest("activeTime은 0 이상의 유한한 숫자여야 합니다.");
        if (recorded == null || !recorded.isIntegralNumber() || !recorded.canConvertToLong()
                || recorded.longValue() < 0) throw badRequest("recordedAt은 0 이상의 정수여야 합니다.");
        String version = text(log, "ruleVersion", 64, false);
        return new ValidatedLog(id, session, sequence, screen, visit, type,
                active.doubleValue(), recorded.longValue(), version, log);
    }

    private static long sequence(JsonNode log, String session) {
        String id = text(log, "logId", 128, false);
        String prefix = session + ":log:";
        if (!id.startsWith(prefix)) throw badRequest("logId는 sessionId:log:순번 형식이어야 합니다.");
        String suffix = id.substring(prefix.length());
        if (!suffix.matches("[1-9][0-9]{0,18}")) throw badRequest("로그 순번은 양의 정수여야 합니다.");
        try { return Long.parseLong(suffix); }
        catch (NumberFormatException e) { throw badRequest("로그 순번이 너무 큽니다."); }
    }

    private static String text(JsonNode log, String key, int max, boolean nullable) {
        JsonNode value = log.get(key);
        if (nullable && value != null && value.isNull()) return null;
        if (value == null || !value.isTextual() || value.asText().isBlank()
                || value.asText().length() > max) throw badRequest(key + " 값이 올바르지 않습니다.");
        return value.asText();
    }

    private static void requireUuid(String value, String field) {
        try {
            if (!UUID.fromString(value).toString().equals(value)) throw new IllegalArgumentException();
        } catch (IllegalArgumentException e) { throw badRequest(field + "는 소문자 UUID여야 합니다."); }
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
