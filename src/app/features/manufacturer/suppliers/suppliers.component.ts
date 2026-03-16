import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../../core/services/company.service';
import { SupplierComponentService } from '../../../core/services/supplier-component.service';

@Component({
    selector: 'app-mfg-suppliers',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Suppliers</h1>
      <p class="text-gray-500 text-sm mb-6">View all registered suppliers and their catalogs</p>

      <div class="grid grid-cols-3 gap-4 mb-6">
        <div *ngFor="let s of suppliers"
          (click)="selectSupplier(s)"
          class="bg-[#141414] border rounded-xl p-5 cursor-pointer transition-all duration-150 hover:border-teal-500/50"
          [ngClass]="{ 'border-teal-500/50 bg-teal-500/5': selectedSupplier?.id === s.id, 'border-gray-800/60': selectedSupplier?.id !== s.id }">
          <h3 class="text-white font-semibold">{{ s.name }}</h3>
          <p class="text-gray-500 text-sm mt-1">{{ s.email }}</p>
          <p class="text-gray-600 text-xs mt-1">{{ s.contactPersonName }}</p>
        </div>
        <div *ngIf="suppliers.length === 0" class="col-span-3 text-center py-8 text-gray-600">No suppliers registered</div>
      </div>

      <!-- Supplier Catalog -->
      <div *ngIf="selectedSupplier" class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="px-5 py-4 border-b border-gray-800/60">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">{{ selectedSupplier.name }} — Catalog</h3>
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

    constructor(private companyService: CompanyService, private supplierCompService: SupplierComponentService) { }

    ngOnInit() {
        this.companyService.getSuppliers().subscribe({ next: d => this.suppliers = d || [], error: () => { } });
    }

    selectSupplier(s: any) {
        this.selectedSupplier = s;
        this.supplierCompService.getBySupplier(s.id).subscribe({ next: d => this.supplierCatalog = d || [], error: () => this.supplierCatalog = [] });
    }
}
