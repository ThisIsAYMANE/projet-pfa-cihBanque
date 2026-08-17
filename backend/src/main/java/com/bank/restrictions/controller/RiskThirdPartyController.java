package com.bank.restrictions.controller;

import com.bank.restrictions.entity.AppUser;
import com.bank.restrictions.entity.RiskThirdParty;
import com.bank.restrictions.service.RiskThirdPartyService;
import com.bank.restrictions.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.bank.restrictions.entity.AuditLog;
import com.bank.restrictions.service.AuditService;

@RestController
@RequestMapping("/api/v1/risk-third-parties")
public class RiskThirdPartyController {

    private final RiskThirdPartyService riskThirdPartyService;
    private final UserService userService;
    private final AuditService auditService;

    public RiskThirdPartyController(RiskThirdPartyService riskThirdPartyService, UserService userService, AuditService auditService) {
        this.riskThirdPartyService = riskThirdPartyService;
        this.userService = userService;
        this.auditService = auditService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_IG', 'ROLE_CONFORMITE_SF', 'ROLE_CONFORMITE_PF', 'ROLE_JURIDIQUE')")
    public ResponseEntity<RiskThirdParty> createDeclaration(@RequestBody RiskThirdParty declaration, @AuthenticationPrincipal Jwt jwt) {
        AppUser user = userService.getOrCreateUserFromJwt(jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(riskThirdPartyService.declareRiskThirdParty(declaration, user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_IG', 'ROLE_CONFORMITE_SF', 'ROLE_CONFORMITE_PF', 'ROLE_JURIDIQUE')")
    public ResponseEntity<RiskThirdParty> updateDeclaration(@PathVariable UUID id, @RequestBody RiskThirdParty newInfo, @AuthenticationPrincipal Jwt jwt) {
        try {
            AppUser user = userService.getOrCreateUserFromJwt(jwt);
            return ResponseEntity.ok(riskThirdPartyService.updateRiskThirdParty(id, newInfo, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/lift")
    @PreAuthorize("hasAnyRole('ROLE_IG', 'ROLE_CONFORMITE_SF', 'ROLE_CONFORMITE_PF', 'ROLE_JURIDIQUE')")
    public ResponseEntity<RiskThirdParty> liftStatus(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        try {
            AppUser user = userService.getOrCreateUserFromJwt(jwt);
            return ResponseEntity.ok(riskThirdPartyService.liftRestrictionStatus(id, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/block")
    @PreAuthorize("hasAnyRole('ROLE_IG', 'ROLE_CONFORMITE_SF', 'ROLE_CONFORMITE_PF', 'ROLE_JURIDIQUE')")
    public ResponseEntity<RiskThirdParty> toggleBlock(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        try {
            AppUser user = userService.getOrCreateUserFromJwt(jwt);
            return ResponseEntity.ok(riskThirdPartyService.toggleBlockRelationship(id, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_IG', 'ROLE_CONFORMITE_SF', 'ROLE_CONFORMITE_PF', 'ROLE_JURIDIQUE', 'ROLE_RESEAU_BPP', 'ROLE_RESEAU_BEI', 'ROLE_B0', 'ROLE_ENGAGEMENT', 'ROLE_RISQUE', 'ROLE_FCT_REGALIENNE')")
    public ResponseEntity<List<RiskThirdParty>> getAll() {
        return ResponseEntity.ok(riskThirdPartyService.getAllRiskThirdParties());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_IG', 'ROLE_CONFORMITE_SF', 'ROLE_CONFORMITE_PF', 'ROLE_JURIDIQUE', 'ROLE_RESEAU_BPP', 'ROLE_RESEAU_BEI', 'ROLE_B0', 'ROLE_ENGAGEMENT', 'ROLE_RISQUE', 'ROLE_FCT_REGALIENNE')")
    public ResponseEntity<RiskThirdParty> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(riskThirdPartyService.getRiskThirdPartyById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ROLE_IG', 'ROLE_CONFORMITE_SF', 'ROLE_CONFORMITE_PF', 'ROLE_JURIDIQUE', 'ROLE_RESEAU_BPP', 'ROLE_RESEAU_BEI', 'ROLE_B0', 'ROLE_ENGAGEMENT', 'ROLE_RISQUE', 'ROLE_FCT_REGALIENNE')")
    public ResponseEntity<List<AuditLog>> getHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(auditService.getHistory(id));
    }
}
