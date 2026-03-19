import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private state = signal<Notification>({ message: '', type: 'info', show: false });
  notification = this.state.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.state.set({ message, type, show: true });
    setTimeout(() => this.hide(), 4000);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  info(message: string) { this.show(message, 'info'); }

  hide() {
    this.state.set({ ...this.state(), show: false });
  }
}
