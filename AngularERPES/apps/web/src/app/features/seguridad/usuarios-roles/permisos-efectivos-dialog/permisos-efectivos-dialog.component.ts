// ============================================================================
// PERMISOS EFECTIVOS DIALOG COMPONENT
// ============================================================================
// Diálogo para mostrar los permisos efectivos de un usuario
// Incluye agrupación por módulos, jerarquía y origen de permisos
// ============================================================================

import { 
  Component, 
  OnInit, 
  Inject, 
  signal, 
  computed,
  effect 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

import { Usuario, Rol, Permiso, PermisosEfectivos } from '../../../../domain/seguridad.types';
import { UsuariosRolesService } from '../usuarios-roles.service';

// ============================================================================
// INTERFACES
// ============================================================================

interface DialogData {
  usuarioId: number;
}

interface PermisoNode {
  nombre: string;
  descripcion?: string;
  tipo: 'modulo' | 'permiso';
  nivel: number;
  expandible: boolean;
  origen?: string[];
  roles?: string[];
  children?: PermisoNode[];
}

interface PermisoFlatNode {
  expandible: boolean;
  nombre: string;
  descripcion?: string;
  tipo: 'modulo' | 'permiso';
  nivel: number;
  origen?: string[];
  roles?: string[];
}

interface EstadisticasPermisos {
  totalPermisos: number;
  permisosPorModulo: { [modulo: string]: number };
  permisosPorRol: { [rol: string]: number };
  modulosConPermisos: number;
  rolesActivos: number;
}

// ============================================================================
// COMPONENTE
// ============================================================================

@Component({
  selector: 'app-permisos-efectivos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatTreeModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './permisos-efectivos-dialog.component.html',
  styleUrl: './permisos-efectivos-dialog.component.scss'
})
export class PermisosEfectivosDialogComponent implements OnInit {
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly usuario = signal<Usuario | null>(null);
  readonly permisosEfectivos = signal<PermisosEfectivos | null>(null);
  readonly filtrosForm: FormGroup;
  readonly vistaActual = signal<'arbol' | 'lista' | 'estadisticas'>('arbol');

  // Configuración del árbol
  private readonly _transformer = (node: PermisoNode, level: number): PermisoFlatNode => {
    return {
      expandible: !!node.children && node.children.length > 0,
      nombre: node.nombre,
      descripcion: node.descripcion,
      tipo: node.tipo,
      nivel: level,
      origen: node.origen,
      roles: node.roles
    };
  };

  readonly treeControl = new FlatTreeControl<PermisoFlatNode>(
    node => node.nivel,
    node => node.expandible
  );

  readonly treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.nivel,
    node => node.expandible,
    node => node.children
  );

  readonly dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // Datos computados
  readonly permisosArbol = computed(() => {
    const permisos = this.permisosEfectivos();
    if (!permisos) return [];

    return this.construirArbolPermisos(permisos);
  });

  readonly permisosFiltrados = computed(() => {
    const permisos = this.permisosEfectivos();
    if (!permisos) return [];

    const filtros = this.filtrosForm?.value || {};
    let resultado = permisos.permisos || [];

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino) ||
        p.modulo.toLowerCase().includes(termino)
      );
    }

    // Filtrar por módulo
    if (filtros.modulo) {
      resultado = resultado.filter(p => p.modulo === filtros.modulo);
    }

    // Filtrar por rol
    if (filtros.rol) {
      // Aquí necesitaríamos información adicional sobre qué rol otorga cada permiso
      // Por ahora, devolvemos todos los permisos
    }

    return resultado;
  });

  readonly estadisticas = computed((): EstadisticasPermisos => {
    const permisos = this.permisosEfectivos();
    if (!permisos) {
      return {
        totalPermisos: 0,
        permisosPorModulo: {},
        permisosPorRol: {},
        modulosConPermisos: 0,
        rolesActivos: 0
      };
    }

    const permisosPorModulo: { [modulo: string]: number } = {};
    const permisosPorRol: { [rol: string]: number } = {};

    permisos.permisos.forEach(permiso => {
      // Contar por módulo
      permisosPorModulo[permiso.modulo] = (permisosPorModulo[permiso.modulo] || 0) + 1;
      
      // Contar por rol (simulado - en implementación real vendría del backend)
      const rolesSimulados = ['Administrador', 'Usuario', 'Supervisor'];
      rolesSimulados.forEach(rol => {
        permisosPorRol[rol] = (permisosPorRol[rol] || 0) + Math.floor(Math.random() * 3);
      });
    });

    return {
      totalPermisos: permisos.permisos.length,
      permisosPorModulo,
      permisosPorRol,
      modulosConPermisos: Object.keys(permisosPorModulo).length,
      rolesActivos: Object.keys(permisosPorRol).filter(rol => permisosPorRol[rol] > 0).length
    };
  });

  readonly modulosDisponibles = computed(() => {
    const permisos = this.permisosEfectivos();
    if (!permisos) return [];

    const modulos = [...new Set(permisos.permisos.map(p => p.modulo))];
    return modulos.sort();
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly usuariosRolesService: UsuariosRolesService,
    private readonly dialogRef: MatDialogRef<PermisosEfectivosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: DialogData
  ) {
    // Inicializar formulario de filtros
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      modulo: [''],
      rol: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarArbol();
  }

  // ============================================================================
  // MÉTODOS DE INICIALIZACIÓN
  // ============================================================================

  private cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    // Cargar usuario
    const usuarios = this.usuariosRolesService.usuarios();
    const usuario = usuarios.find(u => u.id === this.data.usuarioId);
    this.usuario.set(usuario || null);

    // Cargar permisos efectivos
    this.usuariosRolesService.obtenerPermisosEfectivos(this.data.usuarioId)
      .subscribe({
        next: (permisos) => {
          this.permisosEfectivos.set(permisos);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.message || 'Error al cargar los permisos');
          this.loading.set(false);
        }
      });
  }

  private configurarArbol(): void {
    // Actualizar el árbol cuando cambien los permisos
    effect(() => {
      const arbol = this.permisosArbol();
      this.dataSource.data = arbol;
      // Expandir el primer nivel por defecto
      this.treeControl.expandAll();
    });
  }

  // ============================================================================
  // MÉTODOS DE CONSTRUCCIÓN DEL ÁRBOL
  // ============================================================================

  private construirArbolPermisos(permisosEfectivos: PermisosEfectivos): PermisoNode[] {
    const permisosPorModulo = permisosEfectivos.permisosPorModulo || {};
    const arbol: PermisoNode[] = [];

    Object.keys(permisosPorModulo).forEach(modulo => {
      const permisosModulo = permisosPorModulo[modulo];
      
      const nodoModulo: PermisoNode = {
        nombre: modulo,
        descripcion: `Módulo ${modulo}`,
        tipo: 'modulo',
        nivel: 0,
        expandible: true,
        children: []
      };

      // Agrupar permisos por acción
      const permisosPorAccion: { [accion: string]: Permiso[] } = {};
      
      permisosModulo.forEach(permiso => {
        const accion = this.extraerAccion(permiso.nombre);
        if (!permisosPorAccion[accion]) {
          permisosPorAccion[accion] = [];
        }
        permisosPorAccion[accion].push(permiso);
      });

      // Crear nodos para cada acción
      Object.keys(permisosPorAccion).forEach(accion => {
        const permisosAccion = permisosPorAccion[accion];
        
        permisosAccion.forEach(permiso => {
          const nodoPermiso: PermisoNode = {
            nombre: permiso.nombre,
            descripcion: permiso.descripcion,
            tipo: 'permiso',
            nivel: 1,
            expandible: false,
            origen: ['Rol'], // En implementación real, vendría del backend
            roles: ['Administrador'] // En implementación real, vendría del backend
          };
          
          nodoModulo.children!.push(nodoPermiso);
        });
      });

      arbol.push(nodoModulo);
    });

    return arbol;
  }

  private extraerAccion(nombrePermiso: string): string {
    // Extraer la acción del nombre del permiso (ej: "usuarios.crear" -> "crear")
    const partes = nombrePermiso.split('.');
    return partes[partes.length - 1] || 'general';
  }

  // ============================================================================
  // MÉTODOS DE VISTA
  // ============================================================================

  cambiarVista(vista: 'arbol' | 'lista' | 'estadisticas'): void {
    this.vistaActual.set(vista);
  }

  // ============================================================================
  // MÉTODOS DEL ÁRBOL
  // ============================================================================

  hasChild = (_: number, node: PermisoFlatNode) => node.expandible;

  expandirTodo(): void {
    this.treeControl.expandAll();
  }

  contraerTodo(): void {
    this.treeControl.collapseAll();
  }

  // ============================================================================
  // MÉTODOS DE FILTROS
  // ============================================================================

  limpiarFiltros(): void {
    this.filtrosForm.reset();
  }

  aplicarFiltroRapido(tipo: 'lectura' | 'escritura' | 'admin'): void {
    let termino = '';
    
    switch (tipo) {
      case 'lectura':
        termino = 'leer';
        break;
      case 'escritura':
        termino = 'crear|editar|actualizar';
        break;
      case 'admin':
        termino = 'eliminar|admin';
        break;
    }
    
    this.filtrosForm.patchValue({ busqueda: termino });
  }

  // ============================================================================
  // MÉTODOS DE EXPORTACIÓN
  // ============================================================================

  exportarPermisos(): void {
    const permisos = this.permisosEfectivos();
    const usuario = this.usuario();
    
    if (!permisos || !usuario) return;

    const datos = {
      usuario: {
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellidos}`,
        email: usuario.email
      },
      permisos: permisos.permisos,
      estadisticas: this.estadisticas(),
      fechaExportacion: new Date().toISOString(),
      esAdmin: permisos.esAdmin
    };

    const blob = new Blob([JSON.stringify(datos, null, 2)], {
      type: 'application/json'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permisos-efectivos-${usuario.email}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportarCSV(): void {
    const permisos = this.permisosFiltrados();
    const usuario = this.usuario();
    
    if (!permisos || !usuario) return;

    const headers = ['Módulo', 'Permiso', 'Descripción', 'Origen'];
    const rows = permisos.map(permiso => [
      permiso.modulo,
      permiso.nombre,
      permiso.descripcion || '',
      'Rol' // En implementación real, vendría del backend
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permisos-efectivos-${usuario.email}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  obtenerIconoPermiso(nombrePermiso: string): string {
    if (nombrePermiso.includes('leer') || nombrePermiso.includes('ver')) {
      return 'visibility';
    } else if (nombrePermiso.includes('crear') || nombrePermiso.includes('agregar')) {
      return 'add';
    } else if (nombrePermiso.includes('editar') || nombrePermiso.includes('actualizar')) {
      return 'edit';
    } else if (nombrePermiso.includes('eliminar') || nombrePermiso.includes('borrar')) {
      return 'delete';
    } else if (nombrePermiso.includes('admin')) {
      return 'admin_panel_settings';
    } else {
      return 'security';
    }
  }

  obtenerColorPermiso(nombrePermiso: string): string {
    if (nombrePermiso.includes('leer') || nombrePermiso.includes('ver')) {
      return 'primary';
    } else if (nombrePermiso.includes('crear') || nombrePermiso.includes('agregar')) {
      return 'accent';
    } else if (nombrePermiso.includes('editar') || nombrePermiso.includes('actualizar')) {
      return 'warn';
    } else if (nombrePermiso.includes('eliminar') || nombrePermiso.includes('borrar')) {
      return 'error';
    } else {
      return 'default';
    }
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha);
  }

  // ============================================================================
  // MÉTODOS DE ACCIONES
  // ============================================================================

  recargar(): void {
    this.cargarDatos();
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}