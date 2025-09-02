import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

import { CentrosCostelService } from './centros-coste.service';
import { CentroCoste, CreateCentroCosteDto, UpdateCentroCosteDto, CentroCosteFilters, CentroCosteArbol } from '../../../domain/configuracion.types';

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: number;
  codigo: string;
  descripcion?: string;
  activo: boolean;
}

@Component({
  selector: 'app-centros-coste',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTreeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './centros-coste.component.html',
  styleUrls: ['./centros-coste.component.scss']
})
export class CentrosCostelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly centrosCostelService = inject(CentrosCostelService);

  // Reactive properties from service
  readonly centrosCoste = this.centrosCostelService.centrosCoste;
  readonly loading = this.centrosCostelService.loading;
  readonly error = this.centrosCostelService.error;
  readonly centrosActivos = this.centrosCostelService.centrosActivos;
  readonly centrosRaiz = this.centrosCostelService.centrosRaiz;
  readonly totalCentros = this.centrosCostelService.totalCentros;

  // Component state
  editingId: number | null = null;
  vistaArbol = false;
  arbolCentros: CentroCosteArbol[] = [];

  // Table configuration
  displayedColumns: string[] = ['codigo', 'nombre', 'descripcion', 'centroPadre', 'nivel', 'activo', 'acciones'];

  // Forms
  centroForm!: FormGroup;
  filtroForm!: FormGroup;

  // Tree configuration
  private transformer = (node: CentroCosteArbol, level: number): FlatNode => {
    return {
      expandable: !!node.hijos && node.hijos.length > 0,
      name: node.nombre,
      level: level,
      id: node.id,
      codigo: node.codigo,
      descripcion: node.descripcion,
      activo: node.activo
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.hijos
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // Computed properties
  readonly isEditing = computed(() => this.editingId !== null);
  readonly formTitle = computed(() => this.isEditing() ? 'Editar Centro de Coste' : 'Nuevo Centro de Coste');
  readonly submitButtonText = computed(() => this.isEditing() ? 'Actualizar' : 'Crear');

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private initializeForms(): void {
    this.centroForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-_]+$/)]],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      centroPadreId: [null],
      empresaId: [1, Validators.required], // TODO: Obtener de contexto de usuario
      activo: [true]
    });

    this.filtroForm = this.fb.group({
      activo: [null],
      centroPadreId: [null],
      empresaId: [null],
      search: ['']
    });
  }

  private async cargarDatos(): Promise<void> {
    try {
      await this.centrosCostelService.cargarCentrosCoste();
    } catch (error) {
      this.mostrarError('Error al cargar los centros de coste');
    }
  }

  async aplicarFiltros(): Promise<void> {
    try {
      const filtros: CentroCosteFilters = {
        activo: this.filtroForm.get('activo')?.value,
        centroPadreId: this.filtroForm.get('centroPadreId')?.value,
        empresaId: this.filtroForm.get('empresaId')?.value,
        search: this.filtroForm.get('search')?.value || undefined
      };

      // Remover valores null/undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof CentroCosteFilters] === null || filtros[key as keyof CentroCosteFilters] === undefined) {
          delete filtros[key as keyof CentroCosteFilters];
        }
      });

      await this.centrosCostelService.cargarCentrosCoste(filtros);
    } catch (error) {
      this.mostrarError('Error al aplicar filtros');
    }
  }

  async limpiarFiltros(): Promise<void> {
    this.filtroForm.reset({
      activo: null,
      centroPadreId: null,
      empresaId: null,
      search: ''
    });
    
    await this.centrosCostelService.cargarCentrosCoste({});
  }

  async guardarCentro(): Promise<void> {
    if (this.centroForm.invalid) {
      this.centroForm.markAllAsTouched();
      return;
    }

    try {
      const formValue = this.centroForm.value;
      
      if (this.editingId) {
        // Actualizar
        const updateDto: UpdateCentroCosteDto = {
          nombre: formValue.nombre,
          descripcion: formValue.descripcion || undefined,
          activo: formValue.activo,
          centroPadreId: formValue.centroPadreId || undefined
        };
        
        await this.centrosCostelService.actualizarCentroCoste(this.editingId, updateDto);
        this.mostrarExito('Centro de coste actualizado correctamente');
      } else {
        // Crear
        const createDto: CreateCentroCosteDto = {
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion || undefined,
          centroPadreId: formValue.centroPadreId || undefined,
          empresaId: formValue.empresaId
        };
        
        await this.centrosCostelService.crearCentroCoste(createDto);
        this.mostrarExito('Centro de coste creado correctamente');
      }

      this.resetForm();
      await this.cargarDatos();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al guardar el centro de coste';
      this.mostrarError(mensaje);
    }
  }

  editarCentro(centro: CentroCoste): void {
    this.editingId = centro.id;
    this.centroForm.patchValue({
      codigo: centro.codigo,
      nombre: centro.nombre,
      descripcion: centro.descripcion,
      centroPadreId: centro.centroPadreId,
      empresaId: centro.empresaId,
      activo: centro.activo
    });
    
    // Deshabilitar código en edición
    this.centroForm.get('codigo')?.disable();
  }

  async eliminarCentro(id: number): Promise<void> {
    try {
      await this.centrosCostelService.eliminarCentroCoste(id);
      this.mostrarExito('Centro de coste eliminado correctamente');
      await this.cargarDatos();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar el centro de coste';
      this.mostrarError(mensaje);
    }
  }

  cancelarEdicion(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId = null;
    this.centroForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      centroPadreId: null,
      empresaId: 1,
      activo: true
    });
    this.centroForm.get('codigo')?.enable();
  }

  async toggleVistaArbol(): Promise<void> {
    this.vistaArbol = !this.vistaArbol;
    
    if (this.vistaArbol) {
      try {
        this.arbolCentros = await this.centrosCostelService.obtenerArbolCentrosCoste();
        this.dataSource.data = this.arbolCentros;
      } catch (error) {
        this.mostrarError('Error al cargar la vista de árbol');
        this.vistaArbol = false;
      }
    }
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  obtenerNombreCentroPadre(centroPadreId?: number): string {
    if (!centroPadreId) return '-';
    const centroPadre = this.centrosCoste().find(c => c.id === centroPadreId);
    return centroPadre ? centroPadre.nombre : 'No encontrado';
  }

  getErrorMessage(fieldName: string): string {
    const field = this.centroForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
    if (errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} no puede exceder ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return `${this.getFieldLabel(fieldName)} solo puede contener letras mayúsculas, números, guiones y guiones bajos`;
    
    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      codigo: 'Código',
      nombre: 'Nombre',
      descripcion: 'Descripción',
      centroPadreId: 'Centro Padre',
      empresaId: 'Empresa'
    };
    return labels[fieldName] || fieldName;
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}