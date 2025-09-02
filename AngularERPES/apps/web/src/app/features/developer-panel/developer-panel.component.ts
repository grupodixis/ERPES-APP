import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { mockDb } from '../../adapters/mock-db';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-developer-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    FormsModule
  ],
  template: `
    <mat-card class="developer-panel">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>developer_mode</mat-icon>
          Panel de Desarrollador
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Estadísticas de la BD Mock -->
        <div class="stats-section">
          <h3>Estadísticas Mock DB</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Empresas:</span>
              <span class="stat-value">{{ stats().totalEmpresas }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Usuarios:</span>
              <span class="stat-value">{{ stats().totalUsuarios }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Roles:</span>
              <span class="stat-value">{{ stats().totalRoles }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Permisos:</span>
              <span class="stat-value">{{ stats().totalPermisos }}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Configuración de Latencia -->
        <div class="latency-section">
          <h3>Configuración de Latencia</h3>
          <div class="latency-controls">
            <div class="latency-item">
              <label>Latencia Mínima: {{ minLatency() }}ms</label>
              <input 
                type="range" 
                [min]="0" 
                [max]="1000" 
                [step]="50" 
                [value]="minLatency()"
                (input)="onMinLatencyChange($event)"
                class="latency-slider">
            </div>
            <div class="latency-item">
              <label>Latencia Máxima: {{ maxLatency() }}ms</label>
              <input 
                type="range" 
                [min]="100" 
                [max]="2000" 
                [step]="100" 
                [value]="maxLatency()"
                (input)="onMaxLatencyChange($event)"
                class="latency-slider">
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Acciones -->
        <div class="actions-section">
          <h3>Acciones</h3>
          <div class="action-buttons">
            <button 
              mat-raised-button 
              color="warn" 
              [disabled]="isResetting()"
              (click)="resetMockDb()">
              <mat-icon>refresh</mat-icon>
              {{ isResetting() ? 'Reseteando...' : 'Reset Mock DB' }}
            </button>
            
            <button 
              mat-raised-button 
              color="primary"
              (click)="exportMockData()">
              <mat-icon>download</mat-icon>
              Exportar Datos
            </button>
            
            <button 
              mat-raised-button 
              color="accent"
              (click)="showMockStats()">
              <mat-icon>analytics</mat-icon>
              Ver Estadísticas
            </button>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Información del Sistema -->
        <div class="system-info">
          <h3>Información del Sistema</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Modo Demo:</span>
              <mat-chip [color]="isDemoMode() ? 'accent' : 'warn'" selected>
                {{ isDemoMode() ? 'Activado' : 'Desactivado' }}
              </mat-chip>
            </div>
            <div class="info-item">
              <span class="info-label">Último Reset:</span>
              <span class="info-value">{{ lastReset() | date:'short' }}</span>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .developer-panel {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }

    .stats-section,
    .latency-section,
    .actions-section,
    .system-info {
      margin: 20px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 10px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .stat-label {
      font-weight: 500;
      color: #666;
    }

    .stat-value {
      font-weight: bold;
      color: #333;
      font-size: 1.1em;
    }

    .latency-controls {
      margin-top: 15px;
    }

    .latency-item {
      margin: 15px 0;
    }

    .latency-item label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 10px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }

    .info-label {
      font-weight: 500;
      color: #666;
    }

    .info-value {
      font-weight: 500;
      color: #333;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    h3 {
      color: #333;
      margin-bottom: 10px;
      font-size: 1.1em;
    }

    .latency-slider {
      width: 100%;
      margin-top: 8px;
    }
  `]
})
export class DeveloperPanelComponent {
  stats = signal(mockDb.getStats());
  minLatency = signal(100);
  maxLatency = signal(600);
  isResetting = signal(false);
  lastReset = signal(new Date());
  isDemoMode = signal(true); // This should come from config service

  constructor(private toastService: ToastService) {}

  setMinLatency(value: number): void {
    this.minLatency.set(value);
    // TODO: Update global latency configuration
  }

  setMaxLatency(value: number): void {
    this.maxLatency.set(value);
    // TODO: Update global latency configuration
  }

  onMinLatencyChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.setMinLatency(Number(target.value));
    }
  }

  onMaxLatencyChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.setMaxLatency(Number(target.value));
    }
  }

  async resetMockDb(): Promise<void> {
    this.isResetting.set(true);
    
    try {
      mockDb.reset();
      this.stats.set(mockDb.getStats());
      this.lastReset.set(new Date());
      this.toastService.showSuccess('Mock DB reseteada correctamente');
    } catch (error) {
      this.toastService.showError('Error al resetear Mock DB');
    } finally {
      this.isResetting.set(false);
    }
  }

  exportMockData(): void {
    const data = {
      empresas: mockDb.getEmpresas(),
      usuarios: mockDb.getUsuarios(),
      roles: mockDb.getRoles(),
      permisos: mockDb.getPermisos(),
      stats: mockDb.getStats(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.showSuccess('Datos exportados correctamente');
  }

  showMockStats(): void {
    const stats = mockDb.getStats();
    const message = `
      Estadísticas Mock DB:
      - Empresas: ${stats.totalEmpresas}
      - Usuarios: ${stats.totalUsuarios}
      - Roles: ${stats.totalRoles}
      - Permisos: ${stats.totalPermisos}
    `;
    
    this.toastService.showInfo(message);
  }
}
