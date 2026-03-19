import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NotificationComponent],
  template: `
    <app-navbar />
    <router-outlet />
    <app-notification />
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('sparesy');
}
