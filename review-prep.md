# Sparesy — Review Preparation Guide
**Last Updated:** 25 March 2026

This document covers every tricky concept in the codebase, explains the reasoning behind design decisions, and lists likely questions with full answers. Read this before your review.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Concepts](#backend-concepts)
   - [JWT & Authentication](#jwt--authentication)
   - [ThreadLocal & CompanyContext](#threadlocal--companycontext)
   - [Spring Event System (ApplicationEventPublisher)](#spring-event-system)
   - [BCrypt Password Hashing](#bcrypt-password-hashing)
   - [Invite Flow](#invite-flow)
   - [DTO Pattern](#dto-pattern)
   - [Double Negative Logic](#double-negative-logic)
   - [Shared Database](#shared-database)
3. [Frontend Concepts](#frontend-concepts)
   - [HttpInterceptor](#httpinterceptor)
   - [Manual JWT Decoding](#manual-jwt-decoding)
   - [Disabled Field Validation Bug Fix](#disabled-field-validation-bug-fix)
   - [RoleGuard & AuthGuard](#roleguard--authguard)
   - [Angular Signals](#angular-signals)
4. [Likely Questions & Answers](#likely-questions--answers)

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│               Frontend (Angular 17)           │
│                   Port 4200                   │
│  Manufacturer | Supplier | Client portals     │
└────────────────────┬─────────────────────────┘
                     │ HTTP (with JWT)
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────┐         ┌──────────────────┐
│ auth-service │         │  core-service    │
│  Port 8081   │         │  Port 8082       │
│  Login/Reg   │         │  All Business    │
│  JWT Issue   │         │  Logic           │
└──────┬───────┘         └────────┬─────────┘
       │                          │
       └────────┬─────────────────┘
                ▼
         ┌─────────────┐
         │  MySQL DB   │
         │  `sparesy`  │
         │  shared     │
         └─────────────┘
```

**Key point:** Both services share the **same MySQL database** and the **same JWT secret**. This is why core-service can validate tokens issued by auth-service without calling it — they use the same signing key.

---

## Backend Concepts

---

### JWT & Authentication

**What is a JWT?**

A JWT (JSON Web Token) is a self-contained, signed string that carries identity information. It has three parts separated by dots:

```
header.payload.signature
  ↓        ↓         ↓
base64   base64    HMAC-SHA256
```

**What's inside our JWT?**
```json
{
  "sub": "5",
  "companyId": 5,
  "companyType": "MANUFACTURER",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**The flow:**
```
1. User logs in → POST /api/auth/login (port 8081)
2. Auth-service validates credentials, generates JWT with companyId + companyType
3. JWT returned to frontend, stored in localStorage
4. Every future request to core-service (port 8082) carries: Authorization: Bearer <jwt>
5. Core-service validates JWT using the same secret, extracts companyId + companyType
6. No session, no database lookup — the token itself IS the proof of identity
```

**Why no session?** JWT is stateless. The server doesn't store anything. This scales well — any instance of core-service can validate any token without coordinating with each other.

---

### ThreadLocal & CompanyContext

**File:** `core-service/.../security/CompanyContext.java`

**The problem it solves:**

A Spring Boot server handles many requests simultaneously. Each request runs on its own **thread** from a thread pool. If you stored the current user's ID in a regular static variable, requests from different users would overwrite each other.

**How ThreadLocal works:**
```java
private static final ThreadLocal<Long> companyIdHolder = new ThreadLocal<>();
```

ThreadLocal gives each thread its **own private copy** of the variable. Thread A's `companyId` is completely isolated from Thread B's:

```
Thread A (User: Manufacturer, id=5)  →  companyIdHolder = 5
Thread B (User: Client, id=12)       →  companyIdHolder = 12
Thread C (User: Supplier, id=8)      →  companyIdHolder = 8
```

Even though the field is `static`, the values are NOT shared.

**The lifecycle:**
```
Request arrives
    → JwtFilter reads JWT, extracts companyId + companyType
    → CompanyContext.setCurrentCompanyId(5)      ← set for this thread
    → CompanyContext.setCurrentCompanyType(MANUFACTURER)
    → Controller runs
        → Any service can call CompanyContext.getCurrentCompanyId()
        → No need to pass companyId as a parameter through every method
    → Request ends
    → CompanyContext.clear()   ← MUST clear or memory leak occurs
```

**Why must we call `clear()`?**
Threads are reused in a thread pool. If you don't clear the ThreadLocal after a request, the next request handled by that same thread might accidentally read the previous user's company ID.

---

### Spring Event System

**Files:** `QuoteService.java` → `WorkflowService.java`

**The problem:** When a client approves a quote, many things need to happen:
1. Update quote status to APPROVED
2. Update project status to IN_PRODUCTION
3. Create a ProductionOrder
4. Record a Client Cost Transaction
5. Record a Manufacturer Revenue Transaction
6. Record Supplier Revenue Transactions (one per component)

If we put all of this directly in `QuoteService`, it becomes a giant bloated method that knows too much about too many things.

**The solution — Spring Events:**

Instead of calling all that code directly, `QuoteService` fires an **event** and moves on:
```java
// In QuoteService.approveQuote()
eventPublisher.publishEvent(new QuoteApprovedEvent(this, project, quote));
```

Spring sees this event and automatically calls:
```java
// In WorkflowService.java — Spring calls this automatically
@EventListener
public void onQuoteApproved(QuoteApprovedEvent event) {
    // production order, transactions, etc.
}
```

**Why is this good?**
- `QuoteService` doesn't need to know what happens after approval — it just announces it
- `WorkflowService` handles the cascade independently
- Clean separation of concerns — adding more actions on quote approval is a one-line change in WorkflowService

**The three events in our system:**

| Event | Fired When | WorkflowService Action |
|---|---|---|
| `ProjectSubmittedEvent` | Client submits project | (removed — was a no-op) |
| `AllRequestsApprovedEvent` | Last supplier request approved | Status → QUOTED |
| `QuoteApprovedEvent` | Client approves quote | IN_PRODUCTION + ProductionOrder + all Transactions |

**The connection is invisible in the code.** There is no direct method call from QuoteService to WorkflowService. Spring routes events at runtime using `@EventListener`.

---

### BCrypt Password Hashing

**File:** `auth-service/.../service/AuthService.java`

Passwords are **never stored in plain text** and **never decrypted**.

```
Registration:
  "myPassword123!" → BCrypt → "$2a$10$abc...xyz" (stored in DB)

Login:
  User enters "myPassword123!"
  BCrypt re-hashes it with the stored salt
  Compares the result to the stored hash
  If they match → password is correct
```

```java
// Store
passwordEncoder.encode("myPassword123!")    →  "$2a$10$..."

// Verify — never decrypt, re-hash and compare
passwordEncoder.matches("myPassword123!", "$2a$10$...")  →  true or false
```

**Why can't you decrypt BCrypt?** It's a one-way function by design. Even if someone steals the database, they get hashes, not passwords. BCrypt also adds a random **salt** before hashing, so the same password produces a different hash each time — this prevents rainbow table attacks.

**Why is `BCryptPasswordEncoder` a Spring `@Bean`?**
We define it as a `@Bean` in `AuthServiceApplication.java` so Spring manages exactly one instance and injects it via `@Autowired`. Previously it was `new BCryptPasswordEncoder()` inside AuthService — this is a Spring anti-pattern because the object is created outside Spring's control and can't be intercepted or replaced in tests.

---

### Invite Flow

**Why do clients and suppliers need an invite?**
Any random person can't just sign up — only the Manufacturer controls who joins their network.

**Step-by-step:**
```
1. Manufacturer → POST /api/auth/invite { email: "x@y.com", type: "CLIENT" }
   → Backend creates an Invitation record with a UUID token
   → Returns the plain token string (frontend uses responseType: 'text' to receive it)

2. Frontend builds: http://localhost:4200/auth/register?token=<UUID>
   → Manufacturer copies this link and sends it to the invitee

3. Invitee opens the link
   → Angular reads token from URL query params
   → GET /api/auth/invite/validate?token=... 
   → If valid: backend returns Invitation with companyType
   → Frontend pre-fills and disables the companyType field

4. Invitee completes and submits registration form
   → inviteToken sent in the payload
   → Backend marks invitation used=true
   → Company created with OnboardingStatus.PENDING

5. Manufacturer sees PENDING company in the Onboarding tab
   → Approves or Rejects
   → If APPROVED: company can now log in
```

**What prevents the same invite being used twice?**
The `used` flag on the `Invitation` entity. After registration, it's set to `true`. The validate endpoint checks `invitation.getUsed()` and throws an error if true.

---

### DTO Pattern

**What is a DTO (Data Transfer Object)?**

A DTO is a plain object whose only job is to carry data between layers. We have two types:

| Type | Direction | Purpose |
|---|---|---|
| Request DTO | Frontend → Backend | What the API receives (form data) |
| Response DTO | Backend → Frontend | What the API sends back (safe data, no internals) |

**Why not just send the Entity directly?**

Entities are JPA objects mapped to DB tables. They often contain fields you don't want to expose:
- Passwords (even hashed)
- Internal flags
- Circular references (Company → Projects → Company → ...)

`CompanyResponseDTO` deliberately excludes the `password` field. The Entity has it; the DTO doesn't.

**No Request DTO rule:** For objects that are auto-created by the system (ProductionOrder, Transaction, Inventory), there's no request DTO — the frontend never sends these. The backend creates them automatically via WorkflowService.

---

### Double Negative Logic

**File:** `core-service/.../service/RequestService.java`

```java
public boolean allRequestsApproved(Long projectId) {
    return !requestRepository.existsByProjectIdAndStatusNot(projectId, RequestStatus.APPROVED);
}
```

Reading this out loud: *"Does there NOT exist any request whose status is NOT APPROVED?"*

The cleaner way to think about it:
```
existsByProjectIdAndStatusNot(...)  →  "Is there still a pending/quoted/rejected request?"
!existsByProjectIdAndStatusNot(...) →  "No? Then all are approved."
```

This method is called after each `approveRequest()` call. If it returns `true`, it fires the `AllRequestsApprovedEvent` to advance the project to QUOTED.

---

### Shared Database

Both `auth-service` (8081) and `core-service` (8082) connect to the **same MySQL database**, and both map a `Company` entity to the **same `companies` table**.

**Why?** For simplicity. True microservices would have separate databases, but that requires:
- Cross-service API calls to get company data
- Distributed transaction handling
- A message broker (Kafka/RabbitMQ) for eventual consistency

For a project of this scope, sharing a DB and a JWT secret is the pragmatic choice. The services are still logically separated — auth-service owns authentication, core-service owns business logic.

**If asked: "Isn't this wrong for microservices?"**
The honest answer is: *"Yes, in a production microservices system you'd have separate databases. We made a conscious simplification to reduce infrastructure complexity — the JWT acts as the boundary contract between the two services."*

---

## Frontend Concepts

---

### HttpInterceptor

**File:** `core/interceptors/auth.interceptor.ts`

An HTTP Interceptor in Angular sits between every outgoing HTTP request and the network. It can modify requests before they're sent.

```
Component calls this.http.get('/api/projects')
        ↓
AuthInterceptor.intercept() runs automatically
        ↓
Clones the request and adds Authorization header
        ↓
Modified request goes to the backend
```

The key code:
```typescript
const authRequest = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
});
return next.handle(authRequest);
```

**Why `req.clone()`?** HTTP requests in Angular are **immutable** — you can't modify them directly. You must clone and modify the clone.

**How it's registered** (in `app.config.ts`):
```typescript
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

**Why `multi: true`?** It tells Angular to **add** this interceptor to a list rather than **replace** the existing interceptor provider. Without `multi: true`, Angular would think you're trying to replace a single `HTTP_INTERCEPTORS` provider, and earlier interceptors would be lost.

---

### Manual JWT Decoding

**File:** `core/auth/jwt.helper.ts`

```typescript
export function jwtDecode(token: string | null): any | null {
    const payload = token.split('.')[1];               // Part 2 of header.payload.signature
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
}
```

**How a JWT is structured:**
```
eyJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOjV9.signature
        ↑ header           ↑ payload             ↑ signature
```

All three parts are Base64-encoded. The payload is the middle section (`[1]`).

**The replace calls:**
JWTs use **URL-safe Base64** which uses `-` instead of `+` and `_` instead of `/`. The standard `atob()` function needs regular Base64, so we swap them back before decoding.

**Critical point — this does NOT verify the signature.** The frontend just reads the payload to know the user's role and expiry. It does NOT check if the token was tampered with. That's the **backend's job** — the signature is validated by the core-service's `JwtFilter` on every request using the shared secret.

This is safe because: even if someone modifies the payload in localStorage (e.g. changes their role to MANUFACTURER), the backend will reject the request since the signature won't match.

---

### Disabled Field Validation Bug Fix

**File:** `features/auth/register/register.component.ts`

The register form has 3 steps. To validate each step before advancing, we check whether all fields in that step are valid:

```typescript
isCurrentStepValid(): boolean {
    return this.stepFields.every(f => {
        const control = this.registerForm.get(f);
        return control?.disabled || control?.valid;   // ← The fix
    });
}
```

**The bug this fixes:**

When the invite token is present, `companyType` is pre-filled and **disabled**:
```typescript
this.registerForm.get('companyType')?.disable();
```

Angular's `FormGroup.valid` treats a **disabled** field as if it doesn't exist in validation — but the individual `control.valid` property still returns `false` for disabled controls. Without the `control?.disabled` check, Step 1 validation would always fail because `companyType` is both disabled AND "invalid", so the user could never advance to Step 2.

**Why does Angular do this?** It's by design — disabled controls are excluded from form submission (`getRawValue()` is used to include them). The side effect is this validation quirk.

---

### RoleGuard & AuthGuard

**Two separate guards, both applied to protected routes:**

```typescript
// app.routes.ts
{
  path: 'manufacturing',
  component: ManufacturerDashboardComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['manufacturer'] }
}
```

**AuthGuard** — *"Are you logged in at all?"*
```typescript
canActivate(): boolean | UrlTree {
    if (this.auth.isAuthenticated()) return true;
    return this.router.parseUrl('/auth/login');  // redirects
}
```

**RoleGuard** — *"Are you the right type of user for this page?"*
```typescript
canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];   // ['manufacturer']
    const role = this.auth.getUserFromToken()?.role;        // 'supplier'
    return expectedRoles.includes(role);                    // → false → redirect
}
```

Both guards must return `true` for the route to activate. This prevents a Supplier from navigating to `/manufacturing` even if they have a valid JWT.

**How `isAuthenticated()` works:**
```typescript
isAuthenticated(): boolean {
    const user = this.getUserFromToken();   // Decodes JWT from localStorage
    if (!user) return false;               // No token
    if (user.exp && Math.floor(Date.now() / 1000) > user.exp) {
        this.logout();
        return false;                      // Token expired — auto logout
    }
    return true;
}
```

It checks `exp` (expiry) from the JWT payload without calling the backend, using `Date.now() / 1000` (converts ms to seconds to match JWT's unix timestamp format).

---

### Angular Signals

**File:** `register.component.ts`

Angular 17 introduced Signals as a new way to manage reactive state. We use them for UI state flags:

```typescript
currentStep = signal(1);           // current form step
isLoading = signal(false);         // button loading state
showSuccessPopup = signal(false);  // success modal visible?

// Read
this.currentStep()          // → 1

// Write
this.currentStep.update(s => s + 1)   // → 2
this.isLoading.set(true)
```

**Why Signals instead of regular variables?** When you update a Signal, Angular knows that template bindings that depend on it need to re-render. With a regular variable, Angular may not detect the change (especially in `ChangeDetectionStrategy.OnPush` mode used by this component).

---

## Likely Questions & Answers

---

**Q: Explain the overall architecture of Sparesy.**

A: Sparesy has three components — an auth-service on port 8081 (Spring Boot), a core-service on port 8082 (Spring Boot), and a frontend on port 4200 (Angular 17). Both backend services share a MySQL database called `sparesy` and a common JWT secret. The auth-service handles registration and login, and issues JWT tokens. The core-service handles all business logic — projects, sourcing, quotes, production, and finance. The frontend has three separate role-based portals: Manufacturer, Supplier, and Client.

---

**Q: How does authentication work end-to-end?**

A: The user logs in via the Angular form which calls `POST /api/auth/login` on the auth-service. The auth-service verifies the BCrypt password, then generates a JWT containing the `companyId` and `companyType`. The frontend stores this in localStorage. The `AuthInterceptor` automatically attaches this token as a `Bearer` header to every subsequent HTTP request. When a request reaches the core-service, the `JwtFilter` validates the token's signature, extracts the `companyId` and `companyType`, and stores them in `CompanyContext` (a ThreadLocal). Any service can then call `CompanyContext.getCurrentCompanyId()` without the ID being passed as a parameter.

---

**Q: How does the system prevent one user from seeing another user's data?**

A: Every data query uses the `companyId` extracted from the JWT, never a query parameter from the URL. For example, `GET /api/projects/my` doesn't take a client ID as a parameter — it reads `CompanyContext.getCurrentCompanyId()` inside the service and queries `findByClientId(companyId)`. A client can't see another client's projects even if they know the other client's ID, because the JWT locks them to their own ID.

---

**Q: What happens when a client approves a quote?**

A: The client calls `PUT /api/quotes/{id}/approve`. `QuoteService.approveQuote()` sets the quote status to APPROVED and then fires a `QuoteApprovedEvent` via Spring's `ApplicationEventPublisher`. Spring automatically routes this to `WorkflowService.onQuoteApproved()` which then: (1) sets project status to IN_PRODUCTION, (2) creates a ProductionOrder record, (3) records a CLIENT_COST transaction, (4) records a MANUFACTURER_REVENUE transaction, and (5) records a SUPPLIER_REVENUE transaction for each approved supplier request. All of this happens automatically without the controller knowing about it.

---

**Q: Why does WorkflowService use events instead of direct method calls?**

A: Separation of concerns. `QuoteService` should only know about managing quotes. If it directly called ProductionService and TransactionService, it would be tightly coupled to them. Events allow WorkflowService to independently handle the business cascade. It also makes it easy to add new actions on quote approval in the future — you just add more code to `WorkflowService.onQuoteApproved()` without touching `QuoteService` at all.

---

**Q: How does the invite system work? Why can't anyone just register?**

A: Only the Manufacturer can invite Clients and Suppliers. The Manufacturer calls `POST /api/auth/invite` which creates an `Invitation` record in the DB and returns a UUID token. The Manufacturer shares a link containing this token. The invitee opens the link, which validates the token and pre-fills their company type. On registration, the token is sent in the payload, validated, and marked as `used=true` so it can't be reused. The registered company starts with `onboardingStatus = PENDING` and can't log in until the Manufacturer approves them in the Onboarding tab.

---

**Q: What is ThreadLocal and why is it used instead of a regular static variable?**

A: In a Spring Boot server, many HTTP requests are handled simultaneously on different threads from a thread pool. A regular `static` variable would be shared across all threads — Thread A writing `companyId = 5` would overwrite Thread B's `companyId = 12`. `ThreadLocal` gives each thread its own isolated copy of the variable, so Thread A's `companyId = 5` never interferes with Thread B's `companyId = 12`. We clear it after every request (`CompanyContext.clear()`) because threads are reused in a thread pool — if you don't clear, the next request on that thread might read the previous user's data.

---

**Q: How does the frontend know the user's role without calling the backend?**

A: The JWT payload contains `companyType`. The frontend decodes the JWT payload locally using the `jwtDecode()` helper (splits the token on `.`, takes the middle part, base64-decodes it, and JSON-parses it). It does NOT verify the signature — that's the backend's job. The frontend just reads the role to redirect to the right dashboard and show the right UI. Any tampering with the token in localStorage would be caught by the backend's `JwtFilter` on the next API call.

---

**Q: What are Angular Guards and how are they used here?**

A: Guards are classes that Angular calls before activating a route. We have two: `AuthGuard` checks if the user has a valid, non-expired JWT — if not, it redirects to `/auth/login`. `RoleGuard` reads the `data.roles` array from the route definition and checks if the user's `companyType` matches. If not, they're redirected away. Both are applied together (`canActivate: [AuthGuard, RoleGuard]`), so both must return `true` for the route to load.

---

**Q: Why is BCryptPasswordEncoder a `@Bean`? What was wrong with `new BCryptPasswordEncoder()`?**

A: When you write `new BCryptPasswordEncoder()` inside a class, Spring doesn't know about that object. It can't manage its lifecycle, inject it elsewhere, or intercept/replace it in tests. By defining it as a `@Bean` in `AuthServiceApplication`, Spring creates exactly one instance at startup and makes it available for `@Autowired` injection. It's the fundamental Spring principle: let the container manage your objects, don't create them with `new` inside other managed components.

---

**Q: Why do two microservices share one database?**

A: We made a deliberate trade-off for simplicity. True microservices would have separate databases and communicate over HTTP or a message broker (like Kafka). But that would require handling cross-service data joins (e.g. fetching client details from auth-service when building a project response), distributed transactions, and eventual consistency. For this project's scope, sharing a database removes that complexity. The services are still logically separated — auth-service owns authentication and login, core-service owns all business operations. The JWT is the contract between them.

---

**Q: Why does `isCurrentStepValid()` check `control?.disabled || control?.valid`?**

A: When the invite token is present, the `companyType` field is pre-filled and disabled in the form. Angular treats a disabled control's `.valid` property as `false` — but it excludes disabled controls from the overall form validation. So without the `disabled` check, Step 1 would always be invalid because `companyType` is disabled and its `.valid` is `false`. The fix treats a disabled control as "valid for our purposes" — since its value was already set by the backend-validated invite token, we trust it and let the user proceed.

---

**Q: What is `getRawValue()` used for in the register form?**

A: Angular's `formGroup.value` excludes disabled controls. `formGroup.getRawValue()` includes them. Since `companyType` is disabled (pre-filled from invite), we use `getRawValue()` to include it in the submission payload. Without it, the `type` field would be missing from the request body, and the backend would fail or default to null.

---

**Q: How does the system know who the Manufacturer is in WorkflowService?**

A: It queries the database for a company with `type = MANUFACTURER` and `isActive = true`. The system assumes there is exactly one Manufacturer. This is a design assumption — the Manufacturer registers once and owns the system. The `findByTypeAndIsActive(MANUFACTURER, true).stream().findFirst()` pattern reflects this assumption. In a multi-manufacturer system this would need to be redesigned.
