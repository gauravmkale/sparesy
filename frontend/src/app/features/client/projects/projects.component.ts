import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { ProductionService } from '../../../core/services/production.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-client-projects',
    standalone: true,
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">My Projects</h1>
          <p class="text-gray-500 text-sm">Submit and track your PCB projects</p>
        </div>
        <button (click)="showForm.set(!showForm())"
          class="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition">
          {{ showForm() ? 'Cancel' : '+ New Project' }}
        </button>
      </div>

      <!-- New Project Form -->
      <div *ngIf="showForm()" class="bg-[#141414] border border-gray-800/60 rounded-xl p-5 mb-6">
        <h3 class="text-white font-semibold mb-4">Submit New Project</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Project Name</label>
            <input type="text" [(ngModel)]="newProject.name" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 mt-1" />
            
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium mt-3 block">Project Quantity</label>
            <input type="number" [(ngModel)]="newProject.quantity" min="1"
              class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 mt-1" />
            <p *ngIf="newProject.quantity < 1" class="text-red-400 text-xs mt-1">Quantity must be at least 1</p>
            
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium mt-3 block">Layer Count</label>
            <input type="number" [(ngModel)]="newProject.layerCount" min="1"
              class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 mt-1" />
            <p *ngIf="newProject.layerCount < 1" class="text-red-400 text-xs mt-1">Layer count must be at least 1</p>
          </div>
          <div>
            <label class="text-xs text-gray-400 uppercase tracking-wider font-medium block">Board Thickness</label>
            <input type="number" [(ngModel)]="newProject.boardThickness" min="0.1" step="0.1"
              class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 mt-1" />
            <p *ngIf="newProject.boardThickness < 0.1" class="text-red-400 text-xs mt-1">Thickness must be greater than 0</p>
            
            <div class="mt-3">
              <label class="text-xs text-gray-400 uppercase tracking-wider font-medium">Surface Finish</label>
              <select [(ngModel)]="newProject.surfaceFinish" class="w-full bg-[#1a1a1a] border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 mt-1">
                <option value="HASL">HASL</option>
                <option value="ENIG">ENIG</option>
                <option value="OSP">OSP</option>
                <option value="Immersion_Tin">Immersion Tin</option>
                <option value="Immersion_Silver">Immersion Silver</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button (click)="submitProject()" [disabled]="isLoading()" 
            class="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 disabled:opacity-50 transition flex items-center gap-2">
            <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isLoading() ? 'Submitting...' : 'Submit Project' }}
          </button>
        </div>
      </div>

      <!-- Project Detail -->
      <div *ngIf="selectedProject()" class="mb-6">
        <button (click)="selectedProject.set(null)" class="text-gray-500 hover:text-white text-sm mb-4 flex items-center gap-1 transition">← Back to list</button>
        <div class="bg-[#141414] border border-gray-800/60 rounded-xl p-5">
          <h3 class="text-lg font-semibold text-white mb-3">{{ selectedProject()?.name || 'Untitled Project' }}</h3>
          <div class="grid grid-cols-3 gap-3 text-sm mb-4">
            <div><span class="text-gray-500">Quantity:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.quantity }}</span></div>
            <div><span class="text-gray-500">Layers:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.layerCount }}</span></div>
            <div><span class="text-gray-500">Thickness:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.boardThickness }}mm</span></div>
            <div><span class="text-gray-500">Surface:</span> <span class="text-gray-300 ml-2">{{ selectedProject()?.surfaceFinish }}</span></div>
            <div><span class="text-gray-500">Status:</span>
              <span class="ml-2 px-2 py-0.5 rounded-md text-xs font-semibold" [ngClass]="getStatusClass(selectedProject()?.status)">{{ selectedProject()?.status }}</span>
            </div>
          </div>
          <!-- Production Tracking -->
          <div *ngIf="productionOrder()" class="mt-4 pt-4 border-t border-gray-800/40">
            <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Production Progress</h4>
            <div class="flex gap-1 mb-2">
              <div *ngFor="let stage of stages; let i = index"
                class="h-3 flex-1 rounded-full transition-colors"
                [ngClass]="i <= getStageIndex(productionOrder().currentStage) ? 'bg-indigo-500' : 'bg-gray-800'"
                [title]="stage">
              </div>
            </div>
            <p class="text-gray-400 text-sm">Current: <span class="text-white font-medium">{{ productionOrder().currentStage?.replace('_', ' ') }}</span></p>
          </div>
        </div>
      </div>

      <!-- Projects Table -->
      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Qty</th>
                <th class="text-left px-5 py-3 font-medium">Layers</th>
                <th class="text-left px-5 py-3 font-medium">Status</th>
                <th class="text-left px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of projects()" (click)="selectProject(p)" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition cursor-pointer">
                <td class="px-5 py-3 text-white font-medium">{{ p.name }}</td>
                <td class="px-5 py-3 text-gray-400">{{ p.quantity }}</td>
                <td class="px-5 py-3 text-gray-400">{{ p.layerCount }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold" [ngClass]="getStatusClass(p.status)">{{ p.status }}</span>
                </td>
                <td class="px-5 py-3 text-gray-500">{{ p.submittedAt | date:'shortDate' }}</td>
              </tr>
              <tr *ngIf="projects().length === 0">
                <td colspan="5" class="px-5 py-8 text-center text-gray-600">No projects yet. Submit your first project!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ClientProjectsComponent implements OnInit {
    projects = signal<any[]>([]);
    selectedProject = signal<any>(null);
    productionOrder = signal<any>(null);
    showForm = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    
    newProject: any = { name: '', quantity: 100, layerCount: 2, boardThickness: 1.6, surfaceFinish: 'HASL' };
    stages = ['COMPONENT_PREP', 'PCB_FABRICATION', 'SMT_ASSEMBLY', 'SOLDERING', 'QC_INSPECTION', 'PACKAGING', 'READY'];

    private projectService = inject(ProjectService);
    private prodService = inject(ProductionService);
    private notif = inject(NotificationService);

    ngOnInit() { this.load(); }

    load() {
        this.projectService.getMyProjects().subscribe({
            next: d => this.projects.set(d || []),
            error: () => this.notif.error('Failed to load projects')
        });
    }

    selectProject(p: any) {
        this.selectedProject.set(p);
        this.prodService.getByProject(p.id).subscribe({
            next: d => this.productionOrder.set(d),
            error: () => this.productionOrder.set(null)
        });
    }

    submitProject() {
          if (this.isLoading()) return;
          if (!this.newProject.name?.trim()) {
              this.notif.error('Project name is required');
              return;
          }
          if (this.newProject.quantity < 1) {
              this.notif.error('Quantity must be at least 1');
              return;
          }
          if (this.newProject.boardThickness < 0.1) {
              this.notif.error('Board thickness must be greater than 0');
              return;
          }
        this.isLoading.set(true);
        this.projectService.submitProject(this.newProject).subscribe({
            next: () => { 
                this.isLoading.set(false);
                this.showForm.set(false); 
                this.newProject = { name: '', quantity: 100, layerCount: 2, boardThickness: 1.6, surfaceFinish: 'HASL' }; 
                this.load(); 
                this.notif.success('Project submitted successfully');
            },
            error: (e: any) => {
              this.isLoading.set(false);
              this.notif.error(e.error?.message || 'Error submitting project');
            }
        });
    }

    getStageIndex(stage: string): number { return this.stages.indexOf(stage); }

    getStatusClass(status: string): string {
        const map: any = {
            'SUBMITTED': 'bg-blue-500/20 text-blue-400', 'BOM_REVIEW': 'bg-purple-500/20 text-purple-400',
            'SOURCING': 'bg-orange-500/20 text-orange-400', 'QUOTED': 'bg-yellow-500/20 text-yellow-400',
            'QUOTE_APPROVED': 'bg-teal-500/20 text-teal-400', 'IN_PRODUCTION': 'bg-cyan-500/20 text-cyan-400',
            'DELIVERED': 'bg-emerald-500/20 text-emerald-400', 'CANCELLED': 'bg-red-500/20 text-red-400'
        };
        return map[status] || 'bg-gray-500/20 text-gray-400';
    }
}
