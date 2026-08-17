package com.bank.restrictions.service;

import com.bank.restrictions.entity.Restriction;
import com.bank.restrictions.entity.RestrictionType;
import com.bank.restrictions.entity.RiskThirdParty;
import com.bank.restrictions.entity.RiskThirdPartyStatus;
import com.bank.restrictions.repository.RestrictionTypeRepository;
import com.bank.restrictions.repository.RiskThirdPartyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RiskThirdPartyService {

    private final RiskThirdPartyRepository repository;
    private final RestrictionTypeRepository restrictionTypeRepository;
    private final RestrictionService restrictionService;
    private final AuditService auditService;

    public RiskThirdPartyService(RiskThirdPartyRepository repository,
                                 RestrictionTypeRepository restrictionTypeRepository,
                                 RestrictionService restrictionService,
                                 AuditService auditService) {
        this.repository = repository;
        this.restrictionTypeRepository = restrictionTypeRepository;
        this.restrictionService = restrictionService;
        this.auditService = auditService;
    }

    @Transactional
    public RiskThirdParty declareRiskThirdParty(RiskThirdParty declaration, UUID userId) {
        declaration.setCreatedBy(userId);
        declaration.setCreatedAt(LocalDateTime.now());
        declaration.setStatus(RiskThirdPartyStatus.ACTIVE);

        RiskThirdParty saved = repository.save(declaration);

        if (saved.isBlockRelationship() && saved.isCihClient() && saved.getIdentifier() != null) {
            applyBlockAllRestriction(saved.getIdentifier(), userId);
        }

        auditService.logAction("CREATE_IND", "RiskThirdParty", saved.getId(), userId, null, "Created RiskThirdParty declaration");
        return saved;
    }

    @Transactional
    public RiskThirdParty updateRiskThirdParty(UUID id, RiskThirdParty newInfo, UUID userId) {
        RiskThirdParty existing = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
        String before = "Reason: " + existing.getDeclarationReason();
        
        existing.setFirstName(newInfo.getFirstName());
        existing.setLastName(newInfo.getLastName());
        existing.setCin(newInfo.getCin());
        existing.setPassport(newInfo.getPassport());
        existing.setPhone(newInfo.getPhone());
        existing.setEmail(newInfo.getEmail());
        existing.setAddress(newInfo.getAddress());
        existing.setDeclarationReason(newInfo.getDeclarationReason());
        
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(userId);

        RiskThirdParty saved = repository.save(existing);
        
        auditService.logAction("UPDATE_IND", "RiskThirdParty", saved.getId(), userId, before, "Updated RiskThirdParty data");
        return saved;
    }

    @Transactional
    public RiskThirdParty liftRestrictionStatus(UUID id, UUID userId) {
        RiskThirdParty existing = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
        existing.setStatus(RiskThirdPartyStatus.LIFTED);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(userId);

        RiskThirdParty saved = repository.save(existing);

        auditService.logAction("LIFT_IND", "RiskThirdParty", saved.getId(), userId, "ACTIVE", "LIFTED");
        return saved;
    }

    @Transactional
    public RiskThirdParty toggleBlockRelationship(UUID id, UUID userId) {
        RiskThirdParty existing = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
        boolean wasBlocked = existing.isBlockRelationship();
        existing.setBlockRelationship(!wasBlocked);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(userId);

        RiskThirdParty saved = repository.save(existing);

        if (saved.isBlockRelationship() && saved.isCihClient() && saved.getIdentifier() != null) {
            applyBlockAllRestriction(saved.getIdentifier(), userId);
        }
        
        auditService.logAction("TOGGLE_BLOCK_IND", "RiskThirdParty", saved.getId(), userId, "Block: " + wasBlocked, "Block: " + saved.isBlockRelationship());
        return saved;
    }

    private void applyBlockAllRestriction(String identifier, UUID userId) {
        Optional<RestrictionType> blockAllOpt = restrictionTypeRepository.findByLabel("BLOCK_ALL");
        if (blockAllOpt.isEmpty()) {
             blockAllOpt = restrictionTypeRepository.findByLabel("Gel de fonds");
        }
        
        if (blockAllOpt.isPresent()) {
            Restriction restriction = new Restriction();
            restriction.setAccountNumber(identifier);
            restriction.setRestrictionTypeId(blockAllOpt.get().getId());
            restriction.setReason("Auto-blocked via IND Declaration");
            try {
                restrictionService.createRestriction(restriction, userId);
            } catch (IllegalArgumentException e) {
                // Ignore if an active restriction already exists
            }
        }
    }

    @Transactional
    public RiskThirdParty terminateRelationship(UUID id, UUID userId) {
        RiskThirdParty existing = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("RiskThirdParty not found"));
        existing.setStatus(RiskThirdPartyStatus.TERMINATED);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(userId);

        RiskThirdParty saved = repository.save(existing);
        
        auditService.logAction("TERMINATE_IND", "RiskThirdParty", saved.getId(), userId, "Status: " + existing.getStatus(), "Status: TERMINATED");
        return saved;
    }

    public List<RiskThirdParty> getAllRiskThirdParties() {
        return repository.findAll();
    }
}
