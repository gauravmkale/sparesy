import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../../core/services/company.service';

@Component({
    selector: 'app-mfg-onboarding',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">Onboarding Approvals</h1>
          <p class="text-gray-500 text-sm">Review and approve new client and supplier registrations</p>
        </div>
        <span *ngIf="pending.length > 0"
          class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
          {{ pending.length }} Pending
        </span>
      </div>

      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">Company</th>
                <th class="text-left px-5 py-3 font-medium">Type</th>
                <th class="text-left px-5 py-3 font-medium">Email</th>
                <th class="text-left px-5 py-3 font-medium">Contact Person</th>
                <th class="text-left px-5 py-3 font-medium">GST</th>
                <th class="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of pending" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-white font-medium">{{ c.name }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold"
                    [ngClass]="c.type === 'SUPPLIER' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'">
                    {{ c.type }}
                  </span>
                </td>
                <td class="px-5 py-3 text-gray-400">{{ c.email }}</td>
                <td class="px-5 py-3 text-gray-400">{{ c.contactPersonName }}</td>
                <td class="px-5 py-3 text-gray-500 font-mono text-xs">{{ c.gstNumber }}</td>
                <td class="px-5 py-3">
                  <div class="flex gap-2">
                    <button (click)="approve(c.id)"
                      class="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition font-medium">
                      Approve
                    </button>
                    <button (click)="reject(c.id)"
                      class="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition font-medium">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="pending.length === 0">
                <td colspan="6" class="px-5 py-8 text-center text-gray-600">No pending approvals</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MfgOnboardingComponent implements OnInit {
    pending: any[] = [];

    constructor(private companyService: CompanyService) { }

    ngOnInit() { this.load(); }

    load() {
        this.companyService.getPending().subscribe({ next: d => this.pending = d || [], error: () => { } });
    }

    approve(id: number) {
        this.companyService.approve(id).subscribe({
            next: () => this.load(),
            error: (e: any) => alert(e.error?.message || 'Error approving')
        });
    }

    reject(id: number) {
        this.companyService.reject(id).subscribe({
            next: () => this.load(),
            error: (e: any) => alert(e.error?.message || 'Error rejecting')
        });
    }
}