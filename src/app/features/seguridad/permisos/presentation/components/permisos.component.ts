import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PermisoService } from '../../application/services/permiso.service';
import { Permiso, PermisoQueryDto } from '../../domain/entities/permiso.entity';
import { PermisoDialogComponent } from './permiso-dialog.component';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    MatExpansionModule,
    MatBadgeModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="permisos-container">
      <div class="header">
        <h2>Gestión de Permisos</h2>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Permiso
        </button>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Buscar recurso</mat-label>
              <input matInput [formControl]="recursoFilter" placeholder="Ej: usuarios, productos...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Método</mat-label>
              <mat-select [formControl]="metodoFilter">
                <mat-option value="">Todos</mat-option>
                <mat-option value="GET">GET</mat-option>
                <mat-option value="POST">POST</mat-option>
                <mat-option value="PUT">PUT</mat-option>
                <mat-option value="DELETE">DELETE</mat-option>
                <mat-option value="PATCH">PATCH</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Módulo</mat-label>
              <mat-select [formControl]="moduloFilter">
                <mat-option value="">Todos</mat-option>
                <mat-option *ngFor="let modulo of modulosDisponibles" [value]="modulo">
                  {{ modulo }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [formControl]="activoFilter">
                <mat-option value="">Todos</mat-option>
                <mat-option [value]="true">Activo</mat-option>
                <mat-option [value]="false">Inactivo</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Limpiar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Vista por módulos -->
      <div class="permisos-content">
        <mat-accordion multi="true">
          <mat-expansion-panel *ngFor="let modulo of permisosGrouped() | keyvalue" 
                               [expanded]="expandedModules().has(modulo.key)"
                               (opened)="toggleModule(modulo.key, true)"
                               (closed)="toggleModule(modulo.key, false)">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>folder</mat-icon>
                {{ modulo.key }}
                <mat-chip-set>
                  <mat-chip [matBadge]="modulo.value.length" matBadgeColor="primary">
                    {{ modulo.value.length }} permisos
                  </mat-chip>
                </mat-chip-set>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="modulo-content">
              <table mat-table [dataSource]="modulo.value" class="permisos-table">
                <ng-container matColumnDef="recurso">
                  <th mat-header-cell *matHeaderCellDef>Recurso</th>
                  <td mat-cell *matCellDef="let permiso">{{ permiso.recurso }}</td>
                </ng-container>

                <ng-container matColumnDef="metodo">
                  <th mat-header-cell *matHeaderCellDef>Método</th>
                  <td mat-cell *matCellDef="let permiso">
                    <mat-chip [class]="'method-' + permiso.metodo.toLowerCase()">
                      {{ permiso.metodo }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="descripcion">
                  <th mat-header-cell *matHeaderCellDef>Descripción</th>
                  <td mat-cell *matCellDef="let permiso">{{ permiso.descripcion }}</td>
                </ng-container>

                <ng-container matColumnDef="activo">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let permiso">
                    <mat-chip [color]="permiso.activo ? 'primary' : 'warn'">
                      {{ permiso.activo ? 'Activo' : 'Inactivo' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let permiso">
                    <button mat-icon-button 
                            matTooltip="Editar permiso"
                            (click)="openEditDialog(permiso)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button 
                            color="warn"
                            matTooltip="Eliminar permiso"
                            (click)="deletePermiso(permiso)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-expansion-panel>
        </mat-accordion>
      </div>

      <!-- Paginación -->
      <mat-paginator 
        [length]="totalItems()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[5, 10, 25, 50]"
        [pageIndex]="currentPage() - 1"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .permisos-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h2 {
      margin: 0;
      color: #1976d2;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filters-row mat-form-field {
      min-width: 200px;
    }

    .permisos-content {
      margin-bottom: 24px;
    }

    .modulo-content {
      margin-top: 16px;
    }

    .permisos-table {
      width: 100%;
    }

    .mat-expansion-panel-header {
      padding: 16px 24px;
    }

    .mat-panel-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mat-chip-set {
      margin-left: auto;
    }

    .method-get { background-color: #4caf50; color: white; }
    .method-post { background-color: #2196f3; color: white; }
    .method-put { background-color: #ff9800; color: white; }
    .method-delete { background-color: #f44336; color: white; }
    .method-patch { background-color: #9c27b0; color: white; }

    @media (max-width: 768px) {
      .permisos-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;
      }

      .filters-row mat-form-field {
        width: 100%;
      }
    }
  `]
})
export class PermisosComponent implements OnInit {
  private readonly permisoService = inject(PermisoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Signals
  permisos = signal<Permiso[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  expandedModules = signal(new Set<string>(['Seguridad']));

  // Form controls
  recursoFilter = new FormControl('');
  metodoFilter = new FormControl('');
  moduloFilter = new FormControl('');
  activoFilter = new FormControl('');

  // Computed
  permisosGrouped = computed(() => {
    const grouped: { [modulo: string]: Permiso[] } = {};
    this.permisos().forEach(permiso => {
      if (!grouped[permiso.modulo]) {
        grouped[permiso.modulo] = [];
      }
      grouped[permiso.modulo].push(permiso);
    });
    return grouped;
  });

  displayedColumns = ['recurso', 'metodo', 'descripcion', 'activo', 'acciones'];
  modulosDisponibles = this.permisoService.getModulosDisponibles();

  ngOnInit() {
    this.setupFilters();
    this.loadPermisos();
  }

  private setupFilters() {
    // Configurar filtros reactivos
    this.recursoFilter.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.loadPermisos());

    this.metodoFilter.valueChanges.subscribe(() => this.loadPermisos());
    this.moduloFilter.valueChanges.subscribe(() => this.loadPermisos());
    this.activoFilter.valueChanges.subscribe(() => this.loadPermisos());
  }

  loadPermisos() {
    this.loading.set(true);

    const query: PermisoQueryDto = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sort: 'modulo',
      order: 'ASC'
    };

    // Aplicar filtros
    const recurso = this.recursoFilter.value?.trim();
    if (recurso) query.recurso = recurso;

    const metodo = this.metodoFilter.value;
    if (metodo) query.metodo = metodo;

    const modulo = this.moduloFilter.value;
    if (modulo) query.modulo = modulo;

    const activo = this.activoFilter.value;
    if (activo !== '') {
      query.activo = activo === 'true' ? true : activo === 'false' ? false : undefined;
    }

    this.permisoService.getPermisos(query).subscribe({
      next: (response) => {
        this.permisos.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.snackBar.open('Error al cargar los permisos', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadPermisos();
  }

  toggleModule(modulo: string, expanded: boolean) {
    const modules = new Set(this.expandedModules());
    if (expanded) {
      modules.add(modulo);
    } else {
      modules.delete(modulo);
    }
    this.expandedModules.set(modules);
  }

  clearFilters() {
    this.recursoFilter.setValue('');
    this.metodoFilter.setValue('');
    this.moduloFilter.setValue('');
    this.activoFilter.setValue('');
    this.currentPage.set(1);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(PermisoDialogComponent, {
      width: '600px',
      data: { permiso: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPermisos();
        this.snackBar.open('Permiso creado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openEditDialog(permiso: Permiso) {
    const dialogRef = this.dialog.open(PermisoDialogComponent, {
      width: '600px',
      data: { permiso, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPermisos();
        this.snackBar.open('Permiso actualizado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deletePermiso(permiso: Permiso) {
    if (confirm(`¿Está seguro de eliminar el permiso "${permiso.descripcion}"?`)) {
      this.permisoService.deletePermiso(permiso.id).subscribe({
        next: () => {
          this.loadPermisos();
          this.snackBar.open('Permiso eliminado exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error al eliminar permiso:', error);
          this.snackBar.open('Error al eliminar el permiso', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}