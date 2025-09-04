import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface KPIData {
  title: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface TopCustomer {
  name: string;
  amount: number;
  orders: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor() { }

  // KPIs principales
  getKPIs(): Observable<KPIData[]> {
    const kpis: KPIData[] = [
      {
        title: 'Ventas del Mes',
        value: 125000,
        unit: '€',
        change: 12.5,
        changeType: 'positive',
        icon: 'trending_up'
      },
      {
        title: 'Órdenes Pendientes',
        value: 23,
        unit: '',
        change: -5.2,
        changeType: 'negative',
        icon: 'assignment'
      },
      {
        title: 'Liquidez Actual',
        value: 85000,
        unit: '€',
        change: 8.3,
        changeType: 'positive',
        icon: 'account_balance_wallet'
      },
      {
        title: 'Clientes Activos',
        value: 156,
        unit: '',
        change: 15.7,
        changeType: 'positive',
        icon: 'people'
      }
    ];
    return of(kpis).pipe(delay(500));
  }

  // Datos de ventas mensuales
  getMonthlySales(): Observable<ChartData> {
    const data: ChartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Ventas 2024',
        data: [65000, 78000, 85000, 92000, 88000, 95000, 102000, 98000, 105000, 115000, 125000, 130000],
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    };
    return of(data).pipe(delay(500));
  }

  // Estado de órdenes de trabajo
  getOrderStatus(): Observable<ChartData> {
    const data: ChartData = {
      labels: ['Pendientes', 'En Proceso', 'Completadas', 'Canceladas'],
      datasets: [{
        label: 'Órdenes',
        data: [23, 45, 178, 8],
        backgroundColor: ['#f44336', '#ff9800', '#4caf50', '#9e9e9e']
      }]
    };
    return of(data).pipe(delay(500));
  }

  // Flujo de caja mensual
  getCashFlow(): Observable<ChartData> {
    const data: ChartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Ingresos',
          data: [85000, 92000, 78000, 95000, 88000, 102000],
          backgroundColor: '#4caf50'
        },
        {
          label: 'Gastos',
          data: [65000, 70000, 68000, 72000, 69000, 75000],
          backgroundColor: '#f44336'
        }
      ]
    };
    return of(data).pipe(delay(500));
  }

  // Top 5 clientes
  getTopCustomers(): Observable<TopCustomer[]> {
    const customers: TopCustomer[] = [
      { name: 'Construcciones García S.L.', amount: 45000, orders: 12 },
      { name: 'Reformas Martínez', amount: 38000, orders: 8 },
      { name: 'Obras Públicas López', amount: 32000, orders: 15 },
      { name: 'Instalaciones Rodríguez', amount: 28000, orders: 6 },
      { name: 'Proyectos Fernández', amount: 25000, orders: 9 }
    ];
    return of(customers).pipe(delay(500));
  }

  // Distribución de productos por categoría
  getProductDistribution(): Observable<ChartData> {
    const data: ChartData = {
      labels: ['Materiales', 'Herramientas', 'Maquinaria', 'Servicios', 'Otros'],
      datasets: [{
        label: 'Productos',
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          '#3f51b5',
          '#4caf50',
          '#ff9800',
          '#9c27b0',
          '#607d8b'
        ]
      }]
    };
    return of(data).pipe(delay(500));
  }
}