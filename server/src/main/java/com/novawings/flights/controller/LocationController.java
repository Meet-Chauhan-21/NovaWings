package com.novawings.flights.controller;

import com.novawings.flights.model.Location;
import com.novawings.flights.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    // ── PUBLIC endpoints (no auth needed) ────────

    /** Get all active locations for combobox */
    @GetMapping
    public ResponseEntity<List<Location>> getAll() {
        return ResponseEntity.ok(locationService.getAllActiveLocations());
    }

    /** Search locations for combobox typing */
    @GetMapping("/search")
    public ResponseEntity<List<Location>> search(
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(locationService.searchLocations(q));
    }

    /** Get explore page cities */
    @GetMapping("/explore")
    public ResponseEntity<List<Location>> getExploreCities() {
        return ResponseEntity.ok(locationService.getExploreCities());
    }

    /** Get home page cities */
    @GetMapping("/home")
    public ResponseEntity<List<Location>> getHomeCities() {
        return ResponseEntity.ok(locationService.getHomeCities());
    }

    // ── ADMIN endpoints ───────────────────────────

    /** Get ALL locations including inactive */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Location>> getAllAdmin() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    /** Create new location */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Location> create(
            @RequestBody Location location,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                locationService.createLocation(location, auth.getName())
        );
    }

    /** Update location */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Location> update(
            @PathVariable String id,
            @RequestBody Location location,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                locationService.updateLocation(id, location, auth.getName())
        );
    }

    /** Delete location */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }

    /** Toggle active/inactive */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Location> toggle(
            @PathVariable String id,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                locationService.toggleActive(id, auth.getName())
        );
    }

    /** Refresh flight counts for all cities */
    @PostMapping("/refresh-counts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> refreshCounts() {
        locationService.refreshAllFlightCounts();
        return ResponseEntity.ok("Flight counts refreshed successfully");
    }
}
