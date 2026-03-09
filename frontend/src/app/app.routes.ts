import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { LandingPageComponent } from './landingpage.component';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: '', component: LandingPageComponent }
];