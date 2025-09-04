import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';
import { ChartComponent, ChartConfig } from '../shared/components/chart/chart.component';
import { KpiCardComponent } from '../shared/components/kpi-card/kpi-card.component';
import { StatisticsService, KPIData, TopCustomer } from '../services/statistics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    ChartComponent,
    KpiCardComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>
          <mat-icon>dashboard</mat-icon>
          Dashboard Ejecutivo
        </h1>
        <p>Resumen de indicadores clave del negocio</p>
      </div>

      <!-- KPIs Grid -->
      <div class="kpis-grid">
        @for (kpi of kpis(); track kpi.title) {
          <app-kpi-card [kpi]="kpi"></app-kpi-card>
        }
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Ventas Mensuales -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>trending_up</mat-icon>
              Evolución de Ventas
            </mat-card-title>
            <mat-card-subtitle>Tendencia mensual 2024</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (salesChartConfig()) {
              <app-chart [config]="salesChartConfig()!" height="300px"></app-chart>
            }
          </mat-card-content>
        </mat-card>

        <!-- Estado de Órdenes -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>assignment</mat-icon>
              Estado de Órdenes
            </mat-card-title>
            <mat-card-subtitle>Distribución actual</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (ordersChartConfig()) {
              <app-chart [config]="ordersChartConfig()!" height="300px"></app-chart>
            }
          </mat-card-content>
        </mat-card>

        <!-- Flujo de Caja -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>account_balance_wallet</mat-icon>
              Flujo de Caja
            </mat-card-title>
            <mat-card-subtitle>Ingresos vs Gastos</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (cashFlowChartConfig()) {
              <app-chart [config]="cashFlowChartConfig()!" height="300px"></app-chart>
            }
          </mat-card-content>
        </mat-card>

        <!-- Top Clientes -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>people</mat-icon>
              Top 5 Clientes
            </mat-card-title>
            <mat-card-subtitle>Por facturación</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="customers-list">
              @for (customer of topCustomers(); track customer.name) {
                <div class="customer-item">
                  <div class="customer-info">
                    <span class="customer-name">{{ customer.name }}</span>
                    <span class="customer-orders">{{ customer.orders }} órdenes</span>
                  </div>
                  <div class="customer-amount">{{ formatCurrency(customer.amount) }}</div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <mat-card class="quick-actions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>flash_on</mat-icon>
            Acciones Rápidas
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
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
            <button mat-raised-button (click)="navigateTo('/cobros')">
              <mat-icon>payment</mat-icon>
              Cobros
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin-top: 64px;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 8px;
    }

    .dashboard-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .dashboard-header h1 mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3f51b5;
    }

    .dashboard-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 8px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 8px;
    }

    .chart-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .chart-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .chart-card mat-card-header {
      padding-bottom: 8px;
    }

    .chart-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .chart-card mat-card-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #3f51b5;
    }

    .chart-card mat-card-subtitle {
      color: #666;
      font-size: 14px;
      margin-top: 4px;
    }

    .customers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
    }

    .customer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3f51b5;
    }

    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .customer-name {
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .customer-orders {
      font-size: 12px;
      color: #666;
    }

    .customer-amount {
      font-weight: 600;
      color: #3f51b5;
      font-size: 16px;
    }

    .quick-actions-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .quick-actions-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .quick-actions-card mat-card-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #ff9800;
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
      border-radius: 8px;
    }

    .action-buttons button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    @media (max-width: 1200px) {
      .charts-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
        gap: 16px;
      }

      .kpis-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 12px;
      }

      .charts-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
        justify-content: center;
      }

      .dashboard-header h1 {
        font-size: 24px;
      }

      .dashboard-header h1 mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-container {
        padding: 12px;
      }

      .kpis-grid {
        grid-template-columns: 1fr;
      }

      .customer-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .customer-amount {
        align-self: flex-end;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  // Signals para los datos
  kpis = signal<KPIData[]>([]);
  topCustomers = signal<TopCustomer[]>([]);
  salesChartConfig = signal<ChartConfig | null>(null);
  ordersChartConfig = signal<ChartConfig | null>(null);
  cashFlowChartConfig = signal<ChartConfig | null>(null);

  constructor(
    private router: Router,
    private statisticsService: StatisticsService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Cargar KPIs
    this.statisticsService.getKPIs().subscribe(kpis => {
      this.kpis.set(kpis);
    });

    // Cargar top clientes
    this.statisticsService.getTopCustomers().subscribe(customers => {
      this.topCustomers.set(customers);
    });

    // Cargar gráfica de ventas
    this.statisticsService.getMonthlySales().subscribe(data => {
      this.salesChartConfig.set({
        type: 'line',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return '€' + (value / 1000) + 'K';
                }
              }
            }
          }
        }
      });
    });

    // Cargar gráfica de órdenes
    this.statisticsService.getOrderStatus().subscribe(data => {
      this.ordersChartConfig.set({
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    });

    // Cargar gráfica de flujo de caja
    this.statisticsService.getCashFlow().subscribe(data => {
      this.cashFlowChartConfig.set({
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return '€' + (value / 1000) + 'K';
                }
              }
            }
          }
        }
      });
    });
  }

  navigateTo(path: string): void {
    console.log('🚀 Navegando a:', path);
    this.router.navigate([path]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
