import { ChangeDetectionStrategy, Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { RequestService } from '../../../core/services/request.service';
import { QuoteService } from '../../../core/services/quote.service';
import { CompanyService } from '../../../core/services/company.service';
import { ComponentService } from '../../../core/services/component.service';
import { SupplierComponentService } from '../../../core/services/supplier-component.service';
import { NotificationService } from '../../../core/services/notification.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-mfg-projects',
    standalone: true,
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Projects</h1>
      <p class="text-gray-500 text-sm mb-6">Manage all client projects and sourcing workflow</p>

      <!-- Project List -->
      <div *ngIf="!selectedProject()" class="bg-[#141414] border border-gray-800/60 rounded-xl">
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
              <tr *ngFor="let p of projects()" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition cursor-pointer" (click)="selectProject(p)">
                <td class="px-5 py-3 text-gray-500">#{{ p.id }}</td>
                <td class="px-5 py-3 text-white font-medium">{{ p.name }}</td>
                <td class="px-5 py-3 text-gray-400">{{ p.client?.name || '—' }}</td>
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
              <tr *ngIf="projects().length === 0">
                <td colspan="7" class="px-5 py-8 text-center text-gray-600">No projects found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Project Detail -->
      <div *ngIf="selectedProject()">
        <button (click)="selectedProject.set(null)" class="text-gray-500 hover:text-white text-sm mb-4 flex items-center gap-1 transition">
          ← Back to projects
        </button>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5 col-span-2">
            <h3 class="text-lg font-semibold text-white mb-3">{{ selectedProject()?.name || 'Untitled Project' }}</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><span class="text-gray-500">Client:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.client?.name || '—' }}</span></div>
              <div><span class="text-gray-500">Quantity:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.quantity }}</span></div>
              <div><span class="text-gray-500">Layers:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.layerCount }}</span></div>
              <div><span class="text-gray-500">Thickness:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.boardThickness }}mm</span></div>
              <div><span class="text-gray-500">Surface Finish:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.surfaceFinish }}</span></div>
              <div><span class="text-gray-500">Status:</span>
                <span class="ml-2 px-2 py-0.5 rounded-md text-xs font-semibold" [ngClass]="getStatusClass(selectedProject()?.status)">{{ selectedProject()?.status }}</span>
              </div>
            </div>
          </div>
          <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
            <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h4>
            <div class="space-y-2">
              <button (click)="openSendRequest()" class="w-full text-left px-3 py-2 rounded-lg bg-teal-500/10 text-teal-400 text-sm hover:bg-teal-500/20 transition">
                Send Sourcing Request
              </button>
              <button (click)="openCreateQuote()" class="w-full text-left px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition">
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
                  <th class="text-left px-5 py-3 font-medium">Qty</th>
                  <th class="text-left px-5 py-3 font-medium">Target Price</th>
                  <th class="text-left px-5 py-3 font-medium">Quoted Price</th>
                  <th class="text-left px-5 py-3 font-medium">Status</th>
                  <th class="text-left px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of requests()" class="border-t border-gray-800/40">
                  <td class="px-5 py-3">
                    <div class="flex flex-col">
                        <span class="text-white">{{ r.component?.name }}</span>
                        <span class="text-[10px] text-gray-500 font-mono">{{ r.component?.partNumber }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-gray-400">{{ r.supplier?.name }}</td>
                  <td class="px-5 py-3 text-gray-400">{{ r.quantityNeeded }}</td>
                  <td class="px-5 py-3 text-gray-500">{{ r.targetPrice ? '₹' + r.targetPrice : '—' }}</td>
                  <td class="px-5 py-3 text-gray-300 font-medium">{{ r.quotedPrice ? '₹' + r.quotedPrice : '—' }}</td>
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
                <tr *ngIf="requests().length === 0">
                  <td colspan="7" class="px-5 py-6 text-center text-gray-600">No sourcing requests</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Send Request Modal -->
        <div *ngIf="showSendRequest()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="showSendRequest.set(false)">
          <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">Sourcing Request</h3>
                <div class="flex bg-[#1a1a1a] rounded-lg p-1">
                    <button (click)="sourcingMode.set('SINGLE')" class="px-3 py-1 rounded-md text-xs transition" [ngClass]="sourcingMode() === 'SINGLE' ? 'bg-teal-500 text-white' : 'text-gray-500'">Single</button>
                    <button (click)="sourcingMode.set('BULK')" class="px-3 py-1 rounded-md text-xs transition" [ngClass]="sourcingMode() === 'BULK' ? 'bg-teal-500 text-white' : 'text-gray-500'">Send to All</button>
                </div>
            </div>

            <div class="space-y-3">
              <div *ngIf="sourcingMode() === 'SINGLE'">
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Supplier</label>
                <select [(ngModel)]="newRequest.supplierCompanyId" (change)="onSupplierChange()" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1">
                  <option [ngValue]="null" disabled>Select supplier</option>
                  <option *ngFor="let s of suppliers()" [ngValue]="s.id">{{ s.name }}</option>
                </select>
              </div>

              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Component</label>
                <select [(ngModel)]="newRequest.componentId" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1">
                  <option [ngValue]="null" disabled>{{ sourcingMode() === 'SINGLE' && !newRequest.supplierCompanyId ? 'Select supplier first' : 'Select component' }}</option>
                  <option *ngFor="let c of filteredComponents()" [ngValue]="c.id">{{ c.name }} ({{ c.partNumber }})</option>
                </select>
                <p *ngIf="sourcingMode() === 'BULK'" class="text-[10px] text-gray-500 mt-1 italic">Sends request to all suppliers who carry this component.</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Quantity Needed</label>
                    <input type="number" [(ngModel)]="newRequest.quantityNeeded"
                    class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
                </div>
                <div>
                    <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Target Price (Optional)</label>
                    <input type="number" [(ngModel)]="newRequest.targetPrice"
                    class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Target Delivery (Optional)</label>
                <input type="date" [(ngModel)]="targetDeliveryDate"
                  class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-teal-500 mt-1" />
              </div>
            </div>

            <!-- Confirmation Section -->
            <div *ngIf="showConfirmRequest()" class="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 mt-4">
                <p class="text-xs text-teal-400 font-medium">Ready to send?</p>
                <p class="text-[11px] text-gray-400 mt-1">
                    {{ sourcingMode() === 'BULK' ? 'Requests will be sent to all matching suppliers.' : 'Request will be sent to the selected supplier.' }}
                </p>
                <div class="flex justify-end gap-2 mt-3">
                    <button (click)="showConfirmRequest.set(false)" class="text-xs text-gray-500 hover:text-white transition">Back</button>
                    <button (click)="executeSendRequest()" [disabled]="isLoading()" class="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-400 transition flex items-center gap-2">
                        <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        {{ isLoading() ? 'Processing...' : 'Confirm & Send' }}
                    </button>
                </div>
            </div>

            <div *ngIf="!showConfirmRequest()" class="flex justify-end gap-3 mt-4">
              <button (click)="showSendRequest.set(false)" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
              <button (click)="showConfirmRequest.set(true)" [disabled]="!newRequest.componentId || !newRequest.quantityNeeded" class="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400 transition">
                Send Request
              </button>
            </div>
          </div>
        </div>

        <!-- Create Quote Modal -->
        <div *ngIf="showCreateQuote()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="showCreateQuote.set(false)">
          <div class="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-lg space-y-4" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold text-white">Create Client Quote</h3>
            
            <div class="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4 mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-teal-400 uppercase">Automation Tool</span>
                <span class="text-xs text-gray-500">Base Cost: ₹{{ baseCost() | number }}</span>
              </div>
              <div class="flex gap-4 items-end">
                <div class="flex-1">
                  <label class="text-[10px] text-gray-500 uppercase font-bold">Profit Margin %</label>
                  <input type="number" [(ngModel)]="profitMargin" (input)="applyMargin()"
                    class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-teal-500 mt-1" />
                </div>
                <button (click)="applyMargin()" class="px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg text-xs font-bold hover:bg-teal-500/30 transition">Apply</button>
              </div>
            </div>

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
              <button (click)="showCreateQuote.set(false)" class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white transition">Cancel</button>
              <button (click)="createQuote()" [disabled]="isLoading()" class="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition flex items-center gap-2">
                <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ isLoading() ? 'Creating...' : 'Create & Send' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MfgProjectsComponent implements OnInit {
    projects = signal<any[]>([]);
    selectedProject = signal<any>(null);
    requests = signal<any[]>([]);
    suppliers = signal<any[]>([]);
    allComponents = signal<any[]>([]);
    supplierSpecificComponents = signal<any[]>([]);
    isLoading = signal<boolean>(false);
    
    showSendRequest = signal<boolean>(false);
    showConfirmRequest = signal<boolean>(false);
    showCreateQuote = signal<boolean>(false);
    sourcingMode = signal<'SINGLE' | 'BULK'>('SINGLE');
    
    newRequest: any = { supplierCompanyId: null, componentId: null, quantityNeeded: 0, targetPrice: null };
    targetDeliveryDate = '';
    newQuote: any = { totalPrice: 0, leadTimeDays: 0, notes: '' };
    
    profitMargin = 20;
    baseCost = signal<number>(0);

    filteredComponents = computed(() => {
        if (this.sourcingMode() === 'BULK') return this.allComponents();
        if (this.newRequest.supplierCompanyId) return this.supplierSpecificComponents();
        return [];
    });

    private projectService = inject(ProjectService);
    private requestService = inject(RequestService);
    private quoteService = inject(QuoteService);
    private companyService = inject(CompanyService);
    private componentService = inject(ComponentService);
    private supplierCompService = inject(SupplierComponentService);
    private notif = inject(NotificationService);

    ngOnInit() {
        this.loadProjects();
        this.companyService.getApprovedSuppliers().subscribe({
            next: (d: any[]) => this.suppliers.set(d || []),
            error: () => { }
        });
        this.componentService.getAll().subscribe({
            next: (d: any[]) => this.allComponents.set(d || []),
            error: () => { }
        });
    }

    loadProjects() {
        this.isLoading.set(true);
        this.projectService.getAllProjects().subscribe({
            next: (d: any[]) => { 
                this.projects.set((d || []).sort((a, b) => b.id - a.id)); 
                this.isLoading.set(false); 
            },
            error: () => this.isLoading.set(false)
        });
    }

    selectProject(p: any) {
        this.selectedProject.set(p);
        this.isLoading.set(true);
        this.requestService.getByProject(p.id).subscribe({
            next: (d: any[]) => { 
                this.requests.set(d || []); 
                this.isLoading.set(false); 
                this.calculateBaseCost();
            },
            error: () => this.isLoading.set(false)
        });
    }

    calculateBaseCost() {
        const total = this.requests()
            .filter(r => r.status === 'APPROVED')
            .reduce((sum, r) => sum + (r.quotedPrice || 0), 0);
        this.baseCost.set(total);
    }

    openSendRequest() {
        this.sourcingMode.set('SINGLE');
        this.showConfirmRequest.set(false);
        this.showSendRequest.set(true);
    }

    onSupplierChange() {
        if (this.newRequest.supplierCompanyId) {
            this.supplierCompService.getSupplierCatalog(this.newRequest.supplierCompanyId).subscribe({
                next: (scs: any[]) => {
                    this.supplierSpecificComponents.set(scs.map(sc => sc.component));
                }
            });
        } else {
            this.supplierSpecificComponents.set([]);
        }
    }

    executeSendRequest() {
        if (this.isLoading()) return;
        this.isLoading.set(true);

        const baseData = {
            projectId: this.selectedProject().id,
            componentId: this.newRequest.componentId,
            quantityNeeded: this.newRequest.quantityNeeded,
            targetPrice: this.newRequest.targetPrice,
            targetDelivery: this.targetDeliveryDate ? this.targetDeliveryDate + 'T00:00:00' : null
        };

        if (this.sourcingMode() === 'SINGLE') {
            this.requestService.sendRequest({ ...baseData, supplierCompanyId: this.newRequest.supplierCompanyId }).subscribe({
                next: () => this.onSourcingSuccess(),
                error: (e: any) => this.onSourcingError(e)
            });
        } else {
            this.requestService.sendBulkRequest(baseData).subscribe({
                next: () => this.onSourcingSuccess(),
                error: (e: any) => this.onSourcingError(e)
            });
        }
    }

    onSourcingSuccess() {
        this.isLoading.set(false);
        this.showSendRequest.set(false);
        this.showConfirmRequest.set(false);
        this.notif.success('Sourcing requests sent successfully!');
        this.selectProject(this.selectedProject());
        this.newRequest = { supplierCompanyId: null, componentId: null, quantityNeeded: 0, targetPrice: null };
        this.targetDeliveryDate = '';
    }

    onSourcingError(e: any) {
        this.isLoading.set(false);
        this.notif.error(e.error?.message || 'Error sending request');
    }

    openCreateQuote() {
        this.calculateBaseCost();
        this.applyMargin();
        this.showCreateQuote.set(true);
    }

    applyMargin() {
        const cost = this.baseCost();
        const marginMultiplier = 1 + (this.profitMargin / 100);
        this.newQuote.totalPrice = Math.round(cost * marginMultiplier);
    }

    updateStatus(id: number, event: any) {
        this.projectService.updateStatus(id, event.target.value).subscribe({
            next: () => this.loadProjects(), 
            error: (e: any) => this.notif.error(e.error?.message || 'Error updating status')
        });
    }

    approveRequest(id: number) {
        this.requestService.approve(id).subscribe({
            next: () => { 
                this.notif.success('Request approved'); 
                this.selectProject(this.selectedProject()); 
            },
            error: (e: any) => this.notif.error(e.error?.message || 'Error')
        });
    }

    rejectRequest(id: number) {
        this.requestService.reject(id).subscribe({
            next: () => { 
                this.notif.success('Request rejected'); 
                this.selectProject(this.selectedProject()); 
            },
            error: (e: any) => this.notif.error(e.error?.message || 'Error')
        });
    }

    createQuote() {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        const data = { ...this.newQuote, projectId: this.selectedProject().id, lineItemsJson: '[]' };
        this.quoteService.createQuote(data).subscribe({
            next: (q: any) => {
                this.quoteService.send(q.id).subscribe({
                    next: () => { 
                      this.isLoading.set(false);
                      this.showCreateQuote.set(false); 
                      this.notif.success('Quote created and sent to client!'); 
                      this.loadProjects();
                    },
                    error: () => { 
                      this.isLoading.set(false);
                      this.showCreateQuote.set(false); 
                      this.notif.error('Quote created but failed to send'); 
                    }
                });
            },
            error: (e: any) => {
              this.isLoading.set(false);
              this.notif.error(e.error?.message || 'Error creating quote');
            }
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
