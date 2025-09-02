import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { ToastService } from '../../../core/services/toast.service';
import { UsuariosService } from '../../../application/services/usuarios.service';
import { RolesService } from '../../../application/services/roles.service';
import { EmpresasService } from '../../../application/services/empresas.service';
import { User, Role, Empresa } from '../../../domain/auth.types';
import { TableColumn, TableAction } from '../../../domain/common.types';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="usuarios-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            Gestión de Usuarios
          </mat-card-title>
          <mat-card-subtitle>
            Administrar usuarios del sistema
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Filtros -->
          <div class="filters-section">
            <form [formGroup]="filtersForm" class="filters-form">
              <mat-form-field appearance="outline">
                <mat-label>Buscar</mat-label>
                <input matInput formControlName="search" placeholder="Nombre, email, username...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="activo">
                  <mat-option value="">Todos</mat-option>
                  <mat-option [value]="true">Activo</mat-option>
                  <mat-option [value]="false">Inactivo</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rol</mat-label>
                <mat-select formControlName="roleId">
                  <mat-option value="">Todos los roles</mat-option>
                  @for (role of roles(); track role.id) {
                    <mat-option [value]="role.id">{{ role.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <button 
                mat-raised-button 
                color="primary" 
                (click)="aplicarFiltros()"
                [disabled]="usuariosService.dataSource.loading()">
                <mat-icon>filter_list</mat-icon>
                Filtrar
              </button>

              <button 
                mat-stroked-button 
                (click)="limpiarFiltros()"
                [disabled]="usuariosService.dataSource.loading()">
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </form>
          </div>

          <!-- Estadísticas -->
          <div class="stats-section">
            <mat-chip-set>
              <mat-chip color="primary" selected>
                Total: {{ usuariosService.dataSource.total() }}
              </mat-chip>
              <mat-chip color="accent" selected>
                Activos: {{ usuariosService.usuariosActivos().length }}
              </mat-chip>
              <mat-chip color="warn" selected>
                Inactivos: {{ usuariosService.dataSource.total() - usuariosService.usuariosActivos().length }}
              </mat-chip>
            </mat-chip-set>
          </div>

          <!-- Tabla de usuarios -->
          <app-data-table
            [dataSource]="usuariosService.dataSource"
            [columns]="columns"
            [actions]="actions"
            [selectable]="true">
          </app-data-table>
        </mat-card-content>

        <mat-card-actions align="end">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="crearUsuario()"
            [disabled]="usuariosService.dataSource.loading()">
            <mat-icon>add</mat-icon>
            Nuevo Usuario
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .usuarios-container {
      padding: 20px;
    }

    .filters-section {
      margin-bottom: 20px;
    }

    .filters-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filters-form mat-form-field {
      min-width: 200px;
    }

    .stats-section {
      margin-bottom: 16px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .role-chip {
      margin: 2px;
    }

    .user-status {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-active {
      color: #4caf50;
    }

    .status-inactive {
      color: #f44336;
    }
  `]
})
export class UsuariosComponent implements OnInit {
  filtersForm: FormGroup;
  roles = signal<Role[]>([]);

  // Columnas de la tabla
  columns: TableColumn[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      width: '200px'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      width: '250px'
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      width: '150px'
    },
    {
      key: 'roles',
      label: 'Roles',
      sortable: false,
      width: '200px',
      render: (user: User) => this.renderRoles(user.roles)
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      width: '100px',
      align: 'center',
      render: (user: User) => this.renderStatus(user.activo)
    },
    {
      key: 'ultimoAcceso',
      label: 'Último Acceso',
      sortable: true,
      width: '150px',
      render: (user: User) => user.ultimoAcceso ? new Date(user.ultimoAcceso).toLocaleDateString() : 'Nunca'
    }
  ];

  // Acciones de la tabla
  actions: TableAction[] = [
    {
      id: 'view',
      label: 'Ver detalles',
      icon: 'visibility',
      color: 'primary',
      onClick: (user: User) => this.verUsuario(user)
    },
    {
      id: 'edit',
      label: 'Editar usuario',
      icon: 'edit',
      color: 'accent',
      onClick: (user: User) => this.editarUsuario(user)
    },
    {
      id: 'roles',
      label: 'Asignar roles',
      icon: 'security',
      color: 'warn',
      onClick: (user: User) => this.asignarRoles(user)
    },
    {
      id: 'delete',
      label: 'Eliminar usuario',
      icon: 'delete',
      color: 'warn',
      onClick: (user: User) => this.eliminarUsuario(user)
    }
  ];

  constructor(
    private fb: FormBuilder,
    public usuariosService: UsuariosService,
    private rolesService: RolesService,
    private empresasService: EmpresasService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    this.filtersForm = this.fb.group({
      search: [''],
      activo: [''],
      roleId: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    try {
      await Promise.all([
        this.usuariosService.cargarUsuarios(),
        this.cargarRoles(),
        this.cargarEmpresas()
      ]);
    } catch (error) {
      this.toastService.showError('Error al cargar los datos');
    }
  }

  async cargarRoles(): Promise<void> {
    try {
      await this.rolesService.cargarRoles();
      this.roles.set(this.rolesService.roles());
    } catch (error) {
      this.toastService.showError('Error al cargar roles');
    }
  }

  async cargarEmpresas(): Promise<void> {
    try {
      await this.empresasService.cargarEmpresas();
    } catch (error) {
      this.toastService.showError('Error al cargar empresas');
    }
  }

  async aplicarFiltros(): Promise<void> {
    const filters = this.filtersForm.value;
    await this.usuariosService.cargarUsuarios(filters);
  }

  async limpiarFiltros(): Promise<void> {
    this.filtersForm.reset();
    await this.usuariosService.cargarUsuarios();
  }

  async crearUsuario(): Promise<void> {
    const { UsuarioDialogComponent } = await import('./usuario-dialog.component');
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '700px',
      data: {
        usuario: undefined,
        roles: this.roles(),
        empresas: this.empresasService.empresas(),
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.usuariosService.cargarUsuarios();
      }
    });
  }

  async onActionClick(event: { action: TableAction; item: User }): Promise<void> {
    // Las acciones ahora se manejan directamente en la definición de actions
  }

  async verUsuario(usuario: User): Promise<void> {
    // TODO: Implementar vista de detalles
    this.toastService.showInfo(`Viendo usuario: ${usuario.nombre}`);
  }

  async editarUsuario(usuario: User): Promise<void> {
    const { UsuarioDialogComponent } = await import('./usuario-dialog.component');
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '700px',
      data: {
        usuario: usuario,
        roles: this.roles(),
        empresas: this.empresasService.empresas(),
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.usuariosService.cargarUsuarios();
      }
    });
  }

  async asignarRoles(usuario: User): Promise<void> {
    const { AsignarRolesDialogComponent } = await import('./asignar-roles-dialog.component');
    const dialogRef = this.dialog.open(AsignarRolesDialogComponent, {
      width: '600px',
      data: {
        usuario: usuario,
        rolesDisponibles: this.roles()
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.usuariosService.cargarUsuarios();
      }
    });
  }

  async eliminarUsuario(usuario: User): Promise<void> {
    const confirmed = confirm(`¿Estás seguro de que quieres eliminar al usuario "${usuario.nombre}"?`);
    
    if (confirmed) {
      try {
        await this.usuariosService.eliminarUsuario(usuario.id);
        this.toastService.showSuccess('Usuario eliminado correctamente');
        await this.usuariosService.cargarUsuarios();
      } catch (error: any) {
        this.toastService.showError(error.message || 'Error al eliminar usuario');
      }
    }
  }

  private renderRoles(roles: Role[]): string {
    if (!roles || roles.length === 0) return 'Sin roles';
    return roles.map(role => role.nombre).join(', ');
  }

  private renderStatus(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
