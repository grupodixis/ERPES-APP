import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [],
  template: `
    <div class="skeleton-loader">
      @for (row of getRows(); track $index) {
        <div class="skeleton-row">
          @for (column of columns; track $index) {
            <div 
              class="skeleton-cell" 
              [style.width]="column">
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-loader {
      padding: 16px;
    }

    .skeleton-row {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      align-items: center;
    }

    .skeleton-cell {
      height: 20px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() rows: number = 5;
  @Input() columns: string[] = ['20%', '30%', '15%', '15%', '20%'];

  getRows(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i + 1);
  }
}
