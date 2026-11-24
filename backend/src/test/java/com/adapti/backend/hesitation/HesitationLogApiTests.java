package com.adapti.backend.hesitation;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HesitationLogApiTests {
    private static final Path DB;
    static {
        try { DB = Files.createTempDirectory("hesitation-test-").resolve("logs.sqlite"); }
        catch (Exception e) { throw new ExceptionInInitializerError(e); }
    }
    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:sqlite:" + DB);
    }
    @Value("${local.server.port}") int port;
    private final HttpClient client = HttpClient.newHttpClient();
    private final JsonMapper mapper = new JsonMapper();

    private String log(String session, int sequence) {
        return """
                {"logId":"%s:log:%d","sessionId":"%s","screenId":null,
                 "screenVisitId":null,"type":"measurement_state","activeTime":0.5,
                 "recordedAt":1793000000000,"ruleVersion":"initial-1.0",
                 "reason":"documentHidden","paused":true}
                """.formatted(session, sequence, session);
    }
    private HttpResponse<String> post(String logs) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/hesitation/logs"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"logs\":" + logs + "}"))
                .build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpResponse<String> get(String session, String query) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port
                + "/api/hesitation/sessions/" + session + "/logs" + query)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    }
    private JsonNode json(HttpResponse<String> response) { return mapper.readTree(response.body()); }

    @Test void savesOriginalFieldsAndDeduplicatesRetries() throws Exception {
        String session = UUID.randomUUID().toString();
        String entry = log(session, 1);
        var first = post("[" + entry + "," + entry + "]");
        assertEquals(200, first.statusCode());
        assertEquals(1, json(first).get("inserted").intValue());
        assertEquals(1, json(first).get("duplicates").intValue());
        assertEquals(0, json(post("[" + entry + "]")).get("inserted").intValue());
        assertEquals(mapper.readTree(entry), json(get(session, "")).get("logs").get(0));
    }
    @Test void preservesExperimentConditionsAcrossStorageAndRetries() throws Exception {
        for (String mode : new String[]{"baseline", "adaptive"}) {
            String session = UUID.randomUUID().toString();
            String experiment = """
                {"runId":"%s","mode":"%s","service":"kiosk",
                 "automaticHelp":%s,"manualHelp":true,
                 "policyVersion":"automatic-help-ab-1.0","startedAt":1793000000000}
                """.formatted(UUID.randomUUID(), mode, mode.equals("adaptive"));
            String entry = log(session, 1).replace("\"paused\":true", "\"paused\":true,\"experiment\":" + experiment);
            assertEquals(200, post("[" + entry + "]").statusCode());
            assertEquals(1, json(post("[" + entry + "]")).get("duplicates").intValue());
            assertEquals(mapper.readTree(experiment), json(get(session, "")).get("logs").get(0).get("experiment"));
        }
    }
    @Test void taskResultsUseLatestSequenceAndSeparatePractice() throws Exception {
        String session = UUID.randomUUID().toString();
        String attempt = UUID.randomUUID().toString();
        String start = log(session, 1).replace("measurement_state", "behavior")
            .replace("\"paused\":true", """
              "paused":true,"experiment":{"mode":"baseline","dataset":"practice"},
              "event":{"type":"task_attempt_snapshot","attempt":{"attemptId":"%s",
              "taskCode":"test-task","status":"in_progress","durationMs":0,"clicks":0,"errors":0,
              "automaticHelpCount":0,"manualHelpCount":0}}
              """.formatted(attempt));
        String end = start.replace(":log:1", ":log:2").replace("in_progress", "completed").replace("\"durationMs\":0", "\"durationMs\":2000");
        assertEquals(200, post("[" + end + "," + start + "," + end + "]").statusCode());
        var response = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/results/summary?dataset=practice")).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(200, response.statusCode());
        JsonNode row = null;
        for (JsonNode item : json(response)) if (item.get("taskCode").asText().equals("test-task")) row = item;
        assertNotNull(row); assertEquals(1, row.get("started").intValue());
        assertEquals(1, row.get("completed").intValue()); assertEquals(2000, row.get("durationMs").doubleValue());
        var study = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/results/summary?dataset=study")).GET().build(), HttpResponse.BodyHandlers.ofString());
        for (JsonNode item : json(study)) assertNotEquals("test-task", item.get("taskCode").asText());
    }
    @Test void trendsReturnRecentCompletedAttemptsPerModeInChronologicalOrder() throws Exception {
        String session = UUID.randomUUID().toString();
        var entries = new java.util.ArrayList<String>();
        for (int i = 0; i < 38; i++) {
            String entry = log(session, i + 1).replace("measurement_state", "behavior")
                .replace("\"paused\":true", """
                  "paused":true,"experiment":{"mode":"%s","dataset":"%s"},
                  "event":{"type":"task_attempt_snapshot","attempt":{"attemptId":"%s",
                  "taskCode":"kiosk-order","status":"%s","durationMs":%d,"errors":%d,"endedAt":%d}}
                  """.formatted(i == 35 ? "adaptive" : "baseline", i == 37 ? "study" : "practice",
                      UUID.randomUUID(), i == 36 ? "interrupted" : "completed", i * 1000, i, i + 100));
            entries.add(entry);
        }
        java.util.Collections.reverse(entries);
        assertEquals(200, post("[" + String.join(",", entries) + "," + entries.get(0) + "]").statusCode());
        var response = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port +
            "/api/results/trends?dataset=practice&taskCode=kiosk-order")).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(200, response.statusCode());
        assertEquals(31, json(response).size());
        int baseline = 0;
        for (JsonNode row : json(response)) {
            if (row.get("mode").asText().equals("baseline")) {
                assertEquals((baseline + 5) * 1000, row.get("durationMs").intValue());
                baseline++;
            } else assertEquals(35000, row.get("durationMs").intValue());
        }
        assertEquals(30, baseline);
        var empty = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port +
            "/api/results/trends?dataset=practice&taskCode=tax-payment")).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(0, json(empty).size());
        var invalid = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port +
            "/api/results/trends?dataset=invalid&taskCode=kiosk-order")).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(400, invalid.statusCode());
    }
    @Test void conflictRollsBackWholeBatch() throws Exception {
        String session = UUID.randomUUID().toString();
        String entry = log(session, 1);
        assertEquals(200, post("[" + entry + "]").statusCode());
        assertEquals(409, post("[" + log(session, 2) + ","
                + entry.replace("\"paused\":true", "\"paused\":false") + "]").statusCode());
        assertEquals(1, json(get(session, "")).get("logs").size());
    }
    @Test void validatesEntireBatchBeforeSaving() throws Exception {
        String session = UUID.randomUUID().toString();
        assertEquals(400, post("[" + log(session, 1) + ","
                + log(session, 2).replace("\"activeTime\":0.5", "\"activeTime\":-1") + "]").statusCode());
        assertEquals(0, json(get(session, "")).get("logs").size());
        assertEquals(400, post("[]").statusCode());
        assertEquals(400, post("null").statusCode());
        assertEquals(400, post("[null]").statusCode());
        assertEquals(400, get(session, "?limit=1001").statusCode());
        assertEquals(400, get(session, "?afterSequence=-1").statusCode());
    }
    @Test void ordersNumericallyAndIsolatesSessionsWithPagination() throws Exception {
        String session = UUID.randomUUID().toString();
        String other = UUID.randomUUID().toString();
        assertEquals(200, post("[" + log(session, 10) + "," + log(session, 2) + ","
                + log(other, 1) + "]").statusCode());
        JsonNode page = json(get(session, "?limit=1"));
        assertEquals(session + ":log:2", page.get("logs").get(0).get("logId").asText());
        assertTrue(page.get("hasMore").booleanValue());
        assertEquals(2, page.get("nextAfterSequence").longValue());
        JsonNode next = json(get(session, "?limit=1&afterSequence=2"));
        assertEquals(session + ":log:10", next.get("logs").get(0).get("logId").asText());
        assertFalse(next.get("hasMore").booleanValue());
        assertTrue(next.get("nextAfterSequence").isNull());
    }
    @Test void rejectsInvalidIdsAndPreservesNestedBehavior() throws Exception {
        String session = UUID.randomUUID().toString();
        String entry = log(session, 1);
        assertEquals(400, post("[" + entry.replace(session + ":log:1", session + ":log:01") + "]").statusCode());
        assertEquals(400, post("[" + entry.replace("measurement_state", "unknown") + "]").statusCode());
        String behavior = entry.replace("measurement_state", "behavior")
                .replace("\"screenId\":null", "\"screenId\":\"KIOSK_SIDE\"")
                .replace("\"screenVisitId\":null", "\"screenVisitId\":\"" + UUID.randomUUID() + "\"")
                .replace("\"reason\":\"documentHidden\"", "\"event\":{\"type\":\"click\",\"targetId\":\"side-next\"}");
        assertEquals(200, post("[" + behavior + "]").statusCode());
        assertEquals(mapper.readTree(behavior), json(get(session, "")).get("logs").get(0));
    }
}
