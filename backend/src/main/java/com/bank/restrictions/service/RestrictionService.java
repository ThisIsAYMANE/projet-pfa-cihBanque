package com.bank.restrictions.service;

import com.bank.restrictions.entity.RestrictedAccount;
import com.bank.restrictions.entity.Restriction;
import com.bank.restrictions.entity.RestrictionStatus;
import com.bank.restrictions.repository.RestrictedAccountRepository;
import com.bank.restrictions.repository.RestrictionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RestrictionService {
    private final RestrictionRepository restrictionRepository;
    private final RestrictedAccountRepository restrictedAccountRepository;
    private final AuditService auditService;

    public RestrictionService(RestrictionRepository restrictionRepository, RestrictedAccountRepository restrictedAccountRepository, AuditService auditService) {
        this.restrictionRepository = restrictionRepository;
        this.restrictedAccountRepository = restrictedAccountRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Restriction createRestriction(Restriction restriction, UUID userId) {
        if (restriction.getStatus() == RestrictionStatus.ACTIVE || restriction.getStatus() == RestrictionStatus.CONFIRMED) {
            if (restrictionRepository.existsByAccountNumberAndStatus(restriction.getAccountNumber(), RestrictionStatus.ACTIVE)) {
                throw new IllegalArgumentException("Active restriction already exists for this account number");
            }
        }

        // Maintain ERD integrity
        Optional<RestrictedAccount> accountOpt = restrictedAccountRepository.findByAccountNumber(restriction.getAccountNumber());
        if (accountOpt.isEmpty()) {
            RestrictedAccount newAccount = new RestrictedAccount();
            newAccount.setAccountNumber(restriction.getAccountNumber());
            newAccount.setCreatedAt(LocalDateTime.now());
            restrictedAccountRepository.save(newAccount);
        }

        restriction.setCreatedBy(userId);
        restriction.setCreatedAt(LocalDateTime.now());
        if (restriction.getStatus() == null) {
            restriction.setStatus(RestrictionStatus.DRAFT);
        }
        
        Restriction saved = restrictionRepository.save(restriction);
        auditService.logAction("CREATE", "Restriction", saved.getId(), userId, null, saved.getStatus().name());
        return saved;
    }

    public List<Restriction> getMyRestrictions(UUID userId) {
        return restrictionRepository.findByCreatedBy(userId);
    }

    public Optional<Restriction> checkActiveRestriction(String accountNumber) {
        List<Restriction> active = restrictionRepository.findByAccountNumberAndStatus(accountNumber, RestrictionStatus.ACTIVE);
        if (active.isEmpty()) {
            active = restrictionRepository.findByAccountNumberAndStatus(accountNumber, RestrictionStatus.CONFIRMED);
        }
        auditService.logAction("API_CHECK", "Restriction", null, null, null, "Checked account " + accountNumber);
        return active.stream().findFirst();
    }

    public List<Restriction> searchRestrictions(String query) {
        if (query == null || query.isBlank()) {
            return restrictionRepository.findAll();
        }
        return restrictionRepository.findByAccountNumberContainingIgnoreCaseOrReasonContainingIgnoreCase(query, query);
    }

    @Transactional
    public Restriction updateRestriction(UUID id, Restriction newRest, UUID userId) {
        Restriction existing = restrictionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        String beforeState = "Status: " + existing.getStatus() + ", Reason: " + existing.getReason() + ", EndDate: " + existing.getEndDate();
        
        existing.setReason(newRest.getReason());
        existing.setEndDate(newRest.getEndDate());
        existing.setRestrictionTypeId(newRest.getRestrictionTypeId());
        
        // Handle Draft -> Confirmed transition
        if (existing.getStatus() == RestrictionStatus.DRAFT && newRest.getStatus() == RestrictionStatus.CONFIRMED) {
            existing.setStatus(RestrictionStatus.CONFIRMED);
        }

        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(userId);

        String afterState = "Status: " + existing.getStatus() + ", Reason: " + existing.getReason() + ", EndDate: " + existing.getEndDate();
        auditService.logAction("UPDATE", "Restriction", existing.getId(), userId, beforeState, afterState);
        return restrictionRepository.save(existing);
    }

    @Transactional
    public void deactivateRestriction(UUID id, UUID userId) {
        Restriction existing = restrictionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        String beforeState = existing.getStatus().name();
        existing.setStatus(RestrictionStatus.INACTIVE);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(userId);

        auditService.logAction("DEACTIVATE", "Restriction", existing.getId(), userId, beforeState, "INACTIVE");
        restrictionRepository.save(existing);
    }

    public long countActiveRestrictions() {
        // Technically CONFIRMED and ACTIVE mean the same thing for stats
        return restrictionRepository.countByStatus(RestrictionStatus.CONFIRMED) + restrictionRepository.countByStatus(RestrictionStatus.ACTIVE);
    }

    public long countProtectedAccounts() {
        return restrictionRepository.countDistinctProtectedAccounts(RestrictionStatus.CONFIRMED) + restrictionRepository.countDistinctProtectedAccounts(RestrictionStatus.ACTIVE);
    }
}
