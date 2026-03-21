import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionService } from '../../../core/services/production.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-mfg-production',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div>
      <h1 class="text-2xl font-semibold text-white mb-1">Production</h1>
      <p class="text-gray-500 text-sm mb-6">Track and advance production orders</p>

      <div class="bg-[#141414] border border-gray-800/60 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase tracking-wider">
                <th class="text-left px-5 py-3 font-medium">ID</th>
                <th class="text-left px-5 py-3 font-medium">Project</th>
                <th class="text-left px-5 py-3 font-medium">Current Stage</th>
                <th class="text-left px-5 py-3 font-medium">Stage Progress</th>
                <th class="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of orders()" class="border-t border-gray-800/40 hover:bg-white/[0.02] transition">
                <td class="px-5 py-3 text-gray-500">#{{ o.id }}</td>
                <td class="px-5 py-3 text-white font-medium">{{ o.project?.name || '—' }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded-md text-xs font-semibold" [ngClass]="getStageClass(o.currentStage)">
                    {{ o.currentStage?.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex gap-1">
                    <div *ngFor="let stage of stages; let i = index"
                      class="h-2 w-6 rounded-full transition-colors"
                      [ngClass]="i <= getStageIndex(o.currentStage) ? 'bg-teal-500' : 'bg-gray-800'"
                      [title]="stage">
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <button *ngIf="o.currentStage !== 'READY'" (click)="advance(o.id)" [disabled]="isLoading()"
                    class="text-xs px-3 py-1.5 rounded-lg bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2">
                    <span *ngIf="isLoading()" class="h-3 w-3 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></span>
                    {{ isLoading() ? 'Advancing...' : 'Advance →' }}
                  </button>
                  <span *ngIf="o.currentStage === 'READY'" class="text-emerald-400 text-xs font-semibold">✓ Complete</span>
                </td>
              </tr>
              <tr *ngIf="orders().length === 0">
                <td colspan="5" class="px-5 py-8 text-center text-gray-600">No active production orders</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MfgProductionComponent implements OnInit {
    orders = signal<any[]>([]);
    isLoading = signal<boolean>(false);
    stages = ['COMPONENT_PREP', 'PCB_FABRICATION', 'SMT_ASSEMBLY', 'SOLDERING', 'QC_INSPECTION', 'PACKAGING', 'READY'];

    private prodService = inject(ProductionService);
    private notif = inject(NotificationService);

    ngOnInit() { this.load(); }

    load() {
        this.isLoading.set(true);
        this.prodService.getAll().subscribe({
            next: d => {
              this.orders.set(d || []);
              this.isLoading.set(false);
            },
            error: (err) => { 
              this.isLoading.set(false);
              this.notif.error(err.error?.message || 'Failed to load production orders');
            }
        });
    }

    getStageIndex(stage: string): number { return this.stages.indexOf(stage); }

    getStageClass(stage: string): string {
        const i = this.getStageIndex(stage);
        if (stage === 'READY') return 'bg-emerald-500/20 text-emerald-400';
        if (i >= 4) return 'bg-blue-500/20 text-blue-400';
        if (i >= 2) return 'bg-cyan-500/20 text-cyan-400';
        return 'bg-orange-500/20 text-orange-400';
    }

    advance(id: number) {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        this.prodService.advanceStage(id).subscribe({
            next: () => {
              this.isLoading.set(false);
              this.notif.success('Production stage advanced');
              this.load();
            },
            error: (e: any) => {
              this.isLoading.set(false);
              this.notif.error(e.error?.message || 'Error advancing stage');
            }
        });
    }
}
