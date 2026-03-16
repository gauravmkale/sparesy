# Sparesy Frontend — Documentation

**Sparesy | Private Client & Supplier Portal**  
**Port:** 4200  
**Framework:** Angular 21.2.0

---

## Architecture Overview

The Sparesy frontend is built with a **Layered Feature-Based Architecture**. This ensures that the codebase remains scalable, maintainable, and easy to navigate as new modules are added.

### 1. Core Layer (`src/app/core`)
The "brain" of the application. It contains singleton services, guards, and interceptors that exist for the entire lifetime of the app.
- **`auth/`**: Manages user sessions, JWT tokens, and login/logout logic.
- **`guards/`**: Protects routes based on authentication status (`AuthGuard`) and user roles (`RoleGuard`).
- **`interceptors/`**: Automatically attaches the JWT `Authorization` header to every outgoing API request.

### 2. Shared Layer (`src/app/shared`)
Contains reusable UI components, pipes, and directives that are used across multiple features.
- **`components/`**: Common UI elements like the `NavbarComponent`.

### 3. Features Layer (`src/app/features`)
Contains the actual screens (pages) of the application, organized by domain.
- **`landing/`**: The public entry point.
- **`auth/`**: Login and registration screens.
- **`manufacturer/`**: Dashboard for factory admins.
- **`supplier/`**: Portal for parts suppliers.
- **`client/`**: Dashboard for PCB project owners.

---

## Backend Communication

The frontend communicates with two backend services:
1. **Auth Service (8081)**: For login and registration.
2. **Core Service (8082)**: For business logic (projects, quotes, inventory).

### Proxy Configuration (`proxy.conf.json`)
To avoid CORS issues and simplify development, we use an Angular proxy. This allows the frontend to call `/api/auth` and `/api` on its own port (4200), and the server "tunnels" those requests to the correct backend.

```json
{
  "/api/auth": { "target": "http://127.0.0.1:8081" },
  "/api": { "target": "http://127.0.0.1:8082" }
}
```

### The Auth Interceptor
Every request sent via `HttpClient` is intercepted by `AuthInterceptor`. It checks if a JWT token exists in local storage and adds it to the header:
`Authorization: Bearer <token>`

---

## Routing & Security

### Route Definitions (`src/app/app.routes.ts`)
Routes are protected using role-based data.
```typescript
{ 
  path: 'manufacturing', 
  component: ManufacturerDashboardComponent, 
  canActivate: [AuthGuard, RoleGuard], 
  data: { roles: ['manufacturer'] } 
}
```

### Redirection Logic
Upon successful login, the `LoginComponent` reads the `companyType` from the JWT and redirects the user:
- `MANUFACTURER` → `/manufacturing`
- `SUPPLIER` → `/supplier`
- `CLIENT` → `/client`

---

## How to Run

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm start
   ```
   *Note: This command automatically uses `proxy.conf.json`.*

3. **Open in Browser:**
   Navigate to `http://localhost:4200`

---

## Key Files
- `src/main.ts`: Application entry point.
- `src/app/app.component.ts`: The main layout shell.
- `src/app/app.config.ts`: Global providers (Routing, HTTP, Interceptors).
- `src/app/app.routes.ts`: Central routing configuration.
