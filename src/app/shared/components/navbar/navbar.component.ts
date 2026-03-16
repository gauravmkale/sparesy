import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    imports: [RouterModule, CommonModule]
})
export class NavbarComponent {
    constructor(public auth: AuthService, private router: Router) { }

    get user(): AuthUser | null {
        return this.auth.getUserFromToken();
    }

    get isLoggedIn(): boolean {
        return this.auth.isAuthenticated();
    }

    get dashboardRoute(): string {
        const role = this.user?.role;
        if (role === 'manufacturer') return '/manufacturing';
        if (role === 'supplier') return '/supplier';
        if (role === 'client') return '/client';
        return '/';
    }

    get roleBadge(): string {
        return this.user?.role?.charAt(0).toUpperCase() + (this.user?.role?.slice(1) || '');
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/auth/login']);
    }
}
