# Sparesy — Progress Log
**Last Updated:** 11 March 2026
**Focus:** Backend — core-service foundation

---

## ✅ COMPLETED — Auth Service (port 8081)

Auth service is fully built, tested, and Angular frontend integrated.  
See auth-service documentation below for full details.

### Endpoints Working ✅
| Method | URL | What it does |
|---|---|---|
| POST | /api/auth/register | Creates a new company account |
| POST | /api/auth/login | Returns JWT token on success |
| GET | /api/auth/companies/{id} | Returns company details (no password) |
| PUT | /api/auth/companies/{id} | Updates contact details |
| PUT | /api/auth/companies/{id}/deactivate | Deactivates account |

---

## ✅ COMPLETED TODAY — Core Service Foundation (port 8082)

### What was built

```
core-service/
├── pom.xml                              ✅  (all dependencies, Lombok annotation processor)
└── src/main/
    ├── java/com/sparesy/core/
    │   ├── CoreServiceApplication.java  ✅
    │   │
    │   ├── enums/
    │   │   ├── CompanyType.java         ✅  MANUFACTURER, CLIENT, SUPPLIER
    │   │   ├── ProjectStatus.java       ✅  SUBMITTED → BOM_REVIEW → SOURCING → QUOTED
    │   │   │                                → QUOTE_APPROVED → IN_PRODUCTION → DELIVERED → CANCELLED
    │   │   ├── RequestStatus.java       ✅  PENDING → QUOTED → APPROVED → REJECTED
    │   │   ├── QuoteStatus.java         ✅  DRAFT → SENT → APPROVED → REJECTED
    │   │   ├── ProductionStage.java     ✅  COMPONENT_PREP → PCB_FABRICATION → SMT_ASSEMBLY
    │   │   │                                → SOLDERING → QC_INSPECTION → PACKAGING → READY
    │   │   └── TransactionType.java     ✅  SUPPLIER_REVENUE, MANUFACTURER_REVENUE, CLIENT_COST
    │   │
    │   ├── entity/
    │   │   ├── Company.java             ✅  maps to companies table (shared with auth-service)
    │   │   ├── Project.java             ✅  client FK, status, file paths, PCB specs
    │   │   ├── Component.java           ✅  master catalog — name, partNumber (unique), category
    │   │   ├── SupplierComponent.java   ✅  supplier FK, component FK, price, stock, leadTime
    │   │   ├── Request.java             ✅  project FK, supplier FK, component FK, quotedPrice
    │   │   ├── Quote.java               ✅  project FK, totalPrice, lineItemsJson, status
    │   │   ├── ProductionOrder.java     ✅  project FK, currentStage, stageHistoryJson
    │   │   ├── Inventory.java           ✅  component FK, onHand, reserved, reorderThreshold
    │   │   └── Transaction.java         ✅  company FK, project FK, component FK, amount, type
    │   │
    │   ├── dto/
    │   │   ├── request/
    │   │   │   ├── ProjectRequestDTO.java          ✅
    │   │   │   ├── ComponentRequestDTO.java         ✅
    │   │   │   ├── SupplierComponentRequestDTO.java ✅
    │   │   │   ├── RequestRequestDTO.java           ✅
    │   │   │   └── QuoteRequestDTO.java             ✅
    │   │   └── response/
    │   │       ├── CompanyResponseDTO.java          ✅
    │   │       ├── ProjectResponseDTO.java          ✅
    │   │       ├── ComponentResponseDTO.java        ✅
    │   │       ├── SupplierComponentResponseDTO.java ✅
    │   │       ├── RequestResponseDTO.java          ✅
    │   │       ├── QuoteResponseDTO.java            ✅
    │   │       ├── ProductionOrderResponseDTO.java  ✅
    │   │       ├── InventoryResponseDTO.java        ✅
    │   │       └── TransactionResponseDTO.java      ✅
    │   │
    │   ├── repository/
    │   │   ├── CompanyRepository.java          ✅  findByType, existsByEmail
    │   │   ├── ProjectRepository.java          ✅  findByClientId, findAllByOrderBySubmittedAtDesc
    │   │   ├── ComponentRepository.java        ✅  findByPartNumber, findByCategory
    │   │   ├── SupplierComponentRepository.java ✅ findBySupplierId, findBySupplierIdAndIsActive
    │   │   ├── RequestRepository.java          ✅  findByProjectId, existsByProjectIdAndStatusNot
    │   │   ├── QuoteRepository.java            ✅  findByProjectId, findByStatus
    │   │   ├── ProductionOrderRepository.java  ✅  findByProjectId, findByCurrentStage
    │   │   ├── InventoryRepository.java        ✅  findByComponentId, findByQuantityOnHandLessThan
    │   │   └── TransactionRepository.java      ✅  sumAmountByCompanyIdAndType (@Query)
    │   │
    │   └── security/
    │       ├── CompanyContext.java      ✅  ThreadLocal — holds companyId + companyType per request
    │       ├── JwtFilter.java           ✅  validates Bearer token, populates CompanyContext
    │       └── SecurityConfig.java      ✅  stateless, CSRF off, all requests require JWT
    │
    └── resources/
        └── application.properties      ✅  port 8082, MySQL, JWT config

```

### Verified Working ✅
- All 9 tables auto-created by Hibernate on first run
- JwtFilter visible in Spring Security filter chain
- Generated security password warning silenced
- Service boots clean in ~2.5 seconds

### application.properties
```properties
server.port=8082
spring.datasource.url=jdbc:mysql://localhost:3306/sparesy?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
jwt.secret=sparesy-super-secret-key-for-jwt-signing-2026
jwt.expiration=86400000
file.upload.dir=./uploads
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration
```

---

## 🔴 NOT STARTED — Core Service Business Logic

### Next session — pick up here in order:

1. **Services** (heaviest part — pick up with CompanyService next session)
   - CompanyService
   - ProjectService
   - ComponentService
   - SupplierComponentService
   - RequestService
   - QuoteService
   - ProductionService
   - InventoryService
   - TransactionService
   - FileService

2. **Controllers** — one per service, faster once services are done

3. **WorkflowService + 3 events** — auto-advances project status on key events

4. **WebSocket** — WebSocketConfig + NotificationService

---

## 🐛 Bugs Resolved

| Bug | Root Cause | Fix |
|---|---|---|
| Lombok getters not found | Annotation processor not configured | Added maven-compiler-plugin with Lombok path + version 1.18.36 |
| Java 25 incompatible | Spring Boot 3.2 targets Java 17 | Installed Java 17 via Homebrew, set JAVA_HOME |
| AuthServiceApplication not found | File placed in src/main/ instead of correct path | Moved to src/main/java/com/sparesy/auth/ |
| MySQL Public Key Retrieval error | MySQL 8 security setting | Added allowPublicKeyRetrieval=true to datasource URL |
| Login — Invalid email or password | Manually inserted BCrypt hash didn't match | Used register endpoint to create user instead |
| WeakKeyException on JWT | Secret key too short (184 bits) | Updated secret to 48 character string |
| Generated security password warning | Spring auto-configures UserDetailsService | Added spring.autoconfigure.exclude to application.properties |

---

## ⚙️ Environment

| Tool | Version | Notes |
|---|---|---|
| Java | 17.0.18 | Via Homebrew — set JAVA_HOME each session |
| Maven | 3.9.12 | Use mvn directly, not ./mvnw |
| MySQL | 8.x | Database: sparesy |
| Spring Boot | 3.2.0 | |
| JWT Secret | 48+ chars | sparesy-super-secret-key-for-jwt-signing-2026 |

**To start core-service:**
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
cd sparesy/core-service
mvn spring-boot:run
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
- Must call CompanyContext.clear() to prevent memory leaks between requests
- Any service method can call CompanyContext.getCurrentCompanyId() without it being passed as a parameter

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

---

## Auth Service Documentation

### Folder Structure
```
auth-service/
├── pom.xml
└── src/main/
    ├── java/com/sparesy/auth/
    │   ├── AuthServiceApplication.java
    │   ├── enums/
    │   │   └── CompanyType.java
    │   ├── model/
    │   │   └── Company.java
    │   ├── dto/
    │   │   ├── LoginRequest.java
    │   │   ├── LoginResponse.java
    │   │   ├── RegisterRequest.java
    │   │   ├── UpdateCompanyRequest.java
    │   │   └── CompanyResponse.java
    │   ├── repository/
    │   │   └── CompanyRepository.java
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

### Quick Test Commands
```bash
# Register a new client
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Electronics",
    "email": "abc@client.com",
    "password": "client123",
    "type": "CLIENT",
    "pinCode": "400001",
    "contactNumber": "9123456780",
    "gstNumber": "27AAPFU0939F1ZW",
    "address": "456 Park Street, Mumbai",
    "contactPersonName": "Raj Sharma"
  }'

# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"abc@client.com","password":"client123"}'

# Get company by ID
curl http://localhost:8081/api/auth/companies/3

# Update company
curl -X PUT http://localhost:8081/api/auth/companies/3 \
  -H "Content-Type: application/json" \
  -d '{
    "address": "789 New Street, Delhi",
    "contactNumber": "9999999999",
    "contactPersonName": "Raj Updated",
    "pinCode": "110001"
  }'

# Deactivate company
curl -X PUT http://localhost:8081/api/auth/companies/3/deactivate
```