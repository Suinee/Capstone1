package com.adapti.backend.hesitation;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/hesitation")
@CrossOrigin(origins = "http://localhost:5173")
public class HesitationLogController {
    private final HesitationLogService service;

    public HesitationLogController(HesitationLogService service) {
        this.service = service;
    }

    public record BatchRequest(List<JsonNode> logs) {}

    @PostMapping("/logs")
    public HesitationLogService.BatchResult save(@RequestBody BatchRequest request) {
        return service.save(request.logs());
    }

    @GetMapping("/sessions/{sessionId}/logs")
    public HesitationLogService.LogPage find(@PathVariable String sessionId,
            @RequestParam(defaultValue = "0") long afterSequence,
            @RequestParam(defaultValue = "1000") int limit) {
        return service.find(sessionId, afterSequence, limit);
    }
}
