# Auth Service — Documentation
**Sparesy | Private Client & Supplier Portal**  
**Port:** 8081  
**Version:** 1.0.0

---

## What is Auth Service?

Auth service is one of two backend services in Sparesy. Its only responsibility is **identity** — who are you, and are you allowed in?

It handles:
- Registering new company accounts (Manufacturer, Client, Supplier)
- Logging in and issuing JWT tokens
- Managing company details (view, update, deactivate)

It does **not** handle any business logic — that lives in core-service (port 8082).

---

## How it fits into the system

```
Browser (Angular — port 4200)
        │
        │  POST /api/auth/login   → get JWT token
        │  POST /api/auth/register → create account
        ▼
Auth Service (port 8081)
        │
        │  validates credentials
        │  generates JWT token
        ▼
MySQL (port 3306) — sparesy database — companies table
```

Once the user has a JWT token, **every future request goes directly to core-service (port 8082)** — not through auth-service. Auth-service is only involved at login and registration.

---

## JWT Token

When login is successful, auth-service returns a signed JWT token. This token contains:

```json
{
  "companyId": 3,
  "companyType": "CLIENT",
  "exp": 1772956872
}
```

Angular stores this token and attaches it to every API request as:
```
Authorization: Bearer eyJhbGci...
```

Core-service reads `companyId` and `companyType` from this token on every request — this is how multi-tenancy works. Every database query is filtered by `companyId`.

**Token expiry:** 24 hours (86400000ms)

---

## Company Types

There are three types of companies in Sparesy:

| Type | Role |
|---|---|
| `MANUFACTURER` | Owns and operates the platform. Full access to everything. |
| `CLIENT` | Submits PCB projects, reviews quotes, tracks production. |
| `SUPPLIER` | Receives component requests, manages their catalog, submits quotes. |

After login, Angular reads `companyType` from the JWT and redirects:
```
MANUFACTURER → /manufacturer
CLIENT       → /client
SUPPLIER     → /supplier
```

---

## Folder Structure

```
auth-service/
├── pom.xml                          → Maven dependencies
└── src/main/
    ├── java/com/sparesy/auth/
    │   │
    │   ├── AuthServiceApplication.java     → Entry point, starts on port 8081
    │   │
    │   ├── enums/
    │   │   └── CompanyType.java            → MANUFACTURER, CLIENT, SUPPLIER
    │   │
    │   ├── model/
    │   │   └── Company.java                → JPA Entity → maps to companies table in MySQL
    │   │
    │   ├── dto/
    │   │   ├── LoginRequest.java           → { email, password }
    │   │   ├── LoginResponse.java          → { token, companyId, companyType }
    │   │   ├── RegisterRequest.java        → all company fields with validation
    │   │   ├── UpdateCompanyRequest.java   → { address, contactNumber, contactPersonName, pinCode }
    │   │   └── CompanyResponse.java        → company fields WITHOUT password
    │   │
    │   ├── repository/
    │   │   └── CompanyRepository.java      → database queries (Spring generates implementation)
    │   │
    │   ├── service/
    │   │   └── AuthService.java            → all business logic
    │   │
    │   ├── controller/
    │   │   └── AuthController.java         → HTTP endpoints
    │   │
    │   ├── security/
    │   │   ├── JwtUtil.java                → generate, validate, extract JWT
    │   │   └── SecurityConfig.java         → permit /api/auth/**, block everything else
    │   │
    │   └── exception/
    │       ├── ErrorResponse.java          → { status, message }
    │       └── GlobalExceptionHandler.java → converts exceptions to clean JSON responses
    │
    └── resources/
        └── application.properties          → port, database, JWT config
```

---

## API Endpoints

### POST /api/auth/register
Creates a new company account. Only called by the manufacturer when onboarding a new client or supplier.

**Request Body:**
```json
{
  "name": "ABC Electronics",
  "email": "abc@client.com",
  "password": "client123",
  "type": "CLIENT",
  "pinCode": "400001",
  "contactNumber": "9123456780",
  "gstNumber": "27AAPFU0939F1ZW",
  "address": "456 Park Street, Mumbai",
  "contactPersonName": "Raj Sharma"
}
```

**Response 201 — Created:**
```
(empty body)
```

**Response 400 — Validation Error:**
```json
{
  "email": "Email must be valid",
  "password": "Password must be at least 6 characters",
  "pinCode": "Pin code must be 6 digits"
}
```

**Response 400 — Duplicate Email:**
```json
{"status": 400, "message": "Email already registered"}
```

**Response 400 — Duplicate GST:**
```json
{"status": 400, "message": "GST number already registered"}
```

---

### POST /api/auth/login
Verifies credentials and returns a JWT token.

**Request Body:**
```json
{
  "email": "abc@client.com",
  "password": "client123"
}
```

**Response 200 — Success:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "companyId": 3,
  "companyType": "CLIENT"
}
```

**Response 400 — Wrong credentials:**
```json
{"status": 400, "message": "Invalid email or password"}
```

**Response 400 — Deactivated account:**
```json
{"status": 400, "message": "Account is deactivated"}
```

---

### GET /api/auth/companies/{id}
Returns company details by ID. Password is never included in the response.

**Response 200:**
```json
{
  "id": 3,
  "name": "ABC Electronics",
  "email": "abc@client.com",
  "type": "CLIENT",
  "pinCode": "400001",
  "contactNumber": "9123456780",
  "gstNumber": "27AAPFU0939F1ZW",
  "address": "456 Park Street, Mumbai",
  "contactPersonName": "Raj Sharma",
  "isActive": true,
  "createdAt": "2026-03-07T13:27:45"
}
```

---

### PUT /api/auth/companies/{id}
Updates a company's contact details.

**Request Body:**
```json
{
  "address": "789 New Street, Delhi",
  "contactNumber": "9999999999",
  "contactPersonName": "Raj Updated",
  "pinCode": "110001"
}
```

**Response 200:** (empty body)

---

### PUT /api/auth/companies/{id}/deactivate
Deactivates a company account. Deactivated companies cannot log in.

**Response 200:** (empty body)

---

## Validation Rules

| Field | Rule |
|---|---|
| name | Required, max 100 characters |
| email | Required, must be valid email format |
| password | Required, minimum 6 characters |
| type | Required, must be MANUFACTURER / CLIENT / SUPPLIER |
| pinCode | Required, exactly 6 digits |
| contactNumber | Required, exactly 10 digits |
| gstNumber | Required, exactly 15 characters, must be unique |
| address | Required |
| contactPersonName | Required |

---

## Security

- All `/api/auth/**` endpoints are **public** — no token required
- Every other endpoint requires a valid JWT token
- Passwords are hashed with **BCrypt** before storing — never stored as plain text
- JWT tokens are signed with HMAC-SHA256
- JWT secret must be 32+ characters (256 bits minimum)
- Sessions are **stateless** — no server-side session storage

---

## Database

Auth-service connects to the `sparesy` MySQL database. Hibernate automatically creates and updates the `companies` table based on the `Company.java` entity.

**companies table columns:**
```
id                  BIGINT AUTO_INCREMENT PRIMARY KEY
name                VARCHAR(100) NOT NULL
email               VARCHAR(100) NOT NULL UNIQUE
password            VARCHAR(255) NOT NULL
type                VARCHAR(20) NOT NULL
pin_code            VARCHAR(10) NOT NULL
contact_number      VARCHAR(15) NOT NULL
gst_number          VARCHAR(15) NOT NULL UNIQUE
address             VARCHAR(255) NOT NULL
contact_person_name VARCHAR(100) NOT NULL
is_active           TINYINT(1) NOT NULL DEFAULT 1
created_at          DATETIME
```

---

## How to Run

**Prerequisites:**
- Java 17 installed via Homebrew
- Maven 3.6+
- MySQL 8 running with `sparesy` database created

**Step 1 — Set Java 17 (required every new terminal session):**
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

**Step 2 — Start the service:**
```bash
cd sparesy/auth-service
mvn spring-boot:run
```

**Step 3 — Verify it's running:**
```
Started AuthServiceApplication in X seconds
Tomcat started on port 8081
```

---

## application.properties

```properties
server.port=8081

spring.datasource.url=jdbc:mysql://localhost:3306/sparesy?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=sparesy-super-secret-key-for-jwt-signing-2026
jwt.expiration=86400000
```

---

## Quick Test Commands

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

# Test validation (should return field errors)
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"bad-email","password":"123","type":"CLIENT"}'
```