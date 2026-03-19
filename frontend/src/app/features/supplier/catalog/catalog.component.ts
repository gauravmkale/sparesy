import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierComponentService } from '../../../core/services/supplier-component.service';
import { ComponentService } from '../../../core/services/component.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-sup-catalog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">My Catalog</h1>
          <p class="text-gray-500 text-sm">Manage your component offerings</p>
        </div>
        <button (click)="showAddForm.set(!showAddForm())"
          class="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition">
          {{ showAddForm() ? 'Cancel' : '+ Add to Catalog' }}
        </button>
      </div>

      <!-- Add Form -->
      <div *ngIf="showAddForm()" class="bg-[#141414] border border-gray-800/60 rounded-xl p-5 mb-6">
        <h3 class="text-white font-semibold mb-4">Add Component to Catalog</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Select Component</label>
            <select [(ngModel)]="newItem.componentId" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 mt-1">
              <option [ngValue]="null" disabled>Choose from master catalog</option>
              <option *ngFor="let c of masterComponents()" [ngValue]="c.id">{{ c.name }} ({{ c.partNumber }})</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Unit Price (₹)</label>
            <input type="number" [(ngModel)]="newItem.unitPrice" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Stock Quantity</label>
            <input type="number" [(ngModel)]="newItem.stockQuantity" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Lead Time (days)</label>
            <input type="number" [(ngModel)]="newItem.leadTimeDays" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 mt-1" />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button (click)="addToCatalog()" class="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition">Add to Catalog</button>
        </div>
      </div>

      <!-- Catalog Table -->
      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">Component</th>
                <th class="text-left px-5 py-3 font-medium">Unit Price</th>
                <th class="text-left px-5 py-3 font-medium">Stock</th>
                <th class="text-left px-5 py-3 font-medium">Lead Time</th>
                <th class="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sc of catalog()" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-white font-medium">{{ sc.component?.name || 'Unknown Component' }}</td>
                <td class="px-5 py-3">
                  <div *ngIf="editingId() !== sc.id" class="text-gray-300">₹{{ sc.unitPrice }}</div>
                  <input *ngIf="editingId() === sc.id" type="number" [(ngModel)]="editPrice"
                    class="bg-[#1a1a1a] border border-blue-500 text-white px-2 py-1 rounded-lg text-sm w-24" />
                </td>
                <td class="px-5 py-3">
                  <div *ngIf="editingId() !== sc.id" class="text-gray-400">{{ sc.stockQuantity }}</div>
                  <input *ngIf="editingId() === sc.id" type="number" [(ngModel)]="editStock"
                    class="bg-[#1a1a1a] border border-blue-500 text-white px-2 py-1 rounded-lg text-sm w-24" />
                </td>
                <td class="px-5 py-3 text-gray-400">{{ sc.leadTimeDays }} days</td>
                <td class="px-5 py-3">
                  <div *ngIf="editingId() !== sc.id">
                    <button (click)="startEdit(sc)" class="text-xs px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition">Edit</button>
                  </div>
                  <div *ngIf="editingId() === sc.id" class="flex gap-2">
                    <button (click)="saveEdit(sc.id)" class="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition">Save</button>
                    <button (click)="editingId.set(null)" class="text-xs px-2.5 py-1 rounded-lg bg-gray-500/15 text-gray-400 hover:bg-gray-500/25 transition">Cancel</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="catalog().length === 0">
                <td colspan="5" class="px-5 py-8 text-center text-gray-600">No items in catalog. Add components from the master catalog!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SupCatalogComponent implements OnInit {
    catalog = signal<any[]>([]);
    masterComponents = signal<any[]>([]);
    showAddForm = signal<boolean>(false);
    editingId = signal<number | null>(null);
    isLoading = signal<boolean>(false);
    
    editPrice = 0;
    editStock = 0;
    newItem: any = { componentId: null, unitPrice: 0, stockQuantity: 0, leadTimeDays: 7 };

    private supCompService = inject(SupplierComponentService);
    private compService = inject(ComponentService);
    private notif = inject(NotificationService);

    ngOnInit() {
        this.load();
        this.compService.getAll().subscribe({
            next: d => this.masterComponents.set(d || []),
            error: () => { }
        });
    }

    load() {
        this.supCompService.getMyCatalog().subscribe({
            next: d => this.catalog.set(d || []),
            error: () => { }
        });
    }

    addToCatalog() {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        this.supCompService.addToCatalog(this.newItem).subscribe({
            next: () => { 
                this.isLoading.set(false);
                this.showAddForm.set(false); 
                this.notif.success('Component added to your catalog');
                this.newItem = { componentId: null, unitPrice: 0, stockQuantity: 0, leadTimeDays: 7 }; 
                this.load(); 
            },
            error: (e: any) => {
                this.isLoading.set(false);
                this.notif.error(e.error?.message || 'Error adding to catalog');
            }
        });
    }

    startEdit(sc: any) {
        this.editingId.set(sc.id);
        this.editPrice = sc.unitPrice;
        this.editStock = sc.stockQuantity;
    }

    saveEdit(id: number) {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        this.supCompService.updatePrice(id, this.editPrice).subscribe({
            next: () => {
                this.supCompService.updateStock(id, this.editStock).subscribe({
                    next: () => { 
                        this.isLoading.set(false);
                        this.editingId.set(null); 
                        this.notif.success('Catalog item updated');
                        this.load(); 
                    },
                    error: () => { 
                        this.isLoading.set(false);
                        this.editingId.set(null); 
                        this.load(); 
                    }
                });
            },
            error: (e: any) => {
                this.isLoading.set(false);
                this.notif.error(e.error?.message || 'Error updating item');
            }
        });
    }
}
