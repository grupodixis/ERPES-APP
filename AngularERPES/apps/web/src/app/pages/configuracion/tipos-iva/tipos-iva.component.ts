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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TiposIvaService } from '../../../services/tipos-iva.service';
import { TipoIva, CreateTipoIvaDto, UpdateTipoIvaDto, TipoIvaFilters } from '../../../domain/configuracion.types';

@Component({
  selector: 'app-tipos-iva',
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
  templateUrl: './tipos-iva.component.html',
  styleUrl: './tipos-iva.component.scss'
})
export class TiposIvaComponent implements OnInit {
  // Signals para el estado del componente
  tiposIva = signal<TipoIva[]>([]);
  loading = signal(false);
  error = signal('');
  editandoId = signal<number | null>(null);

  // Formularios reactivos
  filtroForm!: FormGroup;
  tipoIvaForm!: FormGroup;

  // Columnas de la tabla
  displayedColumns: string[] = [
    'codigo',
    'nombre', 
    'porcentaje',
    'descripcion',
    'activo',
    'acciones'
  ];

  // Opciones para filtros
  opcionesActivo = [
    { value: '', label: 'Todos' },
    { value: true, label: 'Activos' },
    { value: false, label: 'Inactivos' }
  ];

  // Computed properties
  esEdicion = computed(() => this.editandoId() !== null);
  tituloFormulario = computed(() => 
    this.esEdicion() ? 'Editar Tipo de IVA' : 'Nuevo Tipo de IVA'
  );
  textoBoton = computed(() => 
    this.esEdicion() ? 'Actualizar' : 'Crear'
  );

  constructor(
    private fb: FormBuilder,
    private tiposIvaService: TiposIvaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarDatos();
  }

  private inicializarFormularios(): void {
    // Formulario de filtros
    this.filtroForm = this.fb.group({
      search: [''],
      activo: [''],
      porcentajeMin: [null, [Validators.min(0), Validators.max(100)]],
      porcentajeMax: [null, [Validators.min(0), Validators.max(100)]]
    });

    // Formulario de tipo de IVA
    this.tipoIvaForm = this.fb.group({
      codigo: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[A-Z0-9_]+$/)
      ]],
      nombre: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      porcentaje: [null, [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]],
      descripcion: ['', Validators.maxLength(255)],
      activo: [true]
    });
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set('');

    const filtros = this.construirFiltros();

    this.tiposIvaService.cargarTiposIva(filtros).subscribe({
      next: (tipos) => {
        this.tiposIva.set(tipos);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error al cargar los tipos de IVA');
        this.loading.set(false);
      }
    });
  }

  private construirFiltros(): TipoIvaFilters {
    const formValue = this.filtroForm.value;
    return {
      search: formValue.search || undefined,
      activo: formValue.activo !== '' ? formValue.activo : undefined,
      porcentajeMin: formValue.porcentajeMin || undefined,
      porcentajeMax: formValue.porcentajeMax || undefined,
      empresaId: 1 // TODO: Obtener de contexto de usuario
    };
  }

  filtrar(): void {
    this.cargarDatos();
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      search: '',
      activo: '',
      porcentajeMin: null,
      porcentajeMax: null
    });
    this.cargarDatos();
  }

  guardar(): void {
    this.error.set('');
    
    if (this.tipoIvaForm.invalid) {
      this.tipoIvaForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.tipoIvaForm.value;

    if (this.esEdicion()) {
      // Actualizar tipo existente
      const updateDto: UpdateTipoIvaDto = {
        nombre: formValue.nombre,
        porcentaje: formValue.porcentaje,
        descripcion: formValue.descripcion,
        activo: formValue.activo
      };

      this.tiposIvaService.actualizarTipoIva(this.editandoId()!, updateDto).subscribe({
        next: () => {
          this.snackBar.open('Tipo de IVA actualizado correctamente', 'Cerrar', {
            duration: 3000
          });
          this.cancelar();
          this.cargarDatos();
        },
        error: (error) => {
          this.error.set(error.message || 'Error al actualizar el tipo de IVA');
          this.loading.set(false);
        }
      });
    } else {
      // Crear nuevo tipo
      const createDto: CreateTipoIvaDto = {
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        porcentaje: formValue.porcentaje,
        descripcion: formValue.descripcion,
        empresaId: 1 // TODO: Obtener de contexto de usuario
      };

      this.tiposIvaService.crearTipoIva(createDto).subscribe({
        next: () => {
          this.snackBar.open('Tipo de IVA creado correctamente', 'Cerrar', {
            duration: 3000
          });
          this.cancelar();
          this.cargarDatos();
        },
        error: (error) => {
          this.error.set(error.message || 'Error al crear el tipo de IVA');
          this.loading.set(false);
        }
      });
    }
  }

  editarTipoIva(tipo: TipoIva): void {
    this.editandoId.set(tipo.id);
    this.tipoIvaForm.patchValue({
      codigo: tipo.codigo,
      nombre: tipo.nombre,
      porcentaje: tipo.porcentaje,
      descripcion: tipo.descripcion,
      activo: tipo.activo
    });
    
    // Deshabilitar el código en modo edición
    this.tipoIvaForm.get('codigo')?.disable();
  }

  eliminarTipoIva(tipo: TipoIva): void {
    this.loading.set(true);
    this.error.set('');

    // Verificar si se puede eliminar
    this.tiposIvaService.puedeEliminar(tipo.id).subscribe({
      next: (puedeEliminar) => {
        if (!puedeEliminar) {
          this.error.set('No se puede eliminar este tipo de IVA porque está siendo utilizado');
          this.loading.set(false);
          return;
        }

        // Proceder con la eliminación
        this.tiposIvaService.eliminarTipoIva(tipo.id).subscribe({
          next: () => {
            this.snackBar.open('Tipo de IVA eliminado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarDatos();
          },
          error: (error) => {
            this.error.set(error.message || 'Error al eliminar el tipo de IVA');
            this.loading.set(false);
          }
        });
      },
      error: (error) => {
        this.error.set(error.message || 'Error al verificar si se puede eliminar');
        this.loading.set(false);
      }
    });
  }

  cancelar(): void {
    this.editandoId.set(null);
    this.tipoIvaForm.reset({
      codigo: '',
      nombre: '',
      porcentaje: null,
      descripcion: '',
      activo: true
    });
    this.tipoIvaForm.get('codigo')?.enable();
    this.error.set('');
  }

  // Métodos de utilidad para la UI
  formatearPorcentaje(porcentaje: number): string {
    return `${porcentaje}%`;
  }

  obtenerMensajeError(campo: string): string {
    const control = this.tipoIvaForm.get(campo);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errores = control.errors;
    
    if (errores['required']) {
      return `${this.obtenerNombreCampo(campo)} es requerido`;
    }
    
    if (errores['maxlength']) {
      const maxLength = errores['maxlength'].requiredLength;
      return `${this.obtenerNombreCampo(campo)} no puede exceder ${maxLength} caracteres`;
    }
    
    if (errores['pattern']) {
      return `${this.obtenerNombreCampo(campo)} debe tener un formato válido`;
    }
    
    if (errores['min']) {
      return `${this.obtenerNombreCampo(campo)} debe ser mayor o igual a ${errores['min'].min}`;
    }
    
    if (errores['max']) {
      return `${this.obtenerNombreCampo(campo)} debe ser menor o igual a ${errores['max'].max}`;
    }

    return 'Campo inválido';
  }

  private obtenerNombreCampo(campo: string): string {
    const nombres: { [key: string]: string } = {
      codigo: 'Código',
      nombre: 'Nombre',
      porcentaje: 'Porcentaje',
      descripcion: 'Descripción'
    };
    return nombres[campo] || campo;
  }
}