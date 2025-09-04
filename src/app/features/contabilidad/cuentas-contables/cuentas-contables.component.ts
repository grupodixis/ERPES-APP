import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { ContabilidadService } from '../contabilidad.service';
import { CuentaContable, TipoCuenta, NaturalezaCuenta } from '../contabilidad.types';

interface CuentaNode {
  cuenta: CuentaContable;
  children?: CuentaNode[];
}

interface FlatCuentaNode {
  expandable: boolean;
  cuenta: CuentaContable;
  level: number;
}

@Component({
  selector: 'app-cuentas-contables',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,

    MatDialogModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatTreeModule,
    MatCheckboxModule,
    DragDropModule
  ],
  templateUrl: './cuentas-contables.component.html',
  styleUrls: ['./cuentas-contables.component.scss']
})
export class CuentasContablesComponent implements OnInit {
  private contabilidadService = inject(ContabilidadService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals para el estado
  cuentas = signal<CuentaContable[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedCuenta = signal<CuentaContable | null>(null);
  viewMode = signal<'tree' | 'table'>('tree');

  // Filtros
  codigoFilter = new FormControl('');
  nombreFilter = new FormControl('');
  tipoFilter = new FormControl<TipoCuenta | ''>('');
  naturalezaFilter = new FormControl<NaturalezaCuenta | ''>('');
  activoFilter = new FormControl<string>('');
  nivelFilter = new FormControl<number | null>(null);

  // Configuración de paginación y ordenamiento
  pageSize = signal(50);
  pageIndex = signal(0);
  totalItems = signal(0);
  sortField = signal<string>('codigo');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Configuración del árbol
  private transformer = (node: CuentaNode, level: number): FlatCuentaNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      cuenta: node.cuenta,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatCuentaNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // Configuración de la tabla
  displayedColumns = ['codigo', 'nombre', 'tipo', 'naturaleza', 'nivel', 'saldo', 'activo', 'acciones'];

  // Computed values
  filteredCuentas = computed(() => {
    let cuentas = this.cuentas();
    
    const codigo = this.codigoFilter.value?.toLowerCase() || '';
    const nombre = this.nombreFilter.value?.toLowerCase() || '';
    const tipo = this.tipoFilter.value;
    const naturaleza = this.naturalezaFilter.value;
    const activo = this.activoFilter.value;
    const nivel = this.nivelFilter.value;

    if (codigo) {
      cuentas = cuentas.filter(c => c.codigo.toLowerCase().includes(codigo));
    }
    if (nombre) {
      cuentas = cuentas.filter(c => c.nombre.toLowerCase().includes(nombre));
    }
    if (tipo) {
      cuentas = cuentas.filter(c => c.tipoCuenta === tipo);
    }
    if (naturaleza) {
      cuentas = cuentas.filter(c => c.naturaleza === naturaleza);
    }
    if (activo !== '') {
      const isActive = activo === 'true';
      cuentas = cuentas.filter(c => c.activa === isActive);
    }
    if (nivel !== null) {
      cuentas = cuentas.filter(c => c.nivel === nivel);
    }

    return cuentas;
  });

  paginatedCuentas = computed(() => {
    const filtered = this.filteredCuentas();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  treeData = computed(() => {
    const cuentas = this.filteredCuentas();
    return this.buildTree(cuentas);
  });

  estadisticas = computed(() => {
    const cuentas = this.cuentas();
    return {
      total: cuentas.length,
      activas: cuentas.filter(c => c.activa).length,
      inactivas: cuentas.filter(c => !c.activa).length,
      conSaldo: cuentas.filter(c => c.saldoActual !== 0).length,
      porTipo: {
        activo: cuentas.filter(c => c.tipoCuenta === TipoCuenta.ACTIVO).length,
        pasivo: cuentas.filter(c => c.tipoCuenta === TipoCuenta.PASIVO).length,
        patrimonio: cuentas.filter(c => c.tipoCuenta === TipoCuenta.PATRIMONIO).length,
        ingreso: cuentas.filter(c => c.tipoCuenta === TipoCuenta.INGRESOS).length,
        gasto: cuentas.filter(c => c.tipoCuenta === TipoCuenta.GASTOS).length
      }
    };
  });

  // Enums para el template
  TipoCuenta = TipoCuenta;
  NaturalezaCuenta = NaturalezaCuenta;

  ngOnInit(): void {
    this.loadCuentas();
    this.setupFilters();
  }

  private setupFilters(): void {
    // Configurar filtros reactivos
    this.codigoFilter.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.updateTotalItems();
    });
    
    this.nombreFilter.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.updateTotalItems();
    });
    
    this.tipoFilter.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.updateTotalItems();
    });
    
    this.naturalezaFilter.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.updateTotalItems();
    });
    
    this.activoFilter.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.updateTotalItems();
    });
    
    this.nivelFilter.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.updateTotalItems();
    });
  }

  private updateTotalItems(): void {
    this.totalItems.set(this.filteredCuentas().length);
  }

  async loadCuentas(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      const response = await this.contabilidadService.getCuentasContables().toPromise();
      if (response && response.data) {
        this.cuentas.set(response.data);
      } else {
        this.cuentas.set([]);
      }
      this.updateTotalItems();
      this.updateTreeData();
      
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      this.error.set('Error al cargar las cuentas contables');
      this.showMessage('Error al cargar las cuentas contables', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  private updateTreeData(): void {
    const treeData = this.treeData();
    this.dataSource.data = treeData;
  }

  private buildTree(cuentas: CuentaContable[]): CuentaNode[] {
    const cuentasMap = new Map<string, CuentaNode>();
    const rootNodes: CuentaNode[] = [];

    // Crear nodos
    cuentas.forEach(cuenta => {
      cuentasMap.set(cuenta.codigo, { cuenta, children: [] });
    });

    // Construir jerarquía
    cuentas.forEach(cuenta => {
      const node = cuentasMap.get(cuenta.codigo)!;
      
      if (cuenta.cuentaPadreId) {
        const parent = cuentasMap.get(cuenta.cuentaPadreId.toString());
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.sortField.set(sort.active);
    this.sortDirection.set(sort.direction as 'asc' | 'desc');
  }

  clearFilters(): void {
    this.codigoFilter.setValue('');
    this.nombreFilter.setValue('');
    this.tipoFilter.setValue('');
    this.naturalezaFilter.setValue('');
    this.activoFilter.setValue('');
    this.nivelFilter.setValue(null);
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'tree' ? 'table' : 'tree');
  }

  hasChild = (_: number, node: FlatCuentaNode) => node.expandable;

  selectCuenta(cuenta: CuentaContable): void {
    this.selectedCuenta.set(cuenta);
  }

  async createCuenta(): Promise<void> {
    // TODO: Implementar diálogo de creación
    console.log('Crear nueva cuenta');
  }

  async editCuenta(cuenta: CuentaContable): Promise<void> {
    // TODO: Implementar diálogo de edición
    console.log('Editar cuenta:', cuenta);
  }

  async duplicateCuenta(cuenta: CuentaContable): Promise<void> {
    try {
      this.loading.set(true);
      
      const nuevaCuenta: Partial<CuentaContable> = {
        ...cuenta,
        codigo: cuenta.codigo + '_COPY',
        nombre: cuenta.nombre + ' (Copia)',
        saldoActual: 0,
        // fechaCreacion: new Date(), // This property doesn't exist in CuentaContable interface
        // fechaModificacion: new Date() // This property doesn't exist in CuentaContable interface
      };
      
      await this.contabilidadService.createCuentaContable(nuevaCuenta as CuentaContable).toPromise();
      await this.loadCuentas();
      this.showMessage('Cuenta duplicada exitosamente', 'success');
      
    } catch (error) {
      console.error('Error al duplicar cuenta:', error);
      this.showMessage('Error al duplicar la cuenta', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleActivoCuenta(cuenta: CuentaContable): Promise<void> {
    try {
      this.loading.set(true);
      
      const cuentaActualizada = {
        ...cuenta,
        activa: !cuenta.activa
        // fechaModificacion: new Date() // This property doesn't exist in CuentaContable interface
      };
      
      await this.contabilidadService.updateCuentaContable(cuenta.id, cuentaActualizada).toPromise();
      await this.loadCuentas();
      
      const mensaje = cuenta.activa ? 'Cuenta desactivada' : 'Cuenta activada';
      this.showMessage(mensaje, 'success');
      
    } catch (error) {
      console.error('Error al cambiar estado de cuenta:', error);
      this.showMessage('Error al cambiar el estado de la cuenta', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteCuenta(cuenta: CuentaContable): Promise<void> {
    if (confirm(`¿Está seguro de eliminar la cuenta "${cuenta.nombre}"?`)) {
      try {
        this.loading.set(true);
        
        await this.contabilidadService.deleteCuentaContable(cuenta.id).toPromise();
        await this.loadCuentas();
        this.showMessage('Cuenta eliminada exitosamente', 'success');
        
      } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        this.showMessage('Error al eliminar la cuenta', 'error');
      } finally {
        this.loading.set(false);
      }
    }
  }

  exportCuentas(): void {
    // TODO: Implementar exportación
    console.log('Exportar cuentas');
    this.showMessage('Funcionalidad de exportación en desarrollo', 'info');
  }

  importCuentas(): void {
    // TODO: Implementar importación
    console.log('Importar cuentas');
    this.showMessage('Funcionalidad de importación en desarrollo', 'info');
  }

  onTreeDrop(event: CdkDragDrop<FlatCuentaNode[]>): void {
    // TODO: Implementar reordenamiento del árbol
    console.log('Reordenar árbol:', event);
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    (this.snackBar as MatSnackBar).open(message, 'Cerrar', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  getTipoLabel(tipo: TipoCuenta): string {
    const labels: Record<TipoCuenta, string> = {
      [TipoCuenta.ACTIVO]: 'Activo',
      [TipoCuenta.PASIVO]: 'Pasivo',
      [TipoCuenta.PATRIMONIO]: 'Patrimonio',
      [TipoCuenta.INGRESOS]: 'Ingreso',
      [TipoCuenta.GASTOS]: 'Gasto'
    };
    return labels[tipo] || tipo;
  }

  getNaturalezaLabel(naturaleza: NaturalezaCuenta): string {
    const labels = {
      [NaturalezaCuenta.DEUDORA]: 'Deudora',
      [NaturalezaCuenta.ACREEDORA]: 'Acreedora'
    };
    return labels[naturaleza] || naturaleza;
  }

  formatSaldo(saldo: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(saldo);
  }

  getCuentaIndentation(nivel: number): string {
    return '—'.repeat(Math.max(0, nivel - 1)) + ' ';
  }
}