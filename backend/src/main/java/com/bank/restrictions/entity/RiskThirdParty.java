package com.bank.restrictions.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "RISK_THIRD_PARTY")
public class RiskThirdParty {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Saisie identifiants Tiers (For clients)
    private String identifier;

    // Rajout d’indicateur auto. Client CIH O/N
    @Column(nullable = false)
    private boolean isCihClient;

    // Si non client : saisie des données Tiers
    private String firstName;
    private String lastName;
    private String cin;
    private String passport;
    private String phone;
    private String email;
    private String address;

    // Motif de déclaration
    @Column(nullable = false)
    private String declarationReason;

    // Entité de déclaration (Inspection, Conformité, etc.)
    @Column(nullable = false)
    private String declaringEntity;

    // Bloquer la relation O/N
    @Column(nullable = false)
    private boolean blockRelationship;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskThirdPartyStatus status = RiskThirdPartyStatus.ACTIVE;

    // Audit fields
    private UUID createdBy;
    private LocalDateTime createdAt;
    private UUID updatedBy;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    
    public boolean isCihClient() { return isCihClient; }
    public void setCihClient(boolean isCihClient) { this.isCihClient = isCihClient; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public String getPassport() { return passport; }
    public void setPassport(String passport) { this.passport = passport; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDeclarationReason() { return declarationReason; }
    public void setDeclarationReason(String declarationReason) { this.declarationReason = declarationReason; }

    public String getDeclaringEntity() { return declaringEntity; }
    public void setDeclaringEntity(String declaringEntity) { this.declaringEntity = declaringEntity; }

    public boolean isBlockRelationship() { return blockRelationship; }
    public void setBlockRelationship(boolean blockRelationship) { this.blockRelationship = blockRelationship; }

    public RiskThirdPartyStatus getStatus() { return status; }
    public void setStatus(RiskThirdPartyStatus status) { this.status = status; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
