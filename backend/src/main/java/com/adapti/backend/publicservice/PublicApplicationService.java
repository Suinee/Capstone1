package com.adapti.backend.publicservice;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PublicApplicationService {
    private final JdbcTemplate jdbc;
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final Set<String> RESIDENT = Set.of("주민등록표 등본 발급", "주민등록표 초본 발급",
            "주민등록표 등본(영문) 발급", "주민등록표 초본(영문) 발급");
    private static final Set<String> FAMILY = Set.of("가족관계증명서", "기본증명서", "혼인관계증명서",
            "입양관계증명서", "친양자입양관계증명서");
    public record Request(String requestId, String sessionId, String serviceCode, String name) {}
    public record Application(String requestId, String receiptNo, String receivedAt,
            String serviceCode, String name, int count, String status) {}

    public PublicApplicationService(DataSource source, JdbcTemplate jdbc) {
        this.jdbc = jdbc;
        new ResourceDatabasePopulator(new ClassPathResource("db/public-service.sql")).execute(source);
    }
    private void uuid(String value) {
        try {
            if (value == null || !UUID.fromString(value).toString().equals(value)) throw new IllegalArgumentException();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 UUID가 필요합니다.");
        }
    }
    private boolean validName(String code, String name) {
        if (code == null || name == null) return false;
        return switch (code) {
            case "resident-registration" -> RESIDENT.contains(name);
            case "moving-in-report" -> name.equals("전입신고");
            case "tax-payment" -> name.equals("납세증명서 발급");
            case "family-relationship" -> FAMILY.stream().anyMatch(cert ->
                name.equals(cert + " (일반증명서)") || name.equals(cert + " (상세증명서)") ||
                (!cert.contains("입양") && name.equals(cert + " (특정증명서)")));
            default -> false;
        };
    }
    private Application row(java.sql.ResultSet rs, int n) throws java.sql.SQLException {
        return new Application(rs.getString("request_id"), rs.getString("receipt_no"),
            rs.getString("received_at"), rs.getString("service_code"), rs.getString("service_name"),
            1, "모의 신청 완료");
    }
    @Transactional
    public Application submit(Request request) {
        if (request == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        uuid(request.sessionId()); uuid(request.requestId());
        if (!validName(request.serviceCode(), request.name()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 체험 서비스입니다.");
        jdbc.update("""
            INSERT INTO public_application(request_id, session_id, service_code, service_name, receipt_no, received_at)
            VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(request_id) DO NOTHING
            """, request.requestId(), request.sessionId(), request.serviceCode(), request.name(),
            "DEMO-" + UUID.randomUUID(), LocalDateTime.now(ZoneId.of("Asia/Seoul")).format(TIME));
        var rows = jdbc.query("SELECT * FROM public_application WHERE request_id = ? AND session_id = ?",
            this::row, request.requestId(), request.sessionId());
        if (rows.isEmpty() || !rows.getFirst().serviceCode().equals(request.serviceCode()) ||
                !rows.getFirst().name().equals(request.name()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "신청 요청 번호가 충돌했습니다.");
        return rows.getFirst();
    }
    public List<Application> list(String sessionId) {
        uuid(sessionId);
        return jdbc.query("SELECT * FROM public_application WHERE session_id = ? ORDER BY received_at DESC, rowid DESC",
            this::row, sessionId);
    }
}
