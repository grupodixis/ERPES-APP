import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PermisosService } from '../../../services/permisos.service';
import {
  Permiso,
  CreatePermisoDto,
  UpdatePermisoDto,
  PermisoFilters,
  PermisoArbol,
  ACCIONES_PERMISO,
  MODULOS_SISTEMA
} from '../../../domain/seguridad.types';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.scss']
})
export class PermisosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos
  permisos: Permiso[] = [];
  arbolPermisos: PermisoArbol[] = [];
  permisoSeleccionado: Permiso | null = null;
  modulos: string[] = [];
  acciones: string[] = [];

  // Estados
  cargando = false;
  guardando = false;
  eliminando = false;
  modoEdicion = false;
  mostrarFormulario = false;
  vistaArbol = false;

  // Formularios
  formularioPermiso!: FormGroup;
  formularioFiltros!: FormGroup;

  // Filtros
  filtrosActivos: PermisoFilters = {};

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalElementos = 0;
  permisosPaginados: Permiso[] = [];

  // Constantes
  readonly ACCIONES = ACCIONES_PERMISO;
  readonly MODULOS = MODULOS_SISTEMA;

  constructor(
    private fb: FormBuilder,
    private permisosService: PermisosService
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.configurarFiltros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarFormularios(): void {
    this.formularioPermiso = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      recurso: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      accion: ['', [Validators.required]],
      modulo: ['', [Validators.required]],
      jerarquia: ['', [Validators.maxLength(200)]],
      activo: [true]
    });

    this.formularioFiltros = this.fb.group({
      modulo: [''],
      recurso: [''],
      accion: [''],
      activo: [''],
      search: ['']
    });
  }

  private configurarFiltros(): void {
    this.formularioFiltros.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(filtros => {
        this.aplicarFiltros(filtros);
      });
  }

  private cargarDatosIniciales(): void {
    this.cargando = true;
    
    // Cargar módulos y acciones
    this.modulos = Object.values(MODULOS_SISTEMA);
    this.acciones = Object.values(ACCIONES_PERMISO);
    
    // Cargar permisos
    this.cargarPermisos();
  }

  cargarPermisos(): void {
    this.cargando = true;
    
    this.permisosService.cargarPermisos(this.filtrosActivos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permisos) => {
          this.permisos = permisos;
          this.totalElementos = permisos.length;
          this.actualizarPaginacion();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar permisos:', error);
          this.cargando = false;
        }
      });
  }

  cargarArbolPermisos(): void {
    this.cargando = true;
    
    this.permisosService.obtenerArbolPermisos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (arbol) => {
          this.arbolPermisos = arbol;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar árbol de permisos:', error);
          this.cargando = false;
        }
      });
  }

  aplicarFiltros(filtros: any): void {
    this.filtrosActivos = {};
    
    if (filtros.modulo && filtros.modulo.trim()) {
      this.filtrosActivos.modulo = filtros.modulo;
    }
    if (filtros.recurso && filtros.recurso.trim()) {
      this.filtrosActivos.recurso = filtros.recurso;
    }
    if (filtros.accion && filtros.accion.trim()) {
      this.filtrosActivos.accion = filtros.accion;
    }
    if (filtros.activo !== '' && filtros.activo !== null && filtros.activo !== undefined) {
      this.filtrosActivos.activo = filtros.activo === 'true';
    }
    if (filtros.search && filtros.search.trim()) {
      this.filtrosActivos.search = filtros.search;
    }
    
    this.paginaActual = 1;
    this.cargarPermisos();
  }

  limpiarFiltros(): void {
    this.formularioFiltros.reset();
    this.filtrosActivos = {};
    this.paginaActual = 1;
    this.cargarPermisos();
  }

  cambiarVista(): void {
    this.vistaArbol = !this.vistaArbol;
    if (this.vistaArbol) {
      this.cargarArbolPermisos();
    }
  }

  // Operaciones CRUD
  nuevoPermiso(): void {
    this.permisoSeleccionado = null;
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.formularioPermiso.reset({
      activo: true,
      jerarquia: 1
    });
  }

  editarPermiso(permiso: Permiso): void {
    this.permisoSeleccionado = permiso;
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    
    this.formularioPermiso.patchValue({
      nombre: permiso.nombre,
      descripcion: permiso.descripcion,
      recurso: permiso.recurso,
      accion: permiso.accion,
      modulo: permiso.modulo,
      jerarquia: permiso.jerarquia,
      activo: permiso.activo
    });
  }

  guardarPermiso(): void {
    if (this.formularioPermiso.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.guardando = true;
    const datosFormulario = this.formularioPermiso.value;

    if (this.modoEdicion && this.permisoSeleccionado) {
      const updateDto: UpdatePermisoDto = {
        nombre: datosFormulario.nombre,
        descripcion: datosFormulario.descripcion,
        activo: datosFormulario.activo
      };

      this.permisosService.actualizarPermiso(this.permisoSeleccionado.id.toString(), updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.guardando = false;
            this.cerrarFormulario();
            this.cargarPermisos();
          },
          error: (error) => {
            console.error('Error al actualizar permiso:', error);
            this.guardando = false;
          }
        });
    } else {
      const createDto: CreatePermisoDto = {
        nombre: datosFormulario.nombre,
        descripcion: datosFormulario.descripcion,
        recurso: datosFormulario.recurso,
        accion: datosFormulario.accion,
        modulo: datosFormulario.modulo,
        jerarquia: `${datosFormulario.modulo}/${datosFormulario.recurso}/${datosFormulario.accion}`
      };

      this.permisosService.crearPermiso(createDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.guardando = false;
            this.cerrarFormulario();
            this.cargarPermisos();
          },
          error: (error) => {
            console.error('Error al crear permiso:', error);
            this.guardando = false;
          }
        });
    }
  }

  eliminarPermiso(permiso: Permiso): void {
    if (!confirm(`¿Está seguro de que desea eliminar el permiso "${permiso.nombre}"?`)) {
      return;
    }

    this.eliminando = true;
    
    this.permisosService.eliminarPermiso(permiso.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.eliminando = false;
          this.cargarPermisos();
        },
        error: (error) => {
          console.error('Error al eliminar permiso:', error);
          this.eliminando = false;
          alert('No se puede eliminar el permiso. Puede estar siendo utilizado.');
        }
      });
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.permisoSeleccionado = null;
    this.formularioPermiso.reset();
  }

  // Paginación
  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.permisosPaginados = this.permisos.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalElementos / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Utilidades
  private marcarCamposComoTocados(): void {
    Object.keys(this.formularioPermiso.controls).forEach(key => {
      this.formularioPermiso.get(key)?.markAsTouched();
    });
  }

  esCampoInvalido(campo: string): boolean {
    const control = this.formularioPermiso.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  obtenerErrorCampo(campo: string): string {
    const control = this.formularioPermiso.get(campo);
    if (control?.errors) {
      if (control.errors['required']) return `${campo} es requerido`;
      if (control.errors['minlength']) return `${campo} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `${campo} no puede exceder ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `${campo} debe ser mayor a ${control.errors['min'].min}`;
      if (control.errors['max']) return `${campo} debe ser menor a ${control.errors['max'].max}`;
    }
    return '';
  }

  formatearModulo(modulo: string): string {
    return modulo.charAt(0).toUpperCase() + modulo.slice(1).replace(/_/g, ' ');
  }

  formatearAccion(accion: string): string {
    return accion.charAt(0).toUpperCase() + accion.slice(1).replace(/_/g, ' ');
  }

  obtenerClaseEstado(activo: boolean): string {
    return activo ? 'badge-success' : 'badge-secondary';
  }

  obtenerTextoEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}