package com.bank.restrictions.service;

import com.bank.restrictions.entity.AuditLog;
import com.bank.restrictions.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String action, String entityType, UUID entityId, UUID performedBy, String beforeState, String afterState) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setPerformedBy(performedBy);
        log.setTimestamp(LocalDateTime.now());
        log.setBeforeState(beforeState);
        log.setAfterState(afterState);
        auditLogRepository.save(log);
    }

    public java.util.List<AuditLog> getHistory(UUID entityId) {
        return auditLogRepository.findByEntityIdOrderByTimestampDesc(entityId);
    }
}
