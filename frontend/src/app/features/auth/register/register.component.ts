import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
    animations: [
        trigger('slideStep', [
            state('enter-from-right', style({ transform: 'translateX(0)', opacity: 1 })),
            state('exit-to-left', style({ transform: 'translateX(-100%)', opacity: 0 })),
            state('enter-from-left', style({ transform: 'translateX(0)', opacity: 1 })),
            state('exit-to-right', style({ transform: 'translateX(100%)', opacity: 0 })),
            transition('void => enter-from-right', [
                style({ transform: 'translateX(60px)', opacity: 0 }),
                animate('400ms cubic-bezier(0.16, 1, 0.3, 1)')
            ]),
            transition('void => enter-from-left', [
                style({ transform: 'translateX(-60px)', opacity: 0 }),
                animate('400ms cubic-bezier(0.16, 1, 0.3, 1)')
            ]),
        ]),
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(8px)' }),
                animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('popupOverlay', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('250ms ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0 }))
            ])
        ]),
        trigger('popupContent', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.85) translateY(20px)' }),
                animate('350ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
            ])
        ])
    ]
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    currentStep = 1;
    totalSteps = 3;
    slideDirection: 'left' | 'right' = 'right';
    showSuccessPopup = false;
    inviteToken: string | null = null;
    invalidToken = false;

    steps = [
        { number: 1, label: 'Company' },
        { number: 2, label: 'Account' },
        { number: 3, label: 'Contact' }
    ];

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.registerForm = this.fb.group({
            companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            companyType: ['', Validators.required],
            gstNumber: ['', [
                Validators.required,
                Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
            ]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            ]],
            contactNumber: ['', [
                Validators.required,
                Validators.pattern(/^[6-9][0-9]{9}$/)
            ]],
            contactPersonName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
            pincode: ['', [
                Validators.required,
                Validators.pattern(/^[1-9][0-9]{5}$/)
            ]]
        });
    }

    ngOnInit() {
        this.inviteToken = this.route.snapshot.queryParams['token'] || null;

        // If a token is present, validate it on load
        if (this.inviteToken) {
            this.auth.validateInvite(this.inviteToken).subscribe({
                next: (inv: any) => {
                    // Pre-fill company type from invitation
                    this.registerForm.patchValue({ companyType: inv.type });
                    // Lock company type — it's set by the manufacturer's invite
                    this.registerForm.get('companyType')?.disable();
                },
                error: () => {
                    this.invalidToken = true;
                }
            });
        }
    }

    get stepFields(): string[] {
        switch (this.currentStep) {
            case 1: return ['companyName', 'companyType', 'gstNumber'];
            case 2: return ['email', 'password'];
            case 3: return ['contactNumber', 'contactPersonName', 'address', 'pincode'];
            default: return [];
        }
    }

    isCurrentStepValid(): boolean {
        return this.stepFields.every(f =>{
            const control = this.registerForm.get(f);                    
            return control?.disabled || control?.valid;
        });
    }

    shouldShowError(field: string): boolean {
        const control = this.registerForm.get(field);
        return !!(control && control.invalid && control.dirty);
    }

    markCurrentStepDirty() {
        this.stepFields.forEach(f => this.registerForm.get(f)?.markAsDirty());
    }

    nextStep() {
        this.markCurrentStepDirty();
        if (!this.isCurrentStepValid()) return;
        if (this.currentStep < this.totalSteps) {
            this.slideDirection = 'right';
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.slideDirection = 'left';
            this.currentStep--;
        }
    }

    get slideAnimation(): string {
        return this.slideDirection === 'right' ? 'enter-from-right' : 'enter-from-left';
    }

    onSubmit() {
        this.markCurrentStepDirty();
        if (!this.registerForm.valid) return;

        const v = this.registerForm.getRawValue(); // getRawValue includes disabled fields
        const payload: any = {
            name: v.companyName,
            email: v.email,
            password: v.password,
            type: v.companyType,
            gstNumber: v.gstNumber,
            contactNumber: v.contactNumber,
            address: v.address,
            pincode: v.pincode,
            contactPersonName: v.contactPersonName
        };

        // Attach invite token if present
        if (this.inviteToken) {
            payload.inviteToken = this.inviteToken;
        }

        this.auth.register(payload).subscribe({
            next: () => { this.showSuccessPopup = true; },
            error: err => {
                alert('Registration failed: ' + (err.error?.message || 'Something went wrong'));
            }
        });
    }

    closePopup() {
        this.showSuccessPopup = false;
        this.router.navigate(['/auth/login']);
    }
}