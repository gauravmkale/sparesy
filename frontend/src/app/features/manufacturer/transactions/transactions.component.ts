import { Component, OnInit } from '@angular/core';
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
          <p class="text-3xl font-bold text-emerald-400 mt-2">₹{{ totalRevenue | number }}</p>
        </div>
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Transactions</p>
          <p class="text-3xl font-bold text-white mt-2">{{ transactions.length }}</p>
        </div>
      </div>

      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">ID</th>
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Component</th>
                <th class="text-left px-5 py-3 font-medium">Type</th>
                <th class="text-left px-5 py-3 font-medium">Amount</th>
                <th class="text-left px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of transactions" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-gray-500">#{{ t.id }}</td>
                <td class="px-5 py-3 text-white">{{ t.projectName || '—' }}</td>
                <td class="px-5 py-3 text-gray-400">{{ t.componentName || '—' }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold"
                    [ngClass]="t.type === 'MANUFACTURER_REVENUE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'">
                    {{ t.type }}
                  </span>
                </td>
                <td class="px-5 py-3 text-emerald-400 font-semibold">₹{{ t.amount | number }}</td>
                <td class="px-5 py-3 text-gray-500">{{ t.createdAt | date:'shortDate' }}</td>
              </tr>
              <tr *ngIf="transactions.length === 0">
                <td colspan="6" class="px-5 py-8 text-center text-gray-600">No transactions yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MfgTransactionsComponent implements OnInit {
    transactions: any[] = [];
    totalRevenue = 0;

    constructor(private txnService: TransactionService) { }

    ngOnInit() {
        this.txnService.getMy().subscribe({ next: d => this.transactions = d || [], error: () => { } });
        this.txnService.getRevenue('MANUFACTURER_REVENUE').subscribe({ next: d => this.totalRevenue = d || 0, error: () => { } });
    }
}
