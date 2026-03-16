import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ClientOverviewComponent } from './overview/overview.component';
import { ClientProjectsComponent } from './projects/projects.component';
import { ClientQuotesComponent } from './quotes/quotes.component';
import { ClientTransactionsComponent } from './transactions/transactions.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ClientOverviewComponent, ClientProjectsComponent,
    ClientQuotesComponent, ClientTransactionsComponent
  ],
  template: `
    <div class="flex min-h-[calc(100vh-57px)]">
      <aside class="w-56 bg-[#0d0d0d] border-r border-gray-800/60 flex flex-col py-4 shrink-0">
        <div class="px-4 mb-4">
          <h2 class="text-xs font-semibold text-gray-600 uppercase tracking-widest">Client Portal</h2>
        </div>
        <nav class="flex-1 space-y-0.5 px-2">
          <button *ngFor="let tab of tabs"
            (click)="activeTab = tab.key"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
            [ngClass]="{
              'bg-indigo-500/10 text-indigo-400': activeTab === tab.key,
              'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]': activeTab !== tab.key
            }">
            <span class="text-base" [innerHTML]="tab.icon"></span>
            {{ tab.label }}
          </button>
        </nav>
      </aside>
      <main class="flex-1 p-6 overflow-auto bg-[#0a0a0a]">
        <app-client-overview *ngIf="activeTab === 'overview'" />
        <app-client-projects *ngIf="activeTab === 'projects'" />
        <app-client-quotes *ngIf="activeTab === 'quotes'" />
        <app-client-transactions *ngIf="activeTab === 'transactions'" />
      </main>
    </div>
  `
})
export class ClientDashboardComponent {
  activeTab = 'overview';
  tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'projects', label: 'My Projects', icon: '📁' },
    { key: 'quotes', label: 'Quotes', icon: '📋' },
    { key: 'transactions', label: 'Transactions', icon: '💰' }
  ];
}
