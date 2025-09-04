import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { ContabilidadService } from '../contabilidad.service';
// import { EjercicioDialogComponent } from './ejercicio-dialog.component'; // TODO: Create dialog component
import {
  EjercicioContable,
  EstadoEjercicio,
  ContabilidadQueryParams,
  ContabilidadFormMode
} from '../contabilidad.types';

@Component({
  selector: 'app-ejercicios-contables',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './ejercicios-contables.component.html',
  styleUrls: ['./ejercicios-contables.component.scss']
})
export class EjerciciosContablesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Señales reactivas
  ejercicios = signal<EjercicioContable[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalEjercicios = signal(0);
  ejercicioActivo = signal<EjercicioContable | null>(null);
  
  // Configuración de tabla
  displayedColumns = ['codigo', 'nombre', 'fechaInicio', 'fechaFin', 'estado', 'activo', 'acciones'];
  
  // Paginación y ordenamiento
  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('codigo');
  sortOrder = signal<'asc' | 'desc'>('asc');
  
  // Filtros
  searchControl = new FormControl('');
  estadoFilter = new FormControl('');
  activoFilter = new FormControl('');
  
  // Estados de la UI
  estadosEjercicio = Object.values(EstadoEjercicio);
  
  // Computed properties
  ejerciciosFiltrados = computed(() => {
    let ejercicios = this.ejercicios();
    const search = this.searchControl.value?.toLowerCase() || '';
    const estado = this.estadoFilter.value;
    const activo = this.activoFilter.value;
    
    if (search) {
      ejercicios = ejercicios.filter(ejercicio => 
        ejercicio.codigo.toLowerCase().includes(search) ||
        ejercicio.nombre.toLowerCase().includes(search)
      );
    }
    
    if (estado) {
      ejercicios = ejercicios.filter(ejercicio => ejercicio.estado === estado);
    }
    
    if (activo !== '') {
      const isActive = activo === 'true';
      ejercicios = ejercicios.filter(ejercicio => ejercicio.activo === isActive);
    }
    
    return ejercicios;
  });
  
  estadisticas = computed(() => {
    const ejercicios = this.ejercicios();
    return {
      total: ejercicios.length,
      abiertos: ejercicios.filter(e => e.estado === EstadoEjercicio.ABIERTO).length,
      cerrados: ejercicios.filter(e => e.estado === EstadoEjercicio.CERRADO).length,
      activos: ejercicios.filter(e => e.activo).length
    };
  });

  constructor(
    private contabilidadService: ContabilidadService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadEjercicios();
    this.loadEjercicioActivo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
    // Configurar filtros reactivos
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadEjercicios();
      });

    this.estadoFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadEjercicios();
      });

    this.activoFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadEjercicios();
      });
  }

  loadEjercicios(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: ContabilidadQueryParams = {
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      search: this.searchControl.value || undefined
    };

    // Agregar filtros específicos
    const filters: Record<string, any> = {};
    
    if (this.estadoFilter.value) {
      filters['estado'] = this.estadoFilter.value;
    }
    
    if (this.activoFilter.value !== '') {
      filters['activo'] = this.activoFilter.value === 'true';
    }
    
    if (Object.keys(filters).length > 0) {
      params.filters = filters;
    }

    this.contabilidadService.getEjercicios(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.ejercicios.set(response.data);
          this.totalEjercicios.set(response.total);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar ejercicios:', error);
          this.error.set('Error al cargar los ejercicios contables');
          this.loading.set(false);
          this.showMessage('Error al cargar los ejercicios contables', 'error');
        }
      });
  }

  private loadEjercicioActivo(): void {
    this.contabilidadService.ejercicioActivo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ejercicio => {
        this.ejercicioActivo.set(ejercicio);
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadEjercicios();
  }

  onSortChange(sort: Sort): void {
    this.sortBy.set(sort.active);
    this.sortOrder.set(sort.direction as 'asc' | 'desc');
    this.loadEjercicios();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.estadoFilter.setValue('');
    this.activoFilter.setValue('');
    this.pageIndex.set(0);
    this.loadEjercicios();
  }

  openCreateDialog(): void {
    // TODO: Implement EjercicioDialogComponent
    console.log('Create ejercicio - Dialog not implemented yet');
    this.showMessage('Funcionalidad en desarrollo');
  }

  openEditDialog(ejercicio: EjercicioContable): void {
    // TODO: Implement EjercicioDialogComponent
    console.log('Edit ejercicio:', ejercicio);
    this.showMessage('Funcionalidad en desarrollo');
  }

  openViewDialog(ejercicio: EjercicioContable): void {
    // TODO: Implement EjercicioDialogComponent
    console.log('View ejercicio:', ejercicio);
    this.showMessage('Funcionalidad en desarrollo');
  }

  deleteEjercicio(ejercicio: EjercicioContable): void {
    if (confirm(`¿Está seguro de que desea eliminar el ejercicio "${ejercicio.nombre}"?`)) {
      this.contabilidadService.deleteEjercicio(ejercicio.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEjercicios();
            this.showMessage('Ejercicio eliminado exitosamente');
          },
          error: (error) => {
            console.error('Error al eliminar ejercicio:', error);
            this.showMessage('Error al eliminar el ejercicio', 'error');
          }
        });
    }
  }

  setEjercicioActivo(ejercicio: EjercicioContable): void {
    if (ejercicio.estado !== EstadoEjercicio.ABIERTO) {
      this.showMessage('Solo se pueden activar ejercicios abiertos', 'warning');
      return;
    }

    this.contabilidadService.setEjercicioActivo(ejercicio);
    this.showMessage(`Ejercicio "${ejercicio.nombre}" establecido como activo`);
  }

  cerrarEjercicio(ejercicio: EjercicioContable): void {
    if (ejercicio.estado === EstadoEjercicio.CERRADO) {
      this.showMessage('El ejercicio ya está cerrado', 'warning');
      return;
    }

    if (confirm(`¿Está seguro de que desea cerrar el ejercicio "${ejercicio.nombre}"? Esta acción no se puede deshacer.`)) {
      const ejercicioActualizado = {
        ...ejercicio,
        estado: EstadoEjercicio.CERRADO,
        cerrado: true,
        activo: false
      };

      this.contabilidadService.updateEjercicio(ejercicio.id, ejercicioActualizado)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEjercicios();
            this.showMessage('Ejercicio cerrado exitosamente');
          },
          error: (error) => {
            console.error('Error al cerrar ejercicio:', error);
            this.showMessage('Error al cerrar el ejercicio', 'error');
          }
        });
    }
  }

  duplicarEjercicio(ejercicio: EjercicioContable): void {
    const fechaInicio = new Date(ejercicio.fechaFin);
    fechaInicio.setDate(fechaInicio.getDate() + 1);
    
    const fechaFin = new Date(fechaInicio);
    fechaFin.setFullYear(fechaFin.getFullYear() + 1);
    fechaFin.setDate(fechaFin.getDate() - 1);

    const nuevoEjercicio = {
      codigo: (parseInt(ejercicio.codigo) + 1).toString(),
      nombre: `Ejercicio ${parseInt(ejercicio.codigo) + 1}`,
      fechaInicio,
      fechaFin,
      estado: EstadoEjercicio.ABIERTO,
      activo: false,
      cerrado: false,
      observaciones: `Duplicado desde ejercicio ${ejercicio.codigo}`
    };

    // TODO: Implement EjercicioDialogComponent
    console.log('Duplicate ejercicio:', nuevoEjercicio);
    this.showMessage('Funcionalidad en desarrollo');
  }

  getEstadoColor(estado: EstadoEjercicio): string {
    switch (estado) {
      case EstadoEjercicio.ABIERTO:
        return 'primary';
      case EstadoEjercicio.CERRADO:
        return 'warn';
      case EstadoEjercicio.PROVISIONAL:
        return 'accent';
      default:
        return '';
    }
  }

  getEstadoIcon(estado: EstadoEjercicio): string {
    switch (estado) {
      case EstadoEjercicio.ABIERTO:
        return 'lock_open';
      case EstadoEjercicio.CERRADO:
        return 'lock';
      case EstadoEjercicio.PROVISIONAL:
        return 'schedule';
      default:
        return 'help';
    }
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  navigateToAsientos(ejercicio: EjercicioContable): void {
    this.router.navigate(['/contabilidad/ejercicios', ejercicio.id, 'asientos']);
  }
}