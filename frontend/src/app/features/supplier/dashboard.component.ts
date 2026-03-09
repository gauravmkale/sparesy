import { Component } from '@angular/core';

@Component({
  selector: 'app-supplier-dashboard',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 class="text-4xl font-bold text-blue-400 mb-4">Supplier Portal</h1>
        <p class="text-gray-400">Manage your catalog, view component requests, and submit quotes.</p>
    </div>
  `,
  standalone: true
})
export class SupplierDashboardComponent {}
