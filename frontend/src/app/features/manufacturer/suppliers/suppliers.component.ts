import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { SupplierComponentService } from '../../../core/services/supplier-component.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';


@Component({
    selector: 'app-mfg-suppliers',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">Suppliers</h1>
          <p class="text-gray-500 text-sm">View all registered suppliers and their catalogs</p>
        </div>
        <button (click)="showInviteModal = true"
          class="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400 transition">
          + Add Supplier
        </button>
      </div>

      <!-- Invite Modal -->
      <div *ngIf="showInviteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        (click)="closeInviteModal()">
        <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4"
          (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white">Invite New Supplier</h3>

          <div *ngIf="!generatedLink">
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Supplier Email (optional)</label>
            <input type="email" [(ngModel)]="inviteEmail" placeholder="supplier@company.com"
              class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
            <p class="text-gray-600 text-xs mt-2">Leave blank to generate a generic invite link</p>
          </div>

          <div *ngIf="generatedLink" class="space-y-3">
            <p class="text-gray-400 text-sm">Share this link with the supplier:</p>
            <div class="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-xl px-3 py-2">
              <span class="text-teal-400 text-xs font-mono flex-1 truncate">{{ generatedLink }}</span>
              <button (click)="copyLink()"
                class="text-xs px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 transition shrink-0">
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
            <button *ngIf="!generatedLink" (click)="generateInvite()" [disabled]="isGenerating"
              class="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isGenerating ? 'Generating...' : 'Generate Link' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Suppliers Grid -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div *ngFor="let s of suppliers"
          (click)="selectSupplier(s)"
          class="bg-[#141414] border rounded-xl p-5 cursor-pointer transition-all duration-150 hover:border-teal-500/50"
          [ngClass]="{ 'border-teal-500/50 bg-teal-500/5': selectedSupplier?.id === s.id, 'border-gray-800/60': selectedSupplier?.id !== s.id }">
          <h3 class="text-white font-semibold">{{ s.name }}</h3>
          <p class="text-gray-500 text-sm mt-1">{{ s.email }}</p>
          <p class="text-gray-600 text-xs mt-1">{{ s.contactPersonName }}</p>
        </div>
        <div *ngIf="suppliers.length === 0" class="col-span-3 text-center py-8 text-gray-600">
          No suppliers registered yet. Generate an invite link to add one.
        </div>
      </div>

      <!-- Supplier Catalog -->
      <div *ngIf="selectedSupplier" class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-800/60">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">
            {{ selectedSupplier.name }} — Catalog
          </h3>
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
              <tr *ngFor="let sc of supplierCatalog" class="border-t border-gray-800/40">
                <td class="px-5 py-3 text-white">{{ sc.componentName }}</td>
                <td class="px-5 py-3 text-teal-400 font-mono text-xs">{{ sc.partNumber || '—' }}</td>
                <td class="px-5 py-3 text-gray-300">₹{{ sc.unitPrice }}</td>
                <td class="px-5 py-3 text-gray-400">{{ sc.stockQuantity }}</td>
                <td class="px-5 py-3 text-gray-400">{{ sc.leadTimeDays }} days</td>
              </tr>
              <tr *ngIf="supplierCatalog.length === 0">
                <td colspan="5" class="px-5 py-6 text-center text-gray-600">No catalog items</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MfgSuppliersComponent implements OnInit {
    suppliers: any[] = [];
    selectedSupplier: any = null;
    supplierCatalog: any[] = [];
    showInviteModal = false;
    inviteEmail = '';
    generatedLink: string | null = null;
    copied = false;
    isGenerating =false;

    constructor(
        private companyService: CompanyService,
        private supplierCompService: SupplierComponentService,
        private http: HttpClient,
        private cdr: ChangeDetectorRef

    ) { }

    ngOnInit() {
        this.companyService.getApprovedSuppliers().subscribe({
           next: d => {
            this.suppliers = d || [], 
            this.cdr.detectChanges();
           },
          error: () => { } });
    }

    selectSupplier(s: any) {
        this.selectedSupplier = s;
        this.supplierCompService.getBySupplier(s.id).subscribe({
            next: d => this.supplierCatalog = d || [],
            error: () => this.supplierCatalog = []
        });
    }

    generateInvite() {
        if (this.isGenerating) return;
        this.isGenerating = true;
        const email = this.inviteEmail.trim() || `invite-${Date.now()}@sparesy.com`;
        this.http.post('/api/auth/invite', { email, type: 'SUPPLIER' }, { responseType: 'text' }).subscribe({
            next: (token: string) => {
                this.isGenerating = false;
                this.generatedLink = `${window.location.origin}/auth/register?token=${token}`;
            },
            error: (e: any) => {
                this.isGenerating = false;
                alert(e.error?.message || 'Error generating invite');
            }
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