import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

import { Persona, PersonaFilters } from '../../../domain/terceros.types';
import { PersonasService } from '../../../application/services/personas.service';
import { PersonaDialogComponent, PersonaDialogData } from './persona-dialog.component';

@Component({
  selector: 'app-personas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule, MatChipsModule,
    MatDialogModule, MatTooltipModule, MatProgressSpinnerModule, MatCardModule, MatDividerModule,
    MatBadgeModule, TitleCasePipe
  ],
  template: `
    <div class="personas-container">
      <!-- Header -->
      <div class="header">
        <div class="title-section">
          <h1>Personas</h1>
          <p>Gestión de clientes, proveedores y empleados</p>
        </div>
        <div class="actions">
          <button mat-stroked-button (click)="exportarCSV()" class="export-button">
            <mat-icon>download</mat-icon>
            Exportar CSV
          </button>
          <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
            <mat-icon>add</mat-icon>
            Nueva Persona
          </button>
        </div>
      </div>
    
      <!-- Filtros -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar</mat-label>
            <input matInput
              [(ngModel)]="filtros.texto"
              (ngModelChange)="aplicarFiltros()"
              placeholder="Nombre, apellidos, NIF, código...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
    
            <mat-form-field appearance="outline" class="tipo-field">
              <mat-label>Tipo</mat-label>
              <mat-select [(ngModel)]="filtros.tipo" (ngModelChange)="aplicarFiltros()">
                <mat-option value="">Todos</mat-option>
                @for (tipo of personasService.tipos(); track tipo) {
                  <mat-option [value]="tipo">
                    {{ tipo | titlecase }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
    
            <mat-slide-toggle
              [(ngModel)]="filtros.activa"
              (ngModelChange)="aplicarFiltros()"
              class="activa-toggle">
              Solo activas
            </mat-slide-toggle>
          </div>
        </mat-card>
    
        <!-- Tabla -->
        <mat-card class="table-card">
          <div class="table-container">
            @if (personasService.loading()) {
              <div class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Cargando personas...</p>
              </div>
            } @else if (personasService.error()) {
              <div class="error-container">
                <mat-icon color="warn">error</mat-icon>
                <p>{{ personasService.error() }}</p>
                <button mat-button color="primary" (click)="personasService.cargarPersonas()">
                  Reintentar
                </button>
              </div>
            } @else if (personasFiltradas().length === 0) {
              <div class="empty-container">
                <mat-icon>people</mat-icon>
                <p>No se encontraron personas</p>
                <button mat-button color="primary" (click)="abrirDialogoCrear()">
                  Crear primera persona
                </button>
              </div>
            } @else {
              <table mat-table [dataSource]="personasFiltradas()" class="personas-table">
                <!-- Código -->
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef>Código</th>
                  <td mat-cell *matCellDef="let persona">
                    <div class="codigo-cell">
                      <span class="codigo">{{ persona.codigo }}</span>
                      @if (personasService.tieneDuplicados(persona.id)) {
                        <mat-icon matBadge="!" matBadgeColor="warn" class="duplicado-icon"
                        matTooltip="Posible duplicado detectado">warning</mat-icon>
                      }
                    </div>
                  </td>
                </ng-container>
    
                <!-- Nombre -->
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let persona">
                    <div class="nombre-cell">
                      <span class="nombre-completo">{{ persona.nombre }} {{ persona.apellidos }}</span>
                      @if (persona.email) {
                        <span class="email">{{ persona.email }}</span>
                      }
                    </div>
                  </td>
                </ng-container>
    
                <!-- NIF -->
                <ng-container matColumnDef="nif">
                  <th mat-header-cell *matHeaderCellDef>NIF</th>
                  <td mat-cell *matCellDef="let persona">{{ persona.nif }}</td>
                </ng-container>
    
                <!-- Tipo -->
                <ng-container matColumnDef="tipo">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let persona">
                    <mat-chip [color]="getTipoColor(persona.tipo)" selected>
                      {{ persona.tipo | titlecase }}
                    </mat-chip>
                  </td>
                </ng-container>
    
                <!-- Teléfono -->
                <ng-container matColumnDef="telefono">
                  <th mat-header-cell *matHeaderCellDef>Teléfono</th>
                  <td mat-cell *matCellDef="let persona">
                    {{ persona.telefono || '-' }}
                  </td>
                </ng-container>
    
                <!-- Estado -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let persona">
                    <mat-slide-toggle
                      [checked]="persona.activa"
                      (change)="toggleActiva(persona, $event.checked)"
                      [disabled]="isUpdating(persona.id)"
                      color="primary">
                      {{ persona.activa ? 'Activa' : 'Inactiva' }}
                    </mat-slide-toggle>
                    @if (isUpdating(persona.id)) {
                      <mat-spinner diameter="16" class="toggle-spinner"></mat-spinner>
                    }
                  </td>
                </ng-container>
    
                <!-- Acciones -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let persona">
                    <div class="actions-cell">
                      <button mat-icon-button
                        matTooltip="Ver detalle"
                        (click)="verDetalle(persona)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button
                        matTooltip="Editar"
                        (click)="abrirDialogoEditar(persona)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button
                        matTooltip="Eliminar"
                        color="warn"
                        (click)="eliminarPersona(persona)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>
    
                <tr mat-header-row *matHeaderRowDef="columnas"></tr>
                <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
              </table>
            }
          </div>
        </mat-card>
      </div>
    `,
  styles: [`
    .personas-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .title-section h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 28px;
      font-weight: 500;
    }

    .title-section p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .export-button {
      margin-right: 8px;
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

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .tipo-field {
      min-width: 150px;
    }

    .activa-toggle {
      margin-left: 16px;
    }

    .table-card {
      overflow: hidden;
    }

    .table-container {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-container,
    .error-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
    }

    .loading-container mat-spinner,
    .error-container mat-icon,
    .empty-container mat-icon {
      margin-bottom: 8px;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .empty-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .personas-table {
      width: 100%;
    }

    .codigo-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .codigo {
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }

    .duplicado-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .nombre-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nombre-completo {
      font-weight: 500;
    }

    .email {
      font-size: 12px;
      color: #666;
    }

    .actions-cell {
      display: flex;
      gap: 4px;
    }

    .toggle-spinner {
      margin-left: 8px;
    }

    @media (max-width: 768px) {
      .personas-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field,
      .tipo-field {
        min-width: auto;
      }

      .activa-toggle {
        margin-left: 0;
      }
    }
  `]
})
export class PersonasComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);

  private _updatingIds = signal<Set<number>>(new Set());
  private _filtros = signal<PersonaFilters>({});
  
  personasFiltradas = computed(() => this.personasService.filtrarPersonas(this._filtros()));
  columnas = ['codigo', 'nombre', 'nif', 'tipo', 'telefono', 'estado', 'acciones'];
  filtros = this._filtros();

  constructor(public personasService: PersonasService) {}

  ngOnInit(): void {
    // Los datos se cargan automáticamente en el constructor del servicio
  }

  aplicarFiltros(): void {
    this._filtros.set({ ...this.filtros });
  }

  getTipoColor(tipo: string): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case 'cliente': return 'primary';
      case 'proveedor': return 'accent';
      case 'empleado': return 'warn';
      default: return 'primary';
    }
  }

  async toggleActiva(persona: Persona, activa: boolean): Promise<void> {
    this._updatingIds.update(ids => { ids.add(persona.id); return ids; });
    try {
      await this.personasService.toggleActiva(persona.id, activa);
      console.log(`Persona ${activa ? 'activada' : 'desactivada'} correctamente`);
    } catch (error: any) {
      console.error('Error al cambiar estado:', error.message);
    } finally {
      this._updatingIds.update(ids => { ids.delete(persona.id); return ids; });
    }
  }

  isUpdating(id: number): boolean {
    return this._updatingIds().has(id);
  }

  verDetalle(persona: Persona): void {
    this.router.navigate(['/terceros/personas', persona.id]);
  }

  async abrirDialogoCrear(): Promise<void> {
    const dialogRef = this.dialog.open(PersonaDialogComponent, {
      width: '600px',
      data: { isEdit: false } as PersonaDialogData
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      // Los datos se actualizan automáticamente en el servicio
      console.log('Persona creada correctamente');
    }
  }

  async abrirDialogoEditar(persona: Persona): Promise<void> {
    const dialogRef = this.dialog.open(PersonaDialogComponent, {
      width: '600px',
      data: { persona, isEdit: true } as PersonaDialogData
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      // Los datos se actualizan automáticamente en el servicio
      console.log('Persona actualizada correctamente');
    }
  }

  async eliminarPersona(persona: Persona): Promise<void> {
    if (confirm(`¿Estás seguro de que quieres eliminar a "${persona.nombre} ${persona.apellidos}"?`)) {
      try {
        await this.personasService.eliminarPersona(persona.id);
        console.log('Persona eliminada correctamente');
      } catch (error: any) {
        console.error('Error al eliminar persona:', error.message);
      }
    }
  }

  exportarCSV(): void {
    const personas = this.personasFiltradas();
    if (personas.length === 0) {
      console.log('No hay datos para exportar');
      return;
    }

    // Crear headers del CSV
    const headers = [
      'Código', 'Nombre', 'Apellidos', 'NIF', 'Email', 'Teléfono', 
      'Tipo', 'Activa', 'Empresa ID', 'Creado', 'Actualizado'
    ];

    // Crear filas de datos
    const rows = personas.map(persona => [
      persona.codigo,
      persona.nombre,
      persona.apellidos,
      persona.nif,
      persona.email || '',
      persona.telefono || '',
      persona.tipo,
      persona.activa ? 'Sí' : 'No',
      persona.empresaId,
      persona.createdAt.toLocaleDateString('es-ES'),
      persona.updatedAt.toLocaleDateString('es-ES')
    ]);

    // Combinar headers y filas
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `personas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
