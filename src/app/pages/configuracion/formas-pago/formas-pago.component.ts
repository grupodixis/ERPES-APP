import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';

import { FormasPagoService } from '../../../services/formas-pago.service';
import {
  FormaPago,
  CreateFormaPagoDto,
  UpdateFormaPagoDto,
  FormaPagoFilters
} from '../../../domain/configuracion.types';

@Component({
  selector: 'app-formas-pago',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatSortModule,
    MatTooltipModule
  ],
  templateUrl: './formas-pago.component.html',
  styleUrls: ['./formas-pago.component.scss']
})
export class FormasPagoComponent implements OnInit {
  // Signals para el estado del componente
  formasPago = signal<FormaPago[]>([]);
  tiposFormaPago = signal<{ value: string; label: string }[]>([]);
  loading = signal(false);
  error = signal('');
  editando = signal(false);
  formaPagoEditando = signal<FormaPago | null>(null);

  // Formularios reactivos
  filtroForm!: FormGroup;
  formaPagoForm!: FormGroup;

  // Computed para formas de pago filtradas
  formasPagoFiltradas = computed(() => {
    const formas = this.formasPago();
    const filtros = this.filtroForm?.value;
    
    if (!filtros) return formas;
    
    return formas.filter(forma => {
      const matchSearch = !filtros.search || 
        forma.nombre.toLowerCase().includes(filtros.search.toLowerCase()) ||
        forma.codigo.toLowerCase().includes(filtros.search.toLowerCase());
      
      const matchTipo = !filtros.tipo || forma.tipo === filtros.tipo;
      const matchRequiereCuenta = filtros.requiereCuenta === '' || forma.requiereCuenta === filtros.requiereCuenta;
      const matchActiva = filtros.activa === '' || forma.activa === filtros.activa;
      
      return matchSearch && matchTipo && matchRequiereCuenta && matchActiva;
    });
  });

  // Columnas de la tabla
  displayedColumns: string[] = [
    'codigo',
    'nombre', 
    'tipo',
    'requiereCuenta',
    'diasVencimiento',
    'activa',
    'acciones'
  ];

  constructor(
    private fb: FormBuilder,
    private formasPagoService: FormasPagoService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.cargarFormasPago();
    this.cargarTiposFormaPago();
  }

  private initializeForms(): void {
    // Formulario de filtros
    this.filtroForm = this.fb.group({
      search: [''],
      tipo: [''],
      requiereCuenta: [''],
      activa: ['']
    });

    // Formulario de forma de pago
    this.formaPagoForm = this.fb.group({
      codigo: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Z0-9_]+$/)
      ]],
      nombre: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      descripcion: ['', Validators.maxLength(255)],
      tipo: ['', Validators.required],
      requiereCuenta: [false],
      diasVencimiento: [null, [
        Validators.min(0),
        Validators.max(365)
      ]],
      activa: [true]
    });
  }

  cargarFormasPago(filtros: FormaPagoFilters = {}): void {
    this.loading.set(true);
    this.error.set('');
    
    this.formasPagoService.cargarFormasPago(filtros)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (formas) => {
          this.formasPago.set(formas);
        },
        error: (error) => {
          this.error.set(`Error al cargar formas de pago: ${error.message}`);
          console.error('Error cargando formas de pago:', error);
        }
      });
  }

  private cargarTiposFormaPago(): void {
    this.formasPagoService.obtenerTiposFormaPago()
      .subscribe({
        next: (tipos) => {
          this.tiposFormaPago.set(tipos);
        },
        error: (error) => {
          console.error('Error cargando tipos de forma de pago:', error);
        }
      });
  }

  aplicarFiltros(): void {
    const filtros = this.filtroForm.value;
    this.cargarFormasPago(filtros);
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      search: '',
      tipo: '',
      requiereCuenta: '',
      activa: ''
    });
    this.cargarFormasPago({});
  }

  nuevaFormaPago(): void {
    this.editando.set(false);
    this.formaPagoEditando.set(null);
    this.formaPagoForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: '',
      requiereCuenta: false,
      diasVencimiento: null,
      activa: true
    });
  }

  editarFormaPago(formaPago: FormaPago): void {
    this.editando.set(true);
    this.formaPagoEditando.set(formaPago);
    
    this.formaPagoForm.patchValue({
      codigo: formaPago.codigo,
      nombre: formaPago.nombre,
      descripcion: formaPago.descripcion || '',
      tipo: formaPago.tipo,
      requiereCuenta: formaPago.requiereCuenta,
      diasVencimiento: formaPago.diasVencimiento || null,
      activa: formaPago.activa
    });
  }

  guardarFormaPago(): void {
    if (this.formaPagoForm.invalid) {
      this.formaPagoForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    
    const formData = this.formaPagoForm.value;
    const formaPagoData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      tipo: formData.tipo,
      requiereCuenta: formData.requiereCuenta,
      diasVencimiento: formData.diasVencimiento || undefined,
      activa: formData.activa,
      empresaId: 1 // TODO: Obtener de contexto de usuario
    };

    const operation = this.editando() 
      ? this.formasPagoService.actualizarFormaPago(
          this.formaPagoEditando()!.id, 
          formaPagoData as UpdateFormaPagoDto
        )
      : this.formasPagoService.crearFormaPago(formaPagoData as CreateFormaPagoDto);

    operation
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          const mensaje = this.editando() 
            ? 'Forma de pago actualizada correctamente'
            : 'Forma de pago creada correctamente';
          
          this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
          this.cargarFormasPago();
          this.cancelarEdicion();
        },
        error: (error) => {
          this.error.set(`Error al guardar: ${error.message}`);
          console.error('Error guardando forma de pago:', error);
        }
      });
  }

  eliminarFormaPago(formaPago: FormaPago): void {
    const confirmacion = confirm(
      `¿Está seguro de que desea eliminar la forma de pago "${formaPago.nombre}"?`
    );
    
    if (!confirmacion) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    
    this.formasPagoService.eliminarFormaPago(formaPago.id)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Forma de pago eliminada correctamente', 'Cerrar', { 
            duration: 3000 
          });
          this.cargarFormasPago();
        },
        error: (error) => {
          this.error.set(`Error al eliminar: ${error.message}`);
          console.error('Error eliminando forma de pago:', error);
        }
      });
  }

  cancelarEdicion(): void {
    this.editando.set(false);
    this.formaPagoEditando.set(null);
    this.formaPagoForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: '',
      requiereCuenta: false,
      diasVencimiento: null,
      activa: true
    });
  }

  limpiarError(): void {
    this.error.set('');
  }

  // Métodos auxiliares para la UI
  getErrorMessage(fieldName: string): string {
    const control = this.formaPagoForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    
    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    
    if (errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    }
    
    if (errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} no puede exceder ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (errors['pattern']) {
      return `${this.getFieldLabel(fieldName)} solo puede contener letras mayúsculas, números y guiones bajos`;
    }
    
    if (errors['min']) {
      return `${this.getFieldLabel(fieldName)} debe ser mayor o igual a ${errors['min'].min}`;
    }
    
    if (errors['max']) {
      return `${this.getFieldLabel(fieldName)} debe ser menor o igual a ${errors['max'].max}`;
    }
    
    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      codigo: 'Código',
      nombre: 'Nombre',
      descripcion: 'Descripción',
      tipo: 'Tipo',
      diasVencimiento: 'Días de vencimiento'
    };
    
    return labels[fieldName] || fieldName;
  }

  getTipoLabel(tipo: string): string {
    const tipoEncontrado = this.tiposFormaPago().find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  }
}