import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      
      @if (showAction) {
        <button 
          mat-raised-button 
          color="primary"
          (click)="onActionClick()">
          <mat-icon>{{ actionIcon }}</mat-icon>
          {{ actionText }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: var(--mat-mdc-outlined-button-label-text-color);
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 24px;
      opacity: 0.5;
    }

    .empty-title {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .empty-description {
      margin: 0 0 32px 0;
      font-size: 16px;
      opacity: 0.7;
      max-width: 400px;
      line-height: 1.5;
    }

    button {
      min-width: 200px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() title: string = 'No hay datos';
  @Input() description: string = 'No se encontraron elementos que coincidan con los criterios de búsqueda.';
  @Input() showAction: boolean = false;
  @Input() actionText: string = 'Crear nuevo';
  @Input() actionIcon: string = 'add';

  @Output() actionClick = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClick.emit();
  }
}
