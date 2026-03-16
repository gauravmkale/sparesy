import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { HttpClient } from '@angular/common/http';

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
        <button (click)="showInviteModal = true"
          class="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition">
          + Add Client
        </button>
      </div>

      <!-- Invite Modal -->
      <div *ngIf="showInviteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        (click)="closeInviteModal()">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4"
          (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Invite New Client</h3>

          <div *ngIf="!generatedLink">
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Client Email (optional)</label>
            <input type="email" [(ngModel)]="inviteEmail" placeholder="client@company.com"
              class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 mt-1" />
            <p class="text-gray-600 text-xs mt-2">Leave blank to generate a generic invite link</p>
          </div>

          <div *ngIf="generatedLink" class="space-y-3">
            <p class="text-gray-400 text-sm">Share this link with the client:</p>
            <div class="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-xl px-3 py-2">
              <span class="text-indigo-400 text-xs font-mono flex-1 truncate">{{ generatedLink }}</span>
              <button (click)="copyLink()"
                class="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition shrink-0">
                {{ copied ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <p class="text-gray-600 text-xs">This link expires in 7 days and can only be used once.</p>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <button (click)="closeInviteModal()"
              class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">
              {{ generatedLink ? 'Done' : 'Cancel' }}
            </button>
            <button *ngIf="!generatedLink" (click)="generateInvite()"
              class="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition">
              Generate Link
            </button>
          </div>
        </div>
      </div>

      <!-- Clients Grid -->
      <div class="grid grid-cols-3 gap-4">
        <div *ngFor="let c of clients"
          class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-white font-semibold">{{ c.name }}</h3>
              <p class="text-gray-500 text-sm mt-1">{{ c.email }}</p>
              <p class="text-gray-600 text-xs mt-1">{{ c.contactPersonName }}</p>
            </div>
            <span class="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400">
              Active
            </span>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-800/40 text-xs text-gray-600">
            {{ c.address }}
          </div>
        </div>
        <div *ngIf="clients.length === 0" class="col-span-3 text-center py-8 text-gray-600">
          No clients registered yet. Generate an invite link to add one.
        </div>
      </div>
    </div>
  `
})
export class MfgClientsComponent implements OnInit {
    clients: any[] = [];
    showInviteModal = false;
    inviteEmail = '';
    generatedLink: string | null = null;
    copied = false;

    constructor(
        private companyService: CompanyService,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.companyService.getClients().subscribe({ next: d => this.clients = d || [], error: () => { } });
    }

    generateInvite() {
        const email = this.inviteEmail.trim() || `invite-${Date.now()}@sparesy.com`;
        this.http.post<any>('/api/auth/invite', { email, type: 'CLIENT' }).subscribe({
            next: (token: any) => {
                const rawToken = typeof token === 'string' ? token : token.token;
                this.generatedLink = `${window.location.origin}/auth/register?token=${rawToken}`;
            },
            error: (e: any) => alert(e.error?.message || 'Error generating invite')
        });
    }

    copyLink() {
        if (!this.generatedLink) return;
        navigator.clipboard.writeText(this.generatedLink).then(() => {
            this.copied = true;
            setTimeout(() => this.copied = false, 2000);
        });
    }

    closeInviteModal() {
        this.showInviteModal = false;
        this.inviteEmail = '';
        this.generatedLink = null;
        this.copied = false;
    }
}