package com.bank.restrictions.repository;

import com.bank.restrictions.entity.RestrictedAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestrictedAccountRepository extends JpaRepository<RestrictedAccount, UUID> {
    Optional<RestrictedAccount> findByAccountNumber(String accountNumber);
}
