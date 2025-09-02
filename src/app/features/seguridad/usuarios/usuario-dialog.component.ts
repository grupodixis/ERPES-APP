import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { UsuariosService } from './usuarios.service';
import { User, Role, Empresa } from '../../../domain/auth.types';

export interface UsuarioDialogData {
  usuario?: User;
  roles: Role[];
  empresas: Empresa[];
  isEdit: boolean;
}

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="usuario-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.isEdit ? 'edit' : 'person_add' }}</mat-icon>
        {{ data.isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}
      </h2>
    
      <form [formGroup]="usuarioForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-sections">
            <!-- Datos básicos -->
            <div class="form-section">
              <h3>Datos Personales</h3>
    
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="nombre" placeholder="Nombre del usuario">
                  @if (usuarioForm.get('nombre')?.hasError('required')) {
                    <mat-error>
                      El nombre es requerido
                    </mat-error>
                  }
                </mat-form-field>
    
                <mat-form-field appearance="outline">
                  <mat-label>Apellidos</mat-label>
                  <input matInput formControlName="apellidos" placeholder="Apellidos del usuario">
                  @if (usuarioForm.get('apellidos')?.hasError('required')) {
                    <mat-error>
                      Los apellidos son requeridos
                    </mat-error>
                  }
                </mat-form-field>
              </div>
    
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email" placeholder="email@ejemplo.com">
                  @if (usuarioForm.get('email')?.hasError('required')) {
                    <mat-error>
                      El email es requerido
                    </mat-error>
                  }
                  @if (usuarioForm.get('email')?.hasError('email')) {
                    <mat-error>
                      Formato de email inválido
                    </mat-error>
                  }
                </mat-form-field>
    
                <mat-form-field appearance="outline">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="username" placeholder="Nombre de usuario">
                  @if (usuarioForm.get('username')?.hasError('required')) {
                    <mat-error>
                      El username es requerido
                    </mat-error>
                  }
                </mat-form-field>
              </div>
            </div>
    
            <mat-divider></mat-divider>
    
            <!-- Configuración -->
            <div class="form-section">
              <h3>Configuración</h3>
    
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Empresa</mat-label>
                  <mat-select formControlName="empresaId">
                    @for (empresa of data.empresas; track empresa.id) {
                      <mat-option [value]="empresa.id">{{ empresa.nombre }}</mat-option>
                    }
                  </mat-select>
                  @if (usuarioForm.get('empresaId')?.hasError('required')) {
                    <mat-error>
                      La empresa es requerida
                    </mat-error>
                  }
                </mat-form-field>
    
                <mat-form-field appearance="outline">
                  <mat-label>Roles</mat-label>
                  <mat-select formControlName="roles" multiple>
                    @for (role of data.roles; track role.id) {
                      <mat-option [value]="role">{{ role.nombre }}</mat-option>
                    }
                  </mat-select>
                  @if (usuarioForm.get('roles')?.hasError('required')) {
                    <mat-error>
                      Al menos un rol es requerido
                    </mat-error>
                  }
                </mat-form-field>
              </div>
    
              <div class="form-row">
                <mat-slide-toggle formControlName="activo" color="primary">
                  Usuario activo
                </mat-slide-toggle>
              </div>
            </div>
    
            <!-- Contraseña (solo para nuevos usuarios) -->
            @if (!data.isEdit) {
              <mat-divider></mat-divider>
    
              <div class="form-section">
                <h3>Contraseña</h3>
    
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Contraseña</mat-label>
                    <input matInput formControlName="password" type="password" placeholder="Contraseña">
                    @if (usuarioForm.get('password')?.hasError('required')) {
                      <mat-error>
                        La contraseña es requerida
                      </mat-error>
                    }
                    @if (usuarioForm.get('password')?.hasError('minlength')) {
                      <mat-error>
                        La contraseña debe tener al menos 6 caracteres
                      </mat-error>
                    }
                  </mat-form-field>
    
                  <mat-form-field appearance="outline">
                    <mat-label>Confirmar Contraseña</mat-label>
                    <input matInput formControlName="confirmPassword" type="password" placeholder="Confirmar contraseña">
                    @if (usuarioForm.get('confirmPassword')?.hasError('required')) {
                      <mat-error>
                        Confirmar contraseña es requerido
                      </mat-error>
                    }
                    @if (usuarioForm.get('confirmPassword')?.hasError('passwordMismatch')) {
                      <mat-error>
                        Las contraseñas no coinciden
                      </mat-error>
                    }
                  </mat-form-field>
                </div>
              </div>
            }
          </div>
        </mat-dialog-content>
    
        <mat-dialog-actions align="end">
          <button type="button" mat-button (click)="onCancel()">
            Cancelar
          </button>
          <button
            type="submit"
            mat-raised-button
            color="primary"
            [disabled]="usuarioForm.invalid || loading">
            <mat-icon>{{ data.isEdit ? 'save' : 'add' }}</mat-icon>
            {{ data.isEdit ? 'Guardar' : 'Crear' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
    `,
  styles: [`
    .usuario-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-section h3 {
      margin-bottom: 16px;
      color: #333;
      font-size: 1.1em;
      font-weight: 500;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .form-row mat-slide-toggle {
      margin-top: 16px;
    }

    mat-divider {
      margin: 20px 0;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }

    .role-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .role-chip {
      margin: 2px;
    }
  `]
})
export class UsuarioDialogComponent implements OnInit {
  usuarioForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioDialogData,
    private usuariosService: UsuariosService,
    private toastService: ToastService
  ) {
    this.usuarioForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.usuario) {
      this.patchForm(this.data.usuario);
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      empresaId: [null, Validators.required],
      roles: [[], Validators.required],
      activo: [true],
      password: [''],
      confirmPassword: ['']
    });

    // Validación de contraseñas
    if (!this.data.isEdit) {
      form.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(6)
      ]);
      form.get('confirmPassword')?.setValidators([
        Validators.required,
        this.passwordMatchValidator.bind(this)
      ]);
    }

    return form;
  }

  private patchForm(usuario: User): void {
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      username: usuario.username,
      empresaId: usuario.empresaId,
      roles: usuario.roles,
      activo: usuario.activo
    });
  }

  private passwordMatchValidator(control: any): { [key: string]: any } | null {
    const password = this.usuarioForm?.get('password')?.value;
    const confirmPassword = control.value;
    
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.usuarioForm.invalid) {
      return;
    }

    this.loading = true;

    try {
      const formValue = this.usuarioForm.value;
      const usuarioData = {
        nombre: formValue.nombre,
        apellidos: formValue.apellidos,
        email: formValue.email,
        username: formValue.username,
        empresaId: formValue.empresaId,
        roles: formValue.roles,
        activo: formValue.activo,
        password: formValue.password
      };

      let result: User | null;

      if (this.data.isEdit && this.data.usuario) {
        result = await this.usuariosService.actualizarUsuario(
          this.data.usuario.id,
          usuarioData
        );
        this.toastService.showSuccess('Usuario actualizado correctamente');
      } else {
        result = await this.usuariosService.crearUsuario(usuarioData);
        this.toastService.showSuccess('Usuario creado correctamente');
      }

      this.dialogRef.close(result);
    } catch (error: any) {
      this.toastService.showError(error.message || 'Error al guardar usuario');
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
