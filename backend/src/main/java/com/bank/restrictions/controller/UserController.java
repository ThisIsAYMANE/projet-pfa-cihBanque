package com.bank.restrictions.controller;

import com.bank.restrictions.entity.AppUser;
import com.bank.restrictions.entity.Role;
import com.bank.restrictions.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class UserController {
    private final AppUserRepository appUserRepository;

    public UserController(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @GetMapping
    public ResponseEntity<List<AppUser>> getAllUsers() {
        return ResponseEntity.ok(appUserRepository.findAll());
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable UUID id, @RequestBody AppUser userUpdate) {
        AppUser existing = appUserRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        existing.setRole(userUpdate.getRole());
        return ResponseEntity.ok(appUserRepository.save(existing));
    }
}
