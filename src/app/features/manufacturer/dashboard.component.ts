import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

import { MfgOverviewComponent } from './overview/overview.component';
import { MfgProjectsComponent } from './projects/projects.component';
import { MfgComponentsComponent } from './components/components.component';
import { MfgSuppliersComponent } from './suppliers/suppliers.component';
import { MfgProductionComponent } from './production/production.component';
import { MfgInventoryComponent } from './inventory/inventory.component';
import { MfgTransactionsComponent } from './transactions/transactions.component';

@Component({
  selector: 'app-manufacturer-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MfgOverviewComponent, MfgProjectsComponent, MfgComponentsComponent,
    MfgSuppliersComponent, MfgProductionComponent,
    MfgInventoryComponent, MfgTransactionsComponent
  ],
  template: `
    <div class="flex min-h-[calc(100vh-57px)]">
      <!-- Sidebar -->
      <aside class="w-56 bg-[#0d0d0d] border-r border-gray-800/60 flex flex-col py-4 shrink-0">
        <div class="px-4 mb-4">
          <h2 class="text-xs font-semibold text-gray-600 uppercase tracking-widest">Manufacturer</h2>
        </div>
        <nav class="flex-1 space-y-0.5 px-2">
          <button *ngFor="let tab of tabs"
            (click)="activeTab = tab.key"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
            [ngClass]="{
              'bg-teal-500/10 text-teal-400': activeTab === tab.key,
              'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]': activeTab !== tab.key
            }">
            <span class="text-base" [innerHTML]="tab.icon"></span>
            {{ tab.label }}
          </button>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 p-6 overflow-auto bg-[#0a0a0a]">
        <app-mfg-overview *ngIf="activeTab === 'overview'" />
        <app-mfg-projects *ngIf="activeTab === 'projects'" />
        <app-mfg-components *ngIf="activeTab === 'components'" />
        <app-mfg-suppliers *ngIf="activeTab === 'suppliers'" />
        <app-mfg-production *ngIf="activeTab === 'production'" />
        <app-mfg-inventory *ngIf="activeTab === 'inventory'" />
        <app-mfg-transactions *ngIf="activeTab === 'transactions'" />
      </main>
    </div>
  `
})
export class ManufacturerDashboardComponent {
  activeTab = 'overview';

  tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'projects', label: 'Projects', icon: '📁' },
    { key: 'components', label: 'Components', icon: '🔩' },
    { key: 'suppliers', label: 'Suppliers', icon: '🏭' },
    { key: 'production', label: 'Production', icon: '⚙️' },
    { key: 'inventory', label: 'Inventory', icon: '📦' },
    { key: 'transactions', label: 'Transactions', icon: '💰' }
  ];
}
