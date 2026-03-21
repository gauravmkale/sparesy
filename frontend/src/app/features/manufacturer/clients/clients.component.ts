import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-mfg-clients',
    standalone: true,
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
      <div class="grid grid-cols-3 gap-4">
        <div *ngFor="let c of clients()"
          class="bg-[#141414] border border-gray-800/60 rounded-xl p-5 hover:border-indigo-500/30 transition-colors relative group">
          
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
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-800/40 text-xs text-gray-500 line-clamp-2">
            {{ c?.address }}
          </div>
        </div>
        <div *ngIf="clients().length === 0" class="col-span-3 text-center py-12 bg-[#111111] border border-gray-800/40 rounded-2xl">
          <p class="text-gray-600">No clients registered yet.</p>
          <button (click)="showInviteModal.set(true)" class="text-indigo-400 text-sm mt-2 hover:underline">Generate an invite link</button>
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
    
    inviteEmail = '';

    private companyService = inject(CompanyService);
    private http = inject(HttpClient);
    private notif = inject(NotificationService);

    ngOnInit() { this.load(); }

    load() {
        this.companyService.getApprovedClients().subscribe({
            next: d => this.clients.set(d || []),
            error: () => { }
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
