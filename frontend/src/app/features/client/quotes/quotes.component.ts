import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService } from '../../../core/services/quote.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-client-quotes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Quotes</h1>
      <p class="text-gray-500 text-sm mb-6">Review and respond to manufacturer quotes</p>

      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">ID</th>
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Total Price</th>
                <th class="text-left px-5 py-3 font-medium">Lead Time</th>
                <th class="text-left px-5 py-3 font-medium">Status</th>
                <th class="text-left px-5 py-3 font-medium">Notes</th>
                <th class="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let q of quotes()" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-gray-500">#{{ q.id }}</td>
                <td class="px-5 py-3 text-white font-medium">{{ q.project?.name || '—' }}</td>
                <td class="px-5 py-3 text-indigo-400 font-semibold">₹{{ q.totalPrice | number }}</td>
                <td class="px-5 py-3 text-gray-400">{{ q.leadTimeDays }} days</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold" [ngClass]="getQuoteStatusClass(q.status)">{{ q.status }}</span>
                </td>
                <td class="px-5 py-3 text-gray-500 max-w-[200px] truncate">{{ q.notes || '—' }}</td>
                <td class="px-5 py-3">
                  <div *ngIf="q.status === 'SENT'" class="flex gap-2">
                    <button (click)="approve(q.id)" [disabled]="isLoading()"
                      class="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 transition">
                      {{ isLoading() ? '...' : 'Approve' }}
                    </button>
                    <button (click)="showRejectModal(q)" [disabled]="isLoading()"
                      class="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50 transition">
                      Reject
                    </button>
                  </div>
                  <span *ngIf="q.status === 'APPROVED'" class="text-emerald-400 text-xs font-semibold">✓ Approved</span>
                  <span *ngIf="q.status === 'REJECTED'" class="text-red-400 text-xs font-semibold">✗ Rejected</span>
                </td>
              </tr>
              <tr *ngIf="quotes().length === 0">
                <td colspan="7" class="px-5 py-8 text-center text-gray-600">No quotes received yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reject Modal -->
      <div *ngIf="rejectingQuote()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="rejectingQuote.set(null)">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Reject Quote #{{ rejectingQuote().id }}</h3>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Reason (optional)</label>
            <textarea [(ngModel)]="rejectNote" rows="3"
              class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-red-500 mt-1 resize-none"></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button (click)="rejectingQuote.set(null)" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
            <button (click)="reject()" [disabled]="isLoading()"
              class="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-400 disabled:opacity-50 transition">
              {{ isLoading() ? 'Rejecting...' : 'Reject Quote' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientQuotesComponent implements OnInit {
    quotes = signal<any[]>([]);
    rejectingQuote = signal<any>(null);
    isLoading = signal<boolean>(false);
    rejectNote = '';

    private quoteService = inject(QuoteService);
    private notif = inject(NotificationService);

    ngOnInit() { this.load(); }

    load() {
        this.quoteService.getMyQuotes().subscribe({
            next: d => this.quotes.set(d || []),
            error: () => { }
        });
    }

    approve(id: number) {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        this.quoteService.approve(id).subscribe({ 
          next: () => {
            this.isLoading.set(false);
            this.notif.success('Quote approved! Production will start soon.');
            this.load();
          }, 
          error: (e: any) => {
            this.isLoading.set(false);
            this.notif.error(e.error?.message || 'Error approving quote');
          }
        });
    }

    showRejectModal(q: any) { this.rejectingQuote.set(q); this.rejectNote = ''; }

    reject() {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        this.quoteService.reject(this.rejectingQuote().id, this.rejectNote).subscribe({
            next: () => { 
                this.isLoading.set(false);
                this.rejectingQuote.set(null); 
                this.notif.info('Quote rejected');
                this.load(); 
            },
            error: (e: any) => {
              this.isLoading.set(false);
              this.notif.error(e.error?.message || 'Error rejecting quote');
            }
        });
    }

    getQuoteStatusClass(status: string): string {
        const map: any = {
            'DRAFT': 'bg-gray-500/20 text-gray-400', 'SENT': 'bg-blue-500/20 text-blue-400',
            'APPROVED': 'bg-emerald-500/20 text-emerald-400', 'REJECTED': 'bg-red-500/20 text-red-400'
        };
        return map[status] || 'bg-gray-500/20 text-gray-400';
    }
}
