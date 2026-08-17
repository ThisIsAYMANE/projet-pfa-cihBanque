INSERT INTO RESTRICTION_TYPE (id, label, description, default_expiry_mode, active) 
VALUES (CAST('c0a80121-8285-1815-8182-85669b760000' AS uniqueidentifier), 'Gel de fonds', 'Gel de tous les fonds du compte', 'AUTO', 1);

INSERT INTO RESTRICTION_TYPE (id, label, description, default_expiry_mode, active) 
VALUES (CAST('c0a80121-8285-1815-8182-85669b760001' AS uniqueidentifier), 'Blocage de carte', 'Blocage de la carte bancaire', 'AUTO', 1);

INSERT INTO RESTRICTION_TYPE (id, label, description, default_expiry_mode, active) 
VALUES (CAST('c0a80121-8285-1815-8182-85669b760002' AS uniqueidentifier), 'BLOCK_ALL', 'Blocage tiers : blocage ALL', 'MANUAL', 1);

INSERT INTO RESTRICTION_TYPE (id, label, description, default_expiry_mode, active) 
VALUES (CAST('c0a80121-8285-1815-8182-85669b760003' AS uniqueidentifier), 'BLOCK_PHYSICAL_ACCOUNT_OPS', 'Blocage de compte Physique', 'MANUAL', 1);

INSERT INTO RESTRICTION_TYPE (id, label, description, default_expiry_mode, active) 
VALUES (CAST('c0a80121-8285-1815-8182-85669b760004' AS uniqueidentifier), 'BLOCK_SECURITIES_BL', 'Blocage de compte titre et BL', 'MANUAL', 1);

INSERT INTO RESTRICTION_TYPE (id, label, description, default_expiry_mode, active) 
VALUES (CAST('c0a80121-8285-1815-8182-85669b760005' AS uniqueidentifier), 'BLOCK_LEGAL_ENTITY_OPS', 'Blocage de compte personne morale', 'MANUAL', 1);

INSERT INTO RESTRICTION_TYPE (id, label, description, default_expiry_mode, active) 
VALUES (CAST('c0a80121-8285-1815-8182-85669b760006' AS uniqueidentifier), 'BLOCK_ONLINE_BANKING', 'Blocage banque à distance', 'MANUAL', 1);

INSERT INTO RESTRICTION_TYPE (id, label, description, default_expiry_mode, active) 
VALUES (CAST('c0a80121-8285-1815-8182-85669b760007' AS uniqueidentifier), 'VIGILANCE', 'Vigilance à observer', 'MANUAL', 1);
