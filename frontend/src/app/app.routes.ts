import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { LandingPageComponent } from './features/landing/landingpage.component';
import { ManufacturerDashboardComponent } from './features/manufacturer/dashboard.component';
import { SupplierDashboardComponent } from './features/supplier/dashboard.component';
import { ClientDashboardComponent } from './features/client/dashboard.component';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'manufacturing', component: ManufacturerDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['manufacturer'] } },
    { path: 'supplier', component: SupplierDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['supplier'] } },
    { path: 'client', component: ClientDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['client'] } },
    { path: '', component: LandingPageComponent }
];