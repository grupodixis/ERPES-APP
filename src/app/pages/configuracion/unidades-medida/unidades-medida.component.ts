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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UnidadesMedidaService } from '../../../services/unidades-medida.service';
import {
  UnidadMedida,
  CreateUnidadMedidaDto,
  UpdateUnidadMedidaDto,
  UnidadMedidaFilters
} from '../../../domain/configuracion.types';

@Component({
  selector: 'app-unidades-medida',
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
  templateUrl: './unidades-medida.component.html',
  styleUrl: './unidades-medida.component.scss'
})
export class UnidadesMedidaComponent implements OnInit {
  // Signals para el estado del componente
  unidadesMedida = signal<UnidadMedida[]>([]);
  magnitudes = signal<string[]>([]);
  loading = signal(false);
  error = signal('');
  editandoId = signal<number | null>(null);

  // Formularios reactivos
  filtroForm!: FormGroup;
  unidadMedidaForm!: FormGroup;

  // Columnas de la tabla
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'simbolo',
    'magnitud',
    'esBase',
    'factorConversion',
    'activa',
    'acciones'
  ];

  // Opciones para los selects
  opcionesEsBase = [
    { value: '', label: 'Todos' },
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ];

  opcionesActiva = [
    { value: '', label: 'Todos' },
    { value: true, label: 'Activa' },
    { value: false, label: 'Inactiva' }
  ];

  constructor(
    private fb: FormBuilder,
    private unidadesMedidaService: UnidadesMedidaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarDatos();
  }

  /**
   * Inicializa los formularios reactivos
   */
  private inicializarFormularios(): void {
    this.filtroForm = this.fb.group({
      search: [''],
      magnitud: [''],
      esBase: [''],
      activa: ['']
    });

    this.unidadMedidaForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      simbolo: ['', [Validators.required, Validators.maxLength(10)]],
      magnitud: ['', Validators.required],
      esBase: [false],
      factorConversion: [1, [Validators.required, Validators.min(0.000001)]],
      descripcion: ['', Validators.maxLength(255)],
      activa: [true]
    });
  }

  /**
   * Carga los datos iniciales
   */
  cargarDatos(): void {
    this.loading.set(true);
    this.error.set('');

    // Cargar unidades de medida
    this.unidadesMedidaService.cargarUnidadesMedida().subscribe({
      next: (unidades) => {
        this.unidadesMedida.set(unidades);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });

    // Cargar magnitudes
    this.unidadesMedidaService.obtenerMagnitudes().subscribe({
      next: (magnitudes) => {
        this.magnitudes.set(magnitudes);
      },
      error: (error) => {
        console.error('Error cargando magnitudes:', error);
      }
    });
  }

  /**
   * Aplica los filtros de búsqueda
   */
  filtrar(): void {
    const filtros: UnidadMedidaFilters = {
      ...this.filtroForm.value,
      empresaId: 1 // TODO: Obtener de contexto de usuario
    };

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof UnidadMedidaFilters] === '') {
        delete filtros[key as keyof UnidadMedidaFilters];
      }
    });

    this.loading.set(true);
    this.unidadesMedidaService.cargarUnidadesMedida(filtros).subscribe({
      next: (unidades) => {
        this.unidadesMedida.set(unidades);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroForm.reset({
      search: '',
      magnitud: '',
      esBase: '',
      activa: ''
    });
    this.cargarDatos();
  }

  /**
   * Prepara el formulario para editar una unidad de medida
   */
  editarUnidadMedida(unidad: UnidadMedida): void {
    this.editandoId.set(unidad.id);
    this.unidadMedidaForm.patchValue({
      codigo: unidad.codigo,
      nombre: unidad.nombre,
      simbolo: unidad.simbolo,
      magnitud: unidad.magnitud,
      esBase: unidad.esBase,
      factorConversion: unidad.factorConversion,
      descripcion: unidad.descripcion,
      activa: unidad.activa
    });

    // Deshabilitar el campo código en modo edición
    this.unidadMedidaForm.get('codigo')?.disable();
  }

  /**
   * Guarda la unidad de medida (crear o actualizar)
   */
  guardar(): void {
    this.error.set('');
    
    if (this.unidadMedidaForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading.set(true);

    const formValue = this.unidadMedidaForm.getRawValue();

    if (this.esEdicion()) {
      // Actualizar
      const updateDto: UpdateUnidadMedidaDto = {
        nombre: formValue.nombre,
        simbolo: formValue.simbolo,
        magnitud: formValue.magnitud,
        esBase: formValue.esBase,
        factorConversion: formValue.factorConversion,
        descripcion: formValue.descripcion,
        activa: formValue.activa
      };

      this.unidadesMedidaService.actualizarUnidadMedida(this.editandoId()!, updateDto).subscribe({
        next: () => {
          this.snackBar.open('Unidad de medida actualizada exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.cancelar();
          this.cargarDatos();
        },
        error: (error) => {
          this.error.set(error.message);
          this.loading.set(false);
        }
      });
    } else {
      // Crear
      const createDto: CreateUnidadMedidaDto = {
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        simbolo: formValue.simbolo,
        magnitud: formValue.magnitud,
        esBase: formValue.esBase,
        factorConversion: formValue.factorConversion,
        descripcion: formValue.descripcion,
        empresaId: 1 // TODO: Obtener de contexto de usuario
      };

      this.unidadesMedidaService.crearUnidadMedida(createDto).subscribe({
        next: () => {
          this.snackBar.open('Unidad de medida creada exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.cancelar();
          this.cargarDatos();
        },
        error: (error) => {
          this.error.set(error.message);
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * Elimina una unidad de medida
   */
  eliminarUnidadMedida(unidad: UnidadMedida): void {
    if (!confirm(`¿Está seguro de que desea eliminar la unidad de medida "${unidad.nombre}"?`)) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.unidadesMedidaService.eliminarUnidadMedida(unidad.id).subscribe({
      next: () => {
        this.snackBar.open('Unidad de medida eliminada exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.cargarDatos();
      },
      error: (error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Cancela la edición y resetea el formulario
   */
  cancelar(): void {
    this.editandoId.set(null);
    this.unidadMedidaForm.reset({
      codigo: '',
      nombre: '',
      simbolo: '',
      magnitud: '',
      esBase: false,
      factorConversion: 1,
      descripcion: '',
      activa: true
    });
    this.unidadMedidaForm.get('codigo')?.enable();
    this.error.set('');
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar errores
   */
  private marcarCamposComoTocados(): void {
    Object.keys(this.unidadMedidaForm.controls).forEach(key => {
      this.unidadMedidaForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Verifica si está en modo edición
   */
  esEdicion(): boolean {
    return this.editandoId() !== null;
  }

  /**
   * Obtiene el título del formulario
   */
  tituloFormulario(): string {
    return this.esEdicion() ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida';
  }

  /**
   * Obtiene el texto del botón de guardar
   */
  textoBoton(): string {
    return this.esEdicion() ? 'Actualizar' : 'Crear';
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  obtenerMensajeError(campo: string): string {
    const control = this.unidadMedidaForm.get(campo);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errores = control.errors;
    if (errores['required']) {
      return `${this.obtenerNombreCampo(campo)} es requerido`;
    }
    if (errores['pattern']) {
      return `${this.obtenerNombreCampo(campo)} debe contener solo letras mayúsculas, números y guiones bajos`;
    }
    if (errores['maxlength']) {
      return `${this.obtenerNombreCampo(campo)} no puede exceder ${errores['maxlength'].requiredLength} caracteres`;
    }
    if (errores['min']) {
      return `${this.obtenerNombreCampo(campo)} debe ser mayor que ${errores['min'].min}`;
    }

    return 'Campo inválido';
  }

  /**
   * Obtiene el nombre legible de un campo
   */
  private obtenerNombreCampo(campo: string): string {
    const nombres: { [key: string]: string } = {
      codigo: 'Código',
      nombre: 'Nombre',
      simbolo: 'Símbolo',
      magnitud: 'Magnitud',
      factorConversion: 'Factor de conversión',
      descripcion: 'Descripción'
    };
    return nombres[campo] || campo;
  }

  /**
   * Formatea el factor de conversión para mostrar
   */
  formatearFactor(factor: number): string {
    if (factor === 1) {
      return '1 (base)';
    }
    return factor.toString();
  }
}