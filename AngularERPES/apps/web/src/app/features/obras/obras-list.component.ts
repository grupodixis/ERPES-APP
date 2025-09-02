import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Obra, ObraFilters, EstadoObra } from '../../domain/obras.types';
import { ObrasService } from './obras.service';

@Component({
  selector: 'app-obras-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <div class="obras-container">
      <mat-card class="filter-card">
        <mat-card-header>
          <mat-card-title>Gestión de Obras</mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" routerLink="/obras/nueva">
              <mat-icon>add</mat-icon>
              Nueva Obra
            </button>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <div class="filters-row">
              <mat-form-field appearance="outline">
                <mat-label>Buscar</mat-label>
                <input matInput formControlName="search" placeholder="Código, nombre...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="estado">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="Planificacion">Planificación</mat-option>
                  <mat-option value="EnCurso">En Curso</mat-option>
                  <mat-option value="Suspendida">Suspendida</mat-option>
                  <mat-option value="Finalizada">Finalizada</mat-option>
                  <mat-option value="Cancelada">Cancelada</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Fecha desde</mat-label>
                <input matInput [matDatepicker]="fechaDesde" formControlName="fechaDesde">
                <mat-datepicker-toggle matSuffix [for]="fechaDesde"></mat-datepicker-toggle>
                <mat-datepicker #fechaDesde></mat-datepicker>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Fecha hasta</mat-label>
                <input matInput [matDatepicker]="fechaHasta" formControlName="fechaHasta">
                <mat-datepicker-toggle matSuffix [for]="fechaHasta"></mat-datepicker-toggle>
                <mat-datepicker #fechaHasta></mat-datepicker>
              </mat-form-field>
              
              <button mat-button type="button" (click)="limpiarFiltros()">
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      
      <mat-card class="table-card">
        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Cargando obras...</p>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="obras()" class="obras-table" matSort>
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Código</th>
                  <td mat-cell *matCellDef="let obra">{{ obra.codigo }}</td>
                </ng-container>
                
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                  <td mat-cell *matCellDef="let obra">
                    <div class="obra-info">
                      <span class="obra-nombre">{{ obra.nombre }}</span>
                      @if (obra.cliente) {
                        <span class="obra-cliente">{{ obra.cliente }}</span>
                      }
                    </div>
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
                  <td mat-cell *matCellDef="let obra">
                    <mat-chip [class]="'estado-' + obra.estado.toLowerCase()">
                      {{ getEstadoLabel(obra.estado) }}
                    </mat-chip>
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="fechas">
                  <th mat-header-cell *matHeaderCellDef>Fechas</th>
                  <td mat-cell *matCellDef="let obra">
                    <div class="fechas-info">
                      @if (obra.fechaInicioPrevista) {
                        <span class="fecha-inicio">Inicio: {{ obra.fechaInicioPrevista | date:'dd/MM/yyyy' }}</span>
                      }
                      @if (obra.fechaFinPrevista) {
                        <span class="fecha-fin">Fin: {{ obra.fechaFinPrevista | date:'dd/MM/yyyy' }}</span>
                      }
                    </div>
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="presupuesto">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Presupuesto</th>
                  <td mat-cell *matCellDef="let obra">
                    @if (obra.presupuestoObjetivo) {
                      {{ obra.presupuestoObjetivo | currency:'EUR':'symbol':'1.2-2' }}
                    } @else {
                      <span class="no-data">-</span>
                    }
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="responsable">
                  <th mat-header-cell *matHeaderCellDef>Responsable</th>
                  <td mat-cell *matCellDef="let obra">
                    {{ obra.responsable || '-' }}
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let obra">
                    <div class="acciones">
                      <button mat-icon-button 
                              [routerLink]="['/obras', obra.id]"
                              matTooltip="Ver detalle">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button 
                              [routerLink]="['/obras', obra.id, 'editar']"
                              matTooltip="Editar obra">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button 
                              (click)="eliminarObra(obra)"
                              matTooltip="Eliminar obra"
                              color="warn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>
                
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
              
              @if (obras().length === 0) {
                <div class="no-data">
                  <mat-icon>construction</mat-icon>
                  <p>No se encontraron obras</p>
                  <button mat-raised-button color="primary" routerLink="/obras/nueva">
                    Crear primera obra
                  </button>
                </div>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./obras-list.component.scss']
})
export class ObrasListComponent implements OnInit {
  private obrasService = inject(ObrasService);
  private fb = inject(FormBuilder);
  
  obras = signal<Obra[]>([]);
  loading = signal(false);
  filtros: ObraFilters = {};
  
  filterForm: FormGroup;
  displayedColumns = ['codigo', 'nombre', 'estado', 'fechas', 'presupuesto', 'responsable', 'acciones'];
  
  estadosObra = [
    { value: 'Planificacion', label: 'Planificación' },
    { value: 'EnCurso', label: 'En Curso' },
    { value: 'Suspendida', label: 'Suspendida' },
    { value: 'Finalizada', label: 'Finalizada' },
    { value: 'Cancelada', label: 'Cancelada' }
  ];
  
  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      estado: [''],
      fechaDesde: [null],
      fechaHasta: [null]
    });
  }
  
  ngOnInit() {
    this.cargarObras();
    this.setupFiltros();
  }
  
  private setupFiltros() {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }
  
  private cargarObras() {
    this.loading.set(true);
    
    // TODO: Implementar llamada al servicio
    // Por ahora, datos mock
    setTimeout(() => {
      this.obras.set(this.getMockObras());
      this.loading.set(false);
    }, 1000);
  }
  
  private aplicarFiltros() {
    this.filtros = {
      search: this.filterForm.get('search')?.value || undefined,
      estado: this.filterForm.get('estado')?.value || undefined,
      fechaDesde: this.filterForm.get('fechaDesde')?.value || undefined,
      fechaHasta: this.filterForm.get('fechaHasta')?.value || undefined
    };
    
    // TODO: Implementar filtrado con el servicio
    console.log('Aplicando filtros:', this.filtros);
  }
  
  limpiarFiltros() {
    this.filterForm.reset();
  }
  
  eliminarObra(obra: Obra) {
    if (confirm(`¿Está seguro de que desea eliminar la obra "${obra.nombre}"?`)) {
      // TODO: Implementar eliminación
      console.log('Eliminando obra:', obra.id);
    }
  }
  
  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'Planificacion':
        return 'Planificación';
      case 'EnCurso':
        return 'En Curso';
      case 'Suspendida':
        return 'Suspendida';
      case 'Finalizada':
        return 'Finalizada';
      case 'Cancelada':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }
  
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Planificacion':
        return '#2196F3';
      case 'EnCurso':
        return '#4CAF50';
      case 'Suspendida':
        return '#FF9800';
      case 'Finalizada':
        return '#9C27B0';
      case 'Cancelada':
        return '#F44336';
      default:
        return '#757575';
    }
  }
  
  private getMockObras(): Obra[] {
    return [
      {
        id: 1,
        codigo: 'OB-2024-001',
        nombre: 'Construcción Edificio Residencial',
        estado: 'EnCurso',
        clienteId: 1,
        cliente: 'Inmobiliaria ABC S.L.',
        responsableId: 1,
        responsable: 'Juan Pérez',
        fechaInicioPrevista: new Date('2024-01-15'),
        fechaFinPrevista: new Date('2024-12-15'),
        presupuestoObjetivo: 850000,
        esProvisional: false,
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        codigo: 'OB-2024-002',
        nombre: 'Reforma Oficinas Centro',
        estado: 'Planificacion',
        clienteId: 2,
        cliente: 'Empresa XYZ S.A.',
        responsableId: 2,
        responsable: 'María García',
        fechaInicioPrevista: new Date('2024-03-01'),
        fechaFinPrevista: new Date('2024-06-30'),
        presupuestoObjetivo: 125000,
        esProvisional: false,
        empresaId: 1,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 3,
        codigo: 'OB-2024-003',
        nombre: 'Instalación Sistema Solar',
        estado: 'Finalizada',
        clienteId: 3,
        cliente: 'Cooperativa Energética',
        responsableId: 1,
        responsable: 'Juan Pérez',
        fechaInicioPrevista: new Date('2023-10-01'),
        fechaFinPrevista: new Date('2023-12-31'),
        fechaInicioReal: new Date('2023-10-05'),
        fechaFinReal: new Date('2023-12-20'),
        presupuestoObjetivo: 75000,
        esProvisional: false,
        empresaId: 1,
        createdAt: new Date('2023-09-15'),
        updatedAt: new Date('2023-12-20')
      }
    ];
  }
}