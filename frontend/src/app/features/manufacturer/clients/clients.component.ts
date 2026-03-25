import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-mfg-clients',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">Clients</h1>
          <p class="text-gray-500 text-sm">View all registered clients and generate invite links</p>
        </div>
        <button (click)="showInviteModal.set(true)"
          class="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition">
          + Add Client
        </button>
      </div>

      <!-- Invite Modal -->
      <div *ngIf="showInviteModal()"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        (click)="closeInviteModal()">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4"
          (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Invite New Client</h3>

          <div *ngIf="!generatedLink()">
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Client Email (optional)</label>
            <input type="email" [(ngModel)]="inviteEmail" placeholder="client@company.com"
              class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 mt-1" />
            <p class="text-gray-600 text-xs mt-2">Leave blank to generate a generic invite link</p>
          </div>

          <div *ngIf="generatedLink()" class="space-y-3">
            <p class="text-gray-400 text-sm">Share this link with the client:</p>
            <div class="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-xl px-3 py-2">
              <span class="text-indigo-400 text-xs font-mono flex-1 truncate">{{ generatedLink() }}</span>
              <button (click)="copyLink()"
                class="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition shrink-0">
                {{ copied() ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <p class="text-gray-600 text-xs">This link expires in 7 days and can only be used once.</p>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <button (click)="closeInviteModal()"
              class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">
              {{ generatedLink() ? 'Done' : 'Cancel' }}
            </button>
            <button *ngIf="!generatedLink()" (click)="generateInvite()" [disabled]="isLoading()"
              class="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isLoading() ? 'Generating...' : 'Generate Link' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Clients Grid -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div *ngFor="let c of clients()" (click)="selectClient(c)"
          class="bg-[#141414] border rounded-xl p-5 cursor-pointer transition-all duration-150 hover:border-indigo-500/50 relative group"
          [ngClass]="{ 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]': selectedClient()?.id === c.id, 'border-gray-800/60': selectedClient()?.id !== c.id }">
          
          <button (click)="confirmDelete($event, c)" 
            class="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-white font-semibold">{{ c?.name || 'Untitled Client' }}</h3>
              <p class="text-gray-500 text-sm mt-1">{{ c?.email }}</p>
              <p class="text-gray-600 text-xs mt-1">{{ c?.contactPersonName }}</p>
            </div>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
              [ngClass]="{
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': c?.onboardingStatus === 'APPROVED',
                'bg-amber-500/10 text-amber-400 border border-amber-500/20': c?.onboardingStatus === 'PENDING',
                'bg-red-500/10 text-red-400 border border-red-500/20': c?.onboardingStatus === 'REJECTED'
              }">
              {{ c?.onboardingStatus || 'ACTIVE' }}
            </span>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-800/40 flex items-center justify-between">
            <div class="flex flex-col gap-0.5">
               <span class="text-[10px] text-gray-500 uppercase tracking-tighter">Revenue</span>
               <span class="text-xs font-bold text-emerald-400">₹{{ (c.summary?.totalRevenue || 0) | number }}</span>
            </div>
            <div class="flex flex-col items-end gap-0.5">
               <span class="text-[10px] text-gray-500 uppercase tracking-tighter">Profit</span>
               <span class="text-xs font-bold text-indigo-400">₹{{ (c.summary?.totalProfit || 0) | number }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail View (Below Grid) -->
      <div *ngIf="selectedClient()" class="mt-8">
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl overflow-hidden shadow-2xl">
          <div class="px-6 py-4 border-b border-gray-800/60 flex items-center justify-between bg-white/[0.01]">
             <div class="flex items-center gap-4">
               <h3 class="text-sm font-semibold text-white uppercase tracking-wider">{{ selectedClient()?.name }} — Summary</h3>
               <span class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] border border-indigo-500/20 font-bold uppercase tracking-wider">
                  {{ selectedClient()?.onboardingStatus }}
               </span>
             </div>
             <button (click)="selectedClient.set(null)" class="text-gray-500 hover:text-white text-xs transition p-1">Close Detail ✕</button>
          </div>
          
          <div class="p-6 grid grid-cols-4 gap-6">
            <div class="col-span-1 space-y-4">
               <div>
                 <p class="text-xs text-gray-500 uppercase font-medium">Contact Person</p>
                 <p class="text-white text-sm font-medium">{{ selectedClient()?.contactPersonName }}</p>
               </div>
               <div>
                 <p class="text-xs text-gray-500 uppercase font-medium">Email</p>
                 <p class="text-white text-sm truncate">{{ selectedClient()?.email }}</p>
               </div>
               <div>
                 <p class="text-xs text-gray-500 uppercase font-medium">Address</p>
                 <p class="text-gray-400 text-xs leading-relaxed">{{ selectedClient()?.address }}</p>
               </div>
            </div>

            <div class="col-span-3 space-y-6 border-l border-gray-800/60 pl-6">
               <div class="grid grid-cols-2 gap-4">
                 <div class="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                    <p class="text-[10px] text-emerald-500/60 uppercase font-bold tracking-widest">Total Revenue</p>
                    <p class="text-2xl font-bold text-emerald-400 mt-1">₹{{ (clientSummary()?.totalRevenue || 0) | number }}</p>
                 </div>
                 <div class="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
                    <p class="text-[10px] text-indigo-500/60 uppercase font-bold tracking-widest">Net Margin (Profit)</p>
                    <p class="text-2xl font-bold text-indigo-400 mt-1">₹{{ (clientSummary()?.totalProfit || 0) | number }}</p>
                 </div>
               </div>

               <div>
                 <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Project History</p>
                 <div class="bg-black/20 rounded-xl border border-gray-800/40 overflow-hidden">
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="text-gray-600 border-b border-gray-800/60">
                           <th class="text-left px-4 py-3 font-medium">Project</th>
                           <th class="text-left px-4 py-3 font-medium">Status</th>
                           <th class="text-right px-4 py-3 font-medium">Revenue</th>
                           <th class="text-right px-4 py-3 font-medium">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let p of clientSummary()?.projects" class="border-t border-gray-800/20 hover:bg-white/[0.01]">
                           <td class="px-4 py-2.5 text-gray-200">{{ p.projectName }}</td>
                           <td class="px-4 py-2.5 text-gray-500">{{ p.status }}</td>
                           <td class="px-4 py-2.5 text-right text-gray-400">₹{{ (p.revenue || 0) | number }}</td>
                           <td class="px-4 py-2.5 text-right text-indigo-400 font-semibold">₹{{ (p.profit || 0) | number }}</td>
                        </tr>
                        <tr *ngIf="!clientSummary()?.projects?.length">
                           <td colspan="4" class="px-4 py-6 text-center text-gray-600 italic">No projects recorded.</td>
                        </tr>
                      </tbody>
                    </table>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="companyToDelete()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="companyToDelete.set(null)">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Delete Client?</h3>
          <p class="text-gray-400 text-sm">Are you sure you want to delete <span class="text-white font-medium">{{ companyToDelete().name }}</span>? This action cannot be undone.</p>
          <div class="flex justify-end gap-3 mt-6">
            <button (click)="companyToDelete.set(null)" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
            <button (click)="deleteClient()" [disabled]="isLoading()" class="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-400 transition flex items-center gap-2">
              <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isLoading() ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MfgClientsComponent implements OnInit {
    clients = signal<any[]>([]);
    showInviteModal = signal<boolean>(false);
    generatedLink = signal<string | null>(null);
    copied = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    companyToDelete = signal<any>(null);
    selectedClient = signal<any>(null);
    clientSummary = signal<any>(null);
    inviteEmail = '';

    private txnService = inject(TransactionService);

    private companyService = inject(CompanyService);
    private http = inject(HttpClient);
    private notif = inject(NotificationService);

    ngOnInit() { this.load(); }

    load() {
        forkJoin({
            clients: this.companyService.getApprovedClients(),
            summaries: this.txnService.getClientSummaries()
        }).subscribe({
            next: ({ clients, summaries }) => {
                const combined = clients.map(c => ({
                    ...c,
                    summary: summaries.find(s => s.clientId === c.id)
                }));
                this.clients.set(combined);
            },
            error: () => { }
        });
    }

    selectClient(c: any) {
        this.selectedClient.set(c);
        this.isLoading.set(true);
        this.txnService.getClientSummary(c.id).subscribe({
            next: (summary: any) => {
                this.clientSummary.set(summary);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    generateInvite() {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        const email = this.inviteEmail.trim() || `invite-${Date.now()}@sparesy.com`;
        this.http.post('/api/auth/invite', { email, type: 'CLIENT' }, { responseType: 'text' }).subscribe({
            next: (token: string) => {
                this.isLoading.set(false);
                this.generatedLink.set(`${window.location.origin}/auth/register?token=${token}`);
                this.notif.success('Invite link generated successfully');
            },
            error: (e: any) => {
                this.isLoading.set(false);
                this.notif.error(e.error?.message || 'Error generating invite');
            }
        });
    }

    copyLink() {
        const link = this.generatedLink();
        if (!link) return;
        navigator.clipboard.writeText(link).then(() => {
            this.copied.set(true);
            this.notif.info('Link copied to clipboard');
            setTimeout(() => this.copied.set(false), 2000);
        });
    }

    closeInviteModal() {
        this.showInviteModal.set(false);
        this.inviteEmail = '';
        this.generatedLink.set(null);
        this.copied.set(false);
    }

    confirmDelete(event: Event, c: any) {
        event.stopPropagation();
        this.companyToDelete.set(c);
    }

    deleteClient() {
        if (this.isLoading() || !this.companyToDelete()) return;
        this.isLoading.set(true);
        this.companyService.deleteCompany(this.companyToDelete().id).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.notif.success('Client deleted');
                this.companyToDelete.set(null);
                this.load();
            },
            error: (e: any) => {
                this.isLoading.set(false);
                this.notif.error(e.error?.message || 'Error deleting client');
            }
        });
    }
}
