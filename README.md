# Sparesy Backend — Microservices

This is the backend for **Sparesy**, an enterprise platform for PCB manufacturing and component sourcing management.

## 🏗 System Architecture
The backend is split into two Spring Boot microservices that share a single MySQL database (`sparesy`) and a common JWT secret for authentication.

1.  **Auth-Service (Port 8081)**: Handles user registration, login, and JWT token generation.
2.  **Core-Service (Port 8082)**: Manages projects, component sourcing, quotes, production tracking, inventory, and transactions.

---

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- MySQL 8.0+ (Database named `sparesy` must exist)
- Maven

### Database Setup
Update `src/main/resources/application.properties` in both services with your local MySQL credentials:
```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

### Running the Services
Run each service from its respective folder:
```bash
mvn spring-boot:run
```

---

## 🔐 Authentication
All requests to the **Core-Service** (except Swagger/API Docs) require a valid JWT token in the header:
`Authorization: Bearer <your_jwt_token>`

The token contains:
- `companyId`: The primary key of the company.
- `companyType`: `MANUFACTURER`, `CLIENT`, or `SUPPLIER`.

---

## 🔄 Business Workflow (End-to-End)

1.  **Onboarding**: Users register as one of the three roles (Manufacturer, Client, Supplier).
2.  **Catalog Setup**: 
    - Manufacturers add generic components to the system.
    - Suppliers add those components to their own "Supplier Catalog" with their specific price and stock.
3.  **Project Submission**: A Client submits a PCB project (Quantity, Layer Count, etc.).
4.  **Sourcing**: 
    - Manufacturer views the project and sends "Requests" to Suppliers for the required components.
    - Suppliers respond with a "Quote" (Price and Delivery Date) for those requests.
5.  **Project Quoting**: 
    - Manufacturer approves supplier quotes and builds a final Project Quote for the Client.
    - Client approves the final Quote.
6.  **Production & Finance**:
    - Approval automatically triggers a **Production Order** and creates **Transactions** (Client Cost & Supplier Revenue).
    - Manufacturer advances the production through stages (Component Prep → PCB Fab → SMT → Ready).

---

## 📊 Core Entities (Schemas)

| Entity | Description |
| :--- | :--- |
| **Company** | Profile for Manufacturer, Client, or Supplier. |
| **Project** | The PCB assembly request from the Client. |
| **Component** | Generic electronic parts (e.g., Resistor 10k). |
| **SupplierComponent** | A specific supplier's price and stock for a component. |
| **Request** | Manufacturer asking a Supplier for a component price. |
| **Quote** | The final price proposal sent to the Client. |
| **ProductionOrder** | Tracks the real-time manufacturing stage of a project. |
| **Transaction** | Financial records for costs and revenue. |

---

## 🛠 API Reference (Key Endpoints)

### Auth Service (8081)
- `POST /api/auth/register` : Register a new company.
- `POST /api/auth/login` : Returns JWT, companyId, and type.

### Core Service (8082)
- `GET /api/projects/my` : List projects for the logged-in client.
- `POST /api/components` : Manufacturer adds a new part to the system.
- `GET /api/supplier-components/my` : Supplier manages their price/stock.
- `PUT /api/production/{id}/advance` : Manufacturer moves project to next stage.
- `GET /api/transactions/revenue` : Get financial reports.

---

## 🧪 Testing
The `tests/` folder contains shell scripts to verify the entire flow:
1. `test-1-register.sh` : Creates dummy accounts.
2. `test-2-auth.sh` : Logins and provides tokens.
3. `test-3-workflow.sh` : Executes the sourcing and quoting flow.
4. `test-4-production.sh` : Verifies production stages and transactions.
