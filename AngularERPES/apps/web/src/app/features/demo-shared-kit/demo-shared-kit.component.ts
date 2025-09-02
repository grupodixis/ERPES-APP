import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DataTableComponent } from '../../shared/components/data-table.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { EmptyStateComponent, EmptyStateConfig } from '../../shared/components/empty-state.component';
import { DataSourceService } from '../../shared/services/data-source.service';
import { DialogService } from '../../shared/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { TableColumn, TableAction } from '../../domain/common.types';

interface DemoItem {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-demo-shared-kit',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DataTableComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-container">
      <h1>Demo - Shared UI Kit</h1>
      
      <!-- DataTable Demo -->
      <mat-card class="demo-card">
        <mat-card-header>
          <mat-card-title>DataTable con Signals</mat-card-title>
          <mat-card-subtitle>Tabla reactiva con sort, paginación y acciones</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="demo-controls">
            <button mat-raised-button color="primary" (click)="loadData()">
              <mat-icon>refresh</mat-icon>
              Cargar datos
            </button>
            <button mat-raised-button color="accent" (click)="clearData()">
              <mat-icon>clear</mat-icon>
              Limpiar
            </button>
            <button mat-raised-button color="warn" (click)="simulateError()">
              <mat-icon>error</mat-icon>
              Simular error
            </button>
          </div>

          <app-data-table
            [columns]="columns"
            [actions]="actions"
            [dataSource]="dataSource"
            [selectable]="true"
            (rowClick)="onRowClick($event)"
            (refresh)="loadData()"
            (selectionChange)="onSelectionChange($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>

      <!-- Skeleton Loaders Demo -->
      <mat-card class="demo-card">
        <mat-card-header>
          <mat-card-title>Skeleton Loaders</mat-card-title>
          <mat-card-subtitle>Estados de carga con animaciones</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="skeleton-demos">
            <div class="skeleton-demo">
              <h4>Tabla</h4>
              <app-skeleton-loader type="table" [columns]="4" [rows]="3"></app-skeleton-loader>
            </div>
            
            <div class="skeleton-demo">
              <h4>Tarjeta</h4>
              <app-skeleton-loader type="card" [lines]="3"></app-skeleton-loader>
            </div>
            
            <div class="skeleton-demo">
              <h4>Lista</h4>
              <app-skeleton-loader type="list" [items]="3"></app-skeleton-loader>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Empty States Demo -->
      <mat-card class="demo-card">
        <mat-card-header>
          <mat-card-title>Empty States</mat-card-title>
          <mat-card-subtitle>Estados vacíos con iconos y acciones</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="empty-state-demos">
            <div class="empty-state-demo">
              <h4>Sin datos</h4>
              <app-empty-state 
                [config]="emptyStateConfigs.noData"
                (actionClick)="onEmptyStateAction()">
              </app-empty-state>
            </div>
            
            <div class="empty-state-demo">
              <h4>Sin resultados</h4>
              <app-empty-state 
                [config]="emptyStateConfigs.noResults"
                (actionClick)="onEmptyStateAction()">
              </app-empty-state>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Dialog Demos -->
      <mat-card class="demo-card">
        <mat-card-header>
          <mat-card-title>Diálogos</mat-card-title>
          <mat-card-subtitle>Confirmaciones y selectores</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="dialog-demos">
            <button mat-raised-button color="warn" (click)="showConfirmDelete()">
              <mat-icon>delete</mat-icon>
              Confirmar eliminación
            </button>
            
            <button mat-raised-button color="primary" (click)="showConfirmSave()">
              <mat-icon>save</mat-icon>
              Confirmar guardado
            </button>
            
            <button mat-raised-button color="accent" (click)="showUserSelector()">
              <mat-icon>person</mat-icon>
              Seleccionar usuario
            </button>
            
            <button mat-raised-button color="accent" (click)="showEmpresaSelector()">
              <mat-icon>business</mat-icon>
              Seleccionar empresa
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Toast Demos -->
      <mat-card class="demo-card">
        <mat-card-header>
          <mat-card-title>Toasts</mat-card-title>
          <mat-card-subtitle>Notificaciones del sistema</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="toast-demos">
            <button mat-raised-button color="primary" (click)="showSuccessToast()">
              <mat-icon>check</mat-icon>
              Éxito
            </button>
            
            <button mat-raised-button color="warn" (click)="showErrorToast()">
              <mat-icon>error</mat-icon>
              Error
            </button>
            
            <button mat-raised-button color="accent" (click)="showWarningToast()">
              <mat-icon>warning</mat-icon>
              Advertencia
            </button>
            
            <button mat-raised-button (click)="showInfoToast()">
              <mat-icon>info</mat-icon>
              Información
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 24px;
      color: #1976d2;
    }

    .demo-card {
      margin-bottom: 24px;
    }

    .demo-controls {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .skeleton-demos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .skeleton-demo h4 {
      margin-bottom: 12px;
      color: #666;
    }

    .empty-state-demos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .empty-state-demo h4 {
      margin-bottom: 12px;
      color: #666;
    }

    .dialog-demos,
    .toast-demos {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .demo-container {
        padding: 16px;
      }
      
      .demo-controls,
      .dialog-demos,
      .toast-demos {
        flex-direction: column;
      }
      
      .skeleton-demos,
      .empty-state-demos {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DemoSharedKitComponent {
  dataSource = new DataSourceService<DemoItem>();
  
  columns: TableColumn<DemoItem>[] = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'status', 
      label: 'Estado', 
      sortable: true,
      render: (item) => item.status === 'active' ? 'Activo' : 'Inactivo'
    },
    { key: 'role', label: 'Rol', sortable: true },
    { key: 'createdAt', label: 'Creado', sortable: true },
  ];

  actions: TableAction<DemoItem>[] = [
    {
      id: 'view',
      label: 'Ver',
      icon: 'visibility',
      color: 'primary',
      onClick: (item) => this.onViewItem(item)
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      color: 'accent',
      onClick: (item) => this.onEditItem(item)
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'delete',
      color: 'warn',
      onClick: (item) => this.onDeleteItem(item)
    }
  ];

  emptyStateConfigs = {
    noData: {
      icon: 'inbox',
      title: 'No hay datos',
      description: 'No se encontraron elementos para mostrar. Haga clic en "Cargar datos" para comenzar.',
      actionText: 'Cargar datos',
      actionIcon: 'refresh',
      showAction: true
    } as EmptyStateConfig,
    noResults: {
      icon: 'search_off',
      title: 'Sin resultados',
      description: 'No se encontraron elementos que coincidan con su búsqueda. Intente con otros términos.',
      actionText: 'Limpiar filtros',
      actionIcon: 'clear',
      showAction: true
    } as EmptyStateConfig
  };

  constructor(
    private dialogService: DialogService,
    private toastService: ToastService
  ) {}

  loadData(): void {
    this.dataSource.setLoading(true);
    
    // Simular carga asíncrona
    setTimeout(() => {
      const mockData: DemoItem[] = [
        { id: 1, name: 'Juan Pérez', email: 'juan@empresa.com', status: 'active', role: 'Admin', createdAt: '2024-01-15' },
        { id: 2, name: 'María García', email: 'maria@empresa.com', status: 'active', role: 'Editor', createdAt: '2024-01-16' },
        { id: 3, name: 'Carlos López', email: 'carlos@empresa.com', status: 'inactive', role: 'Viewer', createdAt: '2024-01-17' },
        { id: 4, name: 'Ana Martínez', email: 'ana@empresa.com', status: 'active', role: 'Editor', createdAt: '2024-01-18' },
        { id: 5, name: 'Luis Rodríguez', email: 'luis@empresa.com', status: 'inactive', role: 'Viewer', createdAt: '2024-01-19' },
      ];
      
      this.dataSource.setItems(mockData);
      this.dataSource.setTotal(mockData.length);
    }, 1000);
  }

  clearData(): void {
    this.dataSource.reset();
  }

  simulateError(): void {
    this.dataSource.setLoading(true);
    
    setTimeout(() => {
      this.dataSource.setError('Error simulado: No se pudieron cargar los datos');
    }, 1000);
  }

  onRowClick(item: DemoItem): void {
    this.toastService.showInfo(`Hizo clic en: ${item.name}`);
  }

  onSelectionChange(selection: DemoItem[]): void {
    console.log('Selección cambiada:', selection);
  }

  onViewItem(item: DemoItem): void {
    this.toastService.showInfo(`Ver: ${item.name}`);
  }

  onEditItem(item: DemoItem): void {
    this.toastService.showInfo(`Editar: ${item.name}`);
  }

  onDeleteItem(item: DemoItem): void {
    this.dialogService.confirmDelete(item.name).subscribe(result => {
      if (result.confirmed) {
        this.toastService.showSuccess(`Eliminado: ${item.name}`);
      }
    });
  }

  onEmptyStateAction(): void {
    this.toastService.showInfo('Acción de estado vacío ejecutada');
  }

  showConfirmDelete(): void {
    this.dialogService.confirmDelete('Elemento de prueba').subscribe(result => {
      if (result.confirmed) {
        this.toastService.showSuccess('Elemento eliminado');
      }
    });
  }

  showConfirmSave(): void {
    this.dialogService.confirmSave().subscribe(result => {
      if (result.confirmed) {
        this.toastService.showSuccess('Cambios guardados');
      }
    });
  }

  showUserSelector(): void {
    this.dialogService.selectUser().subscribe(result => {
      if (result.selected) {
        this.toastService.showSuccess(`Usuario seleccionado: ${result.selected.data.nombre}`);
      }
    });
  }

  showEmpresaSelector(): void {
    this.dialogService.selectEmpresa().subscribe(result => {
      if (result.selected) {
        this.toastService.showSuccess(`Empresa seleccionada: ${result.selected.data.nombre}`);
      }
    });
  }

  showSuccessToast(): void {
    this.toastService.showSuccess('Operación completada exitosamente');
  }

  showErrorToast(): void {
    this.toastService.showError('Ha ocurrido un error inesperado');
  }

  showWarningToast(): void {
    this.toastService.showWarning('Advertencia: Revise los datos ingresados');
  }

  showInfoToast(): void {
    this.toastService.showInfo('Información importante del sistema');
  }
}
