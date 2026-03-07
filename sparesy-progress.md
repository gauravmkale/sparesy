# Sparesy — Progress Log
**Last Updated:** 7 March 2026  
**Focus:** Backend — auth-service

---

## ✅ COMPLETED — Auth Service (port 8081)

### Project Structure
- Root `sparesy/` folder created
- Parent `pom.xml` with two modules: `auth-service` and `core-service`
- Java 17 (via Homebrew), Maven 3.9.12, MySQL 8

### All Files Built and Working

```
auth-service/
├── pom.xml
└── src/main/
    ├── java/com/sparesy/auth/
    │   ├── AuthServiceApplication.java      ✅
    │   ├── enums/
    │   │   └── CompanyType.java             ✅  (MANUFACTURER, CLIENT, SUPPLIER)
    │   ├── model/
    │   │   └── Company.java                 ✅  (JPA Entity → maps to companies table)
    │   ├── dto/
    │   │   ├── LoginRequest.java            ✅  (email, password)
    │   │   ├── LoginResponse.java           ✅  (token, companyId, companyType)
    │   │   └── RegisterRequest.java         ✅  (all company fields)
    │   ├── repository/
    │   │   └── CompanyRepository.java       ✅  (findByEmail, findByType)
    │   ├── security/
    │   │   ├── JwtUtil.java                 ✅  (generateToken, validateToken, extract methods)
    │   │   └── SecurityConfig.java          ✅  (permits /api/auth/**, blocks everything else)
    │   ├── service/
    │   │   └── AuthService.java             ✅  (login, register with BCrypt hashing)
    │   └── controller/
    │       └── AuthController.java          ✅  (POST /api/auth/login, POST /api/auth/register)
    └── resources/
        └── application.properties           ✅
```

### Company Fields (RegisterRequest + Company entity)
| Field | Type | Notes |
|---|---|---|
| name | String | Company name |
| email | String | Unique — used as login username |
| password | String | BCrypt hashed, never plain text |
| type | CompanyType | MANUFACTURER / CLIENT / SUPPLIER |
| pinCode | String | 6 digits |
| contactNumber | String | 10 digits |
| gstNumber | String | Unique, 15 chars |
| address | String | Full address |
| contactPersonName | String | Main point of contact |
| isActive | Boolean | Manufacturer can deactivate |
| createdAt | LocalDateTime | Auto-set by Hibernate |

### Endpoints Working ✅
| Method | URL | What it does |
|---|---|---|
| POST | /api/auth/register | Creates a new company account |
| POST | /api/auth/login | Returns JWT token on success |

### Confirmed Working Test
```bash
# Register
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

# Response
{"token":"eyJhbGci...","companyId":3,"companyType":"CLIENT"}
```

---

## 🔴 NOT STARTED — Core Service (port 8082)

### What needs to be built:
```
core-service/
├── pom.xml
└── src/main/java/com/sparesy/core/
    ├── CoreServiceApplication.java
    ├── enums/          → ProjectStatus, RequestStatus, QuoteStatus, ProductionStage, TransactionType
    ├── entity/         → 9 entities (Company, Project, Component, SupplierComponent,
    │                      Request, Quote, ProductionOrder, Inventory, Transaction)
    ├── dto/
    │   ├── request/    → one per entity
    │   └── response/   → one per entity
    ├── repository/     → one per entity
    ├── service/        → one per entity
    ├── controller/     → one per entity
    ├── workflow/       → WorkflowService + 3 events
    ├── websocket/      → WebSocketConfig + NotificationService
    └── security/       → JwtFilter + SecurityConfig + CompanyContext
```

### Next Steps in Order:
1. Set up core-service pom.xml and folder structure
2. Write all 9 entity classes → Hibernate auto-creates tables
3. Write JWT filter → validates token on every request
4. Write SecurityConfig for core-service
5. Write CompanyContext → holds companyId for current request
6. Build Company endpoints → list clients, list suppliers
7. Build Project endpoints → submit, list, detail, status update
8. Build Component + SupplierComponent endpoints
9. Build Request + Quote endpoints
10. Build Production + Inventory endpoints
11. Build WorkflowService + events
12. Build WebSocket notifications

---

## 🐛 Bugs Resolved

| Bug | Root Cause | Fix |
|---|---|---|
| Lombok getters not found | Annotation processor not configured | Added `maven-compiler-plugin` with Lombok path + version `1.18.36` |
| Java 25 incompatible | Spring Boot 3.2 targets Java 17 | Installed Java 17 via Homebrew, set JAVA_HOME |
| `AuthServiceApplication` not found | File placed in `src/main/` instead of `src/main/java/com/sparesy/auth/` | Moved to correct path |
| MySQL Public Key Retrieval error | MySQL 8 security setting | Added `allowPublicKeyRetrieval=true` to datasource URL |
| Login — Invalid email or password | Manually inserted BCrypt hash didn't match password | Used register endpoint to create user instead |
| WeakKeyException on JWT | Secret key too short (184 bits, needs 256+) | Updated secret to 48 character string in application.properties |

---

## ⚙️ Environment

| Tool | Version | Notes |
|---|---|---|
| Java | 17.0.18 | Via Homebrew — set JAVA_HOME each session |
| Maven | 3.9.12 | Use `mvn` directly, not `./mvnw` |
| MySQL | 8.x | Database: `sparesy` |
| Spring Boot | 3.2.0 | |
| JWT Secret | 48+ chars | `sparesy-super-secret-key-for-jwt-signing-2026` |

**To start auth-service:**
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
cd sparesy/auth-service
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
- Request DTO = what comes in
- Response DTO = what goes out
- `confirmPassword` = frontend only, never sent to backend

**Lombok — requires annotation processor in pom.xml:**
- `@Getter` / `@Setter` → getters and setters
- `@Builder` → chain-style object construction
- `@AllArgsConstructor` → constructor with all fields
- `@NoArgsConstructor` → empty constructor

**JWT:**
- Contains: `companyId`, `companyType`, `exp`
- Secret must be 32+ characters (256 bits minimum)
- Generated on login, validated on every core-service request

**BCrypt password hashing:**
```java
// Store
passwordEncoder.encode("plain text")  →  "$2a$10$..."

// Verify (never decrypt — re-hash and compare)
passwordEncoder.matches("plain text", "$2a$10$...")  →  true/false
```

**Multi-tenancy rule — most important rule in the entire project:**
```java
// ALWAYS filter by companyId from JWT
Long companyId = CompanyContext.getCurrentCompanyId();
repository.findByClientCompanyId(companyId);

// NEVER do this
repository.findAll();
```
