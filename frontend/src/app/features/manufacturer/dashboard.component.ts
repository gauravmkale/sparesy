import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

import { MfgOverviewComponent } from './overview/overview.component';
import { MfgProjectsComponent } from './projects/projects.component';
import { MfgComponentsComponent } from './components/components.component';
import { MfgSuppliersComponent } from './suppliers/suppliers.component';
import { MfgProductionComponent } from './production/production.component';
import { MfgNotificationsComponent } from './notifications/notifications.component';
import { MfgTransactionsComponent } from './transactions/transactions.component';
import { MfgOnboardingComponent } from './onboarding/onboarding.component';
import { MfgClientsComponent } from './clients/clients.component';
import { ManufacturerStateService, NotificationEntry } from '../../core/services/manufacturer-state.service';
import { effect, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProjectService } from '../../core/services/project.service';
import { QuoteService } from '../../core/services/quote.service';
import { RequestService } from '../../core/services/request.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-manufacturer-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MfgOverviewComponent, MfgProjectsComponent, MfgComponentsComponent,
    MfgSuppliersComponent, MfgProductionComponent,
    MfgNotificationsComponent, MfgTransactionsComponent,
    MfgOnboardingComponent, MfgClientsComponent
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
            (click)="state.activeTab.set(tab.key)"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
            [ngClass]="{
              'bg-teal-500/10 text-teal-400': state.activeTab() === tab.key,
              'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]': state.activeTab() !== tab.key
            }">
            <div class="flex items-center gap-3">
              <span class="text-base" [innerHTML]="tab.icon"></span>
              {{ tab.label }}
            </div>
            
            <!-- Notification Badge -->
            <div *ngIf="tab.key === 'notifications' && state.notificationCount() > 0"
              class="h-5 w-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse shadow-lg shadow-teal-500/20">
              {{ state.notificationCount() }}
            </div>
          </button>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 p-6 overflow-auto bg-[#0a0a0a]">
        <app-mfg-overview *ngIf="state.activeTab() === 'overview'" />
        <app-mfg-projects *ngIf="state.activeTab() === 'projects'" />
        <app-mfg-components *ngIf="state.activeTab() === 'components'" />
        <app-mfg-suppliers *ngIf="state.activeTab() === 'suppliers'" />
        <app-mfg-clients *ngIf="state.activeTab() === 'clients'" />
        <app-mfg-production *ngIf="state.activeTab() === 'production'" />
        <app-mfg-notifications *ngIf="state.activeTab() === 'notifications'" />
        <app-mfg-transactions *ngIf="state.activeTab() === 'transactions'" />
        <app-mfg-onboarding *ngIf="state.activeTab() === 'onboarding'" />
      </main>
    </div>
  `
})
export class ManufacturerDashboardComponent implements OnInit {
  public state = inject(ManufacturerStateService);
  private projectService = inject(ProjectService);
  private quoteService = inject(QuoteService);
  private requestService = inject(RequestService);

  tabs = [
    { key: 'overview',     label: 'Overview',     icon: '📊' },
    { key: 'projects',     label: 'Projects',     icon: '📁' },
    { key: 'components',   label: 'Components',   icon: '🔩' },
    { key: 'suppliers',    label: 'Suppliers',    icon: '🏭' },
    { key: 'clients',      label: 'Clients',      icon: '🏢' },
    { key: 'production',   label: 'Production',   icon: '⚙️' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'transactions', label: 'Transactions',  icon: '💰' },
    { key: 'onboarding',   label: 'Onboarding',    icon: '👤' }
  ];

  ngOnInit() {
    this.refreshNotifications();
  }

  refreshNotifications() {
     forkJoin({
      projects: this.projectService.getAllProjects().pipe(catchError(() => of([]))),
      quotes: this.quoteService.getMyQuotes().pipe(catchError(() => of([]))),
      requests: this.requestService.getMyRequests().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        const logs: NotificationEntry[] = [];

        // 1. New Projects (Awaiting mfg review)
        res.projects.forEach(p => {
          if (p.status === 'SUBMITTED' || p.status === 'BOM_REVIEW') {
            logs.push({
              id: 'p-' + p.id,
              projectId: p.id,
              type: 'NEW_PROJECT',
              title: 'Project Submission',
              description: `New project "${p.name}" received from ${p.client?.name || 'Client'}.`,
              date: p.submittedAt,
              status: p.status,
              isPending: true
            });
          }
        });

        // 2. Supplier Quotes (Vendor Response)
        res.requests.forEach(r => {
          if (r.status === 'QUOTED') {
            logs.push({
              id: 'r-' + r.id,
              projectId: r.projectId,
              type: 'SUPPLIER_QUOTED',
              title: 'Supplier Quote Received',
              description: `${r.supplier?.name} sent a quote for ${r.component?.name}.`,
              date: r.updatedAt || r.createdAt,
              status: 'Vendor Response',
              isPending: true
            });
          }
        });

        // 3. Client Quote Decisions (Updates)
        res.quotes.forEach(q => {
          if (q.status === 'APPROVED' || q.status === 'REJECTED') {
            logs.push({
              id: 'q-' + q.id,
              projectId: q.projectId,
              type: q.status === 'APPROVED' ? 'QUOTE_APPROVED' : 'QUOTE_REJECTED',
              title: q.status === 'APPROVED' ? 'Client Approved Quote' : 'Client Rejected Quote',
              description: `Project "${q.project?.name || 'Job'}" budget ${q.status.toLowerCase()}.`,
              date: q.updatedAt || q.sentAt,
              status: q.status,
              isPending: false
            });
          }
        });

        logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.state.entries.set(logs);
      }
    });
  }
}