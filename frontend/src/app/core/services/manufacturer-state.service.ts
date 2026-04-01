import { Injectable, signal, computed } from '@angular/core';

export interface NotificationEntry {
  id: string;
  projectId: number;
  type: 'NEW_PROJECT' | 'QUOTE_APPROVED' | 'QUOTE_REJECTED' | 'SUPPLIER_QUOTED';
  title: string;
  description: string;
  date: string;
  status: string;
  isPending: boolean;
}

@Injectable({ providedIn: 'root' })
export class ManufacturerStateService {
  activeTab = signal<string>('overview');
  selectedProjectId = signal<number | null>(null);
  
  private dismissedIds = signal<Set<string>>(new Set(JSON.parse(localStorage.getItem('mfg_dismissed_notifs') || '[]')));
  
  entries = signal<NotificationEntry[]>([]);
  
  // Only show entries that haven't been dismissed
  filteredEntries = computed(() => {
     const dismissed = this.dismissedIds();
     return this.entries().filter(e => !dismissed.has(e.id));
  });

  notificationCount = computed(() => this.filteredEntries().filter(e => e.isPending).length);

  dismiss(id: string) {
    this.dismissedIds.update(set => {
        const newSet = new Set(set);
        newSet.add(id);
        localStorage.setItem('mfg_dismissed_notifs', JSON.stringify(Array.from(newSet)));
        return newSet;
    });
  }

  gotoProject(id: number) {
    this.selectedProjectId.set(id);
    this.activeTab.set('projects');
  }
}
