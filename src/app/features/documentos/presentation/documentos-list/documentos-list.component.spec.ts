import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Component and Services
import { DocumentosListComponent } from './documentos-list.component';
import { TemplatesService } from '../../application/templates.service';

// Types
import { Template, PaginatedResult, EstadoTemplate, TipoTemplate } from '../../../../domain/documentos.types';

describe('DocumentosListComponent', () => {
  let component: DocumentosListComponent;
  let fixture: ComponentFixture<DocumentosListComponent>;
  let templatesService: jasmine.SpyObj<TemplatesService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockTemplates: Template[] = [
    {
      id: 1,
      nombre: 'Contrato de Obra',
      descripcion: 'Plantilla para contratos de construcción',
      tipo: 'AcroForm',
      estado: 'Activa',
      archivoOriginalUrl: '/uploads/templates/contrato-obra.pdf',
      archivoOriginalNombre: 'contrato-obra.pdf',
      archivoOriginalTamaño: 2048576,
      versionActual: 1,
      totalCampos: 15,
      camposMapeados: 12,
      porcentajeCompletitud: 80,
      creadoPorId: 1,
      creadoPor: 'Admin Usuario',
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      nombre: 'Presupuesto Detallado',
      descripcion: 'Plantilla para presupuestos de obra',
      tipo: 'XFA',
      estado: 'Borrador',
      archivoOriginalUrl: '/uploads/templates/presupuesto.pdf',
      archivoOriginalNombre: 'presupuesto.pdf',
      archivoOriginalTamaño: 1024000,
      versionActual: 1,
      totalCampos: 25,
      camposMapeados: 15,
      porcentajeCompletitud: 60,
      creadoPorId: 2,
      creadoPor: 'Usuario Test',
      empresaId: 1,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20')
    }
  ];

  const mockPaginatedResult: PaginatedResult<Template> = {
    data: mockTemplates,
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  beforeEach(async () => {
    const templatesServiceSpy = jasmine.createSpyObj('TemplatesService', [
      'getTemplates',
      'deleteTemplate',
      'updateTemplate',
      'duplicateTemplate'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [DocumentosListComponent],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatMenuModule,
        MatProgressBarModule,
        MatTooltipModule
      ],
      providers: [
        { provide: TemplatesService, useValue: templatesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentosListComponent);
    component = fixture.componentInstance;
    templatesService = TestBed.inject(TemplatesService) as jasmine.SpyObj<TemplatesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // Setup default service responses
    templatesService.getTemplates.and.returnValue(of(mockPaginatedResult));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.displayedColumns).toEqual([
      'nombre',
      'tipo',
      'estado',
      'totalCampos',
      'camposMapeados',
      'porcentajeCompletitud',
      'creadoPor',
      'createdAt',
      'acciones'
    ]);
    expect(component.pageSize).toBe(10);
    expect(component.currentPage).toBe(0);
    expect(component.isLoading).toBe(false);
  });

  it('should load templates on init', () => {
    component.ngOnInit();
    
    expect(templatesService.getTemplates).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockTemplates);
    expect(component.totalItems).toBe(2);
  });

  it('should handle search filter changes', (done) => {
    component.ngOnInit();
    
    component.searchControl.setValue('Contrato');
    
    setTimeout(() => {
      expect(templatesService.getTemplates).toHaveBeenCalledWith(
        jasmine.objectContaining({
          search: 'Contrato',
          page: 1,
          limit: 10
        })
      );
      done();
    }, 350); // Wait for debounce
  });

  it('should handle tipo filter changes', () => {
    component.ngOnInit();
    
    component.tipoControl.setValue('AcroForm');
    
    expect(templatesService.getTemplates).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tipo: 'AcroForm',
        page: 1,
        limit: 10
      })
    );
  });

  it('should handle estado filter changes', () => {
    component.ngOnInit();
    
    component.estadoControl.setValue('Activa');
    
    expect(templatesService.getTemplates).toHaveBeenCalledWith(
      jasmine.objectContaining({
        estado: 'Activa',
        page: 1,
        limit: 10
      })
    );
  });

  it('should clear all filters', () => {
    component.searchControl.setValue('test');
    component.tipoControl.setValue('AcroForm');
    component.estadoControl.setValue('Activa');
    
    component.clearFilters();
    
    expect(component.searchControl.value).toBe('');
    expect(component.tipoControl.value).toBe('');
    expect(component.estadoControl.value).toBe('');
  });

  it('should handle page changes', () => {
    const pageEvent = { pageIndex: 1, pageSize: 25 };
    
    component.onPageChange(pageEvent);
    
    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBe(25);
    expect(templatesService.getTemplates).toHaveBeenCalled();
  });

  it('should navigate to create template', () => {
    component.createTemplate();
    
    expect(router.navigate).toHaveBeenCalledWith(['/administracion/documentos/plantillas/nueva']);
  });

  it('should navigate to view template', () => {
    const template = mockTemplates[0];
    
    component.viewTemplate(template);
    
    expect(router.navigate).toHaveBeenCalledWith(['/administracion/documentos/plantillas', template.id]);
  });

  it('should navigate to edit template', () => {
    const template = mockTemplates[0];
    
    component.editTemplate(template);
    
    expect(router.navigate).toHaveBeenCalledWith(['/administracion/documentos/plantillas', template.id, 'editar']);
  });

  it('should navigate to fill template', () => {
    const template = mockTemplates[0];
    
    component.fillTemplate(template);
    
    expect(router.navigate).toHaveBeenCalledWith(['/administracion/documentos/rellenar', template.id]);
  });

  it('should duplicate template successfully', () => {
    const template = mockTemplates[0];
    const duplicatedTemplate = { ...template, id: 3, nombre: 'Contrato de Obra (Copia)' };
    templatesService.duplicateTemplate.and.returnValue(of(duplicatedTemplate));
    
    component.duplicateTemplate(template);
    
    expect(templatesService.duplicateTemplate).toHaveBeenCalledWith(template.id);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Plantilla duplicada exitosamente',
      'Cerrar',
      jasmine.objectContaining({ panelClass: ['success-snackbar'] })
    );
  });

  it('should handle duplicate template error', () => {
    const template = mockTemplates[0];
    templatesService.duplicateTemplate.and.returnValue(throwError(() => new Error('Error')));
    
    component.duplicateTemplate(template);
    
    expect(snackBar.open).toHaveBeenCalledWith(
      'Error al duplicar la plantilla',
      'Cerrar',
      jasmine.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });

  it('should delete template successfully', () => {
    const template = mockTemplates[0];
    templatesService.deleteTemplate.and.returnValue(of(void 0));
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.deleteTemplate(template);
    
    expect(templatesService.deleteTemplate).toHaveBeenCalledWith(template.id);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Plantilla eliminada exitosamente',
      'Cerrar',
      jasmine.objectContaining({ panelClass: ['success-snackbar'] })
    );
  });

  it('should not delete template if not confirmed', () => {
    const template = mockTemplates[0];
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteTemplate(template);
    
    expect(templatesService.deleteTemplate).not.toHaveBeenCalled();
  });

  it('should toggle template status successfully', () => {
    const template = { ...mockTemplates[0] };
    templatesService.updateTemplate.and.returnValue(of(template));
    
    component.toggleTemplateStatus(template);
    
    expect(templatesService.updateTemplate).toHaveBeenCalledWith(template.id, { estado: 'Inactiva' });
    expect(template.estado).toBe('Inactiva');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Plantilla inactiva exitosamente',
      'Cerrar',
      jasmine.objectContaining({ panelClass: ['success-snackbar'] })
    );
  });

  it('should handle loading error', () => {
    templatesService.getTemplates.and.returnValue(throwError(() => new Error('Network error')));
    
    component.loadTemplates();
    
    expect(component.isLoading).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Error al cargar las plantillas',
      'Cerrar',
      jasmine.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });

  describe('Utility Methods', () => {
    it('should return correct estado color', () => {
      expect(component.getEstadoColor('Activa')).toBe('primary');
      expect(component.getEstadoColor('Borrador')).toBe('accent');
      expect(component.getEstadoColor('Inactiva')).toBe('warn');
      expect(component.getEstadoColor('Archivada')).toBe('');
    });

    it('should return correct tipo icon', () => {
      expect(component.getTipoIcon('AcroForm')).toBe('description');
      expect(component.getTipoIcon('XFA')).toBe('dynamic_form');
      expect(component.getTipoIcon('Plano')).toBe('architecture');
    });

    it('should format file size correctly', () => {
      expect(component.formatFileSize(0)).toBe('0 Bytes');
      expect(component.formatFileSize(1024)).toBe('1 KB');
      expect(component.formatFileSize(1048576)).toBe('1 MB');
      expect(component.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = component.formatDate(date);
      
      expect(formatted).toContain('2024');
      expect(formatted).toContain('ene');
      expect(formatted).toContain('15');
    });
  });

  describe('Filter Options', () => {
    it('should have correct tipos template', () => {
      expect(component.tiposTemplate).toEqual(['AcroForm', 'XFA', 'Plano']);
    });

    it('should have correct estados template', () => {
      expect(component.estadosTemplate).toEqual(['Borrador', 'Activa', 'Inactiva', 'Archivada']);
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup filters on init', () => {
      spyOn(component as any, 'setupFilters');
      spyOn(component, 'loadTemplates');
      
      component.ngOnInit();
      
      expect((component as any).setupFilters).toHaveBeenCalled();
      expect(component.loadTemplates).toHaveBeenCalled();
    });

    it('should cleanup on destroy', () => {
      const destroySpy = spyOn((component as any).destroy$, 'next');
      const completeSpy = spyOn((component as any).destroy$, 'complete');
      
      component.ngOnDestroy();
      
      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});