import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
    selector: 'app-mfg-transactions',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Transactions</h1>
      <p class="text-gray-500 text-sm mb-6">Revenue and transaction history</p>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Revenue</p>
          <p class="text-3xl font-bold text-emerald-400 mt-2">₹{{ totalRevenue() | number }}</p>
        </div>
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Transactions</p>
          <p class="text-3xl font-bold text-white mt-2">{{ transactions().length }}</p>
        </div>
      </div>

      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">ID</th>
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Type</th>
                <th class="text-left px-5 py-3 font-medium">Amount</th>
                <th class="text-left px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of transactions()" (click)="selectProject(t.project)"
                class="border-t border-gray-800/40 hover:bg-white/[0.02] transition cursor-pointer">
                <td class="px-5 py-3 text-gray-500">#{{ t.id }}</td>
                <td class="px-5 py-3 text-white">{{ t.project?.name || '—' }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold"
                    [ngClass]="t.type === 'MANUFACTURER_REVENUE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'">
                    {{ t.type }}
                  </span>
                </td>
                <td class="px-5 py-3 text-emerald-400 font-semibold">₹{{ t.amount | number }}</td>
                <td class="px-5 py-3 text-gray-500">{{ t.createdAt | date:'shortDate' }}</td>
              </tr>
              <tr *ngIf="transactions().length === 0">
                <td colspan="6" class="px-5 py-8 text-center text-gray-600">No transactions yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Project Financial Detail Modal -->
      <div *ngIf="selectedProject()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="selectedProject.set(null)">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">Project Financials</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
                    {{ projectSummary()?.status }}
                </span>
            </div>
            
            <p class="text-sm text-gray-400">{{ selectedProject().name }}</p>

            <div class="grid grid-cols-1 gap-3 mt-4">
                <div class="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl border border-gray-800/60">
                    <span class="text-gray-500 text-xs uppercase font-medium">Revenue</span>
                    <span class="text-white font-semibold">₹{{ (projectSummary()?.revenue || 0) | number }}</span>
                </div>
                <div class="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl border border-gray-800/60">
                    <span class="text-gray-500 text-xs uppercase font-medium">Cost (Suppliers)</span>
                    <span class="text-red-400 font-semibold">- ₹{{ (projectSummary()?.cost || 0) | number }}</span>
                </div>
                <div class="flex items-center justify-between bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <span class="text-emerald-400 text-sm font-bold uppercase">Net Profit</span>
                    <span class="text-emerald-400 text-xl font-bold">₹{{ (projectSummary()?.profit || 0) | number }}</span>
                </div>
            </div>

            <div class="flex justify-end mt-4">
                <button (click)="selectedProject.set(null)" class="px-4 py-2 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-700 transition">
                    Close
                </button>
            </div>
        </div>
      </div>
    </div>
  `
})
export class MfgTransactionsComponent implements OnInit {
    transactions = signal<any[]>([]);
    totalRevenue = signal<number>(0);
    selectedProject = signal<any>(null);
    projectSummary = signal<any>(null);

    constructor(private txnService: TransactionService) { }

    ngOnInit() {
        this.txnService.getMy().subscribe({
            next: d => this.transactions.set(d || []),
            error: () => { }
        });
        this.txnService.getRevenue('MANUFACTURER_REVENUE').subscribe({
            next: d => this.totalRevenue.set(d || 0),
            error: () => { }
        });
    }

    selectProject(project: any) {
        if (!project) return;
        this.selectedProject.set(project);
        this.txnService.getProjectSummary(project.id).subscribe({
            next: (d: any) => this.projectSummary.set(d),
            error: () => { }
        });
    }
}
