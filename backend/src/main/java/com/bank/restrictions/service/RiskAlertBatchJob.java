package com.bank.restrictions.service;

import com.bank.restrictions.entity.Alert;
import com.bank.restrictions.entity.AlertStatus;
import com.bank.restrictions.entity.AlertType;
import com.bank.restrictions.entity.RiskThirdParty;
import com.bank.restrictions.repository.AlertRepository;
import com.bank.restrictions.repository.RiskThirdPartyRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RiskAlertBatchJob {

    private final RiskThirdPartyRepository riskThirdPartyRepository;
    private final AlertRepository alertRepository;

    public RiskAlertBatchJob(RiskThirdPartyRepository riskThirdPartyRepository, AlertRepository alertRepository) {
        this.riskThirdPartyRepository = riskThirdPartyRepository;
        this.alertRepository = alertRepository;
    }

    // Run every night at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    public void scanForAlerts() {
        // This is a placeholder for the actual business logic that would query
        // the core banking / transaction system for new operations from the current day.
        List<RiskThirdParty> restrictedParties = riskThirdPartyRepository.findAll();

        System.out.println("RiskAlertBatchJob started at " + LocalDateTime.now() + ". Scanning " + restrictedParties.size() + " INDs against today's operations.");

        // Simulate logic:
        // for (RiskThirdParty ind : restrictedParties) {
        //     boolean hasSuspiciousOperation = operationService.hasOperationsToday(ind.getCin());
        //     if (hasSuspiciousOperation) {
        //         Alert alert = new Alert();
        //         alert.setType(AlertType.POSITIVE_MATCH);
        //         alert.setDescription("Match found in daily transactions for IND: " + ind.getCin());
        //         alert.setRelatedEntityId(ind.getId());
        //         alert.setStatus(AlertStatus.PENDING);
        //         alert.setCreatedAt(LocalDateTime.now());
        //         alertRepository.save(alert);
        //     }
        // }

        System.out.println("RiskAlertBatchJob completed at " + LocalDateTime.now());
    }
}
