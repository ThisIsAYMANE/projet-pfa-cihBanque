package com.bank.restrictions.repository;

import com.bank.restrictions.entity.RestrictionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestrictionTypeRepository extends JpaRepository<RestrictionType, UUID> {
    Optional<RestrictionType> findByLabel(String label);
}
