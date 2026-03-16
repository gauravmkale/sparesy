import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierComponentService } from '../../../core/services/supplier-component.service';
import { RequestService } from '../../../core/services/request.service';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
    selector: 'app-sup-overview',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Dashboard Overview</h1>
      <p class="text-gray-500 text-sm mb-6">Your supplier operations at a glance</p>

      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Catalog Items</p>
          <p class="text-3xl font-bold text-white mt-2">{{ catalog.length }}</p>
        </div>
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Pending Requests</p>
          <p class="text-3xl font-bold text-blue-400 mt-2">{{ pendingRequests }}</p>
        </div>
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Revenue</p>
          <p class="text-3xl font-bold text-emerald-400 mt-2">₹{{ totalRevenue | number }}</p>
        </div>
      </div>

      <!-- Recent Requests -->
      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-800/60">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Recent Requests</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Component</th>
                <th class="text-left px-5 py-3 font-medium">Qty</th>
                <th class="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of requests.slice(0, 5)" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-white">{{ r.projectName }}</td>
                <td class="px-5 py-3 text-gray-400">{{ r.componentName }}</td>
                <td class="px-5 py-3 text-gray-400">{{ r.quantityNeeded }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold"
                    [ngClass]="r.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : r.status === 'QUOTED' ? 'bg-blue-500/20 text-blue-400' : r.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'">
                    {{ r.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="requests.length === 0">
                <td colspan="4" class="px-5 py-8 text-center text-gray-600">No requests yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SupOverviewComponent implements OnInit {
    catalog: any[] = [];
    requests: any[] = [];
    pendingRequests = 0;
    totalRevenue = 0;

    constructor(
        private supCompService: SupplierComponentService,
        private reqService: RequestService,
        private txnService: TransactionService
    ) { }

    ngOnInit() {
        this.supCompService.getMyCatalog().subscribe({ next: d => this.catalog = d || [], error: () => { } });
        this.reqService.getMyRequests().subscribe({
            next: d => { this.requests = d || []; this.pendingRequests = this.requests.filter(r => r.status === 'PENDING').length; },
            error: () => { }
        });
        this.txnService.getRevenue('SUPPLIER_REVENUE').subscribe({ next: d => this.totalRevenue = d || 0, error: () => { } });
    }
}
