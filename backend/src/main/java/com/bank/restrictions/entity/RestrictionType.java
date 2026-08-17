package com.bank.restrictions.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "RESTRICTION_TYPE")
public class RestrictionType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String label;
    private String description;

    @Enumerated(EnumType.STRING)
    private ExpiryMode defaultExpiryMode;

    private Boolean active;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ExpiryMode getDefaultExpiryMode() { return defaultExpiryMode; }
    public void setDefaultExpiryMode(ExpiryMode defaultExpiryMode) { this.defaultExpiryMode = defaultExpiryMode; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
