// ============================================================================
// ASIGNACION MASIVA DIALOG COMPONENT
// ============================================================================
// Diálogo para asignación masiva de roles a usuarios o usuarios a roles
// Incluye validaciones, preview y confirmación
// ============================================================================

import { 
  Component, 
  OnInit, 
  Inject, 
  signal, 
  computed 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { SelectionModel } from '@angular/cdk/collections';

import { Usuario, Rol } from '../../../../domain/seguridad.types';
import { 
  AsignacionRolesMasivaDto, 
  AsignacionMasivaUsuariosDto 
} from '../usuarios-roles.service';

// ============================================================================
// INTERFACES
// ============================================================================

interface DialogData {
  usuarios: Usuario[];
  roles: Rol[];
  usuariosSeleccionados: number[];
  rolesSeleccionados: number[];
  vistaActual: 'usuarios' | 'roles';
}

interface PreviewAsignacion {
  tipo: 'usuario-roles' | 'rol-usuarios';
  usuario?: Usuario;
  rol?: Rol;
  usuarios?: Usuario[];
  roles?: Rol[];
  accion: 'asignar' | 'desasignar';
  cantidad: number;
}

// ============================================================================
// COMPONENTE
// ============================================================================

@Component({
  selector: 'app-asignacion-masiva-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule
  ],
  templateUrl: './asignacion-masiva-dialog.component.html',
  styleUrl: './asignacion-masiva-dialog.component.scss'
})
export class AsignacionMasivaDialogComponent implements OnInit {
  readonly form: FormGroup;
  readonly tipoAsignacion = signal<'usuario-roles' | 'rol-usuarios'>('usuario-roles');
  readonly accionSeleccionada = signal<'asignar' | 'desasignar'>('asignar');
  
  // Selecciones
  readonly seleccionUsuarios = new SelectionModel<number>(true, []);
  readonly seleccionRoles = new SelectionModel<number>(true, []);
  
  // Datos computados
  readonly usuariosDisponibles = computed(() => {
    const usuarios = this.data.usuarios;
    const filtro = this.form?.get('filtroUsuarios')?.value?.toLowerCase() || '';
    
    return usuarios.filter(usuario => 
      usuario.nombre.toLowerCase().includes(filtro) ||
      usuario.apellidos.toLowerCase().includes(filtro) ||
      usuario.email.toLowerCase().includes(filtro)
    );
  });
  
  readonly rolesDisponibles = computed(() => {
    const roles = this.data.roles;
    const filtro = this.form?.get('filtroRoles')?.value?.toLowerCase() || '';
    
    return roles.filter(rol => 
      rol.nombre.toLowerCase().includes(filtro) ||
      rol.descripcion?.toLowerCase().includes(filtro)
    );
  });
  
  readonly previewAsignacion = computed((): PreviewAsignacion | null => {
    const tipo = this.tipoAsignacion();
    const accion = this.accionSeleccionada();
    
    if (tipo === 'usuario-roles') {
      const usuarioId = this.form?.get('usuarioSeleccionado')?.value;
      const rolesSeleccionados = this.seleccionRoles.selected;
      
      if (!usuarioId || rolesSeleccionados.length === 0) return null;
      
      const usuario = this.data.usuarios.find(u => u.id === usuarioId);
      const roles = this.data.roles.filter(r => rolesSeleccionados.includes(r.id));
      
      return {
        tipo,
        usuario,
        roles,
        accion,
        cantidad: roles.length
      };
    } else {
      const rolId = this.form?.get('rolSeleccionado')?.value;
      const usuariosSeleccionados = this.seleccionUsuarios.selected;
      
      if (!rolId || usuariosSeleccionados.length === 0) return null;
      
      const rol = this.data.roles.find(r => r.id === rolId);
      const usuarios = this.data.usuarios.filter(u => usuariosSeleccionados.includes(u.id));
      
      return {
        tipo,
        rol,
        usuarios,
        accion,
        cantidad: usuarios.length
      };
    }
  });
  
  readonly puedeConfirmar = computed(() => {
    const preview = this.previewAsignacion();
    return preview !== null && preview.cantidad > 0;
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AsignacionMasivaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: DialogData
  ) {
    // Inicializar formulario
    this.form = this.fb.group({
      usuarioSeleccionado: [null, Validators.required],
      rolSeleccionado: [null, Validators.required],
      filtroUsuarios: [''],
      filtroRoles: ['']
    });
    
    // Configurar tipo inicial basado en la vista actual
    if (data.vistaActual === 'usuarios' && data.usuariosSeleccionados.length > 0) {
      this.tipoAsignacion.set('rol-usuarios');
      this.seleccionUsuarios.select(...data.usuariosSeleccionados);
    } else if (data.vistaActual === 'roles' && data.rolesSeleccionados.length > 0) {
      this.tipoAsignacion.set('usuario-roles');
      this.seleccionRoles.select(...data.rolesSeleccionados);
    }
  }

  ngOnInit(): void {
    this.configurarValidaciones();
  }

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  private configurarValidaciones(): void {
    // Actualizar validaciones según el tipo de asignación
    this.tipoAsignacion.subscribe(tipo => {
      if (tipo === 'usuario-roles') {
        this.form.get('usuarioSeleccionado')?.setValidators([Validators.required]);
        this.form.get('rolSeleccionado')?.clearValidators();
      } else {
        this.form.get('rolSeleccionado')?.setValidators([Validators.required]);
        this.form.get('usuarioSeleccionado')?.clearValidators();
      }
      
      this.form.get('usuarioSeleccionado')?.updateValueAndValidity();
      this.form.get('rolSeleccionado')?.updateValueAndValidity();
    });
  }

  // ============================================================================
  // MÉTODOS DE TIPO DE ASIGNACIÓN
  // ============================================================================

  cambiarTipoAsignacion(tipo: 'usuario-roles' | 'rol-usuarios'): void {
    this.tipoAsignacion.set(tipo);
    this.limpiarSelecciones();
  }

  cambiarAccion(accion: 'asignar' | 'desasignar'): void {
    this.accionSeleccionada.set(accion);
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
    const usuarios = this.usuariosDisponibles();
    const todosSeleccionados = usuarios.every(u => this.seleccionUsuarios.isSelected(u.id));
    
    if (todosSeleccionados) {
      this.seleccionUsuarios.clear();
    } else {
      const ids = usuarios.map(u => u.id);
      this.seleccionUsuarios.select(...ids);
    }
  }

  seleccionarTodosRoles(): void {
    const roles = this.rolesDisponibles();
    const todosSeleccionados = roles.every(r => this.seleccionRoles.isSelected(r.id));
    
    if (todosSeleccionados) {
      this.seleccionRoles.clear();
    } else {
      const ids = roles.map(r => r.id);
      this.seleccionRoles.select(...ids);
    }
  }

  limpiarSelecciones(): void {
    this.seleccionUsuarios.clear();
    this.seleccionRoles.clear();
    this.form.patchValue({
      usuarioSeleccionado: null,
      rolSeleccionado: null
    });
  }

  // ============================================================================
  // MÉTODOS DE FILTROS
  // ============================================================================

  limpiarFiltroUsuarios(): void {
    this.form.patchValue({ filtroUsuarios: '' });
  }

  limpiarFiltroRoles(): void {
    this.form.patchValue({ filtroRoles: '' });
  }

  // ============================================================================
  // MÉTODOS DE ACCIONES
  // ============================================================================

  confirmar(): void {
    if (!this.puedeConfirmar()) return;
    
    const preview = this.previewAsignacion()!;
    const tipo = this.tipoAsignacion();
    const accion = this.accionSeleccionada();
    
    let resultado: any;
    
    if (tipo === 'usuario-roles') {
      // Asignar múltiples roles a un usuario
      const dto: AsignacionRolesMasivaDto = {
        usuarioId: preview.usuario!.id,
        rolIds: preview.roles!.map(r => r.id)
      };
      
      resultado = {
        tipo: 'usuario-roles',
        data: dto
      };
    } else {
      // Asignar un rol a múltiples usuarios
      const dto: AsignacionMasivaUsuariosDto = {
        rolId: preview.rol!.id,
        usuarioIds: preview.usuarios!.map(u => u.id),
        accion
      };
      
      resultado = {
        tipo: 'rol-usuarios',
        data: dto
      };
    }
    
    this.dialogRef.close(resultado);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  obtenerIniciales(nombre: string, apellidos: string): string {
    const inicialNombre = nombre.charAt(0).toUpperCase();
    const inicialApellido = apellidos.charAt(0).toUpperCase();
    return `${inicialNombre}${inicialApellido}`;
  }

  obtenerNombreCompleto(usuario: Usuario): string {
    return `${usuario.nombre} ${usuario.apellidos}`;
  }

  formatearDescripcionPreview(): string {
    const preview = this.previewAsignacion();
    if (!preview) return '';
    
    const accion = preview.accion === 'asignar' ? 'asignar' : 'desasignar';
    
    if (preview.tipo === 'usuario-roles') {
      const usuario = this.obtenerNombreCompleto(preview.usuario!);
      const cantidad = preview.cantidad;
      const roles = cantidad === 1 ? 'rol' : 'roles';
      
      return `Se ${accion === 'asignar' ? 'asignarán' : 'desasignarán'} ${cantidad} ${roles} ${accion === 'asignar' ? 'a' : 'de'} ${usuario}`;
    } else {
      const rol = preview.rol!.nombre;
      const cantidad = preview.cantidad;
      const usuarios = cantidad === 1 ? 'usuario' : 'usuarios';
      
      return `Se ${accion === 'asignar' ? 'asignará' : 'desasignará'} el rol "${rol}" ${accion === 'asignar' ? 'a' : 'de'} ${cantidad} ${usuarios}`;
    }
  }

  // ============================================================================
  // MÉTODOS DE VALIDACIÓN
  // ============================================================================

  validarAsignacion(): string[] {
    const errores: string[] = [];
    const preview = this.previewAsignacion();
    
    if (!preview) {
      errores.push('Debe seleccionar al menos un elemento para la asignación');
      return errores;
    }
    
    if (preview.tipo === 'usuario-roles') {
      if (!preview.usuario) {
        errores.push('Debe seleccionar un usuario');
      }
      if (!preview.roles || preview.roles.length === 0) {
        errores.push('Debe seleccionar al menos un rol');
      }
    } else {
      if (!preview.rol) {
        errores.push('Debe seleccionar un rol');
      }
      if (!preview.usuarios || preview.usuarios.length === 0) {
        errores.push('Debe seleccionar al menos un usuario');
      }
    }
    
    return errores;
  }

  obtenerMensajeValidacion(): string {
    const errores = this.validarAsignacion();
    return errores.length > 0 ? errores[0] : '';
  }

  obtenerTituloAccion(): string {
    const accion = this.accionSeleccionada();
    const tipo = this.tipoAsignacion();
    
    if (accion === 'asignar') {
      return tipo === 'usuario-roles' ? 'Asignar Roles' : 'Asignar Usuarios';
    } else {
      return tipo === 'usuario-roles' ? 'Revocar Roles' : 'Revocar Usuarios';
    }
  }

  obtenerTextoBotonAccion(): string {
    const accion = this.accionSeleccionada();
    return accion === 'asignar' ? 'Asignar' : 'Revocar';
  }
}