package com.bank.restrictions.controller;

import com.bank.restrictions.entity.AppUser;
import com.bank.restrictions.entity.Restriction;
import com.bank.restrictions.service.RestrictionService;
import com.bank.restrictions.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restrictions")
public class RestrictionController {
    private final RestrictionService restrictionService;
    private final UserService userService;

    public RestrictionController(RestrictionService restrictionService, UserService userService) {
        this.restrictionService = restrictionService;
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> createRestriction(@RequestBody Restriction restriction, @AuthenticationPrincipal Jwt jwt) {
        try {
            AppUser user = userService.getOrCreateUserFromJwt(jwt);
            Restriction created = restrictionService.createRestriction(restriction, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<Restriction>> getMyRestrictions(@AuthenticationPrincipal Jwt jwt) {
        AppUser user = userService.getOrCreateUserFromJwt(jwt);
        return ResponseEntity.ok(restrictionService.getMyRestrictions(user.getId()));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_VIEWER')")
    public ResponseEntity<List<Restriction>> searchRestrictions(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(restrictionService.searchRestrictions(query));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> updateRestriction(@PathVariable UUID id, @RequestBody Restriction restriction, @AuthenticationPrincipal Jwt jwt) {
        try {
            AppUser user = userService.getOrCreateUserFromJwt(jwt);
            Restriction updated = restrictionService.updateRestriction(id, restriction, user.getId());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deactivateRestriction(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        try {
            AppUser user = userService.getOrCreateUserFromJwt(jwt);
            restrictionService.deactivateRestriction(id, user.getId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
