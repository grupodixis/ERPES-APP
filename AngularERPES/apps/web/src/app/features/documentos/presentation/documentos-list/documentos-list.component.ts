import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, startWith, combineLatest } from 'rxjs';

// Types
import { 
  Template, 
  TemplateFilters, 
  EstadoTemplate, 
  TipoTemplate,
  PaginatedResult
} from '../../../../domain/documentos.types';

// Services
import { TemplatesService } from '../../application/templates.service';

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './documentos-list.component.html',
  styleUrls: ['./documentos-list.component.scss']
})
export class DocumentosListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Table configuration
  displayedColumns: string[] = [
    'nombre',
    'tipo',
    'estado',
    'totalCampos',
    'camposMapeados',
    'porcentajeCompletitud',
    'creadoPor',
    'createdAt',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Template>([]);
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filters
  searchControl = new FormControl('');
  tipoControl = new FormControl<TipoTemplate | ''>('');
  estadoControl = new FormControl<EstadoTemplate | ''>('');

  // Filter options
  tiposTemplate: TipoTemplate[] = ['AcroForm', 'XFA', 'Plano'];
  estadosTemplate: EstadoTemplate[] = ['Borrador', 'Activa', 'Inactiva', 'Archivada'];

  constructor(
    private templatesService: TemplatesService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
    // Combine all filter changes
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.tipoControl.valueChanges.pipe(startWith('')),
      this.estadoControl.valueChanges.pipe(startWith(''))
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.currentPage = 0;
      this.loadTemplates();
    });
  }

  private buildFilters(): TemplateFilters {
    const filters: TemplateFilters = {};

    const search = this.searchControl.value?.trim();
    if (search) {
      filters.search = search;
    }

    const tipo = this.tipoControl.value;
    if (tipo) {
      filters.tipo = tipo;
    }

    const estado = this.estadoControl.value;
    if (estado) {
      filters.estado = estado;
    }

    return filters;
  }

  loadTemplates(): void {
    this.isLoading = true;
    const filters = this.buildFilters();

    this.templatesService.getTemplates({
      ...filters,
      page: this.currentPage + 1,
      limit: this.pageSize
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result: PaginatedResult<Template>) => {
        this.dataSource.data = result.data;
        this.totalItems = result.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.snackBar.open('Error al cargar las plantillas', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTemplates();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.tipoControl.setValue('');
    this.estadoControl.setValue('');
  }

  // Navigation methods
  createTemplate(): void {
    this.router.navigate(['/administracion/documentos/plantillas/nueva']);
  }

  viewTemplate(template: Template): void {
    this.router.navigate(['/administracion/documentos/plantillas', template.id]);
  }

  editTemplate(template: Template): void {
    this.router.navigate(['/administracion/documentos/plantillas', template.id, 'editar']);
  }

  fillTemplate(template: Template): void {
    this.router.navigate(['/administracion/documentos/rellenar', template.id]);
  }

  duplicateTemplate(template: Template): void {
    this.isLoading = true;
    this.templatesService.duplicateTemplate(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newTemplate) => {
          this.snackBar.open('Plantilla duplicada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error duplicating template:', error);
          this.snackBar.open('Error al duplicar la plantilla', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }

  deleteTemplate(template: Template): void {
    if (confirm(`¿Está seguro de que desea eliminar la plantilla "${template.nombre}"?`)) {
      this.isLoading = true;
      this.templatesService.deleteTemplate(template.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Plantilla eliminada exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadTemplates();
          },
          error: (error) => {
            console.error('Error deleting template:', error);
            this.snackBar.open('Error al eliminar la plantilla', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        });
    }
  }

  toggleTemplateStatus(template: Template): void {
    const newStatus: EstadoTemplate = template.estado === 'Activa' ? 'Inactiva' : 'Activa';
    
    this.templatesService.updateTemplate(template.id, { estado: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          template.estado = newStatus;
          this.snackBar.open(
            `Plantilla ${newStatus.toLowerCase()} exitosamente`, 
            'Cerrar', 
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
        },
        error: (error) => {
          console.error('Error updating template status:', error);
          this.snackBar.open('Error al actualizar el estado de la plantilla', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  // Utility methods
  getEstadoColor(estado: EstadoTemplate): string {
    switch (estado) {
      case 'Activa': return 'primary';
      case 'Borrador': return 'accent';
      case 'Inactiva': return 'warn';
      case 'Archivada': return '';
      default: return '';
    }
  }

  getTipoIcon(tipo: TipoTemplate): string {
    switch (tipo) {
      case 'AcroForm': return 'description';
      case 'XFA': return 'dynamic_form';
      case 'Plano': return 'architecture';
      default: return 'insert_drive_file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}