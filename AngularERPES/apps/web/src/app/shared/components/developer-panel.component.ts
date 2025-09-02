import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { mockDb } from '../../adapters/mock-db';
import { MockHandlers } from '../../adapters/mock-handlers';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-developer-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSliderModule,
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
        <mat-card-subtitle>
          Herramientas para desarrollo y testing
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Estadísticas de la base de datos -->
        <div class="stats-section">
          <h3>Estadísticas de Mock DB</h3>
          <div class="stats-grid">
            <mat-chip-set>
              <mat-chip color="primary" selected>
                <mat-icon>people</mat-icon>
                {{ stats().totalUsuarios }} usuarios
              </mat-chip>
              <mat-chip color="accent" selected>
                <mat-icon>check_circle</mat-icon>
                {{ stats().usuariosActivos }} activos
              </mat-chip>
              <mat-chip color="warn" selected>
                <mat-icon>business</mat-icon>
                {{ stats().totalEmpresas }} empresas
              </mat-chip>
              <mat-chip color="primary" selected>
                <mat-icon>admin_panel_settings</mat-icon>
                {{ stats().totalRoles }} roles
              </mat-chip>
              <mat-chip color="accent" selected>
                <mat-icon>security</mat-icon>
                {{ stats().totalPermisos }} permisos
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Configuración de latencia -->
        <div class="latency-section">
          <h3>Configuración de Latencia</h3>
          <div class="latency-controls">
            <label>Latencia mínima: {{ minLatency() }}ms</label>
            <mat-slider
              [min]="0"
              [max]="1000"
              [step]="50"
              [value]="minLatency()"
              (valueChange)="setMinLatency($event)">
            </mat-slider>
            
            <label>Latencia máxima: {{ maxLatency() }}ms</label>
            <mat-slider
              [min]="0"
              [max]="2000"
              [step]="100"
              [value]="maxLatency()"
              (valueChange)="setMaxLatency($event)">
            </mat-slider>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Acciones de desarrollo -->
        <div class="actions-section">
          <h3>Acciones de Desarrollo</h3>
          <div class="actions-grid">
            <button 
              mat-raised-button 
              color="warn" 
              (click)="resetMockDb()"
              [disabled]="isResetting()">
              <mat-icon>refresh</mat-icon>
              {{ isResetting() ? 'Reseteando...' : 'Resetear Mock DB' }}
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

        <!-- Información del sistema -->
        <div class="system-info">
          <h3>Información del Sistema</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Modo:</strong>
              <mat-chip color="primary" selected>
                {{ isDemoMode() ? 'DEMO' : 'PRODUCCIÓN' }}
              </mat-chip>
            </div>
            <div class="info-item">
              <strong>API Client:</strong>
              <mat-chip color="accent" selected>
                {{ isDemoMode() ? 'Mock' : 'HTTP' }}
              </mat-chip>
            </div>
            <div class="info-item">
              <strong>Último reset:</strong>
              <span>{{ lastReset() | date:'medium' }}</span>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .developer-panel {
      max-width: 800px;
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
      margin: 10px 0;
    }

    .latency-controls {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin: 15px 0;
    }

    .latency-controls label {
      font-weight: 500;
      margin-bottom: 5px;
    }

    .actions-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 15px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 15px 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .info-item strong {
      min-width: 120px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    mat-chip {
      margin: 2px;
    }

    mat-chip mat-icon {
      margin-right: 5px;
    }
  `]
})
export class DeveloperPanelComponent {
  stats = signal(mockDb.getStats());
  minLatency = signal(100);
  maxLatency = signal(600);
  isResetting = signal(false);
  lastReset = signal(new Date());
  isDemoMode = signal(true); // Esto debería venir del config service

  constructor(private toastService: ToastService) {}

  setMinLatency(value: number): void {
    this.minLatency.set(value);
    MockHandlers.setLatency(value, this.maxLatency());
    this.toastService.showInfo(`Latencia mínima configurada a ${value}ms`);
  }

  setMaxLatency(value: number): void {
    this.maxLatency.set(value);
    MockHandlers.setLatency(this.minLatency(), value);
    this.toastService.showInfo(`Latencia máxima configurada a ${value}ms`);
  }

  async resetMockDb(): Promise<void> {
    this.isResetting.set(true);
    
    try {
      // Simular delay para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      mockDb.reset();
      this.stats.set(mockDb.getStats());
      this.lastReset.set(new Date());
      
      this.toastService.showSuccess('Mock DB reseteado correctamente');
    } catch (error) {
      this.toastService.showError('Error al resetear Mock DB');
    } finally {
      this.isResetting.set(false);
    }
  }

  exportMockData(): void {
    try {
      const data = {
        usuarios: mockDb.getUsuarios(),
        roles: mockDb.getRoles(),
        permisos: mockDb.getPermisos(),
        empresas: mockDb.getEmpresas(),
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
    } catch (error) {
      this.toastService.showError('Error al exportar datos');
    }
  }

  showMockStats(): void {
    const stats = mockDb.getStats();
    const message = `
      Estadísticas de Mock DB:
      - Usuarios: ${stats.totalUsuarios} (${stats.usuariosActivos} activos)
      - Roles: ${stats.totalRoles}
      - Permisos: ${stats.totalPermisos}
      - Empresas: ${stats.totalEmpresas} (${stats.empresasActivas} activas)
    `;
    
    this.toastService.showInfo(message);
  }
}
