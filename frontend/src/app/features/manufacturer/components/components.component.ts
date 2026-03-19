import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentService } from '../../../core/services/component.service';

@Component({
    selector: 'app-mfg-components',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">Components</h1>
          <p class="text-gray-500 text-sm">Master component catalog</p>
        </div>
        <button (click)="showAddForm.set(!showAddForm())"
          class="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400 transition">
          {{ showAddForm() ? 'Cancel' : '+ Add Component' }}
        </button>
      </div>

      <!-- Add Form -->
      <div *ngIf="showAddForm()" class="bg-[#141414] border border-gray-800/60 rounded-xl p-5 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Name</label>
            <input type="text" [(ngModel)]="newComp.name" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Part Number</label>
            <input type="text" [(ngModel)]="newComp.partNumber" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Category</label>
            <input type="text" [(ngModel)]="newComp.category" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Description</label>
            <input type="text" [(ngModel)]="newComp.description" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button (click)="addComponent()" class="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400 transition">Save Component</button>
        </div>
      </div>

      <!-- Search -->
      <div class="flex gap-3 mb-4">
        <input type="text" [(ngModel)]="searchTerm" placeholder="Search by part number..."
          class="bg-[#1a1a1a] border border-gray-700 text-white px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 w-64" />
        <button (click)="searchByPart()" class="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition">Search</button>
        <button (click)="loadAll()" class="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition">Show All</button>
      </div>

      <!-- Table -->
      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">ID</th>
                <th class="text-left px-5 py-3 font-medium">Name</th>
                <th class="text-left px-5 py-3 font-medium">Part Number</th>
                <th class="text-left px-5 py-3 font-medium">Category</th>
                <th class="text-left px-5 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of components()" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-gray-500">#{{ c.id }}</td>
                <td class="px-5 py-3 text-white font-medium">{{ c.name }}</td>
                <td class="px-5 py-3 text-teal-400 font-mono text-xs">{{ c.partNumber }}</td>
                <td class="px-5 py-3 text-gray-400">{{ c.category }}</td>
                <td class="px-5 py-3 text-gray-500">{{ c.description }}</td>
              </tr>
              <tr *ngIf="components().length === 0">
                <td colspan="5" class="px-5 py-8 text-center text-gray-600">No components found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MfgComponentsComponent implements OnInit {
    components = signal<any[]>([]);
    showAddForm = signal<boolean>(false);
    
    searchTerm = '';
    newComp: any = { name: '', partNumber: '', category: '', description: '' };

    constructor(private compService: ComponentService) { }

    ngOnInit() { this.loadAll(); }

    loadAll() {
        this.compService.getAll().subscribe({
            next: d => this.components.set(d || []),
            error: () => { }
        });
    }

    searchByPart() {
        if (!this.searchTerm.trim()) return this.loadAll();
        this.compService.search(this.searchTerm).subscribe({
            next: d => this.components.set(Array.isArray(d) ? d : [d]),
            error: () => this.components.set([])
        });
    }

    addComponent() {
        this.compService.addComponent(this.newComp).subscribe({
            next: () => { 
                this.showAddForm.set(false); 
                this.newComp = { name: '', partNumber: '', category: '', description: '' }; 
                this.loadAll(); 
            },
            error: (e: any) => alert(e.error?.message || 'Error adding component')
        });
    }
}
