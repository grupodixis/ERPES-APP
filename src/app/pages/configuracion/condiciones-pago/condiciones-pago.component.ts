import { Component, OnInit, signal } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { CondicionesPagoService } from '../../../services/condiciones-pago.service';
import {
  CondicionPago,
  CreateCondicionPagoDto,
  UpdateCondicionPagoDto,
  CondicionPagoFilters
} from '../../../domain/configuracion.types';

@Component({
  selector: 'app-condiciones-pago',
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
    MatDialogModule
  ],
  templateUrl: './condiciones-pago.component.html',
  styleUrls: ['./condiciones-pago.component.scss']
})
export class CondicionesPagoComponent implements OnInit {
  // Signals para el estado del componente
  condicionesPago = signal<CondicionPago[]>([]);
  cargando = signal(false);
  error = signal('');
  modoEdicion = signal(false);
  condicionSeleccionada = signal<CondicionPago | null>(null);

  // Formularios
  condicionForm!: FormGroup;
  filtroForm!: FormGroup;

  // Configuración de la tabla
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'tipo',
    'diasVencimiento',
    'finMes',
    'descuentoProntoPago',
    'activa',
    'acciones'
  ];

  // Opciones para selects
  tiposCondicion = [
    { value: 'contado', label: 'Contado' },
    { value: 'credito', label: 'Crédito' },
    { value: 'mixto', label: 'Mixto' }
  ];

  opcionesActiva = [
    { value: true, label: 'Activa' },
    { value: false, label: 'Inactiva' }
  ];

  constructor(
    private fb: FormBuilder,
    private condicionesPagoService: CondicionesPagoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.cargarCondicionesPago();
  }

  private initializeForms(): void {
    this.condicionForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]], 
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(255)],
      tipo: ['', Validators.required],
      diasVencimiento: [0, [Validators.required, Validators.min(0), Validators.max(365)]],
      diaFijo: ['', [Validators.min(1), Validators.max(31)]],
      finMes: [false],
      descuentoProntoPago: ['', [Validators.min(0), Validators.max(100)]],
      diasDescuento: ['', [Validators.min(0), Validators.max(365)]],
      activa: [true]
    });

    this.filtroForm = this.fb.group({
      search: [''],
      tipo: [''],
      activa: ['']
    });
  }

  cargarCondicionesPago(filtros: CondicionPagoFilters = {}): void {
    this.cargando.set(true);
    this.error.set('');

    this.condicionesPagoService.cargarCondicionesPago(filtros)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (condiciones) => {
          this.condicionesPago.set(condiciones);
        },
        error: (error) => {
          this.error.set(`Error al cargar condiciones de pago: ${error.message}`);
          console.error('Error:', error);
        }
      });
  }

  aplicarFiltros(): void {
    const filtros = this.construirFiltros();
    this.cargarCondicionesPago(filtros);
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      search: '',
      tipo: '',
      activa: ''
    });
    this.cargarCondicionesPago({});
  }

  private construirFiltros(): CondicionPagoFilters {
    const formValue = this.filtroForm.value;
    const filtros: CondicionPagoFilters = {};

    if (formValue.search?.trim()) {
      filtros.search = formValue.search.trim();
    }
    if (formValue.tipo) {
      filtros.tipo = formValue.tipo;
    }
    if (formValue.activa !== '') {
      filtros.activa = formValue.activa;
    }

    // Remover propiedades undefined/null
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof CondicionPagoFilters] == null) {
        delete filtros[key as keyof CondicionPagoFilters];
      }
    });

    return filtros;
  }

  nuevaCondicion(): void {
    this.modoEdicion.set(false);
    this.condicionSeleccionada.set(null);
    this.condicionForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: '',
      diasVencimiento: 0,
      diaFijo: '',
      finMes: false,
      descuentoProntoPago: '',
      diasDescuento: '',
      activa: true
    });
  }

  editarCondicion(condicion: CondicionPago): void {
    this.modoEdicion.set(true);
    this.condicionSeleccionada.set(condicion);
    
    this.condicionForm.patchValue({
      codigo: condicion.codigo,
      nombre: condicion.nombre,
      descripcion: condicion.descripcion || '',
      tipo: condicion.tipo,
      diasVencimiento: condicion.diasVencimiento,
      diaFijo: condicion.diaFijo || '',
      finMes: condicion.finMes,
      descuentoProntoPago: condicion.descuentoProntoPago || '',
      diasDescuento: condicion.diasDescuento || '',
      activa: condicion.activa
    });
  }

  guardarCondicion(): void {
    if (this.condicionForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    const formValue = this.condicionForm.value;
    
    if (this.modoEdicion()) {
      this.actualizarCondicion(formValue);
    } else {
      this.crearCondicion(formValue);
    }
  }

  private crearCondicion(formValue: any): void {
    const dto: CreateCondicionPagoDto = {
      codigo: formValue.codigo,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || undefined,
      tipo: formValue.tipo,
      diasVencimiento: formValue.diasVencimiento,
      diaFijo: formValue.diaFijo || undefined,
      finMes: formValue.finMes || false,
      descuentoProntoPago: formValue.descuentoProntoPago || undefined,
      diasDescuento: formValue.diasDescuento || undefined,
      empresaId: 1 // TODO: Obtener de contexto de usuario
    };

    this.condicionesPagoService.crearCondicionPago(dto)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Condición de pago creada exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.nuevaCondicion();
          this.cargarCondicionesPago();
        },
        error: (error) => {
          this.error.set(`Error al crear condición de pago: ${error.message}`);
        }
      });
  }

  private actualizarCondicion(formValue: any): void {
    const condicionId = this.condicionSeleccionada()?.id;
    if (!condicionId) return;

    const dto: UpdateCondicionPagoDto = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || undefined,
      tipo: formValue.tipo,
      diasVencimiento: formValue.diasVencimiento,
      diaFijo: formValue.diaFijo || undefined,
      finMes: formValue.finMes,
      descuentoProntoPago: formValue.descuentoProntoPago || undefined,
      diasDescuento: formValue.diasDescuento || undefined,
      activa: formValue.activa
    };

    this.condicionesPagoService.actualizarCondicionPago(condicionId, dto)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Condición de pago actualizada exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.cancelarEdicion();
          this.cargarCondicionesPago();
        },
        error: (error) => {
          this.error.set(`Error al actualizar condición de pago: ${error.message}`);
        }
      });
  }

  eliminarCondicion(condicion: CondicionPago): void {
    if (confirm(`¿Está seguro de que desea eliminar la condición de pago "${condicion.nombre}"?`)) {
      this.cargando.set(true);
      this.error.set('');

      this.condicionesPagoService.eliminarCondicionPago(condicion.id)
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: () => {
            this.snackBar.open('Condición de pago eliminada exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarCondicionesPago();
          },
          error: (error) => {
            this.error.set(`Error al eliminar condición de pago: ${error.message}`);
          }
        });
    }
  }

  cancelarEdicion(): void {
    this.modoEdicion.set(false);
    this.condicionSeleccionada.set(null);
    this.condicionForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: '',
      diasVencimiento: 0,
      diaFijo: '',
      finMes: false,
      descuentoProntoPago: '',
      diasDescuento: '',
      activa: true
    });
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.condicionForm.controls).forEach(key => {
      this.condicionForm.get(key)?.markAsTouched();
    });
  }

  // Métodos de utilidad para la plantilla
  getErrorMessage(fieldName: string): string {
    const control = this.condicionForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (control?.hasError('pattern')) {
      return `${this.getFieldLabel(fieldName)} debe contener solo letras mayúsculas, números y guiones bajos`;
    }
    if (control?.hasError('maxlength')) {
      return `${this.getFieldLabel(fieldName)} es demasiado largo`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} debe ser mayor o igual a ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `${this.getFieldLabel(fieldName)} debe ser menor o igual a ${control.errors?.['max'].max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      codigo: 'Código',
      nombre: 'Nombre',
      descripcion: 'Descripción',
      tipo: 'Tipo',
      diasVencimiento: 'Días de vencimiento',
      diaFijo: 'Día fijo',
      descuentoProntoPago: 'Descuento pronto pago',
      diasDescuento: 'Días para descuento'
    };
    return labels[fieldName] || fieldName;
  }

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposCondicion.find(t => t.value === tipo);
    return tipoObj?.label || tipo;
  }

  formatearDescuento(descuento?: number): string {
    return descuento ? `${descuento}%` : '-';
  }
}