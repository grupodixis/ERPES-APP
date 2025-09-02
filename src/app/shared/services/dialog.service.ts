import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../components/confirm-dialog.component';
import { EntitySelectorDialogComponent, EntitySelectorDialogData, EntitySelectorDialogResult } from '../components/entity-selector-dialog.component';
import { EntityOption, TableColumn, ConfirmDialogData, ConfirmDialogResult } from '../../domain/common.types';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Abre un diálogo de confirmación
   */
  confirm(data: ConfirmDialogData): Observable<ConfirmDialogResult> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: false,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Abre un diálogo de confirmación para eliminar
   */
  confirmDelete(itemName: string): Observable<ConfirmDialogResult> {
    return this.confirm({
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'warning',
    });
  }

  /**
   * Abre un diálogo de confirmación para guardar cambios
   */
  confirmSave(): Observable<ConfirmDialogResult> {
    return this.confirm({
      title: 'Guardar cambios',
      message: '¿Desea guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
      type: 'info',
    });
  }

  /**
   * Abre un diálogo de confirmación para salir sin guardar
   */
  confirmDiscardChanges(): Observable<ConfirmDialogResult> {
    return this.confirm({
      title: 'Descartar cambios',
      message: 'Tiene cambios sin guardar. ¿Está seguro de que desea salir sin guardar?',
      confirmText: 'Salir sin guardar',
      cancelText: 'Cancelar',
      type: 'warning',
    });
  }

  /**
   * Abre un diálogo de selección de entidad
   */
  selectEntity<T = any>(data: EntitySelectorDialogData<T>): Observable<EntitySelectorDialogResult<T>> {
    const dialogRef = this.dialog.open(EntitySelectorDialogComponent<T>, {
      data,
      width: '800px',
      height: '600px',
      disableClose: false,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Abre un diálogo de selección de usuario
   */
  selectUser(selectedId?: string | number): Observable<EntitySelectorDialogResult<any>> {
    const columns: TableColumn<any>[] = [
      { key: 'username', label: 'Usuario', sortable: true },
      { key: 'nombre', label: 'Nombre', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'activo', label: 'Activo', sortable: true, render: (item) => item.activo ? 'Sí' : 'No' },
    ];

    return this.selectEntity({
      title: 'Seleccionar Usuario',
      searchPlaceholder: 'Buscar usuarios...',
      columns,
      selectedId,
      loadOptions: async (search: string) => {
        // Mock data - en una implementación real esto haría una llamada HTTP
        const mockUsers = [
          { id: 1, username: 'admin', nombre: 'Administrador', email: 'admin@empresa.com', activo: true },
          { id: 2, username: 'usuario1', nombre: 'Usuario Uno', email: 'usuario1@empresa.com', activo: true },
          { id: 3, username: 'usuario2', nombre: 'Usuario Dos', email: 'usuario2@empresa.com', activo: false },
        ];

        const filtered = mockUsers.filter(user => 
          (user.username?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (user.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (user.email?.toLowerCase() || '').includes(search.toLowerCase())
        );

        return filtered.map(user => ({
          id: user.id,
          label: `${user.nombre} (${user.username})`,
          description: user.email,
          data: user,
        }));
      },
    });
  }

  /**
   * Abre un diálogo de selección de empresa
   */
  selectEmpresa(selectedId?: string | number): Observable<EntitySelectorDialogResult<any>> {
    const columns: TableColumn<any>[] = [
      { key: 'nombre', label: 'Nombre', sortable: true },
      { key: 'nif', label: 'NIF', sortable: true },
      { key: 'activa', label: 'Activa', sortable: true, render: (item) => item.activa ? 'Sí' : 'No' },
    ];

    return this.selectEntity({
      title: 'Seleccionar Empresa',
      searchPlaceholder: 'Buscar empresas...',
      columns,
      selectedId,
      loadOptions: async (search: string) => {
        // Mock data
        const mockEmpresas = [
          { id: 1, nombre: 'Empresa Demo S.L.', nif: 'B12345678', activa: true },
          { id: 2, nombre: 'Constructora Ejemplo S.A.', nif: 'A87654321', activa: true },
          { id: 3, nombre: 'Empresa Inactiva S.L.', nif: 'C11111111', activa: false },
        ];

        const filtered = mockEmpresas.filter((empresa: any) => 
          (empresa.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (empresa.nif?.toLowerCase() || '').includes(search.toLowerCase())
        );

        return filtered.map((empresa: any) => ({
          id: empresa.id,
          label: empresa.nombre,
          description: empresa.nif,
          data: empresa,
        }));
      },
    });
  }
}
