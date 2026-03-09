import { Component } from '@angular/core';

@Component({
  selector: 'app-manufacturer-dashboard',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 class="text-4xl font-bold text-teal-400 mb-4">Manufacturer Dashboard</h1>
        <p class="text-gray-400">Welcome back. Manage your factory, suppliers, and client projects here.</p>
    </div>
  `,
  standalone: true
})
export class ManufacturerDashboardComponent {}
