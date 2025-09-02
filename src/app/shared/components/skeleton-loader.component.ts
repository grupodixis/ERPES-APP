import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-container">
      <!-- Table skeleton -->
      @if (type === 'table') {
        <div class="skeleton-table">
          <div class="skeleton-header">
            @for (i of [].constructor(columns || 4); track i) {
              <div class="skeleton-cell header-cell"></div>
            }
          </div>
          @for (i of [].constructor(rows || 5); track i) {
            <div class="skeleton-row">
              @for (j of [].constructor(columns || 4); track j) {
                <div class="skeleton-cell"></div>
              }
            </div>
          }
        </div>
      }
    
      <!-- Card skeleton -->
      @if (type === 'card') {
        <div class="skeleton-card">
          <div class="skeleton-card-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-title"></div>
          </div>
          <div class="skeleton-content">
            @for (i of [].constructor(lines || 3); track i) {
              <div class="skeleton-line"></div>
            }
          </div>
        </div>
      }
    
      <!-- List skeleton -->
      @if (type === 'list') {
        <div class="skeleton-list">
          @for (i of [].constructor(items || 5); track i) {
            <div class="skeleton-list-item">
              <div class="skeleton-avatar small"></div>
              <div class="skeleton-content">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
              </div>
            </div>
          }
        </div>
      }
    </div>
    `,
  styles: [`
    .skeleton-container {
      width: 100%;
    }

    /* Table skeleton */
    .skeleton-table {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .skeleton-header {
      display: flex;
      background-color: #f5f5f5;
    }

    .skeleton-row {
      display: flex;
      border-top: 1px solid #e0e0e0;
    }

    .skeleton-cell {
      flex: 1;
      height: 48px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .header-cell {
      height: 56px;
      background-color: #f5f5f5;
    }

    /* Card skeleton */
    .skeleton-card {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .skeleton-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-avatar.small {
      width: 32px;
      height: 32px;
    }

    .skeleton-title {
      flex: 1;
      height: 24px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-line.long {
      width: 100%;
    }

    /* List skeleton */
    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    /* Animation */
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'table' | 'card' | 'list' = 'table';
  @Input() columns = 4;
  @Input() rows = 5;
  @Input() items = 5;
  @Input() lines = 3;
}
