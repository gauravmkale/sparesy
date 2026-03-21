import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../core/services/request.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-sup-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Incoming Requests</h1>
      <p class="text-gray-500 text-sm mb-6">Review and quote on sourcing requests from manufacturers</p>

      <div *ngIf="isInitialLoading()" class="flex justify-center py-12">
        <div class="h-8 w-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>

      <div *ngIf="!isInitialLoading()" class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">ID</th>
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Component</th>
                <th class="text-left px-5 py-3 font-medium">Qty</th>
                <th class="text-left px-5 py-3 font-medium">Target Price</th>
                <th class="text-left px-5 py-3 font-medium">Status</th>
                <th class="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of requests()" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-gray-500">#{{ r.id }}</td>
                <td class="px-5 py-3 text-white font-medium">{{ r.project?.name || 'Unknown' }}</td>
                <td class="px-5 py-3">
                    <div class="flex flex-col">
                        <span class="text-gray-300">{{ r.component?.name }}</span>
                        <span class="text-[10px] text-gray-500 font-mono">{{ r.component?.partNumber }}</span>
                    </div>
                </td>
                <td class="px-5 py-3 text-gray-400">{{ r.quantityNeeded }}</td>
                <td class="px-5 py-3 text-gray-400">
                    {{ r.targetPrice ? '₹' + r.targetPrice : '—' }}
                </td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold"
                    [ngClass]="getStatusClass(r.status)">
                    {{ r.status }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  <button *ngIf="r.status === 'PENDING'" (click)="openQuoteModal(r)" [disabled]="isLoading()"
                    class="text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 disabled:opacity-50 transition font-medium">
                    Submit Quote
                  </button>
                  <div *ngIf="r.status === 'QUOTED'" class="flex flex-col">
                    <span class="text-blue-400 text-xs font-medium">₹{{ r.quotedPrice }}</span>
                    <span class="text-[10px] text-gray-500">Awaiting review</span>
                  </div>
                  <span *ngIf="r.status === 'APPROVED'" class="text-emerald-400 text-xs font-semibold">✓ Approved</span>
                  <span *ngIf="r.status === 'REJECTED'" class="text-red-400 text-xs font-semibold">✗ Rejected</span>
                </td>
              </tr>
              <tr *ngIf="requests().length === 0">
                <td colspan="7" class="px-5 py-8 text-center text-gray-600">No incoming requests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quote Modal -->
      <div *ngIf="quotingRequest()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="quotingRequest.set(null)">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Submit Quote</h3>
          <div class="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-2">
            <p class="text-xs text-gray-500 uppercase font-bold mb-2">Request Details</p>
            <div class="grid grid-cols-2 gap-2 text-sm">
                <div><span class="text-gray-500">Component:</span></div>
                <div class="text-white text-right">{{ quotingRequest()?.component?.name }}</div>
                <div><span class="text-gray-500">Quantity:</span></div>
                <div class="text-white text-right">{{ quotingRequest()?.quantityNeeded }}</div>
                <div *ngIf="quotingRequest()?.targetPrice"><span class="text-gray-500">Target Price:</span></div>
                <div *ngIf="quotingRequest()?.targetPrice" class="text-teal-400 font-semibold text-right">₹{{ quotingRequest()?.targetPrice }}</div>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Your Quoted Price (₹)</label>
              <div class="flex gap-2 items-center">
                <input type="number" [(ngModel)]="quoteData.quotedPrice"
                  class="flex-1 bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 mt-1" />
                <button *ngIf="quotingRequest()?.targetPrice" (click)="useTargetPrice()" 
                    class="mt-1 px-3 py-2 bg-teal-500/10 text-teal-400 text-xs font-semibold rounded-xl hover:bg-teal-500/20 transition">
                    Use Target
                </button>
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Delivery Date</label>
              <input type="date" [(ngModel)]="quoteData.deliveryDate"
                class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 mt-1" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-4">
            <button (click)="quotingRequest.set(null)" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
            <button (click)="submitQuote()" [disabled]="isLoading() || !quoteData.quotedPrice"
              class="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 disabled:opacity-50 transition flex items-center gap-2">
              <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isLoading() ? 'Submitting...' : 'Submit Quote' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SupRequestsComponent implements OnInit {
    requests = signal<any[]>([]);
    quotingRequest = signal<any>(null);
    isInitialLoading = signal<boolean>(true);
    isLoading = signal<boolean>(false);
    quoteData: any = { quotedPrice: 0, deliveryDate: '' };

    private reqService = inject(RequestService);
    private notif = inject(NotificationService);

    ngOnInit() { this.load(); }

    load() {
        this.reqService.getMyRequests().subscribe({
            next: d => {
                this.requests.set(d || []);
                this.isInitialLoading.set(false);
            },
            error: () => {
                this.isInitialLoading.set(false);
                this.notif.error('Failed to load requests');
            }
        });
    }

    openQuoteModal(r: any) {
        this.quotingRequest.set(r);
        this.quoteData = { 
            quotedPrice: r.targetPrice || 0, 
            deliveryDate: r.targetDelivery ? new Date(r.targetDelivery).toISOString().split('T')[0] : ''
        };
    }

    useTargetPrice() {
        this.quoteData.quotedPrice = this.quotingRequest().targetPrice;
    }

    submitQuote() {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        
        // Convert date to LocalDateTime format
        const delivery = this.quoteData.deliveryDate ? this.quoteData.deliveryDate + 'T00:00:00' : null;
        
        this.reqService.submitQuote(this.quotingRequest().id, {
            quotedPrice: this.quoteData.quotedPrice,
            delivery: delivery
        }).subscribe({
            next: () => { 
                this.isLoading.set(false);
                this.notif.success('Quote submitted successfully');
                this.quotingRequest.set(null); 
                this.load(); 
            },
            error: (e: any) => {
              this.isLoading.set(false);
              this.notif.error(e.error?.message || 'Error submitting quote');
            }
        });
    }

    getStatusClass(status: string): string {
        const map: any = {
            'PENDING': 'bg-yellow-500/20 text-yellow-400',
            'QUOTED': 'bg-blue-500/20 text-blue-400',
            'APPROVED': 'bg-emerald-500/20 text-emerald-400',
            'REJECTED': 'bg-red-500/20 text-red-400'
        };
        return map[status] || 'bg-gray-500/20 text-gray-400';
    }
}
