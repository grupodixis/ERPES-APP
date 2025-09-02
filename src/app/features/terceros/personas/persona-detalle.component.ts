import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Persona, Direccion, CuentaBancaria } from '../../../domain/terceros.types';
import { PersonasService } from '../../../application/services/personas.service';

@Component({
  selector: 'app-persona-detalle',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatTabsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatCardModule, MatChipsModule, MatDialogModule, MatProgressSpinnerModule,
    MatDividerModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  template: `
    <div class="persona-detalle-container">
      <!-- Header -->
      <div class="header">
        <div class="title-section">
          <button mat-icon-button (click)="volver()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="title-content">
            <h1>{{ persona()?.nombre }} {{ persona()?.apellidos }}</h1>
            <div class="subtitle">
              <span class="codigo">{{ persona()?.codigo }}</span>
              <mat-chip [color]="getTipoColor(persona()?.tipo || '')" selected>
                {{ persona()?.tipo | titlecase }}
              </mat-chip>
              <mat-chip [color]="persona()?.activa ? 'primary' : 'warn'" selected>
                {{ persona()?.activa ? 'Activa' : 'Inactiva' }}
              </mat-chip>
            </div>
          </div>
        </div>
        <div class="actions">
          <button mat-raised-button color="primary" (click)="editarPersona()">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando datos de la persona...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button color="primary" (click)="cargarPersona()">
            Reintentar
          </button>
        </div>
      } @else if (persona()) {
        <!-- Tabs -->
        <mat-tab-group class="tabs-container">
          <!-- Tab Contacto -->
          <mat-tab label="Contacto">
            <div class="tab-content">
              <mat-card class="contacto-card">
                <mat-card-header>
                  <mat-card-title>Información de Contacto</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="contacto-grid">
                    <div class="contacto-item">
                      <label>NIF:</label>
                      <span>{{ persona()?.nif }}</span>
                    </div>
                    <div class="contacto-item">
                      <label>Email:</label>
                      <span>{{ persona()?.email || 'No especificado' }}</span>
                    </div>
                    <div class="contacto-item">
                      <label>Teléfono:</label>
                      <span>{{ persona()?.telefono || 'No especificado' }}</span>
                    </div>
                    <div class="contacto-item">
                      <label>Empresa:</label>
                      <span>{{ persona()?.empresaId }}</span>
                    </div>
                    <div class="contacto-item">
                      <label>Creado:</label>
                      <span>{{ persona()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                    <div class="contacto-item">
                      <label>Actualizado:</label>
                      <span>{{ persona()?.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab Direcciones -->
          <mat-tab label="Direcciones">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Direcciones ({{ direcciones().length }})</h3>
                <button mat-raised-button color="primary" (click)="agregarDireccion()">
                  <mat-icon>add</mat-icon>
                  Nueva Dirección
                </button>
              </div>

              @if (direcciones().length === 0) {
                <div class="empty-state">
                  <mat-icon>location_on</mat-icon>
                  <p>No hay direcciones registradas</p>
                  <button mat-button color="primary" (click)="agregarDireccion()">
                    Agregar primera dirección
                  </button>
                </div>
              } @else {
                <table mat-table [dataSource]="direcciones()" class="direcciones-table">
                  <ng-container matColumnDef="tipo">
                    <th mat-header-cell *matHeaderCellDef>Tipo</th>
                    <td mat-cell *matCellDef="let direccion">
                      <mat-chip [color]="getTipoDireccionColor(direccion.tipo)" selected>
                        {{ direccion.tipo | titlecase }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="direccion">
                    <th mat-header-cell *matHeaderCellDef>Dirección</th>
                    <td mat-cell *matCellDef="let direccion">
                      <div class="direccion-cell">
                        <div class="direccion-principal">
                          {{ direccion.calle }}, {{ direccion.numero }}
                          @if (direccion.piso) {
                            , {{ direccion.piso }}º
                          }
                          @if (direccion.puerta) {
                            {{ direccion.puerta }}
                          }
                        </div>
                        <div class="direccion-secundaria">
                          {{ direccion.codigoPostal }} {{ direccion.ciudad }}, {{ direccion.provincia }}
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="principal">
                    <th mat-header-cell *matHeaderCellDef>Principal</th>
                    <td mat-cell *matCellDef="let direccion">
                      @if (direccion.esPrincipal) {
                        <mat-icon color="primary">star</mat-icon>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let direccion">
                      <div class="actions-cell">
                        <button mat-icon-button matTooltip="Editar">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button matTooltip="Eliminar" color="warn">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="columnasDirecciones"></tr>
                  <tr mat-row *matRowDef="let row; columns: columnasDirecciones;"></tr>
                </table>
              }
            </div>
          </mat-tab>

          <!-- Tab Cuentas Bancarias -->
          <mat-tab label="Cuentas Bancarias">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Cuentas Bancarias ({{ cuentasBancarias().length }})</h3>
                <button mat-raised-button color="primary" (click)="agregarCuentaBancaria()">
                  <mat-icon>add</mat-icon>
                  Nueva Cuenta
                </button>
              </div>

              @if (cuentasBancarias().length === 0) {
                <div class="empty-state">
                  <mat-icon>account_balance</mat-icon>
                  <p>No hay cuentas bancarias registradas</p>
                  <button mat-button color="primary" (click)="agregarCuentaBancaria()">
                    Agregar primera cuenta
                  </button>
                </div>
              } @else {
                <table mat-table [dataSource]="cuentasBancarias()" class="cuentas-table">
                  <ng-container matColumnDef="banco">
                    <th mat-header-cell *matHeaderCellDef>Banco</th>
                    <td mat-cell *matCellDef="let cuenta">{{ cuenta.banco }}</td>
                  </ng-container>

                  <ng-container matColumnDef="sucursal">
                    <th mat-header-cell *matHeaderCellDef>Sucursal</th>
                    <td mat-cell *matCellDef="let cuenta">{{ cuenta.sucursal }}</td>
                  </ng-container>

                  <ng-container matColumnDef="iban">
                    <th mat-header-cell *matHeaderCellDef>IBAN</th>
                    <td mat-cell *matCellDef="let cuenta">
                      <span class="iban">{{ cuenta.iban }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="swift">
                    <th mat-header-cell *matHeaderCellDef>SWIFT</th>
                    <td mat-cell *matCellDef="let cuenta">{{ cuenta.swift }}</td>
                  </ng-container>

                  <ng-container matColumnDef="principal">
                    <th mat-header-cell *matHeaderCellDef>Principal</th>
                    <td mat-cell *matCellDef="let cuenta">
                      @if (cuenta.esPrincipal) {
                        <mat-icon color="primary">star</mat-icon>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let cuenta">
                      <div class="actions-cell">
                        <button mat-icon-button matTooltip="Editar">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button matTooltip="Eliminar" color="warn">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="columnasCuentas"></tr>
                  <tr mat-row *matRowDef="let row; columns: columnasCuentas;"></tr>
                </table>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .persona-detalle-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      margin-right: 8px;
    }

    .title-content h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 28px;
      font-weight: 500;
    }

    .subtitle {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .codigo {
      font-family: 'Courier New', monospace;
      font-weight: 500;
      color: #666;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
    }

    .tabs-container {
      margin-top: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .tab-header h3 {
      margin: 0;
      color: #1976d2;
    }

    .contacto-card {
      max-width: 600px;
    }

    .contacto-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .contacto-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .contacto-item label {
      font-weight: 500;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }

    .contacto-item span {
      font-size: 14px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .direcciones-table,
    .cuentas-table {
      width: 100%;
    }

    .direccion-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .direccion-principal {
      font-weight: 500;
    }

    .direccion-secundaria {
      font-size: 12px;
      color: #666;
    }

    .iban {
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }

    .actions-cell {
      display: flex;
      gap: 4px;
    }

    @media (max-width: 768px) {
      .persona-detalle-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .contacto-grid {
        grid-template-columns: 1fr;
      }

      .tab-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class PersonaDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  persona = signal<Persona | null>(null);
  direcciones = signal<Direccion[]>([]);
  cuentasBancarias = signal<CuentaBancaria[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  columnasDirecciones = ['tipo', 'direccion', 'principal', 'acciones'];
  columnasCuentas = ['banco', 'sucursal', 'iban', 'swift', 'principal', 'acciones'];

  constructor(private personasService: PersonasService) {}

  ngOnInit(): void {
    this.cargarPersona();
  }

  async cargarPersona(): Promise<void> {
    const personaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!personaId) {
      this.error.set('ID de persona no válido');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const personaDetalle = await this.personasService.obtenerPersonaDetalle(personaId);
      this.persona.set(personaDetalle);
      this.direcciones.set(personaDetalle.direcciones);
      this.cuentasBancarias.set(personaDetalle.cuentasBancarias);
    } catch (error: any) {
      this.error.set(error.message || 'Error al cargar los datos de la persona');
    } finally {
      this.loading.set(false);
    }
  }

  getTipoColor(tipo: string): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case 'cliente': return 'primary';
      case 'proveedor': return 'accent';
      case 'empleado': return 'warn';
      default: return 'primary';
    }
  }

  getTipoDireccionColor(tipo: string): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case 'fiscal': return 'primary';
      case 'envio': return 'accent';
      case 'otro': return 'warn';
      default: return 'primary';
    }
  }

  volver(): void {
    this.router.navigate(['/terceros/personas']);
  }

  editarPersona(): void {
    if (this.persona()) {
      // TODO: Implementar diálogo de edición
      console.log('Editar persona:', this.persona()?.id);
    }
  }

  agregarDireccion(): void {
    // TODO: Implementar diálogo de nueva dirección
    console.log('Agregar dirección para persona:', this.persona()?.id);
  }

  agregarCuentaBancaria(): void {
    // TODO: Implementar diálogo de nueva cuenta bancaria
    console.log('Agregar cuenta bancaria para persona:', this.persona()?.id);
  }
}
