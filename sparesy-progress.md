# Sparesy — Progress Log
**Last Updated:** 17 March 2026
**Focus:** Frontend-Backend Integration — Invite Flow, Onboarding, Company Management

---

## ✅ COMPLETED — Auth Service (port 8081)

### Folder Structure
```
auth-service/
├── pom.xml
└── src/main/
    ├── java/com/sparesy/auth/
    │   ├── AuthServiceApplication.java
    │   ├── enums/
    │   │   └── CompanyType.java             MANUFACTURER, CLIENT, SUPPLIER
    │   ├── model/
    │   │   ├── Company.java                 JPA Entity → maps to companies table
    │   │   └── Invitation.java              JPA Entity → maps to invitations table
    │   ├── dto/
    │   │   ├── LoginRequest.java
    │   │   ├── LoginResponse.java
    │   │   ├── RegisterRequest.java         @JsonAlias("pincode") on pinCode field
    │   │   ├── UpdateCompanyRequest.java
    │   │   └── CompanyResponse.java
    │   ├── repository/
    │   │   ├── CompanyRepository.java       findByEmail, findByType, findByGstNumber
    │   │   └── InvitationRepository.java    findByToken, findByEmail
    │   ├── service/
    │   │   └── AuthService.java
    │   ├── controller/
    │   │   └── AuthController.java
    │   ├── security/
    │   │   ├── JwtUtil.java
    │   │   └── SecurityConfig.java
    │   └── exception/
    │       ├── ErrorResponse.java
    │       └── GlobalExceptionHandler.java
    └── resources/
        └── application.properties
```

### Auth Service Endpoints ✅
| Method | URL | What it does |
|---|---|---|
| POST | /api/auth/register | Creates company, requires inviteToken for non-MANUFACTURER |
| POST | /api/auth/login | Returns JWT token on success |
| POST | /api/auth/invite | Creates invite, returns plain string token |
| GET | /api/auth/invite/validate?token= | Validates token, returns Invitation entity |
| GET | /api/auth/companies/{id} | Returns company details (no password) |
| PUT | /api/auth/companies/{id} | Updates contact details |
| PUT | /api/auth/companies/{id}/deactivate | Deactivates account |

### Invitation Entity Fields
| Field | Type | Notes |
|---|---|---|
| id | Long | Auto-increment PK |
| email | String | Unique — invite target email |
| type | CompanyType | CLIENT or SUPPLIER |
| token | String | UUID, auto-generated on @PrePersist |
| used | Boolean | Set to true after registration |
| createdAt | LocalDateTime | Auto-set |
| expiresAt | LocalDateTime | 7 days from creation |

### Company Fields
| Field | Type | Notes |
|---|---|---|
| name | String | Company name |
| email | String | Unique login username |
| password | String | BCrypt hashed |
| type | CompanyType | MANUFACTURER / CLIENT / SUPPLIER |
| pinCode | String | 6 digits — fixed column name pin_code |
| contactNumber | String | 10 digits |
| gstNumber | String | Unique, 15 chars |
| address | String | Full address |
| contactPersonName | String | Main point of contact |
| onboardingStatus | OnboardingStatus | PENDING / APPROVED / REJECTED |
| isActive | Boolean | Manufacturer can deactivate |
| createdAt | LocalDateTime | Auto-set |

---

## ✅ COMPLETED — Core Service (port 8082)

### Folder Structure
```
core-service/
├── pom.xml
└── src/main/java/com/sparesy/core/
    ├── CoreServiceApplication.java
    │
    ├── enums/
    │   ├── CompanyType.java         MANUFACTURER, CLIENT, SUPPLIER
    │   ├── ProjectStatus.java       SUBMITTED → BOM_REVIEW → SOURCING → QUOTED
    │   │                             → QUOTE_APPROVED → IN_PRODUCTION → DELIVERED → CANCELLED
    │   ├── RequestStatus.java       PENDING → QUOTED → APPROVED → REJECTED
    │   ├── QuoteStatus.java         DRAFT → SENT → APPROVED → REJECTED
    │   ├── ProductionStage.java     COMPONENT_PREP → PCB_FABRICATION → SMT_ASSEMBLY
    │   │                             → SOLDERING → QC_INSPECTION → PACKAGING → READY
    │   ├── OnboardingStatus.java    PENDING → APPROVED → REJECTED
    │   └── TransactionType.java     SUPPLIER_REVENUE, MANUFACTURER_REVENUE, CLIENT_COST
    │
    ├── entity/
    │   ├── Company.java             maps to companies table (shared with auth-service)
    │   ├── Project.java             client FK, status, file paths, PCB specs
    │   ├── Component.java           master catalog — name, partNumber (unique), category
    │   ├── SupplierComponent.java   supplier FK, component FK, price, stock, leadTime
    │   ├── Request.java             project FK, supplier FK, component FK, quotedPrice
    │   ├── Quote.java               project FK, totalPrice, lineItemsJson, status
    │   ├── ProductionOrder.java     project FK, currentStage, stageHistoryJson
    │   ├── Inventory.java           component FK, onHand, reserved, reorderThreshold
    │   └── Transaction.java         company FK, project FK, component FK, amount, type
    │
    ├── dto/
    │   ├── request/
    │   │   ├── ProjectRequestDTO.java
    │   │   ├── ComponentRequestDTO.java
    │   │   ├── SupplierComponentRequestDTO.java
    │   │   ├── RequestRequestDTO.java
    │   │   └── QuoteRequestDTO.java
    │   └── response/
    │       ├── CompanyResponseDTO.java
    │       ├── ProjectResponseDTO.java
    │       ├── ComponentResponseDTO.java
    │       ├── SupplierComponentResponseDTO.java
    │       ├── RequestResponseDTO.java
    │       ├── QuoteResponseDTO.java
    │       ├── ProductionOrderResponseDTO.java
    │       ├── InventoryResponseDTO.java
    │       └── TransactionResponseDTO.java
    │
    ├── repository/
    │   ├── CompanyRepository.java           findByType, findByOnboardingStatus,
    │   │                                     findByTypeAndOnboardingStatus, existsByEmail
    │   ├── ProjectRepository.java           findByClientId, findAllByOrderBySubmittedAtDesc
    │   ├── ComponentRepository.java         findByPartNumber, findByCategory
    │   ├── SupplierComponentRepository.java findBySupplierId, findBySupplierIdAndIsActive
    │   ├── RequestRepository.java           findByProjectId, existsByProjectIdAndStatusNot
    │   ├── QuoteRepository.java             findByProjectId, findByStatus
    │   ├── ProductionOrderRepository.java   findByProjectId, findByCurrentStage
    │   ├── InventoryRepository.java         findByComponentId, findByQuantityOnHandLessThan
    │   └── TransactionRepository.java       sumAmountByCompanyIdAndType (@Query)
    │
    ├── service/
    │   ├── CompanyService.java      getAllClients, getAllSuppliers, getAllApprovedClients,
    │   │                             getAllApprovedSuppliers, getPendingCompanies,
    │   │                             approveCompany, rejectCompany
    │   ├── ProjectService.java
    │   ├── ComponentService.java
    │   ├── SupplierComponentService.java
    │   ├── RequestService.java
    │   ├── QuoteService.java
    │   ├── ProductionService.java
    │   ├── InventoryService.java
    │   ├── TransactionService.java
    │   └── FileService.java
    │
    ├── controller/
    │   ├── CompanyController.java   GET /clients, /suppliers, /Approvedclients,
    │   │                             /Approvedsuppliers, /pending, /{id}/approve, /{id}/reject
    │   ├── ProjectController.java
    │   ├── ComponentController.java
    │   ├── SupplierComponentController.java
    │   ├── RequestController.java
    │   ├── QuoteController.java
    │   ├── ProductionController.java
    │   ├── InventoryController.java
    │   ├── TransactionController.java
    │   └── FileController.java
    │
    ├── workflow/
    │   ├── WorkflowService.java
    │   └── events/
    │       ├── ProjectSubmittedEvent.java
    │       ├── AllRequestsApprovedEvent.java
    │       └── QuoteApprovedEvent.java
    │
    ├── websocket/
    │   ├── WebSocketConfig.java
    │   └── NotificationService.java     push(companyId, message)
    │
    └── security/
        ├── CompanyContext.java          ThreadLocal — holds companyId + companyType
        ├── JwtFilter.java               validates Bearer token, populates CompanyContext
        └── SecurityConfig.java          stateless, CSRF off, all requests require JWT
```

### Core Service Endpoints ✅
| Method | URL | Role | What it does |
|---|---|---|---|
| GET | /api/companies/clients | MANUFACTURER | All clients (any status) |
| GET | /api/companies/suppliers | MANUFACTURER | All suppliers (any status) |
| GET | /api/companies/Approvedclients | MANUFACTURER | Approved clients only |
| GET | /api/companies/Approvedsuppliers | MANUFACTURER | Approved suppliers only |
| GET | /api/companies/pending | MANUFACTURER | Companies awaiting approval |
| PUT | /api/companies/{id}/approve | MANUFACTURER | Approve onboarding |
| PUT | /api/companies/{id}/reject | MANUFACTURER | Reject onboarding |
| GET | /api/projects | MANUFACTURER | All projects |
| GET | /api/projects/my | CLIENT | Client's own projects |
| GET | /api/projects/{id} | ALL | Project detail |
| POST | /api/projects | CLIENT | Submit new project |
| PUT | /api/projects/{id}/status | MANUFACTURER | Update project status |
| GET | /api/components | ALL | All components |
| GET | /api/components/{id} | ALL | Component detail |
| POST | /api/components | MANUFACTURER | Add component |
| GET | /api/supplier-components/my | SUPPLIER | Supplier's own catalog |
| GET | /api/supplier-components/{supplierId} | MANUFACTURER | Supplier's catalog |
| POST | /api/supplier-components | SUPPLIER | Add to catalog |
| PUT | /api/supplier-components/{id}/stock | SUPPLIER | Update stock |
| PUT | /api/supplier-components/{id}/price | SUPPLIER | Update price |
| GET | /api/requests/project/{id} | MANUFACTURER | Requests for a project |
| GET | /api/requests/my | SUPPLIER | Supplier's incoming requests |
| POST | /api/requests | MANUFACTURER | Send sourcing request |
| PUT | /api/requests/{id}/quote | SUPPLIER | Submit quote |
| PUT | /api/requests/{id}/approve | MANUFACTURER | Approve request |
| PUT | /api/requests/{id}/reject | MANUFACTURER | Reject request |
| GET | /api/quotes/project/{id} | ALL | Quote for a project |
| GET | /api/quotes/my | CLIENT | Client's quotes |
| POST | /api/quotes | MANUFACTURER | Create quote |
| PUT | /api/quotes/{id}/send | MANUFACTURER | Send quote to client |
| PUT | /api/quotes/{id}/approve | CLIENT | Approve quote |
| PUT | /api/quotes/{id}/reject | CLIENT | Reject quote |
| GET | /api/production | MANUFACTURER | All production orders |
| GET | /api/production/{id} | ALL | Production order detail |
| PUT | /api/production/{id}/advance | MANUFACTURER | Advance stage |
| GET | /api/inventory | MANUFACTURER | All inventory |
| GET | /api/inventory/alerts | MANUFACTURER | Low stock alerts |
| PUT | /api/inventory/{id}/stock | MANUFACTURER | Update stock |
| GET | /api/transactions/my | ALL | Own transactions |
| GET | /api/transactions/revenue | ALL | Revenue summary |

---

## ✅ COMPLETED — Frontend (Angular 17, port 4200)

### Folder Structure
```
frontend/src/app/
├── app.component.ts
├── app.config.ts                    provideHttpClient, AuthInterceptor, provideAnimationsAsync
├── app.routes.ts                    login, register, /manufacturing, /supplier, /client
│
├── core/
│   ├── auth/
│   │   ├── auth.guard.ts            redirects to /auth/login if not authenticated
│   │   ├── auth.service.ts          login, register, logout, getUserFromToken, validateInvite
│   │   ├── jwt.helper.ts            decodes JWT payload without library
│   │   ├── role.guard.ts            checks companyType against route data.roles
│   │   └── token.service.ts         localStorage get/set/remove
│   ├── interceptors/
│   │   └── auth.interceptor.ts      attaches Bearer token to every request
│   └── services/
│       ├── company.service.ts       getClients, getSuppliers, getApprovedClients,
│       │                             getApprovedSuppliers, getPending, approve, reject
│       ├── component.service.ts
│       ├── inventory.service.ts
│       ├── production.service.ts
│       ├── project.service.ts
│       ├── quote.service.ts
│       ├── request.service.ts
│       ├── supplier-component.service.ts
│       └── transaction.service.ts
│
├── features/
│   ├── auth/
│   │   ├── login/                   email + password form, role-based redirect on success
│   │   └── register/                3-step form, invite token validation, disabled field fix
│   ├── landing/                     ngx-light-rays landing page
│   ├── manufacturer/
│   │   ├── dashboard.component.ts   sidebar with 9 tabs
│   │   ├── overview/                4 stat cards + recent projects table
│   │   ├── projects/                project list + detail + sourcing requests + quote modal
│   │   ├── components/              master catalog + add form + part number search
│   │   ├── suppliers/               supplier grid + catalog view + invite modal
│   │   ├── clients/                 client grid + invite modal
│   │   ├── onboarding/              pending approvals table + approve/reject actions
│   │   ├── production/              production orders + stage advance
│   │   ├── inventory/               stock table + low stock alerts
│   │   └── transactions/            revenue summary + transaction history
│   ├── client/
│   │   ├── dashboard.component.ts   sidebar with 4 tabs
│   │   ├── overview/                stat cards + recent projects
│   │   ├── projects/                project list + submit form + production tracking
│   │   ├── quotes/                  quote table + approve/reject with modal
│   │   └── transactions/            cost summary + transaction history
│   └── supplier/
│       ├── dashboard.component.ts   sidebar with 4 tabs
│       ├── overview/                stat cards + recent requests
│       ├── catalog/                 catalog table + add form + inline edit
│       ├── requests/                incoming requests + quote submission modal
│       └── transactions/            revenue summary + transaction history
│
└── shared/
    └── components/
        └── navbar/                  role badge, dashboard link, logout
```

---

## 🐛 Bugs Resolved

| Bug | Root Cause | Fix |
|---|---|---|
| Lombok getters not found | Annotation processor not configured | Added maven-compiler-plugin with Lombok path + version 1.18.36 |
| Java 25 incompatible | Spring Boot 3.2 targets Java 17 | Installed Java 17 via Homebrew, set JAVA_HOME |
| AuthServiceApplication not found | File in wrong directory | Moved to correct path |
| MySQL Public Key Retrieval error | MySQL 8 security setting | Added allowPublicKeyRetrieval=true to datasource URL |
| Login — Invalid email or password | Manually inserted BCrypt hash | Used register endpoint to create user |
| WeakKeyException on JWT | Secret too short (184 bits) | Updated to 48 character string |
| Invite link never appeared on frontend | HttpClient expected JSON, backend returned plain string | Added responseType: 'text' to HTTP call |
| Multiple invite DB entries on double click | No loading guard on button | Added isGenerating flag, disabled button after first click |
| Copy button needed two clicks | Angular change detection missed Promise callback | Wrapped copied flag in NgZone.run() |
| Register form stuck on step 1 after invite link | Disabled companyType field returned invalid from Angular | isCurrentStepValid now checks control?.disabled OR control?.valid |
| validate invite endpoint missing | Not built in backend | Added GET /api/auth/invite/validate + AuthService.validateInvitation() |
| Onboarding tab showed nothing despite correct API response | Angular change detection not firing after HTTP | Added ChangeDetectorRef.detectChanges() to onboarding, clients, suppliers components |
| Suppliers/clients disappeared on reload | Components calling getSuppliers/getClients which return all statuses | Added getApprovedSuppliers/getApprovedClients endpoints filtering by APPROVED |
| pinCode always null in database | Auth-service Company entity had field named pincode (lowercase c), core-service had pinCode — two separate MySQL columns created | Renamed field to pinCode in auth-service entity, dropped pincode column, added @JsonAlias("pincode") to RegisterRequest |

---

## ⚙️ Environment

| Tool | Version | Notes |
|---|---|---|
| Java | 17.0.18 | Via Homebrew — set JAVA_HOME each session |
| Maven | 3.9.12 | Use mvn directly, not ./mvnw |
| MySQL | 8.x | Database: sparesy |
| Spring Boot | 3.2.0 | |
| Angular | 17 | |
| JWT Secret | 48+ chars | sparesy-super-secret-key-for-jwt-signing-2026 |

**To start everything:**
```bash
# Set Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Start MySQL (if not running)
sudo /usr/local/mysql/support-files/mysql.server start

# Terminal 1 — auth-service
cd sparesy/auth-service
mvn spring-boot:run

# Terminal 2 — core-service
cd sparesy/core-service
mvn spring-boot:run

# Terminal 3 — frontend
cd sparesy/frontend
ng serve
```

---

## 🧠 Key Concepts Learned

**Spring Boot layer order — always build in this sequence:**
```
Entity → Repository → Service → Controller
```

**DTO rule:**
- Never expose Entity directly over the API
- Request DTO = what comes in from frontend
- Response DTO = what goes out to frontend
- No request DTO needed when records are auto-created (ProductionOrder, Inventory, Transaction)

**Multi-tenancy rule — most important rule in the entire project:**
```java
// ALWAYS filter by companyId from JWT
Long companyId = CompanyContext.getCurrentCompanyId();
repository.findByClientId(companyId);

// NEVER do this
repository.findAll();
```

**ThreadLocal (CompanyContext):**
- Each request thread gets its own isolated copy of companyId and companyType
- JwtFilter sets it at the start of every request
- Must call CompanyContext.clear() to prevent memory leaks
- Any service method can call CompanyContext.getCurrentCompanyId() without passing it as a parameter

**JWT flow in core-service:**
```
Request arrives → JwtFilter reads Bearer token
               → validates signature + expiry
               → extracts companyId + companyType
               → stores in CompanyContext
               → Spring Security marks request as authenticated
               → Controller runs
               → CompanyContext.clear() at end
```

**Angular change detection with HTTP:**
- HttpClient responses inside RxJS operators don't always trigger Angular change detection
- Fix: inject ChangeDetectorRef and call cdr.detectChanges() after assigning data
- Same issue with native Promise callbacks (navigator.clipboard) — wrap in NgZone.run()

**Invite flow:**
- Manufacturer generates invite → POST /api/auth/invite → returns plain string token
- Frontend uses responseType: 'text' to receive plain string (not JSON)
- Invite link = window.location.origin + /auth/register?token=TOKEN
- Register page reads token from query params → calls validate endpoint
- On valid token: companyType pre-filled and disabled
- On registration: inviteToken sent in payload, marked used=true in DB
- Onboarding status starts as PENDING for all non-MANUFACTURER companies
- Manufacturer sees PENDING companies in Onboarding tab, approves/rejects
- After approval: company appears in Clients or Suppliers tab

**BCrypt password hashing:**
```java
// Store
passwordEncoder.encode("plain text")  →  "$2a$10$..."

// Verify (never decrypt — re-hash and compare)
passwordEncoder.matches("plain text", "$2a$10$...")  →  true/false
```

---

