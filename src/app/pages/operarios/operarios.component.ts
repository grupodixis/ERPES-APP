import { Component, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';

import { OperariosService } from '../../services/operarios.service';
import {
  Operario,
  OperarioCreateDto,
  OperarioUpdateDto,
  OperarioFilter,
  CategoriaOperario
} from '../../domain/rrhh.types';

@Component({
  selector: 'app-operarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatCardModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatToolbarModule,
    MatChipsModule
  ],
  template: `
    <div class="operarios-container">
      <mat-toolbar class="page-header">
        <span class="page-title">
          <mat-icon>people</mat-icon>
          Gestión de Operarios
        </span>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Operario
        </button>
      </mat-toolbar>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>Filtros de Búsqueda</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <div class="filter-row">
              <mat-form-field appearance="outline">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" placeholder="Buscar por nombre...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="categoria">
                  <mat-option value="">Todas las categorías</mat-option>
                  <mat-option *ngFor="let categoria of categorias$ | async" [value]="categoria.idCategoriaOperario">
                    {{categoria.nombre}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="activo">
                  <mat-option value="">Todos</mat-option>
                  <mat-option [value]="true">Activos</mat-option>
                  <mat-option [value]="false">Inactivos</mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-raised-button color="accent" (click)="applyFilters()">
                <mat-icon>filter_list</mat-icon>
                Filtrar
              </button>

              <button mat-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Estadísticas -->
      <div class="stats-row" *ngIf="estadisticas">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{estadisticas.totalOperarios}}</div>
                <div class="stat-label">Total Operarios</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon active">person</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{estadisticas.operariosActivos}}</div>
                <div class="stat-label">Activos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">assignment</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{estadisticas.contratosActivos}}</div>
                <div class="stat-label">Contratos Activos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon pending">pending_actions</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{estadisticas.solicitudesPendientes}}</div>
                <div class="stat-label">Solicitudes Pendientes</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabla de Operarios -->
      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="operarios$ | async" class="operarios-table" matSort>
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let operario">{{operario.idOperario}}</td>
            </ng-container>

            <!-- Persona Column -->
            <ng-container matColumnDef="persona">
              <th mat-header-cell *matHeaderCellDef>Persona</th>
              <td mat-cell *matCellDef="let operario">
                <div class="persona-info">
                  <div class="persona-id">ID: {{operario.idPersona}}</div>
                  <div class="email" *ngIf="operario.emailCorporativo">{{operario.emailCorporativo}}</div>
                </div>
              </td>
            </ng-container>

            <!-- Categoría Column -->
            <ng-container matColumnDef="categoria">
              <th mat-header-cell *matHeaderCellDef>Categoría</th>
              <td mat-cell *matCellDef="let operario">
                <mat-chip-listbox *ngIf="operario.idCategoriaOperario">
                  <mat-chip-option>{{getCategoriaName(operario.idCategoriaOperario)}}</mat-chip-option>
                </mat-chip-listbox>
                <span *ngIf="!operario.idCategoriaOperario" class="no-category">Sin categoría</span>
              </td>
            </ng-container>

            <!-- Fecha Alta Column -->
            <ng-container matColumnDef="fechaAlta">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Alta</th>
              <td mat-cell *matCellDef="let operario">{{operario.fechaAlta | date:'dd/MM/yyyy'}}</td>
            </ng-container>

            <!-- Coste Hora Column -->
            <ng-container matColumnDef="costeHora">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Coste/Hora</th>
              <td mat-cell *matCellDef="let operario">{{operario.costeHoraBase | currency:'EUR':'symbol':'1.2-2'}}</td>
            </ng-container>

            <!-- Estado Column -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let operario">
                <mat-chip-listbox>
                  <mat-chip-option [class]="operario.activo ? 'active-chip' : 'inactive-chip'">
                    {{operario.activo ? 'Activo' : 'Inactivo'}}
                  </mat-chip-option>
                </mat-chip-listbox>
              </td>
            </ng-container>

            <!-- Acciones Column -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let operario">
                <button mat-icon-button color="primary" (click)="openEditDialog(operario)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="viewContratos(operario)" matTooltip="Ver Contratos">
                  <mat-icon>assignment</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="toggleActive(operario)" 
                        [matTooltip]="operario.activo ? 'Desactivar' : 'Activar'">
                  <mat-icon>{{operario.activo ? 'person_off' : 'person_add'}}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 20, 50]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Dialog para crear/editar operario -->
    <ng-template #operarioDialog>
      <h2 mat-dialog-title>{{isEditing ? 'Editar' : 'Nuevo'}} Operario</h2>
      <mat-dialog-content>
        <form [formGroup]="operarioForm" class="operario-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>ID Persona</mat-label>
              <input matInput type="number" formControlName="idPersona" required>
              <mat-error *ngIf="operarioForm.get('idPersona')?.hasError('required')">
                El ID de persona es requerido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="idCategoriaOperario">
                <mat-option value="">Sin categoría</mat-option>
                <mat-option *ngFor="let categoria of categorias$ | async" [value]="categoria.idCategoriaOperario">
                  {{categoria.nombre}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Fecha de Alta</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fechaAlta" required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="operarioForm.get('fechaAlta')?.hasError('required')">
                La fecha de alta es requerida
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>NSS</mat-label>
              <input matInput formControlName="nss" placeholder="Número Seguridad Social">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Fecha Nacimiento</mat-label>
              <input matInput [matDatepicker]="pickerNac" formControlName="fechaNacimiento">
              <mat-datepicker-toggle matSuffix [for]="pickerNac"></mat-datepicker-toggle>
              <mat-datepicker #pickerNac></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Grupo Cotización</mat-label>
              <input matInput formControlName="grupoCotizacion">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Centro de Trabajo</mat-label>
              <input matInput formControlName="centroTrabajo">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>IBAN Nómina</mat-label>
              <input matInput formControlName="ibanNomina" placeholder="ES00 0000 0000 0000 0000 0000">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Email Corporativo</mat-label>
              <input matInput type="email" formControlName="emailCorporativo">
              <mat-error *ngIf="operarioForm.get('emailCorporativo')?.hasError('email')">
                Ingrese un email válido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Teléfono Empresa</mat-label>
              <input matInput formControlName="telefonoEmpresa">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Coste Hora Base</mat-label>
              <input matInput type="number" step="0.01" formControlName="costeHoraBase" required>
              <span matSuffix>€</span>
              <mat-error *ngIf="operarioForm.get('costeHoraBase')?.hasError('required')">
                El coste por hora es requerido
              </mat-error>
              <mat-error *ngIf="operarioForm.get('costeHoraBase')?.hasError('min')">
                El coste debe ser mayor a 0
              </mat-error>
            </mat-form-field>

            <mat-checkbox formControlName="activo" *ngIf="isEditing">
              Operario Activo
            </mat-checkbox>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" (click)="saveOperario()" [disabled]="operarioForm.invalid">
          {{isEditing ? 'Actualizar' : 'Crear'}}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styleUrls: ['./operarios.component.scss']
})
export class OperariosComponent implements OnInit {
  private operariosService = inject(OperariosService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild('operarioDialog') operarioDialog!: TemplateRef<any>;

  operarios$!: Observable<Operario[]>;
  categorias$!: Observable<CategoriaOperario[]>;
  estadisticas: any;

  displayedColumns: string[] = ['id', 'persona', 'categoria', 'fechaAlta', 'costeHora', 'estado', 'acciones'];
  
  filterForm!: FormGroup;
  operarioForm!: FormGroup;
  isEditing = false;
  currentOperario: Operario | null = null;

  ngOnInit() {
    this.initializeForms();
    this.loadData();
  }

  private initializeForms() {
    this.filterForm = this.fb.group({
      nombre: [''],
      categoria: [''],
      activo: ['']
    });

    this.operarioForm = this.fb.group({
      idPersona: ['', [Validators.required, Validators.min(1)]],
      idCategoriaOperario: [''],
      fechaAlta: ['', Validators.required],
      nss: [''],
      fechaNacimiento: [''],
      grupoCotizacion: [''],
      centroTrabajo: [''],
      ibanNomina: [''],
      emailCorporativo: ['', Validators.email],
      telefonoEmpresa: [''],
      costeHoraBase: ['', [Validators.required, Validators.min(0.01)]],
      activo: [true]
    });
  }

  private loadData() {
    this.operarios$ = this.operariosService.getOperarios();
    this.categorias$ = this.operariosService.getCategorias();
    
    this.operariosService.getEstadisticasOperarios().subscribe(stats => {
      this.estadisticas = stats;
    });
  }

  applyFilters() {
    const filters: OperarioFilter = this.filterForm.value;
    this.operarios$ = this.operariosService.getOperarios(filters);
  }

  clearFilters() {
    this.filterForm.reset();
    this.operarios$ = this.operariosService.getOperarios();
  }

  openCreateDialog() {
    this.isEditing = false;
    this.currentOperario = null;
    this.operarioForm.reset();
    this.operarioForm.patchValue({ activo: true, fechaAlta: new Date() });
    
    const dialogRef = this.dialog.open(this.operarioDialog);
  }

  openEditDialog(operario: Operario) {
    this.isEditing = true;
    this.currentOperario = operario;
    
    this.operarioForm.patchValue({
      ...operario,
      fechaAlta: new Date(operario.fechaAlta),
      fechaNacimiento: operario.fechaNacimiento ? new Date(operario.fechaNacimiento) : null
    });
    
    const dialogRef = this.dialog.open(this.operarioDialog);
  }

  saveOperario() {
    if (this.operarioForm.valid) {
      const formValue = this.operarioForm.value;
      
      // Convertir fechas a string
      const operarioData = {
        ...formValue,
        fechaAlta: formValue.fechaAlta.toISOString().split('T')[0],
        fechaNacimiento: formValue.fechaNacimiento ? formValue.fechaNacimiento.toISOString().split('T')[0] : null
      };

      if (this.isEditing && this.currentOperario) {
        const updateDto: OperarioUpdateDto = {
          idOperario: this.currentOperario.idOperario,
          ...operarioData
        };
        
        this.operariosService.updateOperario(updateDto).subscribe({
          next: () => {
            this.snackBar.open('Operario actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.loadData();
            this.dialog.closeAll();
          },
          error: (error) => {
            this.snackBar.open('Error al actualizar operario: ' + error.message, 'Cerrar', { duration: 5000 });
          }
        });
      } else {
        const createDto: OperarioCreateDto = operarioData;
        
        this.operariosService.createOperario(createDto).subscribe({
          next: () => {
            this.snackBar.open('Operario creado correctamente', 'Cerrar', { duration: 3000 });
            this.loadData();
            this.dialog.closeAll();
          },
          error: (error) => {
            this.snackBar.open('Error al crear operario: ' + error.message, 'Cerrar', { duration: 5000 });
          }
        });
      }
    }
  }

  toggleActive(operario: Operario) {
    const action = operario.activo ? 'desactivar' : 'activar';
    
    if (confirm(`¿Está seguro de ${action} este operario?`)) {
      if (operario.activo) {
        this.operariosService.deleteOperario(operario.idOperario).subscribe({
          next: () => {
            this.snackBar.open('Operario desactivado correctamente', 'Cerrar', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            this.snackBar.open('Error al desactivar operario: ' + error.message, 'Cerrar', { duration: 5000 });
          }
        });
      } else {
        const updateDto: OperarioUpdateDto = {
          idOperario: operario.idOperario,
          activo: true
        };
        
        this.operariosService.updateOperario(updateDto).subscribe({
          next: () => {
            this.snackBar.open('Operario activado correctamente', 'Cerrar', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            this.snackBar.open('Error al activar operario: ' + error.message, 'Cerrar', { duration: 5000 });
          }
        });
      }
    }
  }

  viewContratos(operario: Operario) {
    // Navegar a la página de contratos con filtro por operario
    // Implementar navegación
    this.snackBar.open('Funcionalidad de contratos en desarrollo', 'Cerrar', { duration: 3000 });
  }

  getCategoriaName(idCategoria: number): string {
    // Esta función se puede mejorar con un pipe o servicio
    const categorias = {
      1: 'Administrativo',
      2: 'Almacenero', 
      3: 'Técnico Especialista',
      4: 'Operario'
    };
    return (categorias as any)[idCategoria] || 'Sin categoría';
  }
}