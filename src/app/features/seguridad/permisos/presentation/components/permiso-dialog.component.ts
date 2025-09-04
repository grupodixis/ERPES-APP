import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermisoService } from '../../application/services/permiso.service';
import { Permiso, CreatePermisoDto, UpdatePermisoDto } from '../../domain/entities/permiso.entity';

export interface PermisoDialogData {
  permiso: Permiso | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-permiso-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.isEdit ? 'edit' : 'add' }}</mat-icon>
        {{ data.isEdit ? 'Editar Permiso' : 'Nuevo Permiso' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="permisoForm" class="permiso-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Recurso</mat-label>
              <input matInput 
                     formControlName="recurso" 
                     placeholder="Ej: usuarios, productos, obras..."
                     [readonly]="data.isEdit">
              <mat-hint>Nombre del recurso o entidad</mat-hint>
              <mat-error *ngIf="permisoForm.get('recurso')?.hasError('required')">
                El recurso es requerido
              </mat-error>
              <mat-error *ngIf="permisoForm.get('recurso')?.hasError('pattern')">
                Solo se permiten letras, números y guiones
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Método HTTP</mat-label>
              <mat-select formControlName="metodo" [disabled]="data.isEdit">
                <mat-option *ngFor="let metodo of metodosDisponibles" [value]="metodo">
                  <span [class]="'method-badge method-' + metodo.toLowerCase()">{{ metodo }}</span>
                  - {{ getMetodoDescripcion(metodo) }}
                </mat-option>
              </mat-select>
              <mat-hint>Método HTTP asociado al permiso</mat-hint>
              <mat-error *ngIf="permisoForm.get('metodo')?.hasError('required')">
                El método es requerido
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <input matInput 
                     formControlName="descripcion" 
                     placeholder="Ej: Listar usuarios, Crear producto...">
              <mat-hint>Descripción clara de la acción permitida</mat-hint>
              <mat-error *ngIf="permisoForm.get('descripcion')?.hasError('required')">
                La descripción es requerida
              </mat-error>
              <mat-error *ngIf="permisoForm.get('descripcion')?.hasError('minlength')">
                Mínimo 5 caracteres
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Módulo</mat-label>
              <mat-select formControlName="modulo">
                <mat-option *ngFor="let modulo of modulosDisponibles" [value]="modulo">
                  <mat-icon>{{ getModuloIcon(modulo) }}</mat-icon>
                  {{ modulo }}
                </mat-option>
              </mat-select>
              <mat-hint>Módulo al que pertenece el permiso</mat-hint>
              <mat-error *ngIf="permisoForm.get('modulo')?.hasError('required')">
                El módulo es requerido
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-slide-toggle formControlName="activo" color="primary">
              <span class="toggle-label">
                <mat-icon>{{ permisoForm.get('activo')?.value ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ permisoForm.get('activo')?.value ? 'Activo' : 'Inactivo' }}
              </span>
            </mat-slide-toggle>
          </div>

          <!-- Preview del permiso -->
          <div class="preview-section" *ngIf="showPreview()">
            <h4>Vista previa:</h4>
            <div class="permission-preview">
              <mat-icon>security</mat-icon>
              <span class="resource">{{ permisoForm.get('recurso')?.value }}</span>
              <span [class]="'method-badge method-' + (permisoForm.get('metodo')?.value || '').toLowerCase()">
                {{ permisoForm.get('metodo')?.value }}
              </span>
              <span class="description">{{ permisoForm.get('descripcion')?.value }}</span>
              <span class="module">{{ permisoForm.get('modulo')?.value }}</span>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="loading()">
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSave()"
                [disabled]="!permisoForm.valid || loading()">
          <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!loading()">{{ data.isEdit ? 'save' : 'add' }}</mat-icon>
          {{ data.isEdit ? 'Actualizar' : 'Crear' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
    }

    .mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      color: #1976d2;
    }

    .permiso-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 400px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .method-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      color: white;
    }

    .method-get { background-color: #4caf50; }
    .method-post { background-color: #2196f3; }
    .method-put { background-color: #ff9800; }
    .method-delete { background-color: #f44336; }
    .method-patch { background-color: #9c27b0; }

    .preview-section {
      margin-top: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .preview-section h4 {
      margin: 0 0 12px 0;
      color: #1976d2;
    }

    .permission-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .permission-preview .resource {
      font-weight: 500;
      color: #333;
    }

    .permission-preview .description {
      color: #666;
      font-style: italic;
    }

    .permission-preview .module {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    .mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
    }

    .mat-dialog-actions button {
      margin-left: 8px;
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: unset;
        width: 100%;
      }

      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class PermisoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly permisoService = inject(PermisoService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<PermisoDialogComponent>);

  loading = signal(false);
  permisoForm!: FormGroup;
  
  metodosDisponibles = this.permisoService.getMetodosDisponibles();
  modulosDisponibles = this.permisoService.getModulosDisponibles();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PermisoDialogData
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.permisoForm = this.fb.group({
      recurso: [
        this.data.permiso?.recurso || '', 
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9-_]+$/)]
      ],
      metodo: [
        this.data.permiso?.metodo || '', 
        [Validators.required]
      ],
      descripcion: [
        this.data.permiso?.descripcion || '', 
        [Validators.required, Validators.minLength(5)]
      ],
      modulo: [
        this.data.permiso?.modulo || '', 
        [Validators.required]
      ],
      activo: [
        this.data.permiso?.activo ?? true
      ]
    });

    // Auto-generar descripción basada en recurso y método
    this.permisoForm.get('recurso')?.valueChanges.subscribe(() => this.updateDescripcion());
    this.permisoForm.get('metodo')?.valueChanges.subscribe(() => this.updateDescripcion());
  }

  private updateDescripcion() {
    if (!this.data.isEdit) {
      const recurso = this.permisoForm.get('recurso')?.value;
      const metodo = this.permisoForm.get('metodo')?.value;
      
      if (recurso && metodo) {
        const descripcion = this.generateDescripcion(recurso, metodo);
        this.permisoForm.get('descripcion')?.setValue(descripcion);
      }
    }
  }

  private generateDescripcion(recurso: string, metodo: string): string {
    const acciones: { [key: string]: string } = {
      'GET': 'Listar',
      'POST': 'Crear',
      'PUT': 'Actualizar',
      'DELETE': 'Eliminar',
      'PATCH': 'Modificar'
    };

    const accion = acciones[metodo] || metodo;
    return `${accion} ${recurso}`;
  }

  showPreview(): boolean {
    const form = this.permisoForm;
    return form.get('recurso')?.value && 
           form.get('metodo')?.value && 
           form.get('descripcion')?.value && 
           form.get('modulo')?.value;
  }

  getMetodoDescripcion(metodo: string): string {
    const descripciones: { [key: string]: string } = {
      'GET': 'Consultar/Listar',
      'POST': 'Crear/Insertar',
      'PUT': 'Actualizar completo',
      'DELETE': 'Eliminar',
      'PATCH': 'Actualizar parcial'
    };
    return descripciones[metodo] || metodo;
  }

  getModuloIcon(modulo: string): string {
    const iconos: { [key: string]: string } = {
      'Seguridad': 'security',
      'Configuración': 'settings',
      'Terceros': 'people',
      'Productos': 'inventory',
      'Obras': 'construction',
      'Presupuestos': 'calculate',
      'Comercial': 'business',
      'Finanzas': 'account_balance',
      'Logística': 'local_shipping',
      'Contabilidad': 'receipt',
      'RRHH': 'group',
      'Calidad': 'verified',
      'Producción': 'precision_manufacturing'
    };
    return iconos[modulo] || 'folder';
  }

  onSave() {
    if (this.permisoForm.valid) {
      this.loading.set(true);
      
      const formValue = this.permisoForm.value;
      
      if (this.data.isEdit && this.data.permiso) {
        const updateDto: UpdatePermisoDto = {
          descripcion: formValue.descripcion,
          modulo: formValue.modulo,
          activo: formValue.activo
        };
        
        this.permisoService.updatePermiso(this.data.permiso.id, updateDto).subscribe({
          next: (permiso) => {
            this.loading.set(false);
            this.dialogRef.close(permiso);
          },
          error: (error) => {
            this.loading.set(false);
            this.snackBar.open(error.message || 'Error al actualizar el permiso', 'Cerrar', {
              duration: 5000
            });
          }
        });
      } else {
        const createDto: CreatePermisoDto = {
          recurso: formValue.recurso,
          metodo: formValue.metodo,
          descripcion: formValue.descripcion,
          modulo: formValue.modulo,
          activo: formValue.activo
        };
        
        this.permisoService.createPermiso(createDto).subscribe({
          next: (permiso) => {
            this.loading.set(false);
            this.dialogRef.close(permiso);
          },
          error: (error) => {
            this.loading.set(false);
            this.snackBar.open(error.message || 'Error al crear el permiso', 'Cerrar', {
              duration: 5000
            });
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}