import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { SupplierComponentService } from '../../../core/services/supplier-component.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-mfg-suppliers',
    standalone: true,
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">Suppliers</h1>
          <p class="text-gray-500 text-sm">View all registered suppliers and their catalogs</p>
        </div>
        <button (click)="showInviteModal.set(true)"
          class="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400 transition">
          + Add Supplier
        </button>
      </div>

      <!-- Invite Modal -->
      <div *ngIf="showInviteModal()"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        (click)="closeInviteModal()">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4"
          (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Invite New Supplier</h3>

          <div *ngIf="!generatedLink()">
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Supplier Email (optional)</label>
            <input type="email" [(ngModel)]="inviteEmail" placeholder="supplier@company.com"
              class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
            <p class="text-gray-600 text-xs mt-2">Leave blank to generate a generic invite link</p>
          </div>

          <div *ngIf="generatedLink()" class="space-y-3">
            <p class="text-gray-400 text-sm">Share this link with the supplier:</p>
            <div class="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-xl px-3 py-2">
              <span class="text-teal-400 text-xs font-mono flex-1 truncate">{{ generatedLink() }}</span>
              <button (click)="copyLink()"
                class="text-xs px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 transition shrink-0">
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
              class="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isLoading() ? 'Generating...' : 'Generate Link' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Suppliers Grid -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div *ngFor="let s of suppliers()"
          (click)="selectSupplier(s)"
          class="bg-[#141414] border rounded-xl p-5 cursor-pointer transition-all duration-150 hover:border-teal-500/50 relative group"
          [ngClass]="{ 'border-teal-500/50 bg-teal-500/5': selectedSupplier()?.id === s.id, 'border-gray-800/60': selectedSupplier()?.id !== s.id }">
          
          <button (click)="confirmDelete($event, s)" 
            class="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <h3 class="text-white font-semibold">{{ s?.name || 'Untitled Supplier' }}</h3>
          <p class="text-gray-500 text-sm mt-1">{{ s?.email }}</p>
          <p class="text-gray-600 text-xs mt-1">{{ s?.contactPersonName }}</p>
        </div>
        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
          [ngClass]="{
            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': s?.onboardingStatus === 'APPROVED',
            'bg-amber-500/10 text-amber-400 border border-amber-500/20': s?.onboardingStatus === 'PENDING',
            'bg-red-500/10 text-red-400 border border-red-500/20': s?.onboardingStatus === 'REJECTED'
          }">
          {{ s?.onboardingStatus || 'ACTIVE' }}
        </span>
        <div *ngIf="suppliers().length === 0" class="col-span-3 text-center py-12 bg-[#111111] border border-gray-800/40 rounded-2xl">
          <p class="text-gray-600">No suppliers registered yet.</p>
          <button (click)="showInviteModal.set(true)" class="text-teal-400 text-sm mt-2 hover:underline">Generate an invite link</button>
        </div>
      </div>

      <!-- Supplier Catalog -->
      <div *ngIf="selectedSupplier()" class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-800/60 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">
            {{ selectedSupplier()?.name }} — Catalog
          </h3>
          <button (click)="selectedSupplier.set(null)" class="text-gray-500 hover:text-white text-xs transition">Close Catalog ✕</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">Component</th>
                <th class="text-left px-5 py-3 font-medium">Part Number</th>
                <th class="text-left px-5 py-3 font-medium">Unit Price</th>
                <th class="text-left px-5 py-3 font-medium">Stock</th>
                <th class="text-left px-5 py-3 font-medium">Lead Time</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sc of supplierCatalog()" class="border-t border-gray-800/40 hover:bg-white/[0.01] transition">
                <td class="px-5 py-3 text-white">{{ sc.component?.name || 'Unknown' }}</td>
                <td class="px-5 py-3 text-teal-400 font-mono text-xs">{{ sc.component?.partNumber || '—' }}</td>
                <td class="px-5 py-3 text-gray-300">₹{{ sc.unitPrice | number }}</td>
                <td class="px-5 py-3 text-gray-400">{{ sc.stockQuantity }}</td>
                <td class="px-5 py-3 text-gray-400">{{ sc.leadTimeDays }} days</td>
              </tr>
              <tr *ngIf="supplierCatalog().length === 0">
                <td colspan="5" class="px-5 py-8 text-center text-gray-600 italic">This supplier hasn't added any components to their catalog yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="companyToDelete()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="companyToDelete.set(null)">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Delete Supplier?</h3>
          <p class="text-gray-400 text-sm">Are you sure you want to delete <span class="text-white font-medium">{{ companyToDelete().name }}</span>? This action cannot be undone.</p>
          <div class="flex justify-end gap-3 mt-6">
            <button (click)="companyToDelete.set(null)" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
            <button (click)="deleteSupplier()" [disabled]="isLoading()" class="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-400 transition flex items-center gap-2">
              <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isLoading() ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MfgSuppliersComponent implements OnInit {
    suppliers = signal<any[]>([]);
    selectedSupplier = signal<any>(null);
    supplierCatalog = signal<any[]>([]);
    
    showInviteModal = signal<boolean>(false);
    generatedLink = signal<string | null>(null);
    copied = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    companyToDelete = signal<any>(null);
    
    inviteEmail = '';

    private companyService = inject(CompanyService);
    private supplierCompService = inject(SupplierComponentService);
    private http = inject(HttpClient);
    private notif = inject(NotificationService);

    ngOnInit() { this.load(); }

    load() {
        this.companyService.getApprovedSuppliers().subscribe({
            next: (d: any[]) => this.suppliers.set(d || []),
            error: () => { }
        });
    }

    selectSupplier(s: any) {
        this.selectedSupplier.set(s);
        this.supplierCompService.getSupplierCatalog(s.id).subscribe({
            next: (d: any[]) => this.supplierCatalog.set(d || []),
            error: () => this.supplierCatalog.set([])
        });
    }

    generateInvite() {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        const email = this.inviteEmail.trim() || `invite-${Date.now()}@sparesy.com`;
        this.http.post('/api/auth/invite', { email, type: 'SUPPLIER' }, { responseType: 'text' }).subscribe({
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

    confirmDelete(event: Event, s: any) {
        event.stopPropagation();
        this.companyToDelete.set(s);
    }

    deleteSupplier() {
        if (this.isLoading() || !this.companyToDelete()) return;
        this.isLoading.set(true);
        this.companyService.deleteCompany(this.companyToDelete().id).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.notif.success('Supplier deleted');
                if (this.selectedSupplier()?.id === this.companyToDelete().id) {
                    this.selectedSupplier.set(null);
                }
                this.companyToDelete.set(null);
                this.load();
            },
            error: (e: any) => {
                this.isLoading.set(false);
                this.notif.error(e.error?.message || 'Error deleting supplier');
            }
        });
    }
}
