import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ToastService } from '../../../core/services/toast.service';
import { UsuariosService } from './usuarios.service';
import { User, Role } from '../../../domain/auth.types';

export interface AsignarRolesDialogData {
  usuario: User;
  rolesDisponibles: Role[];
}

@Component({
  selector: 'app-asignar-roles-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatListModule,
    MatDividerModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="asignar-roles-dialog">
      <h2 mat-dialog-title>
        <mat-icon>security</mat-icon>
        Asignar Roles
      </h2>

      <mat-dialog-content>
        <div class="usuario-info">
          <h3>{{ data.usuario.nombre }} {{ data.usuario.apellidos }}</h3>
          <p class="email">{{ data.usuario.email }}</p>
          
          <div class="current-roles">
            <h4>Roles actuales:</h4>
            @if (data.usuario.roles.length > 0) {
              <mat-chip-set>
                @for (role of data.usuario.roles; track role.id) {
                  <mat-chip color="primary" selected>{{ role.nombre }}</mat-chip>
                }
              </mat-chip-set>
            } @else {
              <p class="no-roles">Sin roles asignados</p>
            }
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="roles-section">
          <h4>Seleccionar roles:</h4>
          <p class="hint">Los roles seleccionados reemplazarán los roles actuales del usuario.</p>
          
          <mat-list>
            @for (role of data.rolesDisponibles; track role.id) {
              <mat-list-item>
                <mat-checkbox
                  [checked]="isRoleSelected(role)"
                  (change)="toggleRole(role, $event.checked)">
                  <div class="role-info">
                    <div class="role-name">{{ role.nombre }}</div>
                    <div class="role-description">{{ role.descripcion }}</div>
                  </div>
                </mat-checkbox>
              </mat-list-item>
            }
          </mat-list>
        </div>

        @if (selectedRoles.length > 0) {
          <mat-divider></mat-divider>
          
          <div class="selected-summary">
            <h4>Roles a asignar ({{ selectedRoles.length }}):</h4>
            <mat-chip-set>
              @for (role of selectedRoles; track role.id) {
                <mat-chip color="accent" selected>{{ role.nombre }}</mat-chip>
              }
            </mat-chip-set>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button type="button" mat-button (click)="onCancel()">
          Cancelar
        </button>
        <button 
          type="button" 
          mat-raised-button 
          color="primary"
          (click)="onSave()"
          [disabled]="loading">
          <mat-icon>save</mat-icon>
          Guardar Cambios
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .asignar-roles-dialog {
      min-width: 500px;
      max-width: 700px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .usuario-info {
      margin-bottom: 20px;
    }

    .usuario-info h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.2em;
    }

    .email {
      color: #666;
      margin: 0 0 16px 0;
    }

    .current-roles {
      margin-top: 16px;
    }

    .current-roles h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1em;
    }

    .no-roles {
      color: #999;
      font-style: italic;
      margin: 8px 0;
    }

    .roles-section {
      margin: 20px 0;
    }

    .roles-section h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1em;
    }

    .hint {
      color: #666;
      font-size: 0.9em;
      margin: 0 0 16px 0;
    }

    .role-info {
      margin-left: 8px;
    }

    .role-name {
      font-weight: 500;
      color: #333;
    }

    .role-description {
      font-size: 0.9em;
      color: #666;
      margin-top: 2px;
    }

    .selected-summary {
      margin: 20px 0;
    }

    .selected-summary h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1em;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }

    mat-list-item {
      height: auto;
      padding: 8px 0;
    }

    mat-checkbox {
      width: 100%;
    }
  `]
})
export class AsignarRolesDialogComponent implements OnInit {
  selectedRoles: Role[] = [];
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<AsignarRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AsignarRolesDialogData,
    private usuariosService: UsuariosService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Inicializar con los roles actuales del usuario
    this.selectedRoles = [...this.data.usuario.roles];
  }

  isRoleSelected(role: Role): boolean {
    return this.selectedRoles.some(r => r.id === role.id);
  }

  toggleRole(role: Role, checked: boolean): void {
    if (checked) {
      if (!this.isRoleSelected(role)) {
        this.selectedRoles.push(role);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r.id !== role.id);
    }
  }

  async onSave(): Promise<void> {
    this.loading = true;

    try {
      await this.usuariosService.asignarRoles(this.data.usuario.id, this.selectedRoles);
      
      this.toastService.showSuccess('Roles asignados correctamente');
      this.dialogRef.close(this.selectedRoles);
    } catch (error: any) {
      this.toastService.showError(error.message || 'Error al asignar roles');
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
