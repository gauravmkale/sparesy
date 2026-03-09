import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
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
        this.auth.login(this.loginForm.value).subscribe({
            next: () => {
                const user = this.auth['getUserFromToken']();
                if (user?.role === 'manufacturer') this.router.navigate(['/manufacturing']);
                else if (user?.role === 'supplier') this.router.navigate(['/supplier']);
                else this.router.navigate(['/client']);
            },
            error: err => {
                console.error(err);
            }
        })
    }
}