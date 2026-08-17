package com.bank.restrictions.controller;

import com.bank.restrictions.entity.Alert;
import com.bank.restrictions.entity.AlertStatus;
import com.bank.restrictions.entity.RiskThirdParty;
import com.bank.restrictions.repository.AlertRepository;
import com.bank.restrictions.service.RiskThirdPartyService;
import com.bank.restrictions.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_VIEWER')")
public class DashboardController {

    private final UserService userService;
    private final RiskThirdPartyService riskThirdPartyService;
    private final AlertRepository alertRepository;

    public DashboardController(UserService userService, RiskThirdPartyService riskThirdPartyService, AlertRepository alertRepository) {
        this.userService = userService;
        this.riskThirdPartyService = riskThirdPartyService;
        this.alertRepository = alertRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("activeUsers", userService.countUsers());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/risk-third-parties")
    public ResponseEntity<List<RiskThirdParty>> getDashboardRiskThirdParties() {
        return ResponseEntity.ok(riskThirdPartyService.getAllRiskThirdParties());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<Alert>> getDashboardAlerts() {
        return ResponseEntity.ok(alertRepository.findAll());
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable UUID id, @RequestParam String action, @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        return alertRepository.findById(id).map(alert -> {
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setUpdatedAt(java.time.LocalDateTime.now());
            
            if ("TERMINATE".equalsIgnoreCase(action) && alert.getRelatedEntityId() != null) {
                com.bank.restrictions.entity.AppUser user = userService.getOrCreateUserFromJwt(jwt);
                riskThirdPartyService.terminateRelationship(alert.getRelatedEntityId(), user);
            } else if ("BLOCK".equalsIgnoreCase(action) && alert.getRelatedEntityId() != null) {
                com.bank.restrictions.entity.AppUser user = userService.getOrCreateUserFromJwt(jwt);
                riskThirdPartyService.toggleBlockRelationship(alert.getRelatedEntityId(), user);
            }

            alertRepository.save(alert);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
