import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRoles: string[] = route.data['roles'];
        const user = this.auth['getUserFromToken'] ? this.auth['getUserFromToken']() : null;
        const role = user?.role;
        if (!role) {
            this.router.navigate(['/auth/login']);
            return false;
        }
        if (!expectedRoles || expectedRoles.length === 0) return true;
        const allowed = expectedRoles.includes(role);
        if (!allowed) {
            this.router.navigate(['/unauthorized']);
            return false;
        }
        return allowed;
    }
}