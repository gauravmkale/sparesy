import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { ProductionService } from '../../../core/services/production.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
    selector: 'app-mfg-overview',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Dashboard Overview</h1>
      <p class="text-gray-500 text-sm mb-6">Your manufacturing operations at a glance</p>

      <!-- Summary Cards -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Projects</p>
          <p class="text-3xl font-bold text-white mt-2">{{ projects().length }}</p>
        </div>
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Active Production</p>
          <p class="text-3xl font-bold text-teal-400 mt-2">{{ productionOrders().length }}</p>
        </div>
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Low Stock Alerts</p>
          <p class="text-3xl font-bold text-amber-400 mt-2">{{ alerts().length }}</p>
        </div>
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Revenue</p>
          <p class="text-3xl font-bold text-emerald-400 mt-2">₹{{ totalRevenue() | number }}</p>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-800/60">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Recent Projects</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Client</th>
                <th class="text-left px-5 py-3 font-medium">Status</th>
                <th class="text-left px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of projects().slice(0, 5)" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-white font-medium">{{ p.name }}</td>
                <td class="px-5 py-3 text-gray-400">{{ p.client?.name || '—' }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold"
                    [ngClass]="getStatusClass(p.status)">{{ p.status }}</span>
                </td>
                <td class="px-5 py-3 text-gray-500">{{ p.submittedAt | date:'mediumDate' }}</td>
              </tr>
              <tr *ngIf="projects().length === 0">
                <td colspan="4" class="px-5 py-8 text-center text-gray-600">No projects yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MfgOverviewComponent implements OnInit {
    projects = signal<any[]>([]);
    productionOrders = signal<any[]>([]);
    alerts = signal<any[]>([]);
    totalRevenue = signal<number>(0);

    constructor(
        private projectService: ProjectService,
        private productionService: ProductionService,
        private inventoryService: InventoryService,
        private transactionService: TransactionService
    ) { }

    ngOnInit() {
        this.projectService.getAllProjects().subscribe({
            next: d => this.projects.set(d || []),
            error: () => { }
        });
        this.productionService.getAll().subscribe({
            next: d => this.productionOrders.set(d || []),
            error: () => { }
        });
        this.inventoryService.getAlerts().subscribe({
            next: d => this.alerts.set(d || []),
            error: () => { }
        });
        this.transactionService.getRevenue('MANUFACTURER_REVENUE').subscribe({
            next: d => this.totalRevenue.set(d || 0),
            error: () => { }
        });
    }

    getStatusClass(status: string): string {
        const map: any = {
            'SUBMITTED': 'bg-blue-500/20 text-blue-400',
            'BOM_REVIEW': 'bg-purple-500/20 text-purple-400',
            'SOURCING': 'bg-orange-500/20 text-orange-400',
            'QUOTED': 'bg-yellow-500/20 text-yellow-400',
            'QUOTE_APPROVED': 'bg-teal-500/20 text-teal-400',
            'IN_PRODUCTION': 'bg-cyan-500/20 text-cyan-400',
            'DELIVERED': 'bg-emerald-500/20 text-emerald-400',
            'CANCELLED': 'bg-red-500/20 text-red-400'
        };
        return map[status] || 'bg-gray-500/20 text-gray-400';
    }
}
