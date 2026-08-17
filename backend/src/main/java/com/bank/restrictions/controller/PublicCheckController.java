package com.bank.restrictions.controller;

import com.bank.restrictions.entity.Restriction;
import com.bank.restrictions.service.RestrictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/restrictions/check")
public class PublicCheckController {
    private final RestrictionService restrictionService;

    public PublicCheckController(RestrictionService restrictionService) {
        this.restrictionService = restrictionService;
    }

    @GetMapping
    public ResponseEntity<?> checkRestriction(@RequestParam String accountNumber) {
        Optional<Restriction> active = restrictionService.checkActiveRestriction(accountNumber);
        Map<String, Object> response = new HashMap<>();
        if (active.isPresent()) {
            Restriction res = active.get();
            response.put("restricted", true);
            response.put("type", res.getRestrictionTypeId());
            response.put("reason", res.getReason());
            response.put("startDate", res.getStartDate());
            response.put("endDate", res.getEndDate());
        } else {
            response.put("restricted", false);
        }
        return ResponseEntity.ok(response);
    }
}
