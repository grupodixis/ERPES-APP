import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthStore } from '../../core/stores/auth.store';
import { LoginRequest } from '../../domain/auth.types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
          <mat-card-subtitle>ERP Angular</mat-card-subtitle>
        </mat-card-header>
    
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input
                matInput
                formControlName="username"
                placeholder="admin"
                autocomplete="username"
                />
                <mat-icon matSuffix>person</mat-icon>
                @if (loginForm.get('username')?.hasError('required')) {
                  <mat-error>
                    El usuario es requerido
                  </mat-error>
                }
              </mat-form-field>
    
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input
                  matInput
                  type="password"
                  formControlName="password"
                  placeholder="admin"
                  autocomplete="current-password"
                  />
                  <mat-icon matSuffix>lock</mat-icon>
                  @if (loginForm.get('password')?.hasError('required')) {
                    <mat-error>
                      La contraseña es requerida
                    </mat-error>
                  }
                </mat-form-field>
    
                <div class="login-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    [disabled]="loginForm.invalid || isLoading"
                    class="full-width"
                    >
                    @if (isLoading) {
                      <mat-spinner
                        diameter="20"
                        class="spinner-margin"
                      ></mat-spinner>
                    }
                    {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                  </button>
                </div>
    
                <div class="demo-info">
                  <p><strong>Credenciales de demo:</strong></p>
                  <p>Usuario: <code>admin</code></p>
                  <p>Contraseña: <code>admin</code></p>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
    `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      max-width: 400px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .login-actions {
      margin-top: 24px;
    }

    .spinner-margin {
      margin-right: 8px;
    }

    .demo-info {
      margin-top: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      border-left: 4px solid #1976d2;
    }

    .demo-info p {
      margin: 4px 0;
      font-size: 14px;
    }

    .demo-info code {
      background-color: #e0e0e0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    // Dark theme styles
    :host-context(.dark-theme) {
      .login-container {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
      }

      .mat-mdc-form-field.mat-form-field-appearance-outline {
        .mat-mdc-form-field-outline {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        
        &.mat-focused .mat-mdc-form-field-outline {
          color: #4dd0e1 !important;
        }
      }

      .demo-info {
        background-color: #2d2d2d !important;
        border-left-color: #4dd0e1 !important;
        color: rgba(255, 255, 255, 0.87) !important;
      }

      .demo-info code {
        background-color: #3d3d3d !important;
        color: rgba(255, 255, 255, 0.87) !important;
      }
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 10px;
      }
      
      .login-card {
        max-width: 100%;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    // Obtener URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  async onSubmit(): Promise<void> {
    console.log('🔑 LoginComponent.onSubmit() - Iniciando login...');
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const credentials: LoginRequest = this.loginForm.value;
      console.log('🔑 LoginComponent.onSubmit() - Credenciales:', { username: credentials.username, password: '***' });
      
      try {
        console.log('🔑 LoginComponent.onSubmit() - Llamando a authStore.login()...');
        const success = await this.authStore.login(credentials);
        console.log('🔑 LoginComponent.onSubmit() - Resultado del login:', success);
        
        if (success) {
          // Redirigir al dashboard después del login exitoso
          const targetUrl = this.returnUrl === '/' ? '/dashboard' : this.returnUrl;
          console.log('🔑 LoginComponent.onSubmit() - Login exitoso, redirigiendo a:', targetUrl);
          this.router.navigate([targetUrl]);
        } else {
          console.log('🔑 LoginComponent.onSubmit() - Login falló');
        }
      } catch (error) {
        console.error('❌ LoginComponent.onSubmit() - Error en login:', error);
      } finally {
        this.isLoading = false;
        console.log('🔑 LoginComponent.onSubmit() - Finalizado');
      }
    } else {
      console.log('🔑 LoginComponent.onSubmit() - Formulario inválido');
    }
  }
}
