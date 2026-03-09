import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, map, Observable } from "rxjs";
import { TokenService } from "./token.service";
import { jwtDecode } from "./jwt.helper";

export interface AuthUser { id?: number; email?: string; role?: string; exp?: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
    private Api = '/api/auth';
    private userSubject: BehaviorSubject<AuthUser | null>;
    user$;

    constructor(private http: HttpClient, private tokenService: TokenService) {
        this.userSubject = new BehaviorSubject<AuthUser | null>(this.getUserFromToken());
        this.user$ = this.userSubject.asObservable();
    }

    public getUserFromToken(): AuthUser | null {
        const t = this.tokenService.getToken();
        const payload = jwtDecode(t);
        if (!payload) return null;
        return { 
            id: payload.companyId, 
            role: payload.companyType?.toLowerCase(), 
            exp: payload.exp 
        };
    }

    isAuthenticated(): boolean {
        const user = this.getUserFromToken();
        if (!user) return false;
        if (user.exp && Math.floor(Date.now() / 1000) > user.exp) {
            this.logout();
            return false;
        }
        return true;
    }

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post<{ token: string }>(`${this.Api}/login`, credentials)
            .pipe(map(res => {
                this.tokenService.setToken(res.token);
                this.userSubject.next(this.getUserFromToken());
                return res;
            }))
    }

    register(payload: { name: string, email: string, password: string, role: string }) {
        return this.http.post(`${this.Api}/register`, payload);
    }

    logout() {
        this.tokenService.removeToken();
        this.userSubject.next(null);
    }

    getToken(): string | null {
        return this.tokenService.getToken();
    }
}