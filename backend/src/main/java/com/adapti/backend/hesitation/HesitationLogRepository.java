package com.adapti.backend.hesitation;

import java.util.List;
import org.springframework.context.annotation.DependsOn;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@DependsOn("hesitationSchema")
public class HesitationLogRepository {
    private final JdbcTemplate jdbc;

    public HesitationLogRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public int insert(HesitationLogService.ValidatedLog log) {
        return jdbc.update("""
                INSERT INTO hesitation_log
                (log_id, session_id, log_sequence, screen_id, screen_visit_id,
                 log_type, active_time, recorded_at, rule_version, payload_json, received_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(log_id) DO NOTHING
                """, log.logId(), log.sessionId(), log.sequence(), log.screenId(),
                log.screenVisitId(), log.type(), log.activeTime(), log.recordedAt(),
                log.ruleVersion(), log.payload().toString(), System.currentTimeMillis());
    }

    public String findPayload(String logId) {
        return jdbc.queryForObject("SELECT payload_json FROM hesitation_log WHERE log_id = ?",
                String.class, logId);
    }

    public List<String> findPage(String sessionId, long afterSequence, int limit) {
        return jdbc.queryForList("""
                SELECT payload_json FROM hesitation_log
                WHERE session_id = ? AND log_sequence > ?
                ORDER BY log_sequence ASC LIMIT ?
                """, String.class, sessionId, afterSequence, limit);
    }
}
