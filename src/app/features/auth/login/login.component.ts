import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../core/auth/auth.service";
import { Router, RouterModule } from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    imports: [ReactiveFormsModule, CommonModule, RouterModule]
})

export class LoginComponent {
    loginForm: FormGroup;

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }


    onSubmit() {
        if (!this.loginForm.valid) return;
        console.log('Attempting login...', this.loginForm.value);
        this.auth.login(this.loginForm.value).subscribe({
            next: (res) => {
                console.log('Login successful, response:', res);
                const user = this.auth.getUserFromToken();
                console.log('User from token:', user);
                if (user?.role === 'manufacturer') this.router.navigate(['/manufacturing']);
                else if (user?.role === 'supplier') this.router.navigate(['/supplier']);
                else this.router.navigate(['/client']);
            },
            error: err => {
                console.error('Login failed:', err);
                alert('Login failed: ' + (err.error?.message || 'Check console for details'));
            }
        })
    }
}