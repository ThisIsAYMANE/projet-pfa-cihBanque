package com.bank.restrictions.repository;

import com.bank.restrictions.entity.RiskThirdParty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RiskThirdPartyRepository extends JpaRepository<RiskThirdParty, UUID> {
}
