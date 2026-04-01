import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManufacturerStateService } from '../../../core/services/manufacturer-state.service';

@Component({
  selector: 'app-mfg-notifications',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">Activity Feed</h1>
          <p class="text-gray-500 text-sm">Actionable alerts and updates for your business</p>
        </div>
      </div>

      <div class="space-y-3">
        <div *ngIf="state.filteredEntries().length === 0" class="bg-[#141414] border border-gray-800/60 rounded-2xl p-12 text-center">
            <span class="text-4xl mb-4 block">✨</span>
            <h3 class="text-white font-medium">All caught up!</h3>
            <p class="text-gray-500 text-sm mt-1">No pending actions or recent updates.</p>
        </div>

        <div *ngFor="let e of state.filteredEntries()" 
          (click)="state.gotoProject(e.projectId)"
          class="bg-[#141414] border border-gray-800/60 p-4 rounded-xl hover:border-teal-500/30 hover:bg-teal-500/[0.02] transition-all group cursor-pointer relative overflow-hidden">
          
          <!-- Indicator for pending actions -->
          <div *ngIf="e.isPending" class="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>

          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-800/60 bg-[#0d0d0d] font-bold"
              [ngClass]="{
                'text-blue-400': e.type === 'NEW_PROJECT',
                'text-emerald-400': e.type === 'QUOTE_APPROVED' || e.type === 'SUPPLIER_QUOTED',
                'text-red-400': e.type === 'QUOTE_REJECTED'
              }">
              <span class="text-lg">
                 {{ e.type === 'NEW_PROJECT' ? 'New' : e.type === 'QUOTE_APPROVED' ? '$' : e.type === 'SUPPLIER_QUOTED' ? '🏭' : 'No' }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-0.5">
                <h4 class="text-[14px] font-semibold text-gray-100 group-hover:text-white transition-colors leading-tight">{{ e.title }}</h4>
                <div class="flex items-center gap-2">
                   <span class="text-[10px] text-gray-500 font-medium whitespace-nowrap">{{ e.date | date:'short' }}</span>
                   <button (click)="$event.stopPropagation(); state.dismiss(e.id)" 
                     class="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 -mr-1"
                     title="Dismiss">
                     <span class="text-sm">✕</span>
                   </button>
                </div>
              </div>
              <p class="text-[13px] text-gray-400 leading-snug truncate pr-6">{{ e.description }}</p>
              
              <div class="mt-2 flex items-center justify-between">
                 <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-gray-800 text-gray-500 bg-gray-900/50">
                  {{ e.status }}
                 </span>
                 <span class="text-[11px] text-teal-400/0 group-hover:text-teal-400 transition-all font-semibold">View Project →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MfgNotificationsComponent {
  public state = inject(ManufacturerStateService);
}
