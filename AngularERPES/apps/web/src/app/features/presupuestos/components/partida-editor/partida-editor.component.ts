import { Component, Inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snackbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Partida, TipoRecurso, UnidadMedida, CreatePartidaDto, UpdatePartidaDto } from '../../../../domain/presupuestos.types';
import { PresupuestosService } from '../../services/presupuestos.service';

export interface PartidaEditorData {
  partida?: Partida;
  capituloId: string;
  presupuestoId: string;
  mode: 'create' | 'edit' | 'duplicate';
}

@Component({
  selector: 'app-partida-editor',
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
    MatTabsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSlideToggleModule
  ],
  templateUrl: './partida-editor.component.html',
  styleUrl: './partida-editor.component.scss'
})
export class PartidaEditorComponent implements OnInit {
  // Señales reactivas
  loading = signal(false);
  saving = signal(false);
  hasChanges = signal(false);
  
  // Formulario
  partidaForm!: FormGroup;
  
  // Datos de referencia
  tiposRecurso = signal<TipoRecurso[]>([]);
  unidadesMedida = signal<UnidadMedida[]>([]);
  
  // Computadas
  dialogTitle = computed(() => {
    switch (this.data.mode) {
      case 'create': return 'Nueva Partida';
      case 'edit': return `Editar Partida: ${this.data.partida?.codigo || ''}`;
      case 'duplicate': return `Duplicar Partida: ${this.data.partida?.codigo || ''}`;
      default: return 'Partida';
    }
  });
  
  isEditMode = computed(() => this.data.mode === 'edit');
  isCreateMode = computed(() => this.data.mode === 'create');
  isDuplicateMode = computed(() => this.data.mode === 'duplicate');
  
  // Validaciones computadas
  canSave = computed(() => {
    return this.partidaForm?.valid && this.hasChanges() && !this.saving();
  });
  
  constructor(
    private fb: FormBuilder,
    private presupuestosService: PresupuestosService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<PartidaEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PartidaEditorData
  ) {
    this.initializeForm();
    this.setupFormChangeDetection();
  }
  
  ngOnInit(): void {
    this.loadReferenceData();
    this.loadPartidaData();
  }
  
  private initializeForm(): void {
    this.partidaForm = this.fb.group({
      // Información básica
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', Validators.maxLength(1000)],
      
      // Clasificación
      tipoRecurso: ['', Validators.required],
      unidadMedida: ['', Validators.required],
      
      // Cantidades y precios
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      
      // Configuración
      aplicaIva: [true],
      porcentajeIva: [21, [Validators.min(0), Validators.max(100)]],
      
      // Fechas
      fechaInicio: [null],
      fechaFin: [null],
      
      // Observaciones
      observaciones: ['', Validators.maxLength(500)],
      
      // Estado
      activa: [true]
    });
  }
  
  private setupFormChangeDetection(): void {
    // Detectar cambios en el formulario
    effect(() => {
      if (this.partidaForm) {
        this.partidaForm.valueChanges.subscribe(() => {
          this.hasChanges.set(this.partidaForm.dirty);
        });
      }
    });
    
    // Validación condicional del IVA
    this.partidaForm.get('aplicaIva')?.valueChanges.subscribe(aplicaIva => {
      const porcentajeIvaControl = this.partidaForm.get('porcentajeIva');
      if (aplicaIva) {
        porcentajeIvaControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        porcentajeIvaControl?.clearValidators();
        porcentajeIvaControl?.setValue(0);
      }
      porcentajeIvaControl?.updateValueAndValidity();
    });
    
    // Validación de fechas
    this.partidaForm.get('fechaInicio')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
    
    this.partidaForm.get('fechaFin')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
  }
  
  private validateDateRange(): void {
    const fechaInicio = this.partidaForm.get('fechaInicio')?.value;
    const fechaFin = this.partidaForm.get('fechaFin')?.value;
    
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      this.partidaForm.get('fechaFin')?.setErrors({ dateRange: true });
    } else {
      const errors = this.partidaForm.get('fechaFin')?.errors;
      if (errors) {
        delete errors['dateRange'];
        const hasErrors = Object.keys(errors).length > 0;
        this.partidaForm.get('fechaFin')?.setErrors(hasErrors ? errors : null);
      }
    }
  }
  
  private async loadReferenceData(): Promise<void> {
    this.loading.set(true);
    
    try {
      // Cargar tipos de recurso
      const tiposRecurso: TipoRecurso[] = [
        { id: 'mano-obra', nombre: 'Mano de Obra', descripcion: 'Recursos humanos' },
        { id: 'material', nombre: 'Material', descripcion: 'Materiales y suministros' },
        { id: 'maquinaria', nombre: 'Maquinaria', descripcion: 'Equipos y maquinaria' },
        { id: 'subcontrata', nombre: 'Subcontrata', descripcion: 'Servicios subcontratados' },
        { id: 'otros', nombre: 'Otros', descripcion: 'Otros recursos' }
      ];
      
      // Cargar unidades de medida
      const unidadesMedida: UnidadMedida[] = [
        { id: 'ud', nombre: 'Unidad', simbolo: 'ud' },
        { id: 'm', nombre: 'Metro', simbolo: 'm' },
        { id: 'm2', nombre: 'Metro cuadrado', simbolo: 'm²' },
        { id: 'm3', nombre: 'Metro cúbico', simbolo: 'm³' },
        { id: 'kg', nombre: 'Kilogramo', simbolo: 'kg' },
        { id: 'h', nombre: 'Hora', simbolo: 'h' },
        { id: 'dia', nombre: 'Día', simbolo: 'día' },
        { id: 'mes', nombre: 'Mes', simbolo: 'mes' },
        { id: 'año', nombre: 'Año', simbolo: 'año' },
        { id: 'lote', nombre: 'Lote', simbolo: 'lote' }
      ];
      
      this.tiposRecurso.set(tiposRecurso);
      this.unidadesMedida.set(unidadesMedida);
      
    } catch (error) {
      console.error('Error cargando datos de referencia:', error);
      this.showError('Error cargando datos de referencia');
    } finally {
      this.loading.set(false);
    }
  }
  
  private loadPartidaData(): void {
    if (this.data.partida && (this.isEditMode() || this.isDuplicateMode())) {
      const partida = this.data.partida;
      
      this.partidaForm.patchValue({
        codigo: this.isDuplicateMode() ? `${partida.codigo}_COPY` : partida.codigo,
        nombre: this.isDuplicateMode() ? `${partida.nombre} (Copia)` : partida.nombre,
        descripcion: partida.descripcion,
        tipoRecurso: partida.tipoRecurso,
        unidadMedida: partida.unidadMedida,
        cantidad: partida.cantidad,
        precioUnitario: partida.precioUnitario,
        aplicaIva: partida.aplicaIva,
        porcentajeIva: partida.porcentajeIva,
        fechaInicio: partida.fechaInicio ? new Date(partida.fechaInicio) : null,
        fechaFin: partida.fechaFin ? new Date(partida.fechaFin) : null,
        observaciones: partida.observaciones,
        activa: partida.activa
      });
      
      // Marcar como pristine si es modo edición
      if (this.isEditMode()) {
        this.partidaForm.markAsPristine();
        this.hasChanges.set(false);
      }
    } else {
      // Generar código automático para nueva partida
      this.generatePartidaCode();
    }
  }
  
  private generatePartidaCode(): void {
    // Generar código automático basado en el capítulo
    const timestamp = Date.now().toString().slice(-6);
    const codigo = `P${timestamp}`;
    this.partidaForm.patchValue({ codigo });
  }
  
  // Métodos de cálculo
  getImporteBase(): number {
    const cantidad = this.partidaForm.get('cantidad')?.value || 0;
    const precioUnitario = this.partidaForm.get('precioUnitario')?.value || 0;
    return cantidad * precioUnitario;
  }
  
  getImporteIva(): number {
    const aplicaIva = this.partidaForm.get('aplicaIva')?.value;
    if (!aplicaIva) return 0;
    
    const importeBase = this.getImporteBase();
    const porcentajeIva = this.partidaForm.get('porcentajeIva')?.value || 0;
    return importeBase * (porcentajeIva / 100);
  }
  
  getImporteTotal(): number {
    return this.getImporteBase() + this.getImporteIva();
  }
  
  // Métodos de acción
  async onSave(): Promise<void> {
    if (!this.canSave()) return;
    
    this.saving.set(true);
    
    try {
      const formValue = this.partidaForm.value;
      
      if (this.isCreateMode() || this.isDuplicateMode()) {
        const createDto: CreatePartidaDto = {
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          tipoRecurso: formValue.tipoRecurso,
          unidadMedida: formValue.unidadMedida,
          cantidad: formValue.cantidad,
          precioUnitario: formValue.precioUnitario,
          aplicaIva: formValue.aplicaIva,
          porcentajeIva: formValue.porcentajeIva,
          fechaInicio: formValue.fechaInicio?.toISOString(),
          fechaFin: formValue.fechaFin?.toISOString(),
          observaciones: formValue.observaciones,
          activa: formValue.activa,
          capituloId: this.data.capituloId
        };
        
        const nuevaPartida = await this.presupuestosService.createPartida(createDto);
        this.showSuccess('Partida creada correctamente');
        this.dialogRef.close({ action: 'created', partida: nuevaPartida });
        
      } else if (this.isEditMode() && this.data.partida) {
        const updateDto: UpdatePartidaDto = {
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          tipoRecurso: formValue.tipoRecurso,
          unidadMedida: formValue.unidadMedida,
          cantidad: formValue.cantidad,
          precioUnitario: formValue.precioUnitario,
          aplicaIva: formValue.aplicaIva,
          porcentajeIva: formValue.porcentajeIva,
          fechaInicio: formValue.fechaInicio?.toISOString(),
          fechaFin: formValue.fechaFin?.toISOString(),
          observaciones: formValue.observaciones,
          activa: formValue.activa
        };
        
        const partidaActualizada = await this.presupuestosService.updatePartida(this.data.partida.id, updateDto);
        this.showSuccess('Partida actualizada correctamente');
        this.dialogRef.close({ action: 'updated', partida: partidaActualizada });
      }
      
    } catch (error) {
      console.error('Error guardando partida:', error);
      this.showError('Error guardando la partida');
    } finally {
      this.saving.set(false);
    }
  }
  
  onCancel(): void {
    if (this.hasChanges()) {
      const confirmClose = confirm('¿Estás seguro de que quieres cerrar? Se perderán los cambios no guardados.');
      if (!confirmClose) return;
    }
    
    this.dialogRef.close({ action: 'cancelled' });
  }
  
  onReset(): void {
    const confirmReset = confirm('¿Estás seguro de que quieres restablecer el formulario?');
    if (!confirmReset) return;
    
    this.partidaForm.reset();
    this.loadPartidaData();
    this.hasChanges.set(false);
  }
  
  // Métodos de utilidad
  getFieldError(fieldName: string): string | null {
    const field = this.partidaForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;
    
    const errors = field.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}`;
    if (errors['dateRange']) return 'La fecha de fin debe ser posterior a la fecha de inicio';
    
    return 'Campo inválido';
  }
  
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
  
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}