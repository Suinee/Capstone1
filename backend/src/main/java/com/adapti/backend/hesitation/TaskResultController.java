package com.adapti.backend.hesitation;

import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.DependsOn;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "http://localhost:5173")
@DependsOn("hesitationSchema")
public class TaskResultController {
    private final JdbcTemplate jdbc;
    public TaskResultController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping("/trends")
    public List<Map<String, Object>> trends(@RequestParam(defaultValue = "study") String dataset,
            @RequestParam String taskCode) {
        if (!List.of("study", "practice").contains(dataset) ||
            !List.of("kiosk-order", "resident-registration", "moving-in-report", "family-relationship", "tax-payment").contains(taskCode))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 기록 용도 또는 과제입니다.");
        return jdbc.queryForList("""
            WITH snapshots AS (
              SELECT payload_json AS p, recorded_at, session_id,
                ROW_NUMBER() OVER (PARTITION BY session_id, json_extract(payload_json, '$.event.attempt.attemptId')
                  ORDER BY log_sequence DESC) AS rank
              FROM hesitation_log
              WHERE log_type = 'behavior'
                AND json_extract(payload_json, '$.event.type') = 'task_attempt_snapshot'
                AND json_extract(payload_json, '$.experiment.dataset') = ?
                AND json_extract(payload_json, '$.experiment.mode') IN ('baseline', 'adaptive')
            ), completed AS (
              SELECT session_id, json_extract(p, '$.event.attempt.attemptId') AS attemptId,
                json_extract(p, '$.experiment.mode') AS mode,
                json_extract(p, '$.event.attempt.durationMs') AS durationMs,
                json_extract(p, '$.event.attempt.errors') AS errors,
                COALESCE(json_extract(p, '$.event.attempt.endedAt'), recorded_at) AS endedAt
              FROM snapshots WHERE rank = 1
                AND json_extract(p, '$.event.attempt.status') = 'completed'
                AND json_extract(p, '$.event.attempt.taskCode') = ?
            ), recent AS (
              SELECT *, ROW_NUMBER() OVER (PARTITION BY mode ORDER BY endedAt DESC, session_id DESC, attemptId DESC) AS recency
              FROM completed
            )
            SELECT attemptId, mode, durationMs, errors, endedAt FROM recent
            WHERE recency <= 30 ORDER BY mode, endedAt, session_id, attemptId
            """, dataset, taskCode);
    }

    // 로그 재전송은 기존 log_id 유일키로 제거된다. 도착 순서가 아닌 엔진 순번으로 최신 수행 상태를 선택한다.
    @GetMapping("/summary")
    public List<Map<String, Object>> summary(@RequestParam(defaultValue = "study") String dataset) {
        if (!List.of("study", "practice").contains(dataset))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 기록 용도입니다.");
        return jdbc.queryForList("""
            WITH snapshots AS (
              SELECT payload_json AS p,
                ROW_NUMBER() OVER (PARTITION BY session_id, json_extract(payload_json, '$.event.attempt.attemptId')
                  ORDER BY log_sequence DESC) AS rank
              FROM hesitation_log
              WHERE log_type = 'behavior'
                AND json_extract(payload_json, '$.event.type') = 'task_attempt_snapshot'
                AND json_extract(payload_json, '$.experiment.dataset') = ?
                AND json_extract(payload_json, '$.experiment.mode') IN ('baseline', 'adaptive')
            ), attempts AS (
              SELECT json_extract(p, '$.event.attempt') AS a,
                json_extract(p, '$.experiment.mode') AS mode FROM snapshots WHERE rank = 1
            )
            SELECT json_extract(a, '$.taskCode') AS taskCode, mode,
              COUNT(*) AS started,
              SUM(json_extract(a, '$.status') = 'completed') AS completed,
              SUM(json_extract(a, '$.status') = 'interrupted') AS interrupted,
              SUM(json_extract(a, '$.status') = 'in_progress') AS inProgress,
              AVG(CASE WHEN json_extract(a, '$.status') = 'completed' THEN json_extract(a, '$.durationMs') END) AS durationMs,
              AVG(CASE WHEN json_extract(a, '$.status') = 'completed' THEN json_extract(a, '$.clicks') END) AS clicks,
              AVG(CASE WHEN json_extract(a, '$.status') = 'completed' THEN json_extract(a, '$.errors') END) AS errors,
              AVG(CASE WHEN json_extract(a, '$.status') = 'completed' THEN json_extract(a, '$.automaticHelpCount') END) AS automaticHelpCount,
              AVG(CASE WHEN json_extract(a, '$.status') = 'completed' THEN json_extract(a, '$.manualHelpCount') END) AS manualHelpCount
            FROM attempts GROUP BY taskCode, mode ORDER BY taskCode, mode
            """, dataset);
    }
}
