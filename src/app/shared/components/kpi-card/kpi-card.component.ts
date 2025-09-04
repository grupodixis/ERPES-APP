import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { KPIData } from '../../../services/statistics.service';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="kpi-card" [class.positive]="kpi.changeType === 'positive'" 
              [class.negative]="kpi.changeType === 'negative'"
              [class.neutral]="kpi.changeType === 'neutral'">
      <mat-card-content>
        <div class="kpi-header">
          <div class="kpi-icon">
            <mat-icon>{{ kpi.icon }}</mat-icon>
          </div>
          <div class="kpi-change" [class]="kpi.changeType">
            <mat-icon class="change-icon">
              {{ kpi.changeType === 'positive' ? 'trending_up' : 
                 kpi.changeType === 'negative' ? 'trending_down' : 'trending_flat' }}
            </mat-icon>
            <span>{{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}%</span>
          </div>
        </div>
        
        <div class="kpi-content">
          <h3 class="kpi-title">{{ kpi.title }}</h3>
          <div class="kpi-value">
            <span class="value">{{ formatValue(kpi.value) }}</span>
            <span class="unit" *ngIf="kpi.unit">{{ kpi.unit }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .kpi-card {
      height: 140px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      border-left: 4px solid #e0e0e0;
    }
    
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .kpi-card.positive {
      border-left-color: #4caf50;
    }
    
    .kpi-card.negative {
      border-left-color: #f44336;
    }
    
    .kpi-card.neutral {
      border-left-color: #ff9800;
    }
    
    mat-card-content {
      padding: 16px !important;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .kpi-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(63, 81, 181, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .kpi-icon mat-icon {
      color: #3f51b5;
      font-size: 20px;
    }
    
    .kpi-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.05);
    }
    
    .kpi-change.positive {
      color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
    }
    
    .kpi-change.negative {
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
    }
    
    .kpi-change.neutral {
      color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
    }
    
    .change-icon {
      font-size: 14px !important;
      width: 14px;
      height: 14px;
    }
    
    .kpi-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .kpi-title {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      line-height: 1.2;
    }
    
    .kpi-value {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    
    .value {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }
    
    .unit {
      font-size: 16px;
      font-weight: 500;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .kpi-card {
        height: 120px;
      }
      
      .kpi-icon {
        width: 32px;
        height: 32px;
      }
      
      .kpi-icon mat-icon {
        font-size: 16px;
      }
      
      .value {
        font-size: 20px;
      }
      
      .unit {
        font-size: 14px;
      }
    }
  `]
})
export class KpiCardComponent {
  @Input() kpi!: KPIData;

  formatValue(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toLocaleString();
  }
}