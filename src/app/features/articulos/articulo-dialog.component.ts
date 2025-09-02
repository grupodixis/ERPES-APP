import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

import { TipoArticuloVM, CreateTipoArticuloDto, UpdateTipoArticuloDto } from '../../domain/articulos.types';
import { ArticulosService } from '../../application/services/articulos.service';
import { ToastService } from '../../core/services/toast.service';

interface DialogData {
  mode: 'create' | 'edit';
  articulo?: TipoArticuloVM;
}

@Component({
  selector: 'app-articulo-dialog',
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
    MatDividerModule,
    MatCardModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="articulo-dialog scale-in">
      <div class="dialog-header">
        <h2 class="dialog-title">
          <mat-icon class="title-icon">{{ data.mode === 'create' ? 'add_circle' : 'edit' }}</mat-icon>
          <span class="title-text">{{ data.mode === 'create' ? 'Nuevo Artículo' : 'Editar Artículo' }}</span>
        </h2>
      </div>
    
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-form">
        <div class="dialog-content">
          <!-- Información Básica -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon class="section-icon">info</mat-icon>
              Información Básica
            </h3>
    
            <div class="form-grid">
              <!-- Código -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Código *</mat-label>
                <input
                  matInput
                  formControlName="codigo"
                  placeholder="Código del artículo"
                  [readonly]="data.mode === 'edit'">
                  <mat-icon matSuffix class="field-icon">qr_code</mat-icon>
                  @if (form.get('codigo')?.hasError('required')) {
                    <mat-error>
                      El código es obligatorio
                    </mat-error>
                  }
                  @if (form.get('codigo')?.hasError('codigoExiste')) {
                    <mat-error>
                      El código ya existe
                    </mat-error>
                  }
                </mat-form-field>
    
                <!-- Nombre -->
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Nombre *</mat-label>
                  <input
                    matInput
                    formControlName="nombre"
                    placeholder="Nombre del artículo">
                    <mat-icon matSuffix class="field-icon">label</mat-icon>
                    @if (form.get('nombre')?.hasError('required')) {
                      <mat-error>
                        El nombre es obligatorio
                      </mat-error>
                    }
                    @if (form.get('nombre')?.hasError('nombreExiste')) {
                      <mat-error>
                        El nombre ya existe
                      </mat-error>
                    }
                  </mat-form-field>
    
                  <!-- Descripción -->
                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Descripción</mat-label>
                    <textarea
                      matInput
                      formControlName="descripcion"
                      placeholder="Descripción del artículo"
                    rows="3"></textarea>
                    <mat-icon matSuffix class="field-icon">description</mat-icon>
                  </mat-form-field>
                </div>
              </div>
    
              <mat-divider class="section-divider"></mat-divider>
    
              <!-- Unidades de Medida -->
              <div class="form-section">
                <h3 class="section-title">
                  <mat-icon class="section-icon">straighten</mat-icon>
                  Unidades de Medida
                </h3>
    
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>UM Stock *</mat-label>
                    <mat-select formControlName="umStock">
                      @for (um of unidadesMedida(); track um) {
                        <mat-option [value]="um">{{ um }}</mat-option>
                      }
                    </mat-select>
                    <mat-icon matSuffix class="field-icon">inventory</mat-icon>
                    @if (form.get('umStock')?.hasError('required')) {
                      <mat-error>
                        La unidad de medida es obligatoria
                      </mat-error>
                    }
                  </mat-form-field>
    
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>UM Venta Default *</mat-label>
                    <mat-select formControlName="umVentaDefault">
                      @for (um of unidadesMedida(); track um) {
                        <mat-option [value]="um">{{ um }}</mat-option>
                      }
                    </mat-select>
                    <mat-icon matSuffix class="field-icon">point_of_sale</mat-icon>
                    @if (form.get('umVentaDefault')?.hasError('required')) {
                      <mat-error>
                        La unidad de venta es obligatoria
                      </mat-error>
                    }
                  </mat-form-field>
    
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Factor Compra → Venta *</mat-label>
                    <input
                      matInput
                      type="number"
                      formControlName="factorCompraAVenta"
                      placeholder="1.0"
                      step="0.01"
                      min="0.01">
                      <mat-icon matSuffix class="field-icon">calculate</mat-icon>
                      @if (form.get('factorCompraAVenta')?.hasError('required')) {
                        <mat-error>
                          El factor es obligatorio
                        </mat-error>
                      }
                      @if (form.get('factorCompraAVenta')?.hasError('min')) {
                        <mat-error>
                          El factor debe ser mayor a 0
                        </mat-error>
                      }
                    </mat-form-field>
                  </div>
                </div>
    
                <mat-divider class="section-divider"></mat-divider>
    
                <!-- Stock y Precios -->
                <div class="form-section">
                  <h3 class="section-title">
                    <mat-icon class="section-icon">warehouse</mat-icon>
                    Stock y Precios
                  </h3>
    
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Stock Mínimo *</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="stockMinimo"
                        placeholder="0"
                        min="0">
                        <mat-icon matSuffix class="field-icon">warning</mat-icon>
                        @if (form.get('stockMinimo')?.hasError('required')) {
                          <mat-error>
                            El stock mínimo es obligatorio
                          </mat-error>
                        }
                        @if (form.get('stockMinimo')?.hasError('min')) {
                          <mat-error>
                            El stock mínimo debe ser mayor o igual a 0
                          </mat-error>
                        }
                      </mat-form-field>
    
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Stock Máximo</mat-label>
                        <input
                          matInput
                          type="number"
                          formControlName="stockMaximo"
                          placeholder="Opcional"
                          min="0">
                          <mat-icon matSuffix class="field-icon">inventory_2</mat-icon>
                          @if (form.get('stockMaximo')?.hasError('min')) {
                            <mat-error>
                              El stock máximo debe ser mayor o igual a 0
                            </mat-error>
                          }
                        </mat-form-field>
    
                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Precio Compra</mat-label>
                          <input
                            matInput
                            type="number"
                            formControlName="precioCompra"
                            placeholder="0.00"
                            step="0.01"
                            min="0">
                            <mat-icon matSuffix class="field-icon">euro</mat-icon>
                            @if (form.get('precioCompra')?.hasError('min')) {
                              <mat-error>
                                El precio debe ser mayor o igual a 0
                              </mat-error>
                            }
                          </mat-form-field>
    
                          <mat-form-field appearance="outline" class="form-field">
                            <mat-label>Precio Venta</mat-label>
                            <input
                              matInput
                              type="number"
                              formControlName="precioVenta"
                              placeholder="0.00"
                              step="0.01"
                              min="0">
                              <mat-icon matSuffix class="field-icon">attach_money</mat-icon>
                              @if (form.get('precioVenta')?.hasError('min')) {
                                <mat-error>
                                  El precio debe ser mayor o igual a 0
                                </mat-error>
                              }
                            </mat-form-field>
                          </div>
                        </div>
    
                        <mat-divider class="section-divider"></mat-divider>
    
                        <!-- Categorización -->
                        <div class="form-section">
                          <h3 class="section-title">
                            <mat-icon class="section-icon">category</mat-icon>
                            Categorización
                          </h3>
    
                          <div class="form-grid">
                            <mat-form-field appearance="outline" class="form-field">
                              <mat-label>Categoría</mat-label>
                              <mat-select formControlName="categoriaId">
                                <mat-option [value]="null">Sin categoría</mat-option>
                                @for (categoria of categorias(); track categoria.id) {
                                  <mat-option [value]="categoria.id">{{ categoria.nombre }}</mat-option>
                                }
                              </mat-select>
                              <mat-icon matSuffix class="field-icon">folder</mat-icon>
                            </mat-form-field>
    
                            <mat-form-field appearance="outline" class="form-field">
                              <mat-label>Tipo IVA *</mat-label>
                              <mat-select formControlName="ivaId">
                                @for (iva of tiposIVA(); track iva.id) {
                                  <mat-option [value]="iva.id">{{ iva.nombre }} ({{ iva.porcentaje }}%)</mat-option>
                                }
                              </mat-select>
                              <mat-icon matSuffix class="field-icon">receipt</mat-icon>
                              @if (form.get('ivaId')?.hasError('required')) {
                                <mat-error>
                                  El tipo de IVA es obligatorio
                                </mat-error>
                              }
                            </mat-form-field>
                          </div>
                        </div>
    
                        <mat-divider class="section-divider"></mat-divider>
    
                        <!-- Características -->
                        <div class="form-section">
                          <h3 class="section-title">
                            <mat-icon class="section-icon">settings</mat-icon>
                            Características
                          </h3>
    
                          <div class="caracteristicas-grid">
                            <div class="toggle-item">
                              <mat-slide-toggle formControlName="requiereLote" color="primary">
                                <div class="toggle-content">
                                  <mat-icon class="toggle-icon">qr_code</mat-icon>
                                  <span class="toggle-label">Requiere Lote</span>
                                </div>
                              </mat-slide-toggle>
                            </div>
    
                            <div class="toggle-item">
                              <mat-slide-toggle formControlName="requiereSerie" color="primary">
                                <div class="toggle-content">
                                  <mat-icon class="toggle-icon">tag</mat-icon>
                                  <span class="toggle-label">Requiere Serie</span>
                                </div>
                              </mat-slide-toggle>
                            </div>
    
                            <div class="toggle-item">
                              <mat-slide-toggle formControlName="caduca" color="warn">
                                <div class="toggle-content">
                                  <mat-icon class="toggle-icon">schedule</mat-icon>
                                  <span class="toggle-label">Caduca</span>
                                </div>
                              </mat-slide-toggle>
                            </div>
    
                            <div class="toggle-item">
                              <mat-slide-toggle formControlName="activo" color="accent">
                                <div class="toggle-content">
                                  <mat-icon class="toggle-icon">check_circle</mat-icon>
                                  <span class="toggle-label">Activo</span>
                                </div>
                              </mat-slide-toggle>
                            </div>
                          </div>
    
                          <!-- Días de Caducidad (condicional) -->
                          @if (form.get('caduca')?.value) {
                            <div class="caducidad-section">
                              <mat-form-field appearance="outline" class="caducidad-field">
                                <mat-label>Días de Caducidad</mat-label>
                                <input
                                  matInput
                                  type="number"
                                  formControlName="diasCaducidad"
                                  placeholder="365"
                                  min="1">
                                  <mat-icon matSuffix class="field-icon">event</mat-icon>
                                  @if (form.get('diasCaducidad')?.hasError('min')) {
                                    <mat-error>
                                      Los días deben ser mayor a 0
                                    </mat-error>
                                  }
                                </mat-form-field>
                              </div>
                            }
                          </div>
                        </div>
    
                        <div class="dialog-actions">
                          <button
                            type="button"
                            mat-button
                            (click)="onCancel()"
                            class="cancel-button">
                            <mat-icon>close</mat-icon>
                            <span>Cancelar</span>
                          </button>
                          <button
                            type="submit"
                            mat-raised-button
                            color="primary"
                            [disabled]="form.invalid || loading"
                            class="submit-button">
                            @if (loading) {
                              <mat-icon class="loading-icon spin">hourglass_empty</mat-icon>
                            }
                            @if (!loading) {
                              <mat-icon>{{ data.mode === 'create' ? 'add' : 'save' }}</mat-icon>
                            }
                            <span>{{ data.mode === 'create' ? 'Crear' : 'Guardar' }}</span>
                          </button>
                        </div>
                      </form>
                    </div>
    `,
  styles: [`
    .articulo-dialog {
      min-width: 600px;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    // Dialog Header
    .dialog-header {
      padding: 24px 24px 0 24px;
      
      .dialog-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--sidebar-text);
        
        .title-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: var(--status-info);
        }
        
        .title-text {
          font-size: 24px;
          font-weight: 600;
        }
      }
    }

    // Dialog Form
    .dialog-form {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    // Dialog Content
    .dialog-content {
      padding: 24px;
      flex: 1;
      overflow-y: auto;
      max-height: calc(90vh - 140px);
    }

    // Form Sections
    .form-section {
      margin-bottom: 32px;
      
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--sidebar-text);
        
        .section-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          color: var(--status-info);
        }
      }
    }

    .section-divider {
      margin: 32px 0;
      border-color: var(--sidebar-border);
    }

    // Form Grid
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      
      .form-field {
        .field-icon {
          color: var(--mat-card-subtitle-text-color);
        }
      }
      
      .full-width {
        grid-column: 1 / -1;
      }
    }

    // Características Grid
    .caracteristicas-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      
      .toggle-item {
        .toggle-content {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .toggle-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--status-info);
          }
          
          .toggle-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--sidebar-text);
          }
        }
      }
    }

    // Caducidad Section
    .caducidad-section {
      margin-top: 20px;
      
      .caducidad-field {
        max-width: 200px;
      }
    }

    // Dialog Actions
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--sidebar-border);
      background-color: var(--mat-card-background-color);
      
      .cancel-button {
        color: var(--mat-card-subtitle-text-color);
        
        .mat-icon {
          margin-right: 8px;
        }
      }
      
      .submit-button {
        min-width: 120px;
        
        .loading-icon {
          margin-right: 8px;
        }
        
        .mat-icon {
          margin-right: 8px;
        }
      }
    }

    // Responsive Design
    @media (max-width: 768px) {
      .articulo-dialog {
        min-width: auto;
        width: 100%;
        max-width: 100%;
        max-height: 100vh;
      }
      
      .dialog-header {
        padding: 16px 16px 0 16px;
        
        .dialog-title {
          font-size: 20px;
          
          .title-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
          
          .title-text {
            font-size: 20px;
          }
        }
      }
      
      .dialog-content {
        padding: 16px;
        max-height: calc(100vh - 120px);
      }
      
      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .caracteristicas-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .dialog-actions {
        padding: 16px;
        flex-direction: column-reverse;
        
        .cancel-button,
        .submit-button {
          width: 100%;
        }
      }
    }

    @media (max-width: 480px) {
      .dialog-header {
        padding: 12px 12px 0 12px;
        
        .dialog-title {
          font-size: 18px;
          
          .title-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
          
          .title-text {
            font-size: 18px;
          }
        }
      }
      
      .dialog-content {
        padding: 12px;
      }
      
      .form-section {
        margin-bottom: 24px;
        
        .section-title {
          font-size: 16px;
          
          .section-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
      
      .section-divider {
        margin: 24px 0;
      }
    }

    // Dark theme adjustments
    .dark-theme {
      .dialog-header {
        .dialog-title {
          color: var(--sidebar-text);
        }
      }
      
      .form-section {
        .section-title {
          color: var(--sidebar-text);
        }
      }
      
      .caracteristicas-grid {
        .toggle-item {
          .toggle-content {
            .toggle-label {
              color: var(--sidebar-text);
            }
          }
        }
      }
      
      .dialog-actions {
        background-color: var(--mat-card-background-color);
        border-top-color: var(--sidebar-border);
      }
    }
  `]
})
export class ArticuloDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private articulosService = inject(ArticulosService);
  private toastService = inject(ToastService);
  protected dialogRef = inject(MatDialogRef<ArticuloDialogComponent>);
  protected data: DialogData = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  loading = false;

  // Mock data (en producción vendría del servicio)
  unidadesMedida = signal(['kg', 'l', 'm', 'un', 'caja', 'rollo', 'paquete']);
  categorias = signal([
    { id: 1, nombre: 'Aceros' },
    { id: 2, nombre: 'Tornillería' },
    { id: 3, nombre: 'Pinturas' },
    { id: 4, nombre: 'Herramientas' },
    { id: 5, nombre: 'EPIs' }
  ]);
  tiposIVA = signal([
    { id: 1, nombre: 'IVA General', porcentaje: 21 },
    { id: 2, nombre: 'IVA Reducido', porcentaje: 10 },
    { id: 3, nombre: 'IVA Superreducido', porcentaje: 4 },
    { id: 4, nombre: 'Exento', porcentaje: 0 }
  ]);

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      descripcion: [''],
      umStock: ['', [Validators.required]],
      umVentaDefault: ['', [Validators.required]],
      factorCompraAVenta: [1, [Validators.required, Validators.min(0.01)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      stockMaximo: [null, [Validators.min(0)]],
      categoriaId: [null],
      ivaId: [1, [Validators.required]],
      precioCompra: [null, [Validators.min(0)]],
      precioVenta: [null, [Validators.min(0)]],
      requiereLote: [false],
      requiereSerie: [false],
      caduca: [false],
      diasCaducidad: [365, [Validators.min(1)]],
      activo: [true]
    });

    // Validaciones asíncronas
    this.form.get('codigo')?.valueChanges.subscribe(codigo => {
      if (codigo && this.form.get('codigo')?.valid) {
        this.validateCodigoUnico(codigo);
      }
    });

    this.form.get('nombre')?.valueChanges.subscribe(nombre => {
      if (nombre && this.form.get('nombre')?.valid) {
        this.validateNombreUnico(nombre);
      }
    });

    // Generar código automático para nuevos artículos
    if (this.data.mode === 'create') {
      this.generateCodigo();
    }
  }

  private async loadInitialData(): Promise<void> {
    try {
      // En producción, cargaríamos los datos del servicio
      // this.unidadesMedida.set(await this.articulosService.getUnidadesMedida());
      // this.categorias.set(await this.articulosService.getCategorias());
      // this.tiposIVA.set(await this.articulosService.getTiposIVA());
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  }

  private async generateCodigo(): Promise<void> {
    try {
      const codigo = await this.articulosService.generarCodigoSiguiente();
      this.form.patchValue({ codigo });
    } catch (error) {
      console.error('Error al generar código:', error);
    }
  }

  private async validateCodigoUnico(codigo: string): Promise<void> {
    try {
      const isUnique = await this.articulosService.validarCodigoUnico(
        codigo,
        this.data.mode === 'edit' ? this.data.articulo?.id : undefined
      );
      
      if (!isUnique) {
        this.form.get('codigo')?.setErrors({ codigoExiste: true });
      } else {
        this.form.get('codigo')?.setErrors(null);
      }
    } catch (error) {
      console.error('Error al validar código:', error);
    }
  }

  private async validateNombreUnico(nombre: string): Promise<void> {
    try {
      const isUnique = await this.articulosService.validarNombreUnico(
        nombre,
        this.data.mode === 'edit' ? this.data.articulo?.id : undefined
      );
      
      if (!isUnique) {
        this.form.get('nombre')?.setErrors({ nombreExiste: true });
      } else {
        this.form.get('nombre')?.setErrors(null);
      }
    } catch (error) {
      console.error('Error al validar nombre:', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    try {
      const formValue = this.form.value;

      if (this.data.mode === 'create') {
        const dto: CreateTipoArticuloDto = {
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          umStock: formValue.umStock,
          umVentaDefault: formValue.umVentaDefault,
          factorCompraAVenta: formValue.factorCompraAVenta,
          stockMinimo: formValue.stockMinimo,
          stockMaximo: formValue.stockMaximo,
          requiereLote: formValue.requiereLote,
          requiereSerie: formValue.requiereSerie,
          caduca: formValue.caduca,
          diasCaducidad: formValue.caduca ? formValue.diasCaducidad : undefined,
          ivaId: formValue.ivaId,
          precioVenta: formValue.precioVenta,
          precioCompra: formValue.precioCompra,
          categoriaId: formValue.categoriaId
        };

        await this.articulosService.create(dto);
        this.toastService.showSuccess('Artículo creado correctamente');
      } else {
        const dto: UpdateTipoArticuloDto = {
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          umStock: formValue.umStock,
          umVentaDefault: formValue.umVentaDefault,
          factorCompraAVenta: formValue.factorCompraAVenta,
          stockMinimo: formValue.stockMinimo,
          stockMaximo: formValue.stockMaximo,
          requiereLote: formValue.requiereLote,
          requiereSerie: formValue.requiereSerie,
          caduca: formValue.caduca,
          diasCaducidad: formValue.caduca ? formValue.diasCaducidad : undefined,
          ivaId: formValue.ivaId,
          precioVenta: formValue.precioVenta,
          precioCompra: formValue.precioCompra,
          categoriaId: formValue.categoriaId,
          activo: formValue.activo
        };

        await this.articulosService.update(this.data.articulo!.id, dto);
        this.toastService.showSuccess('Artículo actualizado correctamente');
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al guardar artículo:', error);
      this.toastService.showError('Error al guardar el artículo');
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
