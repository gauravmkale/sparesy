# Sparesy — PCB Manufacturing & Sourcing Platform

**Sparesy** is a B2B enterprise platform for PCB manufacturing and component sourcing. It connects three roles — **Manufacturer**, **Client**, and **Supplier** — through a structured workflow from project submission to delivery.

---

## 🏗 System Architecture

Three separate applications, all running locally:

| Service | Port | Technology | Role |
|---|---|---|---|
| **auth-service** | 8081 | Spring Boot 3.2, Java 17 | Registration, login, JWT generation |
| **core-service** | 8082 | Spring Boot 3.2, Java 17 | All business logic — projects, sourcing, quotes, production, finance |
| **frontend** | 4200 | Angular 17 | UI for all three portals (Manufacturer, Supplier, Client) |

Both backend services share the **same MySQL database** (`sparesy`) and the **same JWT secret**, which is how the core-service can validate tokens originally issued by the auth-service without calling it.

---

## 🔁 Business Workflow (End-to-End Flow)

```
[Client] Submits Project
        ↓
[Manufacturer] Reviews BOM → Sends Sourcing Requests to Suppliers
        ↓
[Supplier] Receives Request → Submits Quote (price + delivery date)
        ↓
[Manufacturer] Approves Supplier Quotes → Builds Client Quote
        ↓
[Client] Approves Quote
        ↓ (Auto-triggered by WorkflowService)
• Production Order created
• Client Cost Transaction recorded
• Manufacturer Revenue Transaction recorded
• Supplier Revenue Transactions recorded (one per approved request)
        ↓
[Manufacturer] Advances Production through stages → DELIVERED
```

### Workflow Automation
`WorkflowService` uses Spring's `ApplicationEventPublisher` to wire automated actions to business events — the controller fires an event, and the workflow handles the cascade:

| Event | Trigger | Automated Action |
|---|---|---|
| `ProjectSubmittedEvent` | Client submits project | Status → SUBMITTED |
| `AllRequestsApprovedEvent` | Last supplier request approved | Status → QUOTED |
| `QuoteApprovedEvent` | Client approves quote | Status → IN_PRODUCTION, creates ProductionOrder, records all Transactions |

---

## 🔐 Authentication & Security

### Auth Flow
1. User calls `POST /api/auth/login` on auth-service (port 8081)
2. Auth-service validates credentials and returns a **JWT token**
3. Frontend stores the token in `localStorage` via `TokenService`
4. Every subsequent request to core-service carries `Authorization: Bearer <token>`

### JWT Contents
```
{
  "sub": "5",           ← companyId as string
  "companyId": 5,       ← companyId as number (used by core-service)
  "companyType": "MANUFACTURER",
  "iat": ...,
  "exp": ...
}
```

### How Core-Service Uses the Token (CompanyContext + JwtFilter)
```
Incoming Request
    → JwtFilter.doFilterInternal()
        → Strips "Bearer " prefix
        → Parses & validates JWT signature + expiry
        → Extracts companyId + companyType from claims
        → Stores in CompanyContext (ThreadLocal)
        → Marks request as authenticated in Spring Security
    → Controller runs
        → Any service can call CompanyContext.getCurrentCompanyId()
        → No need to pass companyId as a parameter anywhere
    → CompanyContext.clear() prevents memory leaks
```

**ThreadLocal** ensures each concurrent request thread has its own isolated company identity — Thread A sees companyId=5, Thread B sees companyId=12, even running simultaneously.

### Invite Flow (Non-Manufacturer Registration)
```
Manufacturer → POST /api/auth/invite { email, type }
    → Returns plain UUID token string (responseType: 'text' in Angular)
Frontend builds: window.location.origin + /auth/register?token=TOKEN
Invitee opens link → Angular reads token from query params
    → GET /api/auth/invite/validate?token=... 
    → companyType field pre-filled and disabled
Invitee fills form → POST /api/auth/register (with inviteToken)
    → Invitation marked used=true in DB
    → Company created with OnboardingStatus.PENDING
Manufacturer sees PENDING in Onboarding tab → Approve / Reject
    → OnboardingStatus.APPROVED → company can now log in
```

---

## 🏛 Service Breakdown

### Auth-Service

**Entities:**
- `Company` — stores name, email (BCrypt-hashed password), type, GST number, pin code, contact details, `onboardingStatus`, `isActive`
- `Invitation` — token (UUID), target email, type, `used` flag, `expiresAt` (7 days)

**Endpoints:**
| Method | URL | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create company. Non-MANUFACTURER must have valid inviteToken |
| POST | `/api/auth/login` | Returns JWT + companyId + companyType |
| POST | `/api/auth/invite` | Manufacturer creates invite, returns plain string token |
| GET | `/api/auth/invite/validate?token=` | Validates token, returns Invitation |
| GET | `/api/auth/companies/{id}` | Company profile (password excluded) |
| PUT | `/api/auth/companies/{id}` | Update contact details |
| PUT | `/api/auth/companies/{id}/deactivate` | Deactivate account |

**Key patterns:**
- `BCryptPasswordEncoder.matches()` verifies passwords — never decrypts, re-hashes and compares
- `@JsonAlias("pincode")` on `pinCode` in `RegisterRequest` — handles frontend sending lowercase key
- Login rejects PENDING and REJECTED companies with a clear error message before password check

---

### Core-Service

**Entities:**

| Entity | Key Fields | Notes |
|---|---|---|
| `Company` | id, name, email, type, onboardingStatus, isActive | Mirror of auth-service entity, same DB table |
| `Project` | clientId, name, quantity, layerCount, status, filePaths | Client's PCB assembly request |
| `Component` | partNumber (unique), name, category | Master catalog managed by Manufacturer |
| `SupplierComponent` | supplierId, componentId, price, stock, leadTime, isActive | Supplier's own prices/stock |
| `Request` | projectId, supplierId, componentId, qty, targetPrice, quotedPrice, status | Sourcing request + supplier quote |
| `Quote` | projectId, totalPrice, leadTimeDays, lineItemsJson, status, sentAt | Final client-facing quote |
| `ProductionOrder` | projectId, currentStage, stageHistoryJson | Tracks manufacturing progress |
| `Inventory` | componentId, onHand, reserved, reorderThreshold | Stock tracking |
| `Transaction` | companyId, projectId, componentId, amount, type | Financial records |

**Production Stages (in order):**
`COMPONENT_PREP → PCB_FABRICATION → SMT_ASSEMBLY → SOLDERING → QC_INSPECTION → PACKAGING → READY`

**Transaction Types:**
- `CLIENT_COST` — recorded against client when they approve the quote
- `MANUFACTURER_REVENUE` — recorded against manufacturer at same moment
- `SUPPLIER_REVENUE` — recorded against each supplier for each approved component request

**Financial Reporting (added in latest session):**
- `GET /api/transactions/project/{id}/financials` — revenue, cost, profit for one project
- `GET /api/transactions/client/{id}/financials` — per-client summary across all their projects
- `GET /api/transactions/clients/all` — all client summaries (Manufacturer view)

**Security pattern (multi-tenancy):**
```java
// Always do this
Long companyId = CompanyContext.getCurrentCompanyId();
repository.findByClientId(companyId);

// Never do this without a role check
repository.findAll();
```

---

### Frontend (Angular 17)

**Core infrastructure:**
- `AuthInterceptor` — automatically attaches `Bearer <token>` to every outgoing HTTP request
- `AuthGuard` — redirects to `/auth/login` if no valid token
- `RoleGuard` — checks `companyType` from JWT against route's `data.roles`; prevents cross-role URL access
- `CompanyContext` pattern mirrored in `AuthService.getUserFromToken()` which decodes JWT without a library

**Portals:**

| Portal | Route | Tabs |
|---|---|---|
| Manufacturer | `/manufacturing` | Overview, Projects, Components, Suppliers, Clients, Onboarding, Production, Inventory, Transactions |
| Supplier | `/supplier` | Overview, Catalog, Requests, Transactions |
| Client | `/client` | Overview, Projects, Quotes, Transactions |

**Route protection:**
```
auth/login     → open
auth/register  → open (invite token read from query params)
/manufacturing → AuthGuard + RoleGuard (roles: ['manufacturer'])
/supplier      → AuthGuard + RoleGuard (roles: ['supplier'])
/client        → AuthGuard + RoleGuard (roles: ['client'])
```

---

## ⚠️ Known Issues & Simplification Notes

| Issue | Location | Recommendation |
|---|---|---|
| URL casing inconsistency | `/api/companies/Approvedclients`, `/Approvedsuppliers` | Rename to `/approved-clients`, `/approved-suppliers` (REST convention is kebab-case) |
| Raw `Company` entity returned directly | `CompanyController.java` all GET methods | Should return a `CompanyResponseDTO` to avoid exposing internal fields (password hash visible in JSON) |
| `BCryptPasswordEncoder` instantiated with `new` | `AuthService.java` line 32 | Should be `@Autowired` or `@Bean` — not a Spring-managed singleton, so it can't be intercepted or swapped |
| Unused import | `RequestService.java` line 19 | `import org.springframework.security.access.method.P` — remove |
| Indentation inconsistency | `QuoteService.java` constructor and `approveQuote()` | Methods are not consistently indented (2-space vs 4-space) |
| `getProjectFinancials()` no null guard | `TransactionService.java` line 87 | `revenue.subtract(cost)` throws NullPointerException if no transactions exist yet — add null coalesce |
| `getClientVisibleRequests()` is a duplicate | `RequestService.java` line 112 | Same body as `getRequestsByProject()` — one of them should be removed |
| `WorkflowService.onProjectSubmitted()` does nothing new | `WorkflowService.java` line 54 | Sets status to SUBMITTED — which `ProjectService` already does before firing the event; this is a no-op |

---

## 🧪 Testing

Shell scripts in `tests/`:
| Script | Purpose |
|---|---|
| `test-1-register.sh` | Creates dummy Manufacturer, Client, and Supplier accounts |
| `test-2-auth.sh` | Logs in each account, captures JWT tokens |
| `test-3-workflow.sh` | Runs the sourcing and quoting flow end-to-end |
| `test-4-production.sh` | Verifies production stage advancement and transaction creation |

---

## ⚙️ Environment & Startup

| Tool | Version |
|---|---|
| Java | 17.0.x (Homebrew) |
| Maven | 3.9.x |
| MySQL | 8.x (database: `sparesy`) |
| Spring Boot | 3.2.0 |
| Angular | 17 |
| JWT Secret | 48+ characters (must match in both services) |

```bash
# Set Java 17 (required each new terminal session)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Terminal 1 — Auth Service
cd sparesy/auth-service && mvn spring-boot:run

# Terminal 2 — Core Service
cd sparesy/core-service && mvn spring-boot:run

# Terminal 3 — Frontend
cd sparesy/frontend && npm start
```

Access at: `http://localhost:4200`

---

## 🧱 Layer Build Order (Spring Boot)

Always build in this sequence when adding a new feature:
```
Entity → Repository → Service → Controller
```

DTO rule:
- **Request DTO** = what comes in from the frontend
- **Response DTO** = what goes out to the frontend
- Never expose an Entity directly over the API
- No request DTO needed when objects are auto-created (ProductionOrder, Transaction, Inventory)
