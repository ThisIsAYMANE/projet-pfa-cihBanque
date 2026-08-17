package com.bank.restrictions.service;

import com.bank.restrictions.entity.AppUser;
import com.bank.restrictions.entity.Role;
import com.bank.restrictions.repository.AppUserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final AppUserRepository appUserRepository;

    public UserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }

    public long countUsers() {
        return appUserRepository.count();
    }

    @Transactional
    public AppUser getOrCreateUserFromJwt(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        Optional<AppUser> existingUser = appUserRepository.findByKeycloakId(keycloakId);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        AppUser newUser = new AppUser();
        newUser.setKeycloakId(keycloakId);
        newUser.setUsername(jwt.getClaimAsString("preferred_username"));
        newUser.setFullName(jwt.getClaimAsString("name"));
        newUser.setActive(true);
        newUser.setRole(Role.ROLE_USER);

        return appUserRepository.save(newUser);
    }
}
