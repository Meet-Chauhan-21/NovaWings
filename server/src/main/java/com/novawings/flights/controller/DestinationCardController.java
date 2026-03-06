package com.novawings.flights.controller;

import com.novawings.flights.model.DestinationCard;
import com.novawings.flights.service.DestinationCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/destinations")
public class DestinationCardController {

    @Autowired
    private DestinationCardService service;

    // ── PUBLIC ────────────────────────────────────

    // GET /api/destinations — all active cards
    @GetMapping
    public ResponseEntity<List<DestinationCard>> getAll() {
        return ResponseEntity.ok(service.getAllActive());
    }

    // GET /api/destinations/featured — featured only
    @GetMapping("/featured")
    public ResponseEntity<List<DestinationCard>> getFeatured() {
        return ResponseEntity.ok(service.getFeatured());
    }

    // ── ADMIN ─────────────────────────────────────

    // GET /api/destinations/all — all including inactive
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DestinationCard>> getAllAdmin() {
        return ResponseEntity.ok(service.getAll());
    }

    // POST /api/destinations
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationCard> create(
            @RequestBody DestinationCard card,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                service.create(card, auth.getName())
        );
    }

    // PUT /api/destinations/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationCard> update(
            @PathVariable String id,
            @RequestBody DestinationCard card,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                service.update(id, card, auth.getName())
        );
    }

    // DELETE /api/destinations/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/destinations/{id}/toggle
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationCard> toggle(
            @PathVariable String id,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                service.toggleActive(id, auth.getName())
        );
    }

    // PATCH /api/destinations/{id}/feature
    @PatchMapping("/{id}/feature")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationCard> feature(
            @PathVariable String id,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                service.toggleFeatured(id, auth.getName())
        );
    }

    // PATCH /api/destinations/{id}/order
    @PatchMapping("/{id}/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinationCard> updateOrder(
            @PathVariable String id,
            @RequestBody Map<String, Integer> body,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                service.updateOrder(id, body.get("order"), auth.getName())
        );
    }
}
