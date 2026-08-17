package com.bank.restrictions.service;

import com.bank.restrictions.entity.AppUser;
import com.bank.restrictions.entity.RiskThirdParty;
import com.bank.restrictions.entity.RiskThirdPartyStatus;
import com.bank.restrictions.repository.RiskThirdPartyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RiskThirdPartyService {

    private final RiskThirdPartyRepository repository;
    private final AuditService auditService;

    public RiskThirdPartyService(RiskThirdPartyRepository repository,
                                 AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    private String getIdentifierForAudit(RiskThirdParty ind) {
        if (ind.isCihClient()) {
            return ind.getIdentifierType() + " : " + (ind.getIdentifier() != null ? ind.getIdentifier() : "-");
        } else {
            return ind.getCin() != null ? ind.getCin() : "-";
        }
    }

    @Transactional
    public RiskThirdParty declareRiskThirdParty(RiskThirdParty declaration, AppUser user) {
        declaration.setCreatedBy(user.getId());
        declaration.setCreatedAt(LocalDateTime.now());
        declaration.setStatus(RiskThirdPartyStatus.ACTIVE);

        RiskThirdParty saved = repository.save(declaration);

        auditService.logAction("CREATE_IND", "RiskThirdParty", saved.getId(), user.getId(), user.getUsername(), getIdentifierForAudit(saved), null, "Created RiskThirdParty declaration");
        return saved;
    }

    @Transactional
    public RiskThirdParty updateRiskThirdParty(UUID id, RiskThirdParty newInfo, AppUser user) {
        RiskThirdParty existing = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
        String before = "Reason: " + existing.getDeclarationReason();
        
        existing.setIdentifierType(newInfo.getIdentifierType());
        existing.setIdentifier(newInfo.getIdentifier());
        existing.setFirstName(newInfo.getFirstName());
        existing.setLastName(newInfo.getLastName());
        existing.setCin(newInfo.getCin());
        existing.setPassport(newInfo.getPassport());
        existing.setPhone(newInfo.getPhone());
        existing.setEmail(newInfo.getEmail());
        existing.setAddress(newInfo.getAddress());
        existing.setDeclarationReason(newInfo.getDeclarationReason());
        
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(user.getId());

        RiskThirdParty saved = repository.save(existing);
        
        auditService.logAction("UPDATE_IND", "RiskThirdParty", saved.getId(), user.getId(), user.getUsername(), getIdentifierForAudit(saved), before, "Updated RiskThirdParty data");
        return saved;
    }

    @Transactional
    public RiskThirdParty liftRestrictionStatus(UUID id, AppUser user) {
        RiskThirdParty existing = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
        existing.setStatus(RiskThirdPartyStatus.LIFTED);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(user.getId());

        RiskThirdParty saved = repository.save(existing);

        auditService.logAction("LIFT_IND", "RiskThirdParty", saved.getId(), user.getId(), user.getUsername(), getIdentifierForAudit(saved), "ACTIVE", "LIFTED");
        return saved;
    }

    @Transactional
    public RiskThirdParty toggleBlockRelationship(UUID id, AppUser user) {
        RiskThirdParty existing = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
        boolean wasBlocked = existing.isBlockRelationship();
        existing.setBlockRelationship(!wasBlocked);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(user.getId());

        RiskThirdParty saved = repository.save(existing);
        
        auditService.logAction("TOGGLE_BLOCK_IND", "RiskThirdParty", saved.getId(), user.getId(), user.getUsername(), getIdentifierForAudit(saved), "Block: " + wasBlocked, "Block: " + saved.isBlockRelationship());
        return saved;
    }

    @Transactional
    public RiskThirdParty terminateRelationship(UUID id, AppUser user) {
        RiskThirdParty existing = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
        existing.setStatus(RiskThirdPartyStatus.TERMINATED);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(user.getId());

        RiskThirdParty saved = repository.save(existing);
        
        auditService.logAction("TERMINATE_IND", "RiskThirdParty", saved.getId(), user.getId(), user.getUsername(), getIdentifierForAudit(saved), "Status: " + existing.getStatus(), "Status: TERMINATED");
        return saved;
    }

    public List<RiskThirdParty> getAllRiskThirdParties() {
        return repository.findAll();
    }

    public RiskThirdParty getRiskThirdPartyById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
    }
}
