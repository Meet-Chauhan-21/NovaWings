package com.novawings.flights.controller;

import com.novawings.flights.model.HomeConfig;
import com.novawings.flights.service.HomeConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeConfigController {

    private final HomeConfigService homeConfigService;

    @GetMapping("/config")
    public ResponseEntity<HomeConfig> getConfig() {
        return ResponseEntity.ok(homeConfigService.getConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomeConfig> updateConfig(
            @RequestBody HomeConfig config,
            Authentication auth) {
        HomeConfig updated = homeConfigService.updateConfig(config, auth.getName());
        return ResponseEntity.ok(updated);
    }
}
