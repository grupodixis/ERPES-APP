import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: string;
  showAction?: boolean;
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <mat-card class="empty-state-card">
        <div class="empty-state-content">
          <mat-icon class="empty-state-icon">{{ config.icon }}</mat-icon>
          <h3 class="empty-state-title">{{ config.title }}</h3>
          <p class="empty-state-description">{{ config.description }}</p>
    
          @if (config.showAction && config.actionText) {
            <button
              mat-raised-button
              color="primary"
              (click)="onActionClick()">
              @if (config.actionIcon) {
                <mat-icon>{{ config.actionIcon }}</mat-icon>
              }
              {{ config.actionText }}
            </button>
          }
        </div>
      </mat-card>
    </div>
    `,
  styles: [`
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      padding: 20px;
    }

    .empty-state-card {
      max-width: 400px;
      text-align: center;
      box-shadow: none;
      border: 1px solid #e0e0e0;
    }

    .empty-state-content {
      padding: 40px 20px;
    }

    .empty-state-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #bdbdbd;
      margin-bottom: 16px;
    }

    .empty-state-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .empty-state-description {
      margin: 0 0 24px 0;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.5;
    }

    button {
      min-width: 120px;
    }

    @media (max-width: 480px) {
      .empty-state {
        padding: 16px;
      }
      
      .empty-state-content {
        padding: 32px 16px;
      }
      
      .empty-state-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
      
      .empty-state-title {
        font-size: 18px;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() config!: EmptyStateConfig;
  @Output() actionClick = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClick.emit();
  }
}
