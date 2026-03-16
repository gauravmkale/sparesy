import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { RequestService } from '../../../core/services/request.service';
import { QuoteService } from '../../../core/services/quote.service';
import { CompanyService } from '../../../core/services/company.service';
import { ComponentService } from '../../../core/services/component.service';

@Component({
    selector: 'app-mfg-projects',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Projects</h1>
      <p class="text-gray-500 text-sm mb-6">Manage all client projects and sourcing workflow</p>

      <!-- Project List -->
      <div *ngIf="!selectedProject" class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">ID</th>
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Client</th>
                <th class="text-left px-5 py-3 font-medium">Qty</th>
                <th class="text-left px-5 py-3 font-medium">Status</th>
                <th class="text-left px-5 py-3 font-medium">Date</th>
                <th class="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of projects" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition cursor-pointer" (click)="selectProject(p)">
                <td class="px-5 py-3 text-gray-500">#{{ p.id }}</td>
                <td class="px-5 py-3 text-white font-medium">{{ p.name }}</td>
                <td class="px-5 py-3 text-gray-400">{{ p.clientName || '—' }}</td>
                <td class="px-5 py-3 text-gray-400">{{ p.quantity }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold" [ngClass]="getStatusClass(p.status)">{{ p.status }}</span>
                </td>
                <td class="px-5 py-3 text-gray-500">{{ p.submittedAt | date:'shortDate' }}</td>
                <td class="px-5 py-3">
                  <select (click)="$event.stopPropagation()" (change)="updateStatus(p.id, $event)" [value]="p.status"
                    class="bg-[#1a1a1a] border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded-lg focus:outline-none focus:border-teal-500">
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="BOM_REVIEW">BOM_REVIEW</option>
                    <option value="SOURCING">SOURCING</option>
                    <option value="QUOTED">QUOTED</option>
                    <option value="QUOTE_APPROVED">QUOTE_APPROVED</option>
                    <option value="IN_PRODUCTION">IN_PRODUCTION</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
              <tr *ngIf="projects.length === 0">
                <td colspan="7" class="px-5 py-8 text-center text-gray-600">No projects found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Project Detail -->
      <div *ngIf="selectedProject">
        <button (click)="selectedProject = null" class="text-gray-500 hover:text-white text-sm mb-4 flex items-center gap-1 transition">
          ← Back to projects
        </button>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5 col-span-2">
            <h3 class="text-lg font-semibold text-white mb-3">{{ selectedProject.name }}</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><span class="text-gray-500">Client:</span> <span class="text-gray-300 ml-2">{{ selectedProject.clientName }}</span></div>
              <div><span class="text-gray-500">Quantity:</span> <span class="text-gray-300 ml-2">{{ selectedProject.quantity }}</span></div>
              <div><span class="text-gray-500">Layers:</span> <span class="text-gray-300 ml-2">{{ selectedProject.layerCount }}</span></div>
              <div><span class="text-gray-500">Thickness:</span> <span class="text-gray-300 ml-2">{{ selectedProject.boardThickness }}mm</span></div>
              <div><span class="text-gray-500">Surface Finish:</span> <span class="text-gray-300 ml-2">{{ selectedProject.surfaceFinish }}</span></div>
              <div><span class="text-gray-500">Status:</span>
                <span class="ml-2 px-2 py-0.5 rounded-md text-xs font-semibold" [ngClass]="getStatusClass(selectedProject.status)">{{ selectedProject.status }}</span>
              </div>
            </div>
          </div>
          <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
            <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h4>
            <div class="space-y-2">
              <button (click)="showSendRequest = true" class="w-full text-left px-3 py-2 rounded-lg bg-teal-500/10 text-teal-400 text-sm hover:bg-teal-500/20 transition">
                Send Sourcing Request
              </button>
              <button (click)="showCreateQuote = true" class="w-full text-left px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition">
                Create Client Quote
              </button>
            </div>
          </div>
        </div>

        <!-- Sourcing Requests -->
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl mb-6">
          <div class="px-5 py-4 border-b border-gray-800/60 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Sourcing Requests</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-gray-500 text-xs uppercase tracking-wider">
                  <th class="text-left px-5 py-3 font-medium">Component</th>
                  <th class="text-left px-5 py-3 font-medium">Supplier</th>
                  <th class="text-left px-5 py-3 font-medium">Qty Needed</th>
                  <th class="text-left px-5 py-3 font-medium">Quoted Price</th>
                  <th class="text-left px-5 py-3 font-medium">Status</th>
                  <th class="text-left px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of requests" class="border-t border-gray-800/40">
                  <td class="px-5 py-3 text-white">{{ r.componentName }}</td>
                  <td class="px-5 py-3 text-gray-400">{{ r.supplierName }}</td>
                  <td class="px-5 py-3 text-gray-400">{{ r.quantityNeeded }}</td>
                  <td class="px-5 py-3 text-gray-300">{{ r.quotedPrice ? '₹' + r.quotedPrice : '—' }}</td>
                  <td class="px-5 py-3">
                    <span class="px-2 py-0.5 rounded-md text-xs font-semibold" [ngClass]="getRequestStatusClass(r.status)">{{ r.status }}</span>
                  </td>
                  <td class="px-5 py-3 flex gap-2">
                    <button *ngIf="r.status === 'QUOTED'" (click)="approveRequest(r.id)"
                      class="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition">Approve</button>
                    <button *ngIf="r.status === 'QUOTED'" (click)="rejectRequest(r.id)"
                      class="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition">Reject</button>
                  </td>
                </tr>
                <tr *ngIf="requests.length === 0">
                  <td colspan="6" class="px-5 py-6 text-center text-gray-600">No sourcing requests</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Send Request Modal -->
        <div *ngIf="showSendRequest" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="showSendRequest = false">
          <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold text-white">Send Sourcing Request</h3>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Supplier</label>
                <select [(ngModel)]="newRequest.supplierCompanyId" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1">
                  <option [ngValue]="null" disabled>Select supplier</option>
                  <option *ngFor="let s of suppliers" [ngValue]="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Component</label>
                <select [(ngModel)]="newRequest.componentId" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1">
                  <option [ngValue]="null" disabled>Select component</option>
                  <option *ngFor="let c of components" [ngValue]="c.id">{{ c.name }} ({{ c.partNumber }})</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Quantity Needed</label>
                <input type="number" [(ngModel)]="newRequest.quantityNeeded"
                  class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-4">
              <button (click)="showSendRequest = false" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
              <button (click)="sendRequest()" class="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400 transition">Send</button>
            </div>
          </div>
        </div>

        <!-- Create Quote Modal -->
        <div *ngIf="showCreateQuote" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="showCreateQuote = false">
          <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold text-white">Create Client Quote</h3>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Price (₹)</label>
                <input type="number" [(ngModel)]="newQuote.totalPrice"
                  class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Lead Time (days)</label>
                <input type="number" [(ngModel)]="newQuote.leadTimeDays"
                  class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Notes</label>
                <textarea [(ngModel)]="newQuote.notes" rows="3"
                  class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1 resize-none"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-4">
              <button (click)="showCreateQuote = false" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
              <button (click)="createQuote()" class="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition">Create & Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MfgProjectsComponent implements OnInit {
    projects: any[] = [];
    selectedProject: any = null;
    requests: any[] = [];
    suppliers: any[] = [];
    components: any[] = [];
    showSendRequest = false;
    showCreateQuote = false;
    newRequest: any = { supplierCompanyId: null, componentId: null, quantityNeeded: 0 };
    newQuote: any = { totalPrice: 0, leadTimeDays: 0, notes: '' };

    constructor(
        private projectService: ProjectService,
        private requestService: RequestService,
        private quoteService: QuoteService,
        private companyService: CompanyService,
        private componentService: ComponentService
    ) { }

    ngOnInit() {
        this.loadProjects();
        this.companyService.getSuppliers().subscribe({ next: d => this.suppliers = d || [], error: () => { } });
        this.componentService.getAll().subscribe({ next: d => this.components = d || [], error: () => { } });
    }

    loadProjects() {
        this.projectService.getAllProjects().subscribe({ next: d => this.projects = d || [], error: () => { } });
    }

    selectProject(p: any) {
        this.selectedProject = p;
        this.requestService.getByProject(p.id).subscribe({ next: d => this.requests = d || [], error: () => { } });
    }

    updateStatus(id: number, event: any) {
        this.projectService.updateStatus(id, event.target.value).subscribe({
            next: () => this.loadProjects(), error: (e: any) => alert(e.error?.message || 'Error updating status')
        });
    }

    sendRequest() {
        const data = { ...this.newRequest, projectId: this.selectedProject.id };
        this.requestService.sendRequest(data).subscribe({
            next: () => { this.showSendRequest = false; this.selectProject(this.selectedProject); },
            error: (e: any) => alert(e.error?.message || 'Error sending request')
        });
    }

    approveRequest(id: number) {
        this.requestService.approve(id).subscribe({
            next: () => this.selectProject(this.selectedProject),
            error: (e: any) => alert(e.error?.message || 'Error')
        });
    }

    rejectRequest(id: number) {
        this.requestService.reject(id).subscribe({
            next: () => this.selectProject(this.selectedProject),
            error: (e: any) => alert(e.error?.message || 'Error')
        });
    }

    createQuote() {
        const data = { ...this.newQuote, projectId: this.selectedProject.id, lineItemsJson: '[]' };
        this.quoteService.createQuote(data).subscribe({
            next: (q: any) => {
                this.quoteService.send(q.id).subscribe({
                    next: () => { this.showCreateQuote = false; alert('Quote created and sent to client!'); },
                    error: () => { this.showCreateQuote = false; alert('Quote created but failed to send'); }
                });
            },
            error: (e: any) => alert(e.error?.message || 'Error creating quote')
        });
    }

    getStatusClass(status: string): string {
        const map: any = {
            'SUBMITTED': 'bg-blue-500/20 text-blue-400', 'BOM_REVIEW': 'bg-purple-500/20 text-purple-400',
            'SOURCING': 'bg-orange-500/20 text-orange-400', 'QUOTED': 'bg-yellow-500/20 text-yellow-400',
            'QUOTE_APPROVED': 'bg-teal-500/20 text-teal-400', 'IN_PRODUCTION': 'bg-cyan-500/20 text-cyan-400',
            'DELIVERED': 'bg-emerald-500/20 text-emerald-400', 'CANCELLED': 'bg-red-500/20 text-red-400'
        };
        return map[status] || 'bg-gray-500/20 text-gray-400';
    }

    getRequestStatusClass(status: string): string {
        const map: any = {
            'PENDING': 'bg-yellow-500/20 text-yellow-400', 'QUOTED': 'bg-blue-500/20 text-blue-400',
            'APPROVED': 'bg-emerald-500/20 text-emerald-400', 'REJECTED': 'bg-red-500/20 text-red-400'
        };
        return map[status] || 'bg-gray-500/20 text-gray-400';
    }
}
