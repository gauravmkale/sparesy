import { Component } from '@angular/core';

@Component({
  selector: 'app-client-dashboard',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 class="text-4xl font-bold text-indigo-400 mb-4">Client Dashboard</h1>
        <p class="text-gray-400">Track your PCB projects, upload designs, and manage payments.</p>
    </div>
  `,
  standalone: true
})
export class ClientDashboardComponent {}
