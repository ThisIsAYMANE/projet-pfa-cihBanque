# Enterprise Security Hardening, Dynamic Fields & Bulk Import Plan

This plan details the technical architecture and implementation steps to add **dynamic/extensible client data fields**, a **bulk file import engine (Excel/CSV/Banking formats)**, and transform the Banking Restriction Registry into a **bulletproof, enterprise-ready platform** suitable for high-compliance financial institutions.

## User Review Required

> [!IMPORTANT]
> **Key Architecture & Security Decisions for Review:**
> 1. **Extensible Client & Account Data Schema:** Adding core client fields (Customer Full Name, CIN / National ID, Branch Code, Account Type, Frozen Amount, Risk Level) plus a flexible JSON metadata column (`metadataJson`) for dynamic key-value banking attributes.
> 2. **Bulk Import Engine (Excel `.xlsx` / CSV / Banking Files):** Adding a high-performance batch import endpoint supporting drag-and-drop upload, row-level validation, duplicate checking, and pre-confirmation data previews.
> 3. **Field-Level AES-256 Encryption at Rest:** Sensitive PII (Account Numbers, CIN, Customer Names, Restriction Reasons) will be encrypted in SQL Server using AES-256-GCM via a JPA `AttributeConverter`.
> 4. **Tamper-Evident Audit Ledger:** Audit logs will include a SHA-256 HMAC hash chain connecting log records to guarantee audit integrity against database tampering.

---

## Proposed Changes

### 1. Extensible Client Data & Dynamic Metadata Schema

#### [MODIFY] [Restriction.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/entity/Restriction.java) & [RestrictedAccount.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/entity/RestrictedAccount.java)
- Add standard banking client fields:
  - `customerName` (String, encrypted PII)
  - `nationalId` / `cin` (String, encrypted PII)
  - `branchCode` / `codeAgence` (String)
  - `accountType` (CHECKING, SAVINGS, CORPORATE, INVESTMENT)
  - `frozenAmount` (BigDecimal) & `currency` (String, default `MAD`)
  - `riskLevel` (LOW, MEDIUM, HIGH, CRITICAL)
- Add a flexible `metadataJson` field (`@Column(columnDefinition = "NVARCHAR(MAX)")`) to support dynamic custom key-value pairs per bank branch or restriction category.

#### [MODIFY] [EntryForm.jsx](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/frontend/src/pages/EntryForm.jsx) & [SearchAndFilter.jsx](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/frontend/src/pages/SearchAndFilter.jsx)
- Extend creation and search forms to input/display Customer Name, CIN, Branch Code, Account Type, Risk Level, and Frozen Amount.
- Add an interactive dynamic key-value field adder in `EntryForm.jsx` allowing users to append custom metadata fields on the fly.

---

### 2. Bulk File Import Engine (Excel, CSV & Banking Formats)

#### [MODIFY] [pom.xml](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/pom.xml)
- Add Apache POI dependency (`org.apache.poi:poi-ooxml`) for parsing `.xlsx` and `.xls` files, and `commons-csv` for parsing `.csv` files.

#### [NEW] [BulkImportService.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/service/BulkImportService.java)
- Implement multi-format file parser (Excel `.xlsx`/`.xls`, CSV, fixed-width banking text files).
- Validate required fields (Account Number, Reason, Start Date, End Date) row-by-row before database insertion.
- Enforce duplicate detection logic against existing active restrictions.
- Return structured import response (`{ totalRows: 100, successCount: 95, failedCount: 5, errors: [...] }`).

#### [NEW] [BulkImportController.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/controller/BulkImportController.java)
- Expose `POST /api/restrictions/import/preview` (validates and parses file, returns parsed rows to UI without committing).
- Expose `POST /api/restrictions/import/confirm` (saves validated rows to DB within a single transactional unit).

#### [NEW] [BulkImport.jsx](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/frontend/src/pages/BulkImport.jsx)
- Add a modern drag-and-drop file upload UI with format template download buttons (Download Sample `.xlsx` / `.csv`).
- Render a live validation preview table highlighting valid vs invalid rows before user clicks **Confirm Import**.

---

### 3. Enterprise Security & Encryption ("Bulletproof Platform")

#### [NEW] [EncryptionConverter.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/security/EncryptionConverter.java)
- Implement a JPA `AttributeConverter<String, String>` using AES-256-GCM with secure key rotation support.
- Encrypt sensitive PII fields (`accountNumber`, `customerName`, `nationalId`, `reason`) before writing to DB; decrypt transparently on read.

#### [NEW] [RateLimitingFilter.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/security/RateLimitingFilter.java)
- Token-bucket rate limiting filter for public endpoints (`/api/public/check`, `/api/restrictions/search`) to mitigate DoS/brute-force attacks.

#### [MODIFY] [SecurityConfig.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/config/SecurityConfig.java)
- Enforce enterprise HTTP Security Headers: HSTS, Content-Security-Policy (CSP), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`).

#### [MODIFY] [AuditService.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/service/AuditService.java) & [AuditLog.java](file:///c:/Users/AYMANE%20MAALI/OneDrive/Bureau/pfa/backend/src/main/java/com/bank/restrictions/entity/AuditLog.java)
- Add SHA-256 hash chaining (`entryHash` + `previousHash`) to render audit logs tamper-evident.

---

## Verification Plan

### Automated Tests
- Test bulk import service parsing & validation (Excel & CSV):
  `./mvnw test -Dtest=BulkImportServiceTest`
- Test AES-256 field encryption/decryption:
  `./mvnw test -Dtest=EncryptionConverterTest`
- Test rate-limiting filter:
  `./mvnw test -Dtest=RateLimitingFilterTest`

### Manual Verification
1. **Bulk Import Test:** Upload sample Excel (`.xlsx`) and CSV files via the new **Importation en masse** tab; verify pre-import validation table, error highlights, and successful batch insertion.
2. **Dynamic Client Data Test:** Create a restriction with extended fields (Customer Name, CIN, Branch, Risk Level, custom metadata key-values) and verify display in search and audit logs.
3. **Encryption Verification:** Query raw SQL Server table `RESTRICTION` to verify PII columns are stored as encrypted ciphertexts.
