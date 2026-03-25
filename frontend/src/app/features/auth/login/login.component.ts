import { Component, signal, inject, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../core/auth/auth.service";
import { Router, RouterModule } from "@angular/router";
import { NotificationService } from "../../../core/services/notification.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoginComponent {
    loginForm: FormGroup;
    isLoading = signal(false);

    private auth = inject(AuthService);
    private router = inject(Router);
    private notif = inject(NotificationService);
    private fb = inject(FormBuilder);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (!this.loginForm.valid || this.isLoading()) return;

        this.isLoading.set(true);
        this.auth.login(this.loginForm.value).subscribe({
            next: () => {
                this.notif.success('Login successful!');
                const user = this.auth.getUserFromToken();
                if (user?.role === 'manufacturer') this.router.navigate(['/manufacturing']);
                else if (user?.role === 'supplier') this.router.navigate(['/supplier']);
                else this.router.navigate(['/client']);
            },
            error: err => {
                this.isLoading.set(false);
                this.notif.error(err.error?.message || 'Login failed');
            }
        })
    }
}