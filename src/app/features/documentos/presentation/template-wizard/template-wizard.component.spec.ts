import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { TemplateWizardComponent } from './template-wizard.component';
import { TemplatesService } from '../../application/templates.service';
import { PdfViewerService } from '../../application/pdf-viewer.service';
import { MappingService } from '../../application/mapping.service';
import {
  Template,
  TemplateField,
  TipoTemplate,
  EstadoTemplate,
  TipoCampo,
  CreateTemplateDto
} from '../../../../domain/documentos.types';
import { MaterialModule } from '../../../../shared/material/material.module';

// Mock data
const mockTemplate: Template = {
  id: 1,
  nombre: 'Test Template',
  descripcion: 'Test Description',
  tipo: TipoTemplate.FORMULARIO,
  estado: EstadoTemplate.BORRADOR,
  archivoUrl: 'test-file.pdf',
  archivoNombre: 'test-file.pdf',
  archivoTamaño: 1024,
  versionActual: 1,
  totalCampos: 5,
  camposMapeados: 3,
  completitud: 60,
  creadoPorId: 1,
  creadoPor: 'Test User',
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
  empresaId: 1
};

const mockExtractedFields = [
  {
    name: 'nombre',
    type: 'text',
    x: 100,
    y: 200,
    width: 150,
    height: 20,
    page: 1,
    required: true,
    defaultValue: ''
  },
  {
    name: 'email',
    type: 'text',
    x: 100,
    y: 250,
    width: 200,
    height: 20,
    page: 1,
    required: false,
    defaultValue: ''
  }
];

const mockTemplateFields: TemplateField[] = [
  {
    id: 1,
    templateId: 1,
    nombre: 'nombre',
    etiqueta: 'Nombre Completo',
    tipo: TipoCampo.TEXTO,
    requerido: true,
    posicionX: 100,
    posicionY: 200,
    ancho: 150,
    alto: 20,
    pagina: 1,
    orden: 1,
    valorPorDefecto: '',
    validaciones: {},
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  },
  {
    id: 2,
    templateId: 1,
    nombre: 'email',
    etiqueta: 'Correo Electrónico',
    tipo: TipoCampo.EMAIL,
    requerido: false,
    posicionX: 100,
    posicionY: 250,
    ancho: 200,
    alto: 20,
    pagina: 1,
    orden: 2,
    valorPorDefecto: '',
    validaciones: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  }
];

const mockErpFields = [
  { name: 'cliente.nombre', label: 'Nombre del Cliente', type: 'string' },
  { name: 'cliente.email', label: 'Email del Cliente', type: 'string' },
  { name: 'factura.numero', label: 'Número de Factura', type: 'number' },
  { name: 'factura.fecha', label: 'Fecha de Factura', type: 'date' }
];

describe('TemplateWizardComponent', () => {
  let component: TemplateWizardComponent;
  let fixture: ComponentFixture<TemplateWizardComponent>;
  let templatesService: jasmine.SpyObj<TemplatesService>;
  let pdfViewerService: jasmine.SpyObj<PdfViewerService>;
  let mappingService: jasmine.SpyObj<MappingService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TemplateWizardComponent>>;

  beforeEach(async () => {
    const templatesServiceSpy = jasmine.createSpyObj('TemplatesService', [
      'createTemplate',
      'updateTemplate',
      'analyzeTemplate',
      'getTemplateFields'
    ]);
    const pdfViewerServiceSpy = jasmine.createSpyObj('PdfViewerService', [
      'loadPdf',
      'renderPage',
      'extractFormFields',
      'extractText',
      'getPageDimensions',
      'dispose'
    ]);
    const mappingServiceSpy = jasmine.createSpyObj('MappingService', [
      'getAvailableErpFields',
      'createFieldMapping',
      'validateMapping'
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [TemplateWizardComponent],
      imports: [
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TemplatesService, useValue: templatesServiceSpy },
        { provide: PdfViewerService, useValue: pdfViewerServiceSpy },
        { provide: MappingService, useValue: mappingServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { template: null, mode: 'create' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateWizardComponent);
    component = fixture.componentInstance;
    templatesService = TestBed.inject(TemplatesService) as jasmine.SpyObj<TemplatesService>;
    pdfViewerService = TestBed.inject(PdfViewerService) as jasmine.SpyObj<PdfViewerService>;
    mappingService = TestBed.inject(MappingService) as jasmine.SpyObj<MappingService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<TemplateWizardComponent>>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values in create mode', () => {
      fixture.detectChanges();
      
      expect(component.currentStep).toBe(0);
      expect(component.isEditMode).toBeFalse();
      expect(component.templateForm).toBeDefined();
      expect(component.templateForm.get('nombre')?.value).toBe('');
      expect(component.templateForm.get('descripcion')?.value).toBe('');
      expect(component.templateForm.get('tipo')?.value).toBe(TipoTemplate.FORMULARIO);
    });

    it('should initialize with template data in edit mode', () => {
      component.data = { template: mockTemplate, mode: 'edit' };
      component.ngOnInit();
      
      expect(component.isEditMode).toBeTrue();
      expect(component.templateForm.get('nombre')?.value).toBe(mockTemplate.nombre);
      expect(component.templateForm.get('descripcion')?.value).toBe(mockTemplate.descripcion);
      expect(component.templateForm.get('tipo')?.value).toBe(mockTemplate.tipo);
    });

    it('should load ERP fields on initialization', () => {
      mappingService.getAvailableErpFields.and.returnValue(of(mockErpFields));
      
      fixture.detectChanges();
      
      expect(mappingService.getAvailableErpFields).toHaveBeenCalled();
      expect(component.availableErpFields).toEqual(mockErpFields);
    });
  });

  describe('File Upload', () => {
    it('should handle file selection', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const event = { target: { files: [file] } } as any;
      
      component.onFileSelected(event);
      
      expect(component.selectedFile).toBe(file);
      expect(component.templateForm.get('archivoNombre')?.value).toBe('test.pdf');
    });

    it('should reject non-PDF files', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [file] } } as any;
      
      component.onFileSelected(event);
      
      expect(component.selectedFile).toBeNull();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Solo se permiten archivos PDF',
        'Cerrar',
        { duration: 3000 }
      );
    });

    it('should reject files larger than 10MB', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });
      const event = { target: { files: [largeFile] } } as any;
      
      component.onFileSelected(event);
      
      expect(component.selectedFile).toBeNull();
      expect(snackBar.open).toHaveBeenCalledWith(
        'El archivo no puede ser mayor a 10MB',
        'Cerrar',
        { duration: 3000 }
      );
    });

    it('should load and display PDF after file selection', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const event = { target: { files: [file] } } as any;
      
      pdfViewerService.loadPdf.and.returnValue(Promise.resolve());
      pdfViewerService.renderPage.and.returnValue(Promise.resolve());
      pdfViewerService.getPageDimensions.and.returnValue(Promise.resolve({ width: 595, height: 842 }));
      
      component.onFileSelected(event);
      await component.loadPdf();
      
      expect(pdfViewerService.loadPdf).toHaveBeenCalledWith(file);
      expect(component.pdfLoaded).toBeTrue();
    });
  });

  describe('PDF Viewer', () => {
    beforeEach(() => {
      component.selectedFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      component.pdfLoaded = true;
    });

    it('should render PDF page to canvas', async () => {
      const canvas = document.createElement('canvas');
      component.pdfCanvas = { nativeElement: canvas };
      
      pdfViewerService.renderPage.and.returnValue(Promise.resolve());
      pdfViewerService.getPageDimensions.and.returnValue(Promise.resolve({ width: 595, height: 842 }));
      
      await component.renderPage(1);
      
      expect(pdfViewerService.renderPage).toHaveBeenCalledWith(1, canvas, jasmine.any(Number));
      expect(component.currentPage).toBe(1);
    });

    it('should handle page navigation', async () => {
      component.totalPages = 3;
      component.currentPage = 1;
      
      spyOn(component, 'renderPage').and.returnValue(Promise.resolve());
      
      await component.nextPage();
      expect(component.currentPage).toBe(2);
      expect(component.renderPage).toHaveBeenCalledWith(2);
      
      await component.previousPage();
      expect(component.currentPage).toBe(1);
      expect(component.renderPage).toHaveBeenCalledWith(1);
    });

    it('should not navigate beyond page boundaries', async () => {
      component.totalPages = 3;
      component.currentPage = 3;
      
      spyOn(component, 'renderPage');
      
      await component.nextPage();
      expect(component.currentPage).toBe(3);
      expect(component.renderPage).not.toHaveBeenCalled();
      
      component.currentPage = 1;
      await component.previousPage();
      expect(component.currentPage).toBe(1);
    });

    it('should zoom in and out', async () => {
      component.zoomLevel = 1.0;
      spyOn(component, 'renderPage').and.returnValue(Promise.resolve());
      
      await component.zoomIn();
      expect(component.zoomLevel).toBe(1.25);
      expect(component.renderPage).toHaveBeenCalled();
      
      await component.zoomOut();
      expect(component.zoomLevel).toBe(1.0);
    });
  });

  describe('Field Detection', () => {
    it('should extract form fields from PDF', async () => {
      pdfViewerService.extractFormFields.and.returnValue(Promise.resolve(mockExtractedFields));
      
      await component.detectFields();
      
      expect(pdfViewerService.extractFormFields).toHaveBeenCalled();
      expect(component.detectedFields).toEqual(mockExtractedFields);
      expect(component.fieldsDetected).toBeTrue();
    });

    it('should handle field detection errors', async () => {
      pdfViewerService.extractFormFields.and.returnValue(Promise.reject(new Error('Detection failed')));
      
      await component.detectFields();
      
      expect(component.fieldsDetected).toBeFalse();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error al detectar campos: Detection failed',
        'Cerrar',
        { duration: 5000 }
      );
    });

    it('should convert detected fields to template fields', () => {
      component.detectedFields = mockExtractedFields;
      
      component.convertToTemplateFields();
      
      expect(component.templateFields.length).toBe(2);
      expect(component.templateFields[0].nombre).toBe('nombre');
      expect(component.templateFields[0].tipo).toBe(TipoCampo.TEXTO);
      expect(component.templateFields[1].nombre).toBe('email');
      expect(component.templateFields[1].tipo).toBe(TipoCampo.EMAIL);
    });
  });

  describe('Field Mapping', () => {
    beforeEach(() => {
      component.templateFields = mockTemplateFields;
      component.availableErpFields = mockErpFields;
    });

    it('should create field mapping on drag and drop', () => {
      const dragEvent = {
        dataTransfer: {
          getData: jasmine.createSpy('getData').and.returnValue('cliente.nombre')
        },
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      const templateField = mockTemplateFields[0];
      
      component.onFieldDrop(dragEvent, templateField);
      
      expect(dragEvent.preventDefault).toHaveBeenCalled();
      expect(component.fieldMappings.length).toBe(1);
      expect(component.fieldMappings[0].templateFieldId).toBe(templateField.id!);
      expect(component.fieldMappings[0].erpField).toBe('cliente.nombre');
    });

    it('should remove field mapping', () => {
      component.fieldMappings = [
        {
          id: 1,
          templateId: 1,
          templateFieldId: 1,
          erpField: 'cliente.nombre',
          transformPresetId: null,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }
      ];
      
      component.removeMapping(1);
      
      expect(component.fieldMappings.length).toBe(0);
    });

    it('should validate mappings', () => {
      mappingService.validateMapping.and.returnValue(of({ isValid: true, errors: [] }));
      
      component.fieldMappings = [
        {
          id: 1,
          templateId: 1,
          templateFieldId: 1,
          erpField: 'cliente.nombre',
          transformPresetId: null,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }
      ];
      
      component.validateMappings();
      
      expect(mappingService.validateMapping).toHaveBeenCalled();
      expect(component.mappingErrors.length).toBe(0);
    });
  });

  describe('Stepper Navigation', () => {
    it('should navigate to next step when valid', () => {
      component.currentStep = 0;
      component.templateForm.patchValue({
        nombre: 'Test Template',
        descripcion: 'Test Description',
        tipo: TipoTemplate.FORMULARIO
      });
      
      component.nextStep();
      
      expect(component.currentStep).toBe(1);
    });

    it('should not navigate to next step when form is invalid', () => {
      component.currentStep = 0;
      component.templateForm.patchValue({
        nombre: '', // Required field empty
        descripcion: 'Test Description',
        tipo: TipoTemplate.FORMULARIO
      });
      
      component.nextStep();
      
      expect(component.currentStep).toBe(0);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Por favor complete todos los campos requeridos',
        'Cerrar',
        { duration: 3000 }
      );
    });

    it('should navigate to previous step', () => {
      component.currentStep = 2;
      
      component.previousStep();
      
      expect(component.currentStep).toBe(1);
    });

    it('should not navigate to previous step from first step', () => {
      component.currentStep = 0;
      
      component.previousStep();
      
      expect(component.currentStep).toBe(0);
    });
  });

  describe('Template Creation/Update', () => {
    beforeEach(() => {
      component.templateForm.patchValue({
        nombre: 'Test Template',
        descripcion: 'Test Description',
        tipo: TipoTemplate.FORMULARIO
      });
      component.selectedFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      component.templateFields = mockTemplateFields;
      component.fieldMappings = [
        {
          id: 1,
          templateId: 1,
          templateFieldId: 1,
          erpField: 'cliente.nombre',
          transformPresetId: null,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }
      ];
    });

    it('should create template successfully', async () => {
      templatesService.createTemplate.and.returnValue(of(mockTemplate));
      
      await component.saveTemplate();
      
      expect(templatesService.createTemplate).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Plantilla creada exitosamente',
        'Cerrar',
        { duration: 3000 }
      );
      expect(dialogRef.close).toHaveBeenCalledWith(mockTemplate);
    });

    it('should update template successfully', async () => {
      component.isEditMode = true;
      component.data = { template: mockTemplate, mode: 'edit' };
      templatesService.updateTemplate.and.returnValue(of(mockTemplate));
      
      await component.saveTemplate();
      
      expect(templatesService.updateTemplate).toHaveBeenCalledWith(mockTemplate.id, jasmine.any(Object));
      expect(snackBar.open).toHaveBeenCalledWith(
        'Plantilla actualizada exitosamente',
        'Cerrar',
        { duration: 3000 }
      );
    });

    it('should handle save errors', async () => {
      templatesService.createTemplate.and.returnValue(throwError(() => new Error('Save failed')));
      
      await component.saveTemplate();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error al guardar la plantilla: Save failed',
        'Cerrar',
        { duration: 5000 }
      );
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Field Editing', () => {
    beforeEach(() => {
      component.templateFields = [...mockTemplateFields];
    });

    it('should edit field properties', () => {
      const field = component.templateFields[0];
      const updatedField = {
        ...field,
        etiqueta: 'Nombre Actualizado',
        requerido: false
      };
      
      component.editField(field, updatedField);
      
      expect(component.templateFields[0].etiqueta).toBe('Nombre Actualizado');
      expect(component.templateFields[0].requerido).toBeFalse();
    });

    it('should delete field', () => {
      const fieldToDelete = component.templateFields[0];
      
      component.deleteField(fieldToDelete);
      
      expect(component.templateFields.length).toBe(1);
      expect(component.templateFields[0].nombre).toBe('email');
    });

    it('should add new field manually', () => {
      const newField = {
        nombre: 'telefono',
        etiqueta: 'Teléfono',
        tipo: TipoCampo.TELEFONO,
        requerido: false,
        posicionX: 100,
        posicionY: 300,
        ancho: 150,
        alto: 20,
        pagina: 1,
        orden: 3
      };
      
      component.addField(newField);
      
      expect(component.templateFields.length).toBe(3);
      expect(component.templateFields[2].nombre).toBe('telefono');
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag start for ERP fields', () => {
      const dragEvent = {
        dataTransfer: {
          setData: jasmine.createSpy('setData')
        }
      } as any;
      
      const erpField = mockErpFields[0];
      
      component.onDragStart(dragEvent, erpField);
      
      expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', erpField.name);
    });

    it('should handle drag over', () => {
      const dragEvent = {
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      component.onDragOver(dragEvent);
      
      expect(dragEvent.preventDefault).toHaveBeenCalled();
    });

    it('should highlight drop zone on drag enter', () => {
      const templateField = mockTemplateFields[0];
      
      component.onDragEnter(templateField);
      
      expect(component.dragOverField).toBe(templateField);
    });

    it('should remove highlight on drag leave', () => {
      component.dragOverField = mockTemplateFields[0];
      
      component.onDragLeave();
      
      expect(component.dragOverField).toBeNull();
    });
  });

  describe('Component Cleanup', () => {
    it('should dispose PDF viewer on destroy', () => {
      component.ngOnDestroy();
      
      expect(pdfViewerService.dispose).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should check if step is valid', () => {
      // Step 0: Basic info
      component.currentStep = 0;
      component.templateForm.patchValue({
        nombre: 'Test',
        descripcion: 'Test',
        tipo: TipoTemplate.FORMULARIO
      });
      expect(component.isStepValid(0)).toBeTrue();
      
      // Step 1: File upload
      component.currentStep = 1;
      component.selectedFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      component.pdfLoaded = true;
      expect(component.isStepValid(1)).toBeTrue();
      
      // Step 2: Field detection
      component.currentStep = 2;
      component.templateFields = mockTemplateFields;
      expect(component.isStepValid(2)).toBeTrue();
    });

    it('should get field type icon', () => {
      expect(component.getFieldTypeIcon(TipoCampo.TEXTO)).toBe('text_fields');
      expect(component.getFieldTypeIcon(TipoCampo.NUMERO)).toBe('numbers');
      expect(component.getFieldTypeIcon(TipoCampo.EMAIL)).toBe('email');
      expect(component.getFieldTypeIcon(TipoCampo.FECHA)).toBe('calendar_today');
      expect(component.getFieldTypeIcon(TipoCampo.TELEFONO)).toBe('phone');
      expect(component.getFieldTypeIcon(TipoCampo.CHECKBOX)).toBe('check_box');
      expect(component.getFieldTypeIcon(TipoCampo.LISTA)).toBe('list');
    });

    it('should format file size', () => {
      expect(component.formatFileSize(1024)).toBe('1.00 KB');
      expect(component.formatFileSize(1048576)).toBe('1.00 MB');
      expect(component.formatFileSize(500)).toBe('500 B');
    });

    it('should get mapping status', () => {
      component.fieldMappings = [
        {
          id: 1,
          templateId: 1,
          templateFieldId: 1,
          erpField: 'cliente.nombre',
          transformPresetId: null,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }
      ];
      
      expect(component.isMapped(mockTemplateFields[0])).toBeTrue();
      expect(component.isMapped(mockTemplateFields[1])).toBeFalse();
    });
  });
});