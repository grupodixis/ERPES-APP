import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OperariosService } from '../../services/operarios.service';
import { CategoriaOperario } from '../../domain/rrhh.types';

@Component({
  selector: 'app-categorias-operario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './categorias-operario.component.html',
  styleUrls: ['./categorias-operario.component.scss']
})
export class CategoriasOperarioComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('categoriaDialog') categoriaDialog!: TemplateRef<any>;

  displayedColumns: string[] = ['nombre', 'descripcion', 'salarioBase', 'activo', 'fechaCreacion', 'acciones'];
  dataSource = new MatTableDataSource<CategoriaOperario>();
  categoriaForm: FormGroup;
  filtroForm: FormGroup;
  loading = false;
  editingCategoria: CategoriaOperario | null = null;
  totalCategorias = 0;
  categoriasActivas = 0;
  salarioPromedio = 0;

  constructor(
    private fb: FormBuilder,
    private operariosService: OperariosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      salarioBase: [0, [Validators.required, Validators.min(0)]],
      activo: [true]
    });

    this.filtroForm = this.fb.group({
      busqueda: [''],
      activo: ['todos']
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.calcularEstadisticas();
    this.configurarFiltros();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarCategorias(): void {
    this.loading = true;
    this.operariosService.getCategorias().subscribe({
      next: (categorias) => {
        this.dataSource.data = categorias;
        this.loading = false;
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  configurarFiltros(): void {
    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  aplicarFiltros(): void {
    const filtros = this.filtroForm.value;
    let datosFiltrados = [...this.dataSource.data];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      datosFiltrados = datosFiltrados.filter(categoria =>
        categoria.nombre.toLowerCase().includes(busqueda) ||
        categoria.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado activo
    if (filtros.activo !== 'todos') {
      const activo = filtros.activo === 'activos';
      datosFiltrados = datosFiltrados.filter(categoria => categoria.activa === activo);
    }

    this.dataSource.data = datosFiltrados;
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      busqueda: '',
      activo: 'todos'
    });
    this.cargarCategorias();
  }

  calcularEstadisticas(): void {
    const categorias = this.dataSource.data;
    this.totalCategorias = categorias.length;
    this.categoriasActivas = categorias.filter(c => c.activa).length;
    this.salarioPromedio = categorias.length > 0 ?
      categorias.reduce((sum, c) => sum + c.salarioBase, 0) / categorias.length : 0;
  }

  abrirDialogoCategoria(categoria?: CategoriaOperario): void {
    this.editingCategoria = categoria || null;
    
    if (categoria) {
      this.categoriaForm.patchValue({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        salarioBase: categoria.salarioBase,
        activa: categoria.activa
      });
    } else {
      this.categoriaForm.reset({
        nombre: '',
        descripcion: '',
        salarioBase: 0,
        activo: true
      });
    }

    const dialogRef = this.dialog.open(this.categoriaDialog, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.guardarCategoria();
      }
    });
  }

  guardarCategoria(): void {
    if (this.categoriaForm.valid) {
      const categoriaData = this.categoriaForm.value;
      
      if (this.editingCategoria) {
        // Actualizar categoría existente
        const categoriaActualizada: CategoriaOperario = {
          ...this.editingCategoria,
          ...categoriaData,
          fechaModificacion: new Date()
        };
        
        this.operariosService.updateCategoria(categoriaActualizada).subscribe({
          next: () => {
            this.snackBar.open('Categoría actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.cargarCategorias();
          },
          error: (error) => {
            console.error('Error al actualizar categoría:', error);
            this.snackBar.open('Error al actualizar la categoría', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        // Crear nueva categoría
        const nuevaCategoria: Partial<CategoriaOperario> = {
          ...categoriaData,
          fechaCreacion: new Date()
        };
        
        this.operariosService.createCategoria(nuevaCategoria).subscribe({
          next: () => {
            this.snackBar.open('Categoría creada correctamente', 'Cerrar', { duration: 3000 });
            this.cargarCategorias();
          },
          error: (error) => {
            console.error('Error al crear categoría:', error);
            this.snackBar.open('Error al crear la categoría', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  eliminarCategoria(categoria: CategoriaOperario): void {
    if (confirm(`¿Está seguro de que desea eliminar la categoría "${categoria.nombre}"?`)) {
      this.operariosService.deleteCategoria(categoria.idCategoriaOperario).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.cargarCategorias();
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
          this.snackBar.open('Error al eliminar la categoría', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  toggleEstadoCategoria(categoria: CategoriaOperario): void {
    const categoriaActualizada: CategoriaOperario = {
      ...categoria,
      activa: !categoria.activa
    };
    
    this.operariosService.updateCategoria(categoriaActualizada).subscribe({
      next: () => {
        const estado = categoriaActualizada.activa ? 'activada' : 'desactivada';
        this.snackBar.open(`Categoría ${estado} correctamente`, 'Cerrar', { duration: 3000 });
        this.cargarCategorias();
      },
      error: (error) => {
        console.error('Error al cambiar estado de categoría:', error);
        this.snackBar.open('Error al cambiar el estado de la categoría', 'Cerrar', { duration: 3000 });
      }
    });
  }

  exportarCategorias(): void {
    const categorias = this.dataSource.data;
    const csvContent = this.convertirACSV(categorias);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `categorias_operario_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertirACSV(categorias: CategoriaOperario[]): string {
    const headers = ['Nombre', 'Descripción', 'Salario Base', 'Activo', 'Fecha Creación'];
    const csvArray = [headers.join(',')];
    
    categorias.forEach(categoria => {
      const row = [
        categoria.nombre,
        `"${categoria.descripcion}"`,
        categoria.salarioBase.toString(),
        categoria.activa ? 'Sí' : 'No',
        categoria.fechaCreacion.toLocaleDateString()
      ];
      csvArray.push(row.join(','));
    });
    
    return csvArray.join('\n');
  }

  cerrarDialogo(): void {
    this.dialog.closeAll();
  }
}