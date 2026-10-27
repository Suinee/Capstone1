package com.adapti.backend.publicservice;

import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import tools.jackson.databind.json.JsonMapper;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PublicApplicationApiTests {
    static final Path DB;
    static { try { DB = Files.createTempDirectory("public-api-test").resolve("test.sqlite"); }
        catch (Exception e) { throw new ExceptionInInitializerError(e); } }
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:sqlite:" + DB);
    }
    @Value("${local.server.port}") int port;
    final HttpClient client = HttpClient.newHttpClient();
    final JsonMapper mapper = new JsonMapper();
    String id() { return UUID.randomUUID().toString(); }
    String body(String request, String session, String code, String name) {
        return """
            {"requestId":"%s","sessionId":"%s","serviceCode":"%s","name":"%s"}
            """.formatted(request, session, code, name);
    }
    HttpResponse<String> post(String body) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/public-service/applications"))
            .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build(),
            HttpResponse.BodyHandlers.ofString());
    }
    HttpResponse<String> get(String session) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port +
            "/api/public-service/applications?sessionId=" + session)).GET().build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test void allServicesAreSavedAndIsolatedBySession() throws Exception {
        String session = id();
        String[][] services = {{"resident-registration", "주민등록표 등본 발급"},
            {"moving-in-report", "전입신고"}, {"family-relationship", "가족관계증명서 (일반증명서)"},
            {"tax-payment", "납세증명서 발급"}};
        for (String[] service : services) {
            var response = post(body(id(), session, service[0], service[1]));
            assertEquals(200, response.statusCode(), response.body());
            var result = mapper.readTree(response.body());
            assertTrue(result.get("receiptNo").asText().startsWith("DEMO-"));
            assertEquals(service[1], result.get("name").asText());
        }
        assertEquals(4, mapper.readTree(get(session).body()).size());
        assertEquals(0, mapper.readTree(get(id()).body()).size());
        // Open a separate connection: records are persisted in SQLite, not server memory.
        try (var conn = java.sql.DriverManager.getConnection("jdbc:sqlite:" + DB);
             var statement = conn.prepareStatement("SELECT count(*) FROM public_application WHERE session_id = ?")) {
            statement.setString(1, session);
            try (var rows = statement.executeQuery()) { assertTrue(rows.next()); assertEquals(4, rows.getInt(1)); }
        }
    }
    @Test void retryIsIdempotentAndConflictingPayloadIsRejected() throws Exception {
        String session = id(), request = id();
        String payload = body(request, session, "moving-in-report", "전입신고");
        var first = post(payload);
        assertEquals(200, first.statusCode());
        assertEquals(first.body(), post(payload).body());
        assertEquals(409, post(body(request, session, "tax-payment", "납세증명서 발급")).statusCode());
        assertEquals(409, post(body(request, id(), "moving-in-report", "전입신고")).statusCode());
        assertEquals(1, mapper.readTree(get(session).body()).size());
    }
    @Test void rejectsInvalidServiceNameAndIds() throws Exception {
        String session = id();
        assertEquals(400, post(body(id(), session, "tax-payment", "전입신고")).statusCode());
        assertEquals(400, post(body(id(), session, "family-relationship", "입양관계증명서 (특정증명서)")).statusCode());
        assertEquals(400, post(body("bad", session, "moving-in-report", "전입신고")).statusCode());
        assertEquals(400, get("bad").statusCode());
        assertEquals(0, mapper.readTree(get(session).body()).size());
    }
}
