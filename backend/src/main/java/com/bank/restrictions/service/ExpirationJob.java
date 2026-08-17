package com.bank.restrictions.service;

import com.bank.restrictions.entity.Restriction;
import com.bank.restrictions.entity.RestrictionStatus;
import com.bank.restrictions.repository.RestrictionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpirationJob {
    private final RestrictionRepository restrictionRepository;
    private final AuditService auditService;

    public ExpirationJob(RestrictionRepository restrictionRepository, AuditService auditService) {
        this.restrictionRepository = restrictionRepository;
        this.auditService = auditService;
    }

    @Scheduled(cron = "0 0 0 * * ?") // Daily at midnight
    @Transactional
    public void resolveExpiredRestrictions() {
        List<Restriction> activeRestrictions = restrictionRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Restriction r : activeRestrictions) {
            if ((r.getStatus() == RestrictionStatus.ACTIVE || r.getStatus() == RestrictionStatus.CONFIRMED) 
                && "AUTO".equals(r.getExpiryMode()) 
                && r.getEndDate() != null 
                && r.getEndDate().isBefore(today)) {
                
                String beforeState = r.getStatus().name();
                r.setStatus(RestrictionStatus.RESOLVED);
                restrictionRepository.save(r);
                
                auditService.logAction("AUTO_RESOLVE", "Restriction", r.getId(), null, beforeState, "RESOLVED");
            }
        }
    }
}
