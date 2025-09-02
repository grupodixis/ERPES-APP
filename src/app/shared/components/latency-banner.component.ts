import { Component, inject } from '@angular/core';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { LatencyService } from '../../core/services/latency.service';

@Component({
  selector: 'app-latency-banner',
  standalone: true,
  imports: [
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule
],
  template: `
    @if (isLoading()) {
      <div class="latency-banner">
        <div class="latency-content">
          <mat-icon class="latency-icon">schedule</mat-icon>
          <span class="latency-text">Simulando latencia de red...</span>
          <mat-chip color="accent" selected>
            {{ currentLatency() }}ms
          </mat-chip>
        </div>
        <mat-progress-bar 
          mode="indeterminate" 
          color="accent">
        </mat-progress-bar>
      </div>
    }
  `,
  styles: [`
    .latency-banner {
      position: fixed;
      top: 64px; /* Debajo del toolbar */
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #ff9800, #ff5722);
      color: white;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .latency-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
    }

    .latency-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .latency-text {
      font-size: 14px;
      font-weight: 500;
      flex: 1;
    }

    mat-chip {
      background-color: rgba(255,255,255,0.2) !important;
      color: white !important;
    }

    mat-progress-bar {
      height: 2px;
    }

    @media (max-width: 768px) {
      .latency-banner {
        top: 56px;
      }
      
      .latency-content {
        padding: 6px 12px;
      }
      
      .latency-text {
        font-size: 12px;
      }
    }
  `]
})
export class LatencyBannerComponent {
  private latencyService = inject(LatencyService);

  get isLoading() {
    return this.latencyService.isLoading;
  }

  get currentLatency() {
    return this.latencyService.currentLatency;
  }
}
