import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../core/services/request.service';

@Component({
    selector: 'app-sup-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Incoming Requests</h1>
      <p class="text-gray-500 text-sm mb-6">Review and quote on sourcing requests from manufacturers</p>

      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">ID</th>
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Component</th>
                <th class="text-left px-5 py-3 font-medium">Qty Needed</th>
                <th class="text-left px-5 py-3 font-medium">Status</th>
                <th class="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of requests" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-gray-500">#{{ r.id }}</td>
                <td class="px-5 py-3 text-white">{{ r.projectName }}</td>
                <td class="px-5 py-3 text-gray-400">{{ r.componentName }}</td>
                <td class="px-5 py-3 text-gray-400">{{ r.quantityNeeded }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold"
                    [ngClass]="r.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : r.status === 'QUOTED' ? 'bg-blue-500/20 text-blue-400' : r.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'">
                    {{ r.status }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  <button *ngIf="r.status === 'PENDING'" (click)="openQuoteModal(r)"
                    class="text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition font-medium">
                    Submit Quote
                  </button>
                  <span *ngIf="r.status === 'QUOTED'" class="text-blue-400 text-xs">₹{{ r.quotedPrice }} — awaiting review</span>
                  <span *ngIf="r.status === 'APPROVED'" class="text-emerald-400 text-xs">✓ Approved</span>
                  <span *ngIf="r.status === 'REJECTED'" class="text-red-400 text-xs">✗ Rejected</span>
                </td>
              </tr>
              <tr *ngIf="requests.length === 0">
                <td colspan="6" class="px-5 py-8 text-center text-gray-600">No incoming requests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quote Modal -->
      <div *ngIf="quotingRequest" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="quotingRequest = null">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Submit Quote</h3>
          <p class="text-gray-500 text-sm">For: {{ quotingRequest.componentName }} — {{ quotingRequest.quantityNeeded }} units</p>
          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Quoted Price (₹)</label>
              <input type="number" [(ngModel)]="quoteData.quotedPrice"
                class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 mt-1" />
            </div>
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Delivery Days</label>
              <input type="number" [(ngModel)]="quoteData.deliveryDays"
                class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 mt-1" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-4">
            <button (click)="quotingRequest = null" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
            <button (click)="submitQuote()" class="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition">Submit Quote</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SupRequestsComponent implements OnInit {
    requests: any[] = [];
    quotingRequest: any = null;
    quoteData: any = { quotedPrice: 0, deliveryDays: 7 };

    constructor(private reqService: RequestService) { }

    ngOnInit() { this.load(); }

    load() { this.reqService.getMyRequests().subscribe({ next: d => this.requests = d || [], error: () => { } }); }

    openQuoteModal(r: any) {
        this.quotingRequest = r;
        this.quoteData = { quotedPrice: 0, deliveryDays: 7 };
    }

    submitQuote() {
        this.reqService.submitQuote(this.quotingRequest.id, this.quoteData).subscribe({
            next: () => { this.quotingRequest = null; this.load(); },
            error: (e: any) => alert(e.error?.message || 'Error submitting quote')
        });
    }
}
