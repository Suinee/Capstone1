package com.adapti.backend.publicservice;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public-service/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicApplicationController {
    private final PublicApplicationService service;
    public PublicApplicationController(PublicApplicationService service) { this.service = service; }
    @PostMapping
    public PublicApplicationService.Application submit(@RequestBody PublicApplicationService.Request request) {
        return service.submit(request);
    }
    @GetMapping
    public List<PublicApplicationService.Application> list(@RequestParam String sessionId) {
        return service.list(sessionId);
    }
}
