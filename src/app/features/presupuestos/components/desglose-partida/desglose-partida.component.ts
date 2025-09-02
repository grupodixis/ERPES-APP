import { Component, Input, OnInit, signal, computed, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snackbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SelectionModel } from '@angular/cdk/collections';

import { DesglosePartida, TipoRecurso, UnidadMedida, CreateDesglosePartidaDto, UpdateDesglosePartidaDto } from '../../../../domain/presupuestos.types';
import { PresupuestosService } from '../../services/presupuestos.service';

export interface DesgloseFilter {
  search: string;
  tipoRecurso: string;
  unidadMedida: string;
  activos: boolean;
  conStock: boolean;
}

export interface DesgloseColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'currency';
  editable: boolean;
  required?: boolean;
  options?: any[];
  width?: string;
}

@Component({
  selector: 'app-desglose-partida',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatToolbarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatSlideToggleModule
  ],
  templateUrl: './desglose-partida.component.html',
  styleUrl: './desglose-partida.component.scss'
})
export class DesglosePartidaComponent implements OnInit {
  @Input() partidaId!: string;
  @Input() readonly = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Señales reactivas
  loading = signal(false);
  saving = signal(false);
  hasChanges = signal(false);
  editingRowId = signal<string | null>(null);
  
  // Datos
  desgloses = signal<DesglosePartida[]>([]);
  tiposRecurso = signal<TipoRecurso[]>([]);
  unidadesMedida = signal<UnidadMedida[]>([]);
  
  // Filtros
  filters = signal<DesgloseFilter>({
    search: '',
    tipoRecurso: '',
    unidadMedida: '',
    activos: true,
    conStock: false
  });
  
  // Tabla
  dataSource = new MatTableDataSource<DesglosePartida>([]);
  selection = new SelectionModel<DesglosePartida>(true, []);
  
  // Configuración de columnas
  columns: DesgloseColumn[] = [
    { key: 'select', label: '', type: 'checkbox', editable: false, width: '50px' },
    { key: 'codigo', label: 'Código', type: 'text', editable: true, required: true, width: '120px' },
    { key: 'nombre', label: 'Nombre', type: 'text', editable: true, required: true, width: '200px' },
    { key: 'tipoRecurso', label: 'Tipo', type: 'select', editable: true, required: true, width: '120px' },
    { key: 'unidadMedida', label: 'Unidad', type: 'select', editable: true, required: true, width: '100px' },
    { key: 'cantidad', label: 'Cantidad', type: 'number', editable: true, required: true, width: '100px' },
    { key: 'precioUnitario', label: 'Precio Unit.', type: 'currency', editable: true, required: true, width: '120px' },
    { key: 'importeTotal', label: 'Importe Total', type: 'currency', editable: false, width: '120px' },
    { key: 'activo', label: 'Activo', type: 'checkbox', editable: true, width: '80px' },
    { key: 'actions', label: 'Acciones', type: 'text', editable: false, width: '100px' }
  ];
  
  displayedColumns = computed(() => this.columns.map(col => col.key));
  
  // Formulario para edición inline
  editForm!: FormGroup;
  
  // Datos filtrados
  filteredDesgloses = computed(() => {
    const desgloses = this.desgloses();
    const filter = this.filters();
    
    return desgloses.filter(desglose => {
      // Filtro de búsqueda
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch = 
          desglose.codigo.toLowerCase().includes(searchLower) ||
          desglose.nombre.toLowerCase().includes(searchLower) ||
          (desglose.descripcion && desglose.descripcion.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      
      // Filtro por tipo de recurso
      if (filter.tipoRecurso && desglose.tipoRecurso !== filter.tipoRecurso) {
        return false;
      }
      
      // Filtro por unidad de medida
      if (filter.unidadMedida && desglose.unidadMedida !== filter.unidadMedida) {
        return false;
      }
      
      // Filtro por activos
      if (filter.activos && !desglose.activo) {
        return false;
      }
      
      // Filtro por stock (simulado)
      if (filter.conStock && desglose.cantidad <= 0) {
        return false;
      }
      
      return true;
    });
  });
  
  // Totales computados
  totalImporte = computed(() => {
    return this.filteredDesgloses().reduce((total, desglose) => {
      return total + (desglose.cantidad * desglose.precioUnitario);
    }, 0);
  });
  
  totalCantidad = computed(() => {
    return this.filteredDesgloses().reduce((total, desglose) => {
      return total + desglose.cantidad;
    }, 0);
  });
  
  constructor(
    private fb: FormBuilder,
    private presupuestosService: PresupuestosService,
    private snackBar: MatSnackBar
  ) {
    this.initializeEditForm();
    this.setupDataSourceUpdates();
  }
  
  ngOnInit(): void {
    this.loadReferenceData();
    this.loadDesgloses();
  }
  
  private initializeEditForm(): void {
    this.editForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', Validators.maxLength(500)],
      tipoRecurso: ['', Validators.required],
      unidadMedida: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      activo: [true]
    });
  }
  
  private setupDataSourceUpdates(): void {
    // Actualizar dataSource cuando cambien los datos filtrados
    effect(() => {
      const filtered = this.filteredDesgloses();
      this.dataSource.data = filtered;
      
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }
  
  private async loadReferenceData(): Promise<void> {
    try {
      // Cargar tipos de recurso
      const tiposRecurso: TipoRecurso[] = [
        { id: 'mano-obra', nombre: 'Mano de Obra', descripcion: 'Recursos humanos' },
        { id: 'material', nombre: 'Material', descripcion: 'Materiales y suministros' },
        { id: 'maquinaria', nombre: 'Maquinaria', descripcion: 'Equipos y maquinaria' },
        { id: 'subcontrata', nombre: 'Subcontrata', descripcion: 'Servicios subcontratados' },
        { id: 'otros', nombre: 'Otros', descripcion: 'Otros recursos' }
      ];
      
      // Cargar unidades de medida
      const unidadesMedida: UnidadMedida[] = [
        { id: 'ud', nombre: 'Unidad', simbolo: 'ud' },
        { id: 'm', nombre: 'Metro', simbolo: 'm' },
        { id: 'm2', nombre: 'Metro cuadrado', simbolo: 'm²' },
        { id: 'm3', nombre: 'Metro cúbico', simbolo: 'm³' },
        { id: 'kg', nombre: 'Kilogramo', simbolo: 'kg' },
        { id: 'h', nombre: 'Hora', simbolo: 'h' },
        { id: 'dia', nombre: 'Día', simbolo: 'día' },
        { id: 'mes', nombre: 'Mes', simbolo: 'mes' },
        { id: 'año', nombre: 'Año', simbolo: 'año' },
        { id: 'lote', nombre: 'Lote', simbolo: 'lote' }
      ];
      
      this.tiposRecurso.set(tiposRecurso);
      this.unidadesMedida.set(unidadesMedida);
      
      // Actualizar opciones en columnas
      this.updateColumnOptions();
      
    } catch (error) {
      console.error('Error cargando datos de referencia:', error);
      this.showError('Error cargando datos de referencia');
    }
  }
  
  private updateColumnOptions(): void {
    const tipoRecursoColumn = this.columns.find(col => col.key === 'tipoRecurso');
    if (tipoRecursoColumn) {
      tipoRecursoColumn.options = this.tiposRecurso();
    }
    
    const unidadMedidaColumn = this.columns.find(col => col.key === 'unidadMedida');
    if (unidadMedidaColumn) {
      unidadMedidaColumn.options = this.unidadesMedida();
    }
  }
  
  private async loadDesgloses(): Promise<void> {
    if (!this.partidaId) return;
    
    this.loading.set(true);
    
    try {
      const desgloses = await this.presupuestosService.getDesglosesByPartida(this.partidaId);
      this.desgloses.set(desgloses);
    } catch (error) {
      console.error('Error cargando desgloses:', error);
      this.showError('Error cargando el desglose de la partida');
    } finally {
      this.loading.set(false);
    }
  }
  
  // Métodos de filtrado
  onFilterChange(filterKey: keyof DesgloseFilter, value: any): void {
    this.filters.update(current => ({
      ...current,
      [filterKey]: value
    }));
  }
  
  clearFilters(): void {
    this.filters.set({
      search: '',
      tipoRecurso: '',
      unidadMedida: '',
      activos: true,
      conStock: false
    });
  }
  
  // Métodos de selección
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }
  
  toggleRow(row: DesglosePartida): void {
    this.selection.toggle(row);
  }
  
  // Métodos de edición
  startEdit(desglose: DesglosePartida): void {
    if (this.readonly) return;
    
    this.editingRowId.set(desglose.id);
    this.editForm.patchValue(desglose);
  }
  
  cancelEdit(): void {
    this.editingRowId.set(null);
    this.editForm.reset();
  }
  
  async saveEdit(): Promise<void> {
    if (!this.editForm.valid || !this.editingRowId()) return;
    
    this.saving.set(true);
    
    try {
      const formValue = this.editForm.value;
      const updateDto: UpdateDesglosePartidaDto = {
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        tipoRecurso: formValue.tipoRecurso,
        unidadMedida: formValue.unidadMedida,
        cantidad: formValue.cantidad,
        precioUnitario: formValue.precioUnitario,
        activo: formValue.activo
      };
      
      const updatedDesglose = await this.presupuestosService.updateDesglosePartida(this.editingRowId()!, updateDto);
      
      // Actualizar en la lista local
      this.desgloses.update(current => 
        current.map(d => d.id === updatedDesglose.id ? updatedDesglose : d)
      );
      
      this.editingRowId.set(null);
      this.editForm.reset();
      this.hasChanges.set(true);
      
      this.showSuccess('Desglose actualizado correctamente');
      
    } catch (error) {
      console.error('Error actualizando desglose:', error);
      this.showError('Error actualizando el desglose');
    } finally {
      this.saving.set(false);
    }
  }
  
  async addNewRow(): Promise<void> {
    if (this.readonly) return;
    
    const newDesglose: CreateDesglosePartidaDto = {
      codigo: `D${Date.now().toString().slice(-6)}`,
      nombre: 'Nuevo recurso',
      descripcion: '',
      tipoRecurso: 'material',
      unidadMedida: 'ud',
      cantidad: 1,
      precioUnitario: 0,
      activo: true,
      partidaId: this.partidaId
    };
    
    this.saving.set(true);
    
    try {
      const createdDesglose = await this.presupuestosService.createDesglosePartida(newDesglose);
      
      // Agregar a la lista local
      this.desgloses.update(current => [...current, createdDesglose]);
      
      // Iniciar edición inmediatamente
      this.startEdit(createdDesglose);
      
      this.hasChanges.set(true);
      this.showSuccess('Nueva línea agregada');
      
    } catch (error) {
      console.error('Error creando desglose:', error);
      this.showError('Error creando nueva línea');
    } finally {
      this.saving.set(false);
    }
  }
  
  async deleteSelected(): Promise<void> {
    if (this.readonly || this.selection.selected.length === 0) return;
    
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar ${this.selection.selected.length} elemento(s)?`);
    if (!confirmDelete) return;
    
    this.saving.set(true);
    
    try {
      const idsToDelete = this.selection.selected.map(d => d.id);
      
      for (const id of idsToDelete) {
        await this.presupuestosService.deleteDesglosePartida(id);
      }
      
      // Actualizar lista local
      this.desgloses.update(current => 
        current.filter(d => !idsToDelete.includes(d.id))
      );
      
      this.selection.clear();
      this.hasChanges.set(true);
      
      this.showSuccess(`${idsToDelete.length} elemento(s) eliminado(s)`);
      
    } catch (error) {
      console.error('Error eliminando desgloses:', error);
      this.showError('Error eliminando elementos');
    } finally {
      this.saving.set(false);
    }
  }
  
  async duplicateSelected(): Promise<void> {
    if (this.readonly || this.selection.selected.length === 0) return;
    
    this.saving.set(true);
    
    try {
      for (const desglose of this.selection.selected) {
        const duplicateDto: CreateDesglosePartidaDto = {
          codigo: `${desglose.codigo}_COPY`,
          nombre: `${desglose.nombre} (Copia)`,
          descripcion: desglose.descripcion,
          tipoRecurso: desglose.tipoRecurso,
          unidadMedida: desglose.unidadMedida,
          cantidad: desglose.cantidad,
          precioUnitario: desglose.precioUnitario,
          activo: desglose.activo,
          partidaId: this.partidaId
        };
        
        const duplicatedDesglose = await this.presupuestosService.createDesglosePartida(duplicateDto);
        
        // Agregar a la lista local
        this.desgloses.update(current => [...current, duplicatedDesglose]);
      }
      
      this.selection.clear();
      this.hasChanges.set(true);
      
      this.showSuccess('Elementos duplicados correctamente');
      
    } catch (error) {
      console.error('Error duplicando desgloses:', error);
      this.showError('Error duplicando elementos');
    } finally {
      this.saving.set(false);
    }
  }
  
  // Métodos de utilidad
  getColumnValue(desglose: DesglosePartida, column: DesgloseColumn): any {
    if (column.key === 'importeTotal') {
      return desglose.cantidad * desglose.precioUnitario;
    }
    
    return (desglose as any)[column.key];
  }
  
  getOptionLabel(options: any[], value: any): string {
    const option = options?.find(opt => opt.id === value);
    return option ? option.nombre : value;
  }
  
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
  
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}