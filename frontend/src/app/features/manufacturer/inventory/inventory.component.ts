import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
    selector: 'app-mfg-inventory',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Inventory</h1>
      <p class="text-gray-500 text-sm mb-6">Stock levels and low stock alerts</p>

      <!-- Alerts -->
      <div *ngIf="alerts().length > 0" class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
        <h3 class="text-amber-400 text-sm font-semibold mb-2">⚠ Low Stock Alerts ({{ alerts().length }})</h3>
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let a of alerts()" class="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-medium">
            {{ a.component?.name || 'Component #' + a.componentId }} — {{ a.quantityOnHand }} left
          </span>
        </div>
      </div>

      <!-- Stock Table -->
      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">Component</th>
                <th class="text-left px-5 py-3 font-medium">On Hand</th>
                <th class="text-left px-5 py-3 font-medium">Reserved</th>
                <th class="text-left px-5 py-3 font-medium">Available</th>
                <th class="text-left px-5 py-3 font-medium">Reorder At</th>
                <th class="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inventory()" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-white font-medium">{{ item.component?.name || 'Component #' + item.componentId }}</td>
                <td class="px-5 py-3 text-gray-300">{{ item.quantityOnHand }}</td>
                <td class="px-5 py-3 text-gray-400">{{ item.quantityReserved }}</td>
                <td class="px-5 py-3 text-gray-300">{{ item.availableQuantity }}</td>
                <td class="px-5 py-3 text-gray-500">{{ item.reorderThreshold }}</td>
                <td class="px-5 py-3">
                  <span *ngIf="item.isLowStock" class="px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500/20 text-red-400">LOW</span>
                  <span *ngIf="!item.isLowStock" class="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400">OK</span>
                </td>
              </tr>
              <tr *ngIf="inventory().length === 0">
                <td colspan="6" class="px-5 py-8 text-center text-gray-600">No inventory records</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MfgInventoryComponent implements OnInit {
    inventory = signal<any[]>([]);
    alerts = signal<any[]>([]);

    constructor(private invService: InventoryService) { }

    ngOnInit() {
        this.invService.getAll().subscribe({
            next: d => this.inventory.set(d || []),
            error: () => { }
        });
        this.invService.getAlerts().subscribe({
            next: d => this.alerts.set(d || []),
            error: () => { }
        });
    }
}
