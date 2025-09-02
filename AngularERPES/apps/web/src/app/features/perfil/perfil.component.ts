import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="perfil-container">
      <mat-card class="perfil-card">
        <mat-card-header>
          <div mat-card-avatar class="perfil-avatar">
            <mat-icon>person</mat-icon>
          </div>
          <mat-card-title>Perfil de Usuario</mat-card-title>
          <mat-card-subtitle>Gestiona tu información personal</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="perfilForm" class="perfil-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" placeholder="Ingresa tu nombre">
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="apellido" placeholder="Ingresa tu apellido">
                <mat-icon matSuffix>person_outline</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="tu@email.com">
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="telefono" placeholder="+34 123 456 789">
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cargo</mat-label>
              <input matInput formControlName="cargo" placeholder="Tu cargo en la empresa">
              <mat-icon matSuffix>work</mat-icon>
            </mat-form-field>

            <mat-divider></mat-divider>

            <div class="roles-section">
              <h3>Roles Asignados</h3>
              <div class="roles-chips">
                <mat-chip-set>
                  <mat-chip *ngFor="let rol of userRoles()">
                    <mat-icon matChipAvatar>security</mat-icon>
                    {{ rol }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="info-section">
              <h3>Información de Sesión</h3>
              <div class="info-grid">
                <div class="info-item">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <span class="info-label">Último acceso</span>
                    <span class="info-value">{{ lastLogin() }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>computer</mat-icon>
                  <div>
                    <span class="info-label">Sesiones activas</span>
                    <span class="info-value">{{ activeSessions() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="cancelar()">
            <mat-icon>cancel</mat-icon>
            Cancelar
          </button>
          <button mat-raised-button color="primary" (click)="guardar()" [disabled]="perfilForm.invalid">
            <mat-icon>save</mat-icon>
            Guardar Cambios
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .perfil-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .perfil-card {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
    }

    .perfil-avatar {
      background-color: var(--status-info);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }

    .perfil-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .roles-section {
      margin: 16px 0;
    }

    .roles-section h3 {
      margin: 0 0 12px 0;
      color: var(--text-primary);
      font-size: 16px;
      font-weight: 500;
    }

    .roles-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .info-section {
      margin: 16px 0;
    }

    .info-section h3 {
      margin: 0 0 16px 0;
      color: var(--text-primary);
      font-size: 16px;
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: var(--surface-variant);
      border-radius: 8px;
    }

    .info-item mat-icon {
      color: var(--status-info);
    }

    .info-item div {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .info-value {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 400;
    }

    mat-card-actions {
      padding: 16px 24px;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .perfil-container {
        padding: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PerfilComponent {
  perfilForm: FormGroup;
  userRoles = signal(['Administrador', 'Usuario']);
  lastLogin = signal('Hoy, 09:30 AM');
  activeSessions = signal('2');

  constructor(
    private fb: FormBuilder,
    private authStore: AuthStore
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['Juan', [Validators.required, Validators.minLength(2)]],
      apellido: ['Pérez', [Validators.required, Validators.minLength(2)]],
      email: ['juan.perez@empresa.com', [Validators.required, Validators.email]],
      telefono: ['+34 123 456 789', [Validators.required]],
      cargo: ['Gerente de Sistemas', [Validators.required]]
    });
  }

  guardar(): void {
    if (this.perfilForm.valid) {
      console.log('Guardando perfil:', this.perfilForm.value);
      // Aquí implementarías la lógica para guardar el perfil
    }
  }

  cancelar(): void {
    this.perfilForm.reset();
    // Aquí podrías navegar de vuelta o resetear el formulario
  }
}