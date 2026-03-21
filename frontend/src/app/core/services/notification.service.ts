import { Injectable, signal, computed } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsState = signal<Notification[]>([]);
  notifications = this.notificationsState.asReadonly();

  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++this.counter;
    const newNotif: Notification = { id, message, type };
    
    this.notificationsState.update(prev => [...prev, newNotif]);

    // Auto hide after 4 seconds
    setTimeout(() => this.hide(id), 4000);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  info(message: string) { this.show(message, 'info'); }

  hide(id: number) {
    this.notificationsState.update(prev => prev.filter(n => n.id !== id));
  }
}
