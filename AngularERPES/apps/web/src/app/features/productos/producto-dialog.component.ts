import { ChangeDetectionStrategy, Component, Inject, OnInit, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CategoriasProductosService } from '../../application/services/categorias-productos.service';
import { CategoriaVM, TipoProducto } from '../../domain/productos.types';

export interface ProductoDialogData {
  mode: 'create' | 'edit';
  categoria?: CategoriaVM;
}

@Component({
  selector: 'app-producto-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressBarModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="producto-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.mode === 'create' ? 'add' : 'edit' }}</mat-icon>
        {{ data.mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría' }}
      </h2>
    
      @if (loading) {
        <mat-progress-bar
          mode="indeterminate"
          class="progress-bar">
        </mat-progress-bar>
      }
    
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="dialog-content">
          <div class="form-row">
            <mat-form-field appearance="outline" class="codigo-field">
              <mat-label>Código</mat-label>
              <input
                matInput
                formControlName="codigo"
                placeholder="Ej: BAR001"
                [readonly]="data.mode === 'edit'">
                @if (form.get('codigo')?.hasError('required')) {
                  <mat-error>
                    El código es obligatorio
                  </mat-error>
                }
                @if (form.get('codigo')?.hasError('minlength')) {
                  <mat-error>
                    El código debe tener al menos 3 caracteres
                  </mat-error>
                }
                @if (form.get('codigo')?.hasError('pattern')) {
                  <mat-error>
                    El código debe contener solo letras, números y guiones
                  </mat-error>
                }
                @if (form.get('codigo')?.hasError('duplicate')) {
                  <mat-error>
                    Este código ya existe
                  </mat-error>
                }
              </mat-form-field>
    
              <mat-form-field appearance="outline" class="nombre-field">
                <mat-label>Nombre</mat-label>
                <input
                  matInput
                  formControlName="nombre"
                  placeholder="Ej: Barandillas de Acero">
                  @if (form.get('nombre')?.hasError('required')) {
                    <mat-error>
                      El nombre es obligatorio
                    </mat-error>
                  }
                  @if (form.get('nombre')?.hasError('minlength')) {
                    <mat-error>
                      El nombre debe tener al menos 3 caracteres
                    </mat-error>
                  }
                  @if (form.get('nombre')?.hasError('duplicate')) {
                    <mat-error>
                      Este nombre ya existe
                    </mat-error>
                  }
                </mat-form-field>
              </div>
    
              <mat-form-field appearance="outline" class="descripcion-field">
                <mat-label>Descripción</mat-label>
                <textarea
                  matInput
                  formControlName="descripcion"
                  placeholder="Descripción opcional de la categoría"
                  rows="3">
                </textarea>
                <mat-hint>Opcional. Proporciona más detalles sobre esta categoría.</mat-hint>
              </mat-form-field>
    
              <div class="form-row">
                <mat-form-field appearance="outline" class="tipo-field">
                  <mat-label>Tipo de Producto</mat-label>
                  <mat-select formControlName="tipoProducto">
                    <mat-option value="barandilla">Barandilla</mat-option>
                    <mat-option value="puerta">Puerta</mat-option>
                    <mat-option value="ventana">Ventana</mat-option>
                    <mat-option value="escalera">Escalera</mat-option>
                    <mat-option value="cerramiento">Cerramiento</mat-option>
                    <mat-option value="estructura">Estructura</mat-option>
                    <mat-option value="acabado">Acabado</mat-option>
                    <mat-option value="instalacion">Instalación</mat-option>
                  </mat-select>
                  @if (form.get('tipoProducto')?.hasError('required')) {
                    <mat-error>
                      El tipo de producto es obligatorio
                    </mat-error>
                  }
                </mat-form-field>
    
                <mat-form-field appearance="outline" class="padre-field">
                  <mat-label>Categoría Padre</mat-label>
                  <mat-select formControlName="categoriaPadreId">
                    <mat-option [value]="null">Sin categoría padre (Raíz)</mat-option>
                    @for (categoria of categoriasPadre; track categoria.id) {
                      <mat-option [value]="categoria.id">
                        {{ categoria.codigo }} - {{ categoria.nombre }}
                      </mat-option>
                    }
                  </mat-select>
                  <mat-hint>Opcional. Selecciona una categoría padre para crear jerarquía.</mat-hint>
                </mat-form-field>
              </div>
    
              <div class="form-row">
                <mat-slide-toggle
                  formControlName="activa"
                  color="primary"
                  class="activa-toggle">
                  Categoría activa
                </mat-slide-toggle>
              </div>
            </mat-dialog-content>
    
            <mat-dialog-actions align="end" class="dialog-actions">
              <button
                type="button"
                mat-button
                (click)="onCancel()"
                [disabled]="loading">
                Cancelar
              </button>
              <button
                type="submit"
                mat-raised-button
                color="primary"
                [disabled]="form.invalid || loading">
                <mat-icon>{{ data.mode === 'create' ? 'add' : 'save' }}</mat-icon>
                {{ data.mode === 'create' ? 'Crear' : 'Guardar' }}
              </button>
            </mat-dialog-actions>
          </form>
        </div>
    `,
  styles: [`
    .producto-dialog {
      min-width: 500px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 16px 24px 0;
    }

    .progress-bar {
      margin-top: 8px;
    }

    .dialog-content {
      padding: 16px 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row > * {
      flex: 1;
    }

    .codigo-field {
      flex: 0 0 40%;
    }

    .nombre-field {
      flex: 0 0 60%;
    }

    .tipo-field {
      flex: 0 0 50%;
    }

    .padre-field {
      flex: 0 0 50%;
    }

    .descripcion-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .activa-toggle {
      margin: 16px 0;
    }

    .dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    .dialog-actions button {
      min-width: 100px;
    }

    @media (max-width: 600px) {
      .producto-dialog {
        min-width: auto;
        width: 100%;
        max-width: 100vw;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }

      .form-row > * {
        flex: none;
      }
    }
  `]
})
export class ProductoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriasService = inject(CategoriasProductosService);
  private dialogRef = inject(MatDialogRef<ProductoDialogComponent>);

  // Input data
  data: ProductoDialogData = inject(MAT_DIALOG_DATA);

  // Form
  form!: FormGroup;
  loading = false;
  categoriasPadre: CategoriaVM[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadCategoriasPadre();
    
    if (this.data.mode === 'edit' && this.data.categoria) {
      this.patchForm(this.data.categoria);
    } else {
      this.generateCodigo();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      codigo: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Z0-9-]+$/)
      ]],
      nombre: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      descripcion: [''],
      tipoProducto: ['barandilla', Validators.required],
      categoriaPadreId: [null],
      activa: [true]
    });

    // Validaciones asíncronas
    this.setupAsyncValidators();
  }

  private setupAsyncValidators(): void {
    // Validar código único
    this.form.get('codigo')?.valueChanges.subscribe(async (value) => {
      if (value && this.form.get('codigo')?.valid) {
        const isUnique = await this.categoriasService.validarCodigoUnico(
          value, 
          this.data.mode === 'edit' ? this.data.categoria?.id : undefined
        );
        
        if (!isUnique) {
          this.form.get('codigo')?.setErrors({ duplicate: true });
        }
      }
    });

    // Validar nombre único
    this.form.get('nombre')?.valueChanges.subscribe(async (value) => {
      if (value && this.form.get('nombre')?.valid) {
        const isUnique = await this.categoriasService.validarNombreUnico(
          value, 
          this.data.mode === 'edit' ? this.data.categoria?.id : undefined
        );
        
        if (!isUnique) {
          this.form.get('nombre')?.setErrors({ duplicate: true });
        }
      }
    });
  }

  private async loadCategoriasPadre(): Promise<void> {
    try {
      const response = await this.categoriasService.list({ activa: true });
      this.categoriasPadre = response.data.filter(cat => 
        this.data.mode === 'edit' ? cat.id !== this.data.categoria?.id : true
      );
    } catch (error) {
      console.error('Error loading parent categories:', error);
    }
  }

  private async generateCodigo(): Promise<void> {
    try {
      const codigo = await this.categoriasService.generarCodigoSiguiente();
      this.form.patchValue({ codigo });
    } catch (error) {
      console.error('Error generating code:', error);
    }
  }

  private patchForm(categoria: CategoriaVM): void {
    this.form.patchValue({
      codigo: categoria.codigo,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      tipoProducto: 'barandilla',
      categoriaPadreId: categoria.categoriaPadreId,
      activa: categoria.activa
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    try {
      const formValue = this.form.value;
      const dto = {
        ...formValue,
        // Campos adicionales requeridos por el DTO
        tipoArticulo: 'simple' as any,
        estado: 'activo' as any,
        unidadMedidaVentaId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        puntoReorden: 0,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false
      };

      if (this.data.mode === 'create') {
        await this.categoriasService.create(dto);
      } else {
        await this.categoriasService.update(this.data.categoria!.id, dto);
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error saving categoria:', error);
      // El error se maneja en el store
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
