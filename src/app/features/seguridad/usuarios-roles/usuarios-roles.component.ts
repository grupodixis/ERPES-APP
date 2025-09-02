// ============================================================================
// USUARIOS-ROLES COMPONENT
// ============================================================================
// Componente principal para gestionar asignaciones de roles a usuarios
// Incluye multi-select, asignación masiva, filtros y estadísticas
// ============================================================================

import { 
  Component, 
  OnInit, 
  OnDestroy, 
  inject, 
  signal, 
  computed, 
  effect 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { Usuario, Rol, UsuarioRol } from '../../../domain/seguridad.types';
import { 
  UsuariosRolesService, 
  UsuarioRolesFilters, 
  EstadisticasUsuarioRoles,
  AsignacionMasivaUsuariosDto 
} from './usuarios-roles.service';
import { AsignacionMasivaDialogComponent } from './asignacion-masiva-dialog/asignacion-masiva-dialog.component';
import { PermisosEfectivosDialogComponent } from './permisos-efectivos-dialog/permisos-efectivos-dialog.component';

// ============================================================================
// INTERFACES LOCALES
// ============================================================================

interface UsuarioConRoles {
  usuario: Usuario;
  roles: Rol[];
  cantidadRoles: number;
  seleccionado: boolean;
}

interface RolConUsuarios {
  rol: Rol;
  usuarios: Usuario[];
  cantidadUsuarios: number;
  seleccionado: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

@Component({
  selector: 'app-usuarios-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './usuarios-roles.component.html',
  styleUrl: './usuarios-roles.component.scss'
})
export class UsuariosRolesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly usuariosRolesService = inject(UsuariosRolesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  // Estado del componente
  readonly vistaActual = signal<'usuarios' | 'roles'>('usuarios');
  readonly modoSeleccion = signal<boolean>(false);
  readonly filtrosForm: FormGroup;

  // Selecciones
  readonly seleccionUsuarios = new SelectionModel<number>(true, []);
  readonly seleccionRoles = new SelectionModel<number>(true, []);

  // Datos del servicio
  readonly loading = this.usuariosRolesService.loading;
  readonly error = this.usuariosRolesService.error;
  readonly usuarios = this.usuariosRolesService.usuarios;
  readonly roles = this.usuariosRolesService.roles;
  readonly usuarioRoles = this.usuariosRolesService.usuarioRolesFiltrados;
  readonly estadisticas = this.usuariosRolesService.estadisticas;
  readonly filtros = this.usuariosRolesService.filtros;

  // Datos procesados para las vistas
  readonly usuariosConRoles = computed((): UsuarioConRoles[] => {
    const usuarios = this.usuarios();
    const asignaciones = this.usuarioRoles();
    
    return usuarios.map(usuario => {
      const rolesUsuario = asignaciones
        .filter(ur => ur.usuarioId === usuario.id && ur.asignado)
        .map(ur => this.roles().find(r => r.id === ur.rolId)!)
        .filter(Boolean);
      
      return {
        usuario,
        roles: rolesUsuario,
        cantidadRoles: rolesUsuario.length,
        seleccionado: this.seleccionUsuarios.isSelected(usuario.id)
      };
    });
  });

  readonly rolesConUsuarios = computed((): RolConUsuarios[] => {
    const roles = this.roles();
    const asignaciones = this.usuarioRoles();
    
    return roles.map(rol => {
      const usuariosRol = asignaciones
        .filter(ur => ur.rolId === rol.id && ur.asignado)
        .map(ur => this.usuarios().find(u => u.id === ur.usuarioId)!)
        .filter(Boolean);
      
      return {
        rol,
        usuarios: usuariosRol,
        cantidadUsuarios: usuariosRol.length,
        seleccionado: this.seleccionRoles.isSelected(rol.id)
      };
    });
  });

  // Columnas de las tablas
  readonly columnasUsuarios = ['select', 'usuario', 'email', 'roles', 'cantidadRoles', 'acciones'];
  readonly columnasRoles = ['select', 'rol', 'descripcion', 'usuarios', 'cantidadUsuarios', 'acciones'];

  // Estadísticas computadas
  readonly usuariosSeleccionados = computed(() => this.seleccionUsuarios.selected.length);
  readonly rolesSeleccionados = computed(() => this.seleccionRoles.selected.length);
  readonly tieneSeleccion = computed(() => 
    this.usuariosSeleccionados() > 0 || this.rolesSeleccionados() > 0
  );

  constructor() {
    // Inicializar formulario de filtros
    this.filtrosForm = this.fb.group({
      search: [''],
      usuarioId: [null],
      rolId: [null],
      activo: [null]
    });

    // Configurar efectos reactivos
    this.configurarEfectos();
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarFiltros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // MÉTODOS DE INICIALIZACIÓN
  // ============================================================================

  private cargarDatos(): void {
    // Cargar usuarios, roles y asignaciones
    this.usuariosRolesService.cargarUsuarios().subscribe();
    this.usuariosRolesService.cargarRoles().subscribe();
    this.usuariosRolesService.cargarUsuarioRoles().subscribe();
  }

  private configurarFiltros(): void {
    // Configurar filtros reactivos con debounce
    this.filtrosForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(filtros => {
        this.aplicarFiltros(filtros);
      });
  }

  private configurarEfectos(): void {
    // Efecto para limpiar selecciones al cambiar de vista
    effect(() => {
      const vista = this.vistaActual();
      this.limpiarSelecciones();
    });

    // Efecto para actualizar modo selección
    effect(() => {
      const tieneSeleccion = this.tieneSeleccion();
      if (!tieneSeleccion && this.modoSeleccion()) {
        this.modoSeleccion.set(false);
      }
    });
  }

  // ============================================================================
  // MÉTODOS DE VISTA Y NAVEGACIÓN
  // ============================================================================

  cambiarVista(vista: 'usuarios' | 'roles'): void {
    this.vistaActual.set(vista);
    this.limpiarSelecciones();
  }

  toggleModoSeleccion(): void {
    const nuevoModo = !this.modoSeleccion();
    this.modoSeleccion.set(nuevoModo);
    
    if (!nuevoModo) {
      this.limpiarSelecciones();
    }
  }

  // ============================================================================
  // MÉTODOS DE FILTROS
  // ============================================================================

  aplicarFiltros(filtros: any): void {
    const filtrosLimpios: UsuarioRolesFilters = {
      search: filtros.search || undefined,
      usuarioId: filtros.usuarioId || undefined,
      rolId: filtros.rolId || undefined,
      activo: filtros.activo !== null ? filtros.activo : undefined
    };

    this.usuariosRolesService.actualizarFiltros(filtrosLimpios);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.usuariosRolesService.limpiarFiltros();
  }

  // ============================================================================
  // MÉTODOS DE SELECCIÓN
  // ============================================================================

  toggleSeleccionUsuario(usuarioId: number): void {
    this.seleccionUsuarios.toggle(usuarioId);
  }

  toggleSeleccionRol(rolId: number): void {
    this.seleccionRoles.toggle(rolId);
  }

  seleccionarTodosUsuarios(): void {
    const todosSeleccionados = this.usuariosConRoles().every(u => u.seleccionado);
    
    if (todosSeleccionados) {
      this.seleccionUsuarios.clear();
    } else {
      const ids = this.usuariosConRoles().map(u => u.usuario.id);
      this.seleccionUsuarios.select(...ids);
    }
  }

  seleccionarTodosRoles(): void {
    const todosSeleccionados = this.rolesConUsuarios().every(r => r.seleccionado);
    
    if (todosSeleccionados) {
      this.seleccionRoles.clear();
    } else {
      const ids = this.rolesConUsuarios().map(r => r.rol.id);
      this.seleccionRoles.select(...ids);
    }
  }

  limpiarSelecciones(): void {
    this.seleccionUsuarios.clear();
    this.seleccionRoles.clear();
  }

  // ============================================================================
  // MÉTODOS DE ASIGNACIÓN
  // ============================================================================

  asignarRolAUsuario(usuarioId: number, rolId: number): void {
    this.usuariosRolesService.asignarRol({ usuarioId, rolId })
      .subscribe({
        next: () => {
          this.snackBar.open('Rol asignado correctamente', 'Cerrar', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open(`Error: ${error.message}`, 'Cerrar', {
            duration: 5000
          });
        }
      });
  }

  desasignarRolDeUsuario(usuarioId: number, rolId: number): void {
    this.usuariosRolesService.desasignarRol(usuarioId, rolId)
      .subscribe({
        next: () => {
          this.snackBar.open('Rol desasignado correctamente', 'Cerrar', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open(`Error: ${error.message}`, 'Cerrar', {
            duration: 5000
          });
        }
      });
  }

  // ============================================================================
  // MÉTODOS DE DIÁLOGOS
  // ============================================================================

  abrirAsignacionMasiva(): void {
    const dialogRef = this.dialog.open(AsignacionMasivaDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        usuarios: this.usuarios(),
        roles: this.roles(),
        usuariosSeleccionados: this.seleccionUsuarios.selected,
        rolesSeleccionados: this.seleccionRoles.selected,
        vistaActual: this.vistaActual()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.procesarAsignacionMasiva(result);
      }
    });
  }

  abrirPermisosEfectivos(usuarioId: number): void {
    const dialogRef = this.dialog.open(PermisosEfectivosDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: { usuarioId }
    });
  }

  // ============================================================================
  // MÉTODOS DE PROCESAMIENTO
  // ============================================================================

  private procesarAsignacionMasiva(resultado: any): void {
    if (resultado.tipo === 'usuario-roles') {
      // Asignar múltiples roles a un usuario
      this.usuariosRolesService.asignacionMasivaUsuario(resultado.data)
        .subscribe({
          next: () => {
            this.limpiarSelecciones();
            this.snackBar.open('Asignación masiva completada', 'Cerrar', {
              duration: 3000
            });
          },
          error: (error) => {
            this.snackBar.open(`Error: ${error.message}`, 'Cerrar', {
              duration: 5000
            });
          }
        });
    } else if (resultado.tipo === 'rol-usuarios') {
      // Asignar un rol a múltiples usuarios
      this.usuariosRolesService.asignacionMasivaRol(resultado.data)
        .subscribe({
          next: () => {
            this.limpiarSelecciones();
            this.snackBar.open('Asignación masiva completada', 'Cerrar', {
              duration: 3000
            });
          },
          error: (error) => {
            this.snackBar.open(`Error: ${error.message}`, 'Cerrar', {
              duration: 5000
            });
          }
        });
    }
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  obtenerRolesUsuario(usuarioId: number): Rol[] {
    return this.usuariosConRoles()
      .find(u => u.usuario.id === usuarioId)?.roles || [];
  }

  obtenerUsuariosRol(rolId: number): Usuario[] {
    return this.rolesConUsuarios()
      .find(r => r.rol.id === rolId)?.usuarios || [];
  }

  usuarioTieneRol(usuarioId: number, rolId: number): boolean {
    return this.usuarioRoles().some(ur => 
      ur.usuarioId === usuarioId && ur.rolId === rolId && ur.asignado
    );
  }

  formatearFechaAsignacion(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha);
  }

  // ============================================================================
  // MÉTODOS DE EXPORTACIÓN
  // ============================================================================

  exportarDatos(): void {
    const datos = {
      usuarios: this.usuariosConRoles(),
      roles: this.rolesConUsuarios(),
      estadisticas: this.estadisticas(),
      fechaExportacion: new Date()
    };

    const blob = new Blob([JSON.stringify(datos, null, 2)], {
      type: 'application/json'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuarios-roles-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ============================================================================
  // MÉTODOS DE ACCESIBILIDAD
  // ============================================================================

  anunciarCambioVista(vista: string): void {
    const mensaje = `Vista cambiada a ${vista}`;
    // Aquí se podría integrar con un servicio de accesibilidad
    console.log(mensaje);
  }

  anunciarSeleccion(tipo: string, cantidad: number): void {
    const mensaje = `${cantidad} ${tipo} seleccionados`;
    // Aquí se podría integrar con un servicio de accesibilidad
    console.log(mensaje);
  }

  trackByUsuarioRol(index: number, item: any): any {
    return item.id || index;
  }
}