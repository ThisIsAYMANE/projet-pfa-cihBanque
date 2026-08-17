package com.bank.restrictions.repository;

import com.bank.restrictions.entity.Restriction;
import com.bank.restrictions.entity.RestrictionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestrictionRepository extends JpaRepository<Restriction, UUID> {
    List<Restriction> findByAccountNumberAndStatus(String accountNumber, RestrictionStatus status);
    List<Restriction> findByCreatedBy(UUID createdBy);
    boolean existsByAccountNumberAndStatus(String accountNumber, RestrictionStatus status);
    
    long countByStatus(RestrictionStatus status);
    
    @Query("SELECT COUNT(DISTINCT r.accountNumber) FROM Restriction r WHERE r.status = :status")
    long countDistinctProtectedAccounts(@Param("status") RestrictionStatus status);

    List<Restriction> findByAccountNumberContainingIgnoreCaseOrReasonContainingIgnoreCase(String account, String reason);
}
