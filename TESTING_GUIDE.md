# Guide de Recette (UAT) - Registre de Restrictions Clients

Ce guide vous accompagnera étape par étape pour tester l'intégralité des fonctionnalités prévues dans le document de conception (`project.md`).

---

## Étape 1 : Démarrage de l'Environnement

Avant de commencer les tests, assurez-vous que **Docker Desktop** est ouvert et en cours d'exécution sur votre machine.

1. **Lancer la Base de données et Keycloak :**
   Ouvrez un terminal dans le dossier `pfa` et exécutez :
   ```bash
   docker-compose up -d
   ```
   *(Attendez 1 à 2 minutes pour que Keycloak et SQL Server démarrent complètement).*

2. **Créer la Base de données :**
   Dans un terminal, exécutez cette commande pour créer la base `restriction_registry` à l'intérieur du conteneur (mot de passe : `StrongPassword123!`) :
   ```bash
   docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "StrongPassword123!" -C -Q "CREATE DATABASE restriction_registry"
   ```
   *(Si la base existe déjà, cette commande affichera une erreur que vous pouvez ignorer).*

2. **Lancer le Backend (Spring Boot) :**
   Ouvrez un deuxième terminal dans `pfa/backend` et exécutez :
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Lancer le Frontend (React) :**
   Ouvrez un troisième terminal dans `pfa/frontend` et exécutez :
   ```bash
   npm run dev
   ```

---

## Étape 2 : Test de l'Interface d'Administration (UC1 à UC9)

Ouvrez votre navigateur sur **http://localhost:5173**. Vous serez redirigé vers Keycloak.
Connectez-vous avec le compte par défaut :
- **Username** : `admin_user`
- **Password** : `admin`

### Test 1 : Saisie d'une Restriction (UC2 & Workflow)
1. Allez sur la page **Saisie Restriction**.
2. Remplissez le formulaire (ex: Compte = `123456789`, Motif = `Soupçon de fraude`).
3. Cliquez sur **Sauvegarder (Brouillon)**.
4. Un encadré bleu "Relecture" apparaît (le statut en base est désormais `DRAFT`).
5. Cliquez sur **Confirmer**. La restriction est maintenant `CONFIRMED`/`ACTIVE`.

### Test 2 : Consultation (UC3)
1. Allez sur **Mes Saisies**.
2. Vérifiez que la restriction que vous venez de créer apparaît bien dans la liste avec le statut `CONFIRMED`.

### Test 3 : Recherche, Édition et Désactivation (UC4, UC6, UC7)
1. Allez sur **Recherche Globale**.
2. Cherchez le compte `123456789`.
3. Cliquez sur **Éditer**. Modifiez le motif et sauvegardez. Constatez que la ligne se met à jour.
4. Cliquez sur **Désactiver**. Acceptez l'alerte. Le statut de la restriction passe à `INACTIVE` (Soft Delete réussi).

### Test 4 : Statistiques et Traçabilité (UC8, UC9)
1. Allez sur **Dashboard**. Constatez que les compteurs de comptes protégés et de restrictions se mettent à jour.
2. Allez sur **Logs d'Audit**.
3. Vous devez voir l'historique complet de vos actions récentes : `CREATE`, `UPDATE` (votre édition), et `DEACTIVATE` (votre soft delete), avec les états "Avant" et "Après".

---

## Étape 3 : Test du Mode Utilisateur Normal (ROLE_USER)

Un utilisateur standard ("Saisisseur") possède le rôle `ROLE_USER`. Il peut créer des restrictions mais n'a pas accès à la gestion des utilisateurs, ni au Dashboard global, ni aux Logs d'Audit.

1. Déconnectez-vous de l'application React.
2. Reconnectez-vous avec le compte par défaut :
   - **Username** : `standard_user`
   - **Password** : `user`
3. **Résultat attendu** : Le menu latéral gauche ne doit afficher **que** les options "Saisie Restriction" et "Mes Saisies". Les options "Dashboard", "Recherche Globale" et "Gestion Utilisateurs" doivent être invisibles.

---

## Étape 4 : Test du Mode Visualiseur (ROLE_VIEWER)

Pour tester le mode lecture seule, vous devez vous connecter avec un compte qui possède uniquement le rôle `ROLE_VIEWER`.
1. Allez sur l'interface d'administration de Keycloak : **http://localhost:8085/admin** (Login: `admin` / Password: `admin`).
2. Allez dans le Realm `restriction-registry` -> **Users** -> Add user (ex: `viewer_user`).
3. Dans l'onglet **Credentials**, définissez un mot de passe (décochez "Temporary").
4. Dans l'onglet **Role Mapping**, assignez-lui **uniquement** le rôle `ROLE_VIEWER`.
5. Déconnectez-vous de l'application React et reconnectez-vous avec `viewer_user`.
6. **Résultat attendu** : Sur la page de saisie, un bandeau orange indique le mode lecture seule. Les champs sont bloqués. Sur la page de recherche, le bouton "Désactiver" est masqué.

---

## Étape 4 : Test de l'API CIB/SITEX (UC11)

L'application CIB/SITEX est un système machine-to-machine. Elle doit récupérer un token avant d'interroger notre API.
Vous pouvez simuler cela avec l'outil **Postman** ou **cURL**.

### 1. Obtenir le Token d'accès (Client Credentials)
Ouvrez un terminal et exécutez cette requête pour simuler le service CIB :
```bash
curl -X POST http://localhost:8085/realms/restriction-registry/protocol/openid-connect/token \
  -d "grant_type=client_credentials" \
  -d "client_id=cib-sitex-service" \
  -d "client_secret=VOTRE_SECRET_CLIENT"
```
*(Note: Vous trouverez le `client_secret` dans Keycloak -> Clients -> `cib-sitex-service` -> Credentials).*
Copiez le token généré dans la réponse (`access_token`).

### 2. Interroger l'API
Utilisez le token copié pour vérifier un compte :
```bash
curl -X GET "http://localhost:8081/api/v1/restrictions/check?accountNumber=123456789" \
  -H "Authorization: Bearer VOTRE_TOKEN_COPIE"
```
**Résultat attendu** : L'API renvoie un JSON indiquant si le compte est restreint ou non, et l'action `API_CHECK` est enregistrée dans les Logs d'Audit !
