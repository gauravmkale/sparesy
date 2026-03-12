# Core Service — Documentation & Progress
**Sparesy | Private Client & Supplier Portal**
**Port:** 8082
**Last Updated:** 12 March 2026

---

## What is Core Service?

Core service is the brain of Sparesy. It handles all business logic after a user has logged in via auth-service. Every request to core-service must carry a valid JWT token issued by auth-service.

It handles:
- Project submission and tracking
- Component catalog management
- Supplier sourcing and quoting workflow
- Client quote review and approval
- Production order tracking
- Inventory management
- Transaction and revenue recording
- Real-time WebSocket notifications (coming next session)
- Workflow automation via Spring Application Events (coming next session)

---

## How it fits into the system

```
Browser (Angular — port 4200)
        │
        │  Every request carries: Authorization: Bearer {token}
        ▼
Core Service (port 8082)
        │
        │  JwtFilter validates token on every request
        │  CompanyContext stores companyId + companyType for the request
        │  Controllers → Services → Repositories
        ▼
MySQL (port 3306) — sparesy database — 9 tables
```

---

## Folder Structure

```
core-service/
├── pom.xml                          → Maven dependencies
└── src/main/
    ├── java/com/sparesy/core/
    │   │
    │   ├── CoreServiceApplication.java         → Entry point, starts on port 8082
    │   │
    │   ├── enums/
    │   │   ├── CompanyType.java                → MANUFACTURER, CLIENT, SUPPLIER
    │   │   ├── ProjectStatus.java              → SUBMITTED → BOM_REVIEW → SOURCING
    │   │   │                                      → QUOTED → QUOTE_APPROVED
    │   │   │                                      → IN_PRODUCTION → DELIVERED → CANCELLED
    │   │   ├── RequestStatus.java              → PENDING → QUOTED → APPROVED → REJECTED
    │   │   ├── QuoteStatus.java                → DRAFT → SENT → APPROVED → REJECTED
    │   │   ├── ProductionStage.java            → COMPONENT_PREP → PCB_FABRICATION
    │   │   │                                      → SMT_ASSEMBLY → SOLDERING
    │   │   │                                      → QC_INSPECTION → PACKAGING → READY
    │   │   └── TransactionType.java            → SUPPLIER_REVENUE, MANUFACTURER_REVENUE, CLIENT_COST
    │   │
    │   ├── entity/
    │   │   ├── Company.java                    → maps to companies table (shared with auth-service)
    │   │   ├── Project.java                    → client FK, status, file paths, PCB specs
    │   │   ├── Component.java                  → master catalog — name, partNumber (unique), category
    │   │   ├── SupplierComponent.java          → supplier FK, component FK, price, stock, leadTime
    │   │   ├── Request.java                    → project FK, supplier FK, component FK, quotedPrice
    │   │   ├── Quote.java                      → project FK, totalPrice, lineItemsJson, status
    │   │   ├── ProductionOrder.java            → project FK, currentStage, stageHistoryJson
    │   │   ├── Inventory.java                  → component FK, onHand, reserved, reorderThreshold
    │   │   └── Transaction.java                → company FK, project FK, component FK, amount, type
    │   │
    │   ├── dto/
    │   │   ├── request/
    │   │   │   ├── ProjectRequestDTO.java          → name, quantity, layerCount, boardThickness, surfaceFinish
    │   │   │   ├── ComponentRequestDTO.java         → name, partNumber, category, description
    │   │   │   ├── SupplierComponentRequestDTO.java → componentId, unitPrice, stockQuantity, leadTimeDays
    │   │   │   ├── RequestRequestDTO.java           → projectId, supplierCompanyId, componentId, quantityNeeded
    │   │   │   └── QuoteRequestDTO.java             → projectId, totalPrice, leadTimeDays, lineItemsJson, notes
    │   │   └── response/
    │   │       ├── CompanyResponseDTO.java          → id, name, email, type, contactPersonName (no password)
    │   │       ├── ProjectResponseDTO.java          → all fields + clientName flattened
    │   │       ├── ComponentResponseDTO.java        → id, name, partNumber, category, description
    │   │       ├── SupplierComponentResponseDTO.java → all fields + supplierName + componentName flattened
    │   │       ├── RequestResponseDTO.java          → all fields + projectName + supplierName + componentName
    │   │       ├── QuoteResponseDTO.java            → all fields + projectName
    │   │       ├── ProductionOrderResponseDTO.java  → all fields + projectName + stageHistoryJson
    │   │       ├── InventoryResponseDTO.java        → all fields + availableQuantity + isLowStock
    │   │       └── TransactionResponseDTO.java      → all fields + companyName + projectName + componentName
    │   │
    │   ├── repository/
    │   │   ├── CompanyRepository.java          → findByType, existsByEmail
    │   │   ├── ProjectRepository.java          → findByClientId, findAllByOrderBySubmittedAtDesc
    │   │   ├── ComponentRepository.java        → findByPartNumber, findByCategory
    │   │   ├── SupplierComponentRepository.java → findBySupplierId, findBySupplierIdAndIsActive
    │   │   ├── RequestRepository.java          → findByProjectId, existsByProjectIdAndStatusNot
    │   │   ├── QuoteRepository.java            → findByProjectId, findByStatus
    │   │   ├── ProductionOrderRepository.java  → findByProjectId, findByCurrentStage
    │   │   ├── InventoryRepository.java        → findByComponentId, findByQuantityOnHandLessThan
    │   │   └── TransactionRepository.java      → sumAmountByCompanyIdAndType (@Query)
    │   │
    │   ├── service/
    │   │   ├── CompanyService.java             → getAllClients, getAllSuppliers, getCompanyById
    │   │   ├── ProjectService.java             → submitProject, getProjectById, getProjectsByClient,
    │   │   │                                      getAllProjects, updateStatus
    │   │   ├── ComponentService.java           → addComponent, getAllComponents, getComponentById,
    │   │   │                                      searchByPartNumber, getByCategory
    │   │   ├── SupplierComponentService.java   → addToSupplierCatalog, getBySupplier,
    │   │   │                                      getActiveBySupplier, updateStock, updatePrice
    │   │   ├── RequestService.java             → sendRequest, getRequestsByProject,
    │   │   │                                      getRequestsBySupplier, submitQuote,
    │   │   │                                      approveRequest, rejectRequest, allRequestsApproved
    │   │   ├── QuoteService.java               → createQuote, getQuoteByProject, sendToClient,
    │   │   │                                      approveQuote, rejectQuote, getSentQuotes
    │   │   ├── ProductionService.java          → createProductionOrder, getById, getByProject,
    │   │   │                                      advanceStage, getAllActive
    │   │   ├── InventoryService.java           → createInventoryRecord, getByComponent,
    │   │   │                                      getInventory, updateStock, reserveStock, getLowStockAlerts
    │   │   └── TransactionService.java         → recordSupplierRevenue, recordClientCost,
    │   │                                          recordManufacturerRevenue, getByCompany, getTotalRevenue
    │   │
    │   ├── controller/
    │   │   ├── CompanyController.java          → GET /api/companies/clients
    │   │   │                                      GET /api/companies/suppliers
    │   │   │                                      GET /api/companies/{id}
    │   │   ├── ProjectController.java          → POST /api/projects
    │   │   │                                      GET /api/projects
    │   │   │                                      GET /api/projects/my
    │   │   │                                      GET /api/projects/{id}
    │   │   │                                      PUT /api/projects/{id}/status
    │   │   ├── ComponentController.java        → POST /api/components
    │   │   │                                      GET /api/components
    │   │   │                                      GET /api/components/{id}
    │   │   │                                      GET /api/components/search?partNumber=
    │   │   │                                      GET /api/components/category?category=
    │   │   ├── SupplierComponentController.java → POST /api/supplier-components
    │   │   │                                      GET /api/supplier-components/my
    │   │   │                                      GET /api/supplier-components/{supplierId}
    │   │   │                                      PUT /api/supplier-components/{id}/stock
    │   │   │                                      PUT /api/supplier-components/{id}/price
    │   │   ├── RequestController.java          → POST /api/requests
    │   │   │                                      GET /api/requests/project/{projectId}
    │   │   │                                      GET /api/requests/my
    │   │   │                                      PUT /api/requests/{id}/quote
    │   │   │                                      PUT /api/requests/{id}/approve
    │   │   │                                      PUT /api/requests/{id}/reject
    │   │   ├── QuoteController.java            → POST /api/quotes
    │   │   │                                      GET /api/quotes/project/{projectId}
    │   │   │                                      GET /api/quotes/my
    │   │   │                                      PUT /api/quotes/{id}/send
    │   │   │                                      PUT /api/quotes/{id}/approve
    │   │   │                                      PUT /api/quotes/{id}/reject
    │   │   ├── ProductionController.java       → GET /api/production
    │   │   │                                      GET /api/production/{id}
    │   │   │                                      GET /api/production/project/{projectId}
    │   │   │                                      PUT /api/production/{id}/advance
    │   │   ├── InventoryController.java        → GET /api/inventory
    │   │   │                                      GET /api/inventory/component/{componentId}
    │   │   │                                      GET /api/inventory/alerts
    │   │   │                                      PUT /api/inventory/{componentId}/stock
    │   │   └── TransactionController.java      → GET /api/transactions/my
    │   │                                          GET /api/transactions/revenue?type=
    │   │
    │   ├── security/
    │   │   ├── CompanyContext.java             → ThreadLocal — holds companyId + companyType per request
    │   │   ├── JwtFilter.java                  → validates Bearer token, populates CompanyContext
    │   │   └── SecurityConfig.java             → stateless, CSRF off, Swagger permitted, all else requires JWT
    │   │
    │   ├── workflow/                           → 🔴 NOT BUILT YET
    │   │   ├── WorkflowService.java
    │   │   └── events/
    │   │       ├── ProjectSubmittedEvent.java
    │   │       ├── AllRequestsApprovedEvent.java
    │   │       └── QuoteApprovedEvent.java
    │   │
    │   └── websocket/                          → 🔴 NOT BUILT YET
    │       ├── WebSocketConfig.java
    │       └── NotificationService.java
    │
    └── resources/
        └── application.properties

```

---

## API Endpoints

### Company
| Method | URL | Who | What |
|---|---|---|---|
| GET | /api/companies/clients | Manufacturer | List all client companies |
| GET | /api/companies/suppliers | Manufacturer | List all supplier companies |
| GET | /api/companies/{id} | All | Get company by id |

### Projects
| Method | URL | Who | What |
|---|---|---|---|
| POST | /api/projects | Client | Submit a new project |
| GET | /api/projects | Manufacturer | All projects newest first |
| GET | /api/projects/my | Client | Client's own projects |
| GET | /api/projects/{id} | All | Single project detail |
| PUT | /api/projects/{id}/status | Manufacturer | Update project status |

### Components
| Method | URL | Who | What |
|---|---|---|---|
| POST | /api/components | Manufacturer | Add to master catalog |
| GET | /api/components | All | List all components |
| GET | /api/components/{id} | All | Single component |
| GET | /api/components/search?partNumber= | All | Search by part number |
| GET | /api/components/category?category= | All | Filter by category |

### Supplier Components
| Method | URL | Who | What |
|---|---|---|---|
| POST | /api/supplier-components | Supplier | Add to own catalog |
| GET | /api/supplier-components/my | Supplier | Own full catalog |
| GET | /api/supplier-components/{supplierId} | Manufacturer | Supplier's active catalog |
| PUT | /api/supplier-components/{id}/stock | Supplier | Update stock quantity |
| PUT | /api/supplier-components/{id}/price | Supplier | Update unit price |

### Requests
| Method | URL | Who | What |
|---|---|---|---|
| POST | /api/requests | Manufacturer | Send request to supplier |
| GET | /api/requests/project/{projectId} | Manufacturer | All requests for a project |
| GET | /api/requests/my | Supplier | Incoming requests |
| PUT | /api/requests/{id}/quote | Supplier | Submit quoted price + delivery |
| PUT | /api/requests/{id}/approve | Manufacturer | Approve supplier quote |
| PUT | /api/requests/{id}/reject | Manufacturer | Reject supplier quote |

### Quotes
| Method | URL | Who | What |
|---|---|---|---|
| POST | /api/quotes | Manufacturer | Create quote draft |
| GET | /api/quotes/project/{projectId} | All | Quote for a project |
| GET | /api/quotes/my | Client | Client's sent quotes |
| PUT | /api/quotes/{id}/send | Manufacturer | Send quote to client |
| PUT | /api/quotes/{id}/approve | Client | Approve quote |
| PUT | /api/quotes/{id}/reject | Client | Reject quote with note |

### Production
| Method | URL | Who | What |
|---|---|---|---|
| GET | /api/production | Manufacturer | All active orders |
| GET | /api/production/{id} | All | Single order |
| GET | /api/production/project/{projectId} | All | Order for a project |
| PUT | /api/production/{id}/advance | Manufacturer | Advance to next stage |

### Inventory
| Method | URL | Who | What |
|---|---|---|---|
| GET | /api/inventory | Manufacturer | All stock levels |
| GET | /api/inventory/component/{componentId} | Manufacturer | Stock for one component |
| GET | /api/inventory/alerts | Manufacturer | Low stock alerts |
| PUT | /api/inventory/{componentId}/stock | Manufacturer | Update stock quantity |

### Transactions
| Method | URL | Who | What |
|---|---|---|---|
| GET | /api/transactions/my | All | Own transaction history |
| GET | /api/transactions/revenue?type= | All | Total revenue by type |

---

## Verified Working ✅
- All 9 tables auto-created by Hibernate on first boot
- JwtFilter registered in Spring Security filter chain
- Generated security password warning silenced
- Swagger UI accessible at http://localhost:8082/swagger-ui/index.html
- Service boots clean in ~2.5 seconds
- All 9 controllers registered and visible in Swagger

---

## 🔴 NOT BUILT YET — Next Session

### 1. FileService + FileController
Handles Gerber zip and BOM CSV file uploads from the client.

Methods needed:
- `saveFile(MultipartFile file, Long projectId, String fileType)` — saves to `./uploads/{projectId}/`
- `getFilePath(Long projectId, String fileType)` — returns stored path

Endpoints needed:
- `POST /api/files/upload` — client uploads Gerber or BOM file
- `GET /api/files/{projectId}/{type}` — fetch file path for a project

### 2. WorkflowService + 3 Event Classes
The automation engine. Listens for key events and auto-advances the system.

```
ProjectSubmittedEvent     → fired when client submits project
                          → sets status to SUBMITTED

AllRequestsApprovedEvent  → fired when manufacturer approves last request
                          → sets status to QUOTED

QuoteApprovedEvent        → fired when client approves quote
                          → sets status to IN_PRODUCTION
                          → auto-creates ProductionOrder
                          → auto-records transactions
```

Files needed:
- `workflow/events/ProjectSubmittedEvent.java`
- `workflow/events/AllRequestsApprovedEvent.java`
- `workflow/events/QuoteApprovedEvent.java`
- `workflow/WorkflowService.java`

### 3. WebSocketConfig + NotificationService
Real-time push notifications to all three portals without page refresh.

Files needed:
- `websocket/WebSocketConfig.java` — configures STOMP over SockJS
- `websocket/NotificationService.java` — push(companyId, message)

---

## application.properties

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
springdoc.swagger-ui.path=/swagger-ui/index.html
springdoc.api-docs.path=/api-docs
```

---

## How to Run

**Step 1 — Set Java 17:**
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

**Step 2 — Start core-service:**
```bash
cd sparesy/core-service
mvn spring-boot:run
```

**Step 3 — Verify:**
```
Started CoreServiceApplication in ~2.5 seconds
Tomcat started on port 8082
```

**Step 4 — Open Swagger:**
```
http://localhost:8082/swagger-ui/index.html
```

---

## Key Rules

**Multi-tenancy — most important rule:**
```java
// ALWAYS do this in every service method
Long companyId = CompanyContext.getCurrentCompanyId();
repository.findByClientId(companyId);

// NEVER do this
repository.findAll();
```

**JWT flow:**
```
Request → JwtFilter reads Bearer token
        → validates signature + expiry
        → extracts companyId + companyType
        → stores in CompanyContext (ThreadLocal)
        → Spring Security marks request authenticated
        → Controller runs
        → CompanyContext.clear() prevents memory leaks
```

**Service dependencies:**
```
CompanyService       ← no dependencies
ComponentService     ← no dependencies
ProjectService       ← CompanyService
SupplierComponentService ← CompanyService, ComponentService
RequestService       ← ProjectService, CompanyService, ComponentService
QuoteService         ← ProjectService
ProductionService    ← ProjectService
InventoryService     ← ComponentService
TransactionService   ← no dependencies
```core-service/core-service.md