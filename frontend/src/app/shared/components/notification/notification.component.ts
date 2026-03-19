import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notif().show" 
      class="fixed bottom-6 right-6 z-[9999] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 transition-all duration-300 transform"
      [ngClass]="{
        'bg-[#1a1a1a] border-emerald-500/30 text-emerald-400': notif().type === 'success',
        'bg-[#1a1a1a] border-red-500/30 text-red-400': notif().type === 'error',
        'bg-[#1a1a1a] border-blue-500/30 text-blue-400': notif().type === 'info'
      }">
      <div class="flex-1 font-medium">{{ notif().message }}</div>
      <button (click)="ns.hide()" class="hover:opacity-70">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `
})
export class NotificationComponent {
  ns = inject(NotificationService);
  notif = this.ns.notification;
}
