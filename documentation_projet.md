# Documentation Technique et Fonctionnelle : Gestion des Tiers à Risques (IND)

**Client / Contexte :** CIH Bank
**Projet :** Digitalisation du processus de déclaration et de gestion des Tiers Indésirables (Tiers à Risques).

---

## 1. Présentation Générale du Projet

L'application **Gestion des Tiers à Risques (IND)** est une solution interne sécurisée permettant aux différentes entités de la banque (Inspection, Conformité, Juridique, Réseau) de déclarer, suivre et gérer les clients ou prospects considérés comme "à risque". 

L'objectif principal est de centraliser ces déclarations, d'automatiser le blocage relationnel dans le système central (Sitex), et de fournir un tableau de bord proactif basé sur un batch de filtrage quotidien des transactions.

---

## 2. Architecture Technique

Le projet repose sur une architecture moderne, modulaire et hautement sécurisée :

### 2.1. Stack Technologique
* **Frontend (Interface Utilisateur) :** React.js (Vite), CSS pur (Design System Premium avec Glassmorphism léger), `lucide-react` pour l'iconographie, `axios` pour les requêtes HTTP, et `i18next` pour l'internationalisation.
* **Backend (API REST) :** Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate.
* **Base de données :** Microsoft SQL Server 2022 (hébergé sous conteneur Docker).
* **Gestion des Identités et Accès (IAM) :** Keycloak (hébergé sous conteneur Docker).

### 2.2. Modèle de Déploiement Local
Le socle infrastructurel local (Base de données et Keycloak) est orchestré via un fichier `docker-compose.yml`, permettant de monter l'environnement en une seule commande de manière reproductible.

---

## 3. Couverture Fonctionnelle

L'application répond de bout en bout au cahier des charges initial.

### 3.1. Gestion des Accès & Habilitations
La sécurité est déléguée à **Keycloak** (OAuth2 / OpenID Connect).
* Les rôles sont définis au niveau du *Realm* : `ROLE_ADMIN`, `ROLE_IG`, `ROLE_CONFORMITE_SF`, `ROLE_CONFORMITE_PF`, `ROLE_JURIDIQUE`, `ROLE_VIEWER`, etc.
* **Contrôle d'accès (RBAC) :** Le Frontend masque dynamiquement les boutons d'édition/création si l'utilisateur n'a qu'un rôle de lecture (`ROLE_VIEWER`). Le Backend protège ses routes via des annotations `@PreAuthorize`.

### 3.2. Fiche de Déclaration d'un Tiers à Risques
Un formulaire dynamique et sécurisé permet la saisie des Tiers :
* **Indicateur Client CIH (O/N) :** Si coché, l'utilisateur choisit le "Type d'identifiant" (RIB, Radical ou CIN) et saisit la valeur. Le système comprend qu'il s'agit d'un client existant. Si décoché, l'utilisateur doit saisir les informations civiles (Nom, Prénom, CIN, etc.).
* **Motif et Entité :** Sélection du motif de la déclaration (Fraude, Blanchiment, etc.) et de l'entité déclarante.
* **Blocage de la Relation (Sitex) :** Une case à cocher permet de décider si la relation doit être gelée immédiatement (Blocage Automatique Sitex O/N). Le type de restriction est précisé (Blocage Total, Blocage Carte, etc.).

### 3.3. Modification et Cycle de Vie du Tiers (IND)
* **Modification :** Il est possible de mettre à jour les données du Tiers.
* **Blocage / Déblocage :** Un bouton d'action directe permet de basculer l'état du blocage (OUI / NON) sans avoir à remplir le formulaire complet.
* **Levée du Statut IND :** Permet de sortir définitivement un client de la liste des tiers à risques, en passant son statut en "LIFTED".

### 3.4. Dashboard des Alertes
La page d'accueil offre une vue macroscopique et proactive :
* **Consultation des Tiers :** Un tableau de bord affiche les Tiers actuellement actifs.
* **Alertes Quotidiennes (Batch de filtrage) :** Un service Spring Boot (Batch Job) tourne toutes les nuits (à 1h00 du matin) pour scanner les opérations du jour des Tiers Indésirables. 
* Si une opération suspecte est détectée (EER, Vente, OA, AAV), une **Alerte** est générée.
* **Prise de décision :** Depuis le Dashboard, l'utilisateur peut traiter l'alerte en décidant d'appliquer un blocage de la relation ou de clôturer définitivement la relation (Terminate) avec le client.

### 3.5. Historique et Logs d'Audit
L'application intègre une traçabilité totale et inaltérable :
* **Historique individuel :** Depuis la liste des Tiers, un clic sur l'icône "Historique" affiche toutes les modifications subies par le Tiers spécifique (avec l'ancienne et la nouvelle valeur).
* **Page Globale des Logs d'Audit :** Une page dédiée affiche la totalité des actions de l'application (Création, Modification, Levée). Elle indique clairement la **Date**, l'**Action**, le **Nom de l'utilisateur**, et l'**Identifiant du Tiers** impacté.
* **Recherche temps réel :** Des barres de recherche intelligentes permettent de filtrer instantanément les listes de Tiers et d'Audits.

---

## 4. Modèle de Données (Entités Principales)

1. **RiskThirdParty (Tiers à Risques) :** 
   - Stocke l'identifiant (CIN/Radical/RIB), les données civiles, l'état du blocage, le motif, l'entité déclarante et le statut de la relation (`ACTIVE`, `LIFTED`, `TERMINATED`).
2. **Alert (Alertes du Dashboard) :** 
   - Stocke les alertes générées par le Batch nocturne, liées par ID au Tiers concerné, avec leur statut de résolution (`PENDING`, `RESOLVED`).
3. **AuditLog (Traçabilité) :** 
   - Stocke de manière immuable l'UUID de l'entité modifiée, le nom d'utilisateur, le type d'action (`CREATE_IND`, `UPDATE_IND`, `TOGGLE_BLOCK_IND`), et le détail textuel des changements.

---

## 5. Guide de Lancement Rapide (Runbook)

Pour déployer l'application en environnement de développement ou de test :

1. **Démarrer l'infrastructure (Base de données + Keycloak) :**
   ```bash
   cd c:\Users\AYMANE MAALI\OneDrive\Bureau\pfa
   docker-compose up -d
   ```
2. **Démarrer le Backend (Spring Boot) :**
   ```bash
   cd backend
   ./mvnw clean spring-boot:run
   ```
   *(Le backend écoute sur le port 8081)*
3. **Démarrer le Frontend (React/Vite) :**
   ```bash
   cd frontend
   npm run dev
   ```
   *(Le frontend écoute sur le port 5173)*

**Identifiants de Test (Keycloak) :**
- **Admin :** `admin_user` / `admin` (Dispose des droits d'écriture complets)
- **Viewer :** *(À configurer dans Keycloak si nécessaire, ou utiliser un utilisateur avec uniquement le rôle ROLE_VIEWER).*

---

## 6. Sécurité Spécifique Implémentée

- **CORS Policies :** Le backend Spring Boot est configuré pour n'accepter que les requêtes provenant du domaine du Frontend (`http://localhost:5173`).
- **Validation JWT :** Le backend agit en tant que "Resource Server" OAuth2. Il décrypte la signature cryptographique du token émis par Keycloak pour chaque requête et refuse tout accès sans Token valide (Erreur 401).
- **Protection contre le contournement :** Même si un utilisateur malveillant modifie le Frontend pour afficher le bouton de création, la requête POST sera interceptée et bloquée par le Backend avec une Erreur 403 (Forbidden) si le token ne contient pas les rôles adéquats.

---

## 7. Pistes d'Évolutions Futures

Pour la prochaine phase du projet (V2), voici les recommandations :
1. **Intégration réelle du Core Banking (Sitex) :** Remplacer le Batch "Mocké" actuel par de véritables appels API ou procédures stockées vers le système central de CIH Bank.
2. **Pagination côté Serveur :** À mesure que la base de données grossit, implémenter une pagination sur les pages de listes (Tiers et Audit) pour optimiser les performances.
3. **Exports :** Ajouter la possibilité d'exporter les grilles de données (Tiers, Alertes, Audits) au format Excel / CSV.
