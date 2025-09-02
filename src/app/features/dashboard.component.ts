import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-card class="dashboard-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </mat-card-title>
          <mat-card-subtitle>
            Panel principal del sistema ERP
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="dashboard-content">
            <h3>Bienvenido al Sistema ERP</h3>
            <p>Selecciona una opción del menú lateral para comenzar.</p>
            
            <div class="quick-actions">
              <h4>Acciones Rápidas:</h4>
              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="navigateTo('/articulos')">
                  <mat-icon>inventory_2</mat-icon>
                  Artículos
                </button>
                <button mat-raised-button color="accent" (click)="navigateTo('/terceros')">
                  <mat-icon>people</mat-icon>
                  Terceros
                </button>
                <button mat-raised-button color="warn" (click)="navigateTo('/productos')">
                  <mat-icon>category</mat-icon>
                  Productos
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-card {
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .dashboard-card mat-card-header {
      margin-bottom: 24px;
    }

    .dashboard-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 600;
    }

    .dashboard-card mat-card-title mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #2196f3;
    }

    .dashboard-content {
      padding: 16px 0;
    }

    .dashboard-content h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 20px;
    }

    .dashboard-content p {
      margin: 0 0 32px 0;
      color: #666;
      font-size: 16px;
    }

    .quick-actions {
      margin-top: 32px;
    }

    .quick-actions h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
    }

    .action-buttons button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class DashboardComponent {
  constructor(private router: Router) {}

  navigateTo(path: string): void {
    console.log('🚀 Navegando a:', path);
    this.router.navigate([path]);
  }
}
