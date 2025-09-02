import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { FillPreviewComponent } from './fill-preview.component';
import { FillJobsService } from '../../application/fill-jobs.service';
import { TemplatesService } from '../../application/templates.service';
import { PdfViewerService } from '../../application/pdf-viewer.service';
import { Template, TemplateField, FillJob, FillJobStatus } from '../../domain/models';

// Material Modules for testing
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('FillPreviewComponent', () => {
  let component: FillPreviewComponent;
  let fixture: ComponentFixture<FillPreviewComponent>;
  let fillJobsService: jasmine.SpyObj<FillJobsService>;
  let templatesService: jasmine.SpyObj<TemplatesService>;
  let pdfViewerService: jasmine.SpyObj<PdfViewerService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<FillPreviewComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockTemplate: Template = {
    id: '1',
    name: 'Test Template',
    description: 'Test Description',
    pdfUrl: 'test.pdf',
    fields: [
      {
        id: '1',
        name: 'field1',
        type: 'text',
        x: 100,
        y: 200,
        width: 150,
        height: 20,
        page: 1,
        required: true,
        defaultValue: '',
        validation: null,
        confidence: 0.95
      },
      {
        id: '2',
        name: 'field2',
        type: 'number',
        x: 100,
        y: 250,
        width: 150,
        height: 20,
        page: 1,
        required: false,
        defaultValue: '0',
        validation: null,
        confidence: 0.88
      }
    ] as TemplateField[],
    version: '1.0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'test-user'
  };

  const mockDialogData = {
    template: mockTemplate,
    mode: 'create' as const
  };

  const mockFillJob: FillJob = {
    id: '1',
    templateId: '1',
    status: FillJobStatus.COMPLETED,
    inputData: {
      field1: 'Test Value 1',
      field2: '123'
    },
    outputPdfUrl: 'output.pdf',
    progress: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
    createdBy: 'test-user'
  };

  beforeEach(async () => {
    const fillJobsServiceSpy = jasmine.createSpyObj('FillJobsService', [
      'createFillJob',
      'getFillJob',
      'downloadResult',
      'previewResult',
      'validateInputData',
      'getJobProgress'
    ]);

    const templatesServiceSpy = jasmine.createSpyObj('TemplatesService', [
      'getTemplate',
      'getTemplateFields'
    ]);

    const pdfViewerServiceSpy = jasmine.createSpyObj('PdfViewerService', [
      'loadPdf',
      'renderPage',
      'getPageCount',
      'dispose'
    ]);

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [FillPreviewComponent],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressBarModule,
        MatIconModule,
        MatTableModule,
        MatChipsModule,
        MatTooltipModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: FillJobsService, useValue: fillJobsServiceSpy },
        { provide: TemplatesService, useValue: templatesServiceSpy },
        { provide: PdfViewerService, useValue: pdfViewerServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FillPreviewComponent);
    component = fixture.componentInstance;
    fillJobsService = TestBed.inject(FillJobsService) as jasmine.SpyObj<FillJobsService>;
    templatesService = TestBed.inject(TemplatesService) as jasmine.SpyObj<TemplatesService>;
    pdfViewerService = TestBed.inject(PdfViewerService) as jasmine.SpyObj<PdfViewerService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<FillPreviewComponent>>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with template data', () => {
      expect(component.template).toEqual(mockTemplate);
      expect(component.mode).toBe('create');
    });

    it('should initialize form with template fields', () => {
      component.ngOnInit();
      
      expect(component.dataForm.get('field1')).toBeTruthy();
      expect(component.dataForm.get('field2')).toBeTruthy();
      expect(component.dataForm.get('field1')?.value).toBe('');
      expect(component.dataForm.get('field2')?.value).toBe('0');
    });

    it('should set required validators for required fields', () => {
      component.ngOnInit();
      
      const field1Control = component.dataForm.get('field1');
      const field2Control = component.dataForm.get('field2');
      
      expect(field1Control?.hasError('required')).toBe(true);
      expect(field2Control?.hasError('required')).toBe(false);
    });

    it('should load existing fill job data in edit mode', () => {
      const editData = {
        template: mockTemplate,
        mode: 'edit' as const,
        fillJob: mockFillJob
      };
      
      component.data = editData;
      component.ngOnInit();
      
      expect(component.fillJob).toEqual(mockFillJob);
      expect(component.dataForm.get('field1')?.value).toBe('Test Value 1');
      expect(component.dataForm.get('field2')?.value).toBe('123');
    });
  });

  describe('Data Input Management', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate input data', () => {
      fillJobsService.validateInputData.and.returnValue(of({
        isValid: true,
        errors: []
      }));

      component.validateData();

      expect(fillJobsService.validateInputData).toHaveBeenCalledWith(
        mockTemplate.id,
        component.dataForm.value
      );
    });

    it('should handle validation errors', () => {
      const validationResult = {
        isValid: false,
        errors: [
          { field: 'field1', message: 'Field is required' },
          { field: 'field2', message: 'Invalid number format' }
        ]
      };
      
      fillJobsService.validateInputData.and.returnValue(of(validationResult));

      component.validateData();

      expect(component.validationErrors).toEqual(validationResult.errors);
      expect(component.isDataValid).toBe(false);
    });

    it('should clear validation errors when data is valid', () => {
      component.validationErrors = [{ field: 'field1', message: 'Error' }];
      
      fillJobsService.validateInputData.and.returnValue(of({
        isValid: true,
        errors: []
      }));

      component.validateData();

      expect(component.validationErrors).toEqual([]);
      expect(component.isDataValid).toBe(true);
    });

    it('should auto-validate on form changes', () => {
      spyOn(component, 'validateData');
      
      component.dataForm.get('field1')?.setValue('New Value');
      
      expect(component.validateData).toHaveBeenCalled();
    });

    it('should handle different field types correctly', () => {
      const numberField = component.dataForm.get('field2');
      
      numberField?.setValue('abc');
      expect(numberField?.hasError('pattern')).toBe(true);
      
      numberField?.setValue('123');
      expect(numberField?.hasError('pattern')).toBe(false);
    });
  });

  describe('PDF Preview Generation', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.dataForm.patchValue({
        field1: 'Test Value 1',
        field2: '123'
      });
    });

    it('should generate preview successfully', () => {
      const previewResult = {
        previewUrl: 'preview.pdf',
        pages: 1
      };
      
      fillJobsService.previewResult.and.returnValue(of(previewResult));
      pdfViewerService.loadPdf.and.returnValue(of(true));
      pdfViewerService.getPageCount.and.returnValue(1);

      component.generatePreview();

      expect(fillJobsService.previewResult).toHaveBeenCalledWith(
        mockTemplate.id,
        component.dataForm.value
      );
      expect(component.previewUrl).toBe(previewResult.previewUrl);
      expect(component.isPreviewLoading).toBe(false);
    });

    it('should handle preview generation errors', () => {
      fillJobsService.previewResult.and.returnValue(
        throwError(() => new Error('Preview generation failed'))
      );

      component.generatePreview();

      expect(component.isPreviewLoading).toBe(false);
      expect(component.previewError).toBe('Error generating preview');
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error generating preview',
        'Close',
        { duration: 3000 }
      );
    });

    it('should load PDF in viewer after preview generation', () => {
      const previewResult = {
        previewUrl: 'preview.pdf',
        pages: 1
      };
      
      fillJobsService.previewResult.and.returnValue(of(previewResult));
      pdfViewerService.loadPdf.and.returnValue(of(true));
      pdfViewerService.getPageCount.and.returnValue(1);

      component.generatePreview();

      expect(pdfViewerService.loadPdf).toHaveBeenCalledWith(previewResult.previewUrl);
      expect(component.totalPages).toBe(1);
    });

    it('should handle PDF loading errors', () => {
      const previewResult = {
        previewUrl: 'preview.pdf',
        pages: 1
      };
      
      fillJobsService.previewResult.and.returnValue(of(previewResult));
      pdfViewerService.loadPdf.and.returnValue(
        throwError(() => new Error('PDF loading failed'))
      );

      component.generatePreview();

      expect(component.previewError).toBe('Error loading PDF preview');
    });

    it('should auto-generate preview when data changes', () => {
      spyOn(component, 'generatePreview');
      component.isDataValid = true;
      
      component.dataForm.get('field1')?.setValue('New Value');
      
      // Simulate debounce time
      jasmine.clock().tick(500);
      
      expect(component.generatePreview).toHaveBeenCalled();
    });
  });

  describe('PDF Viewer Controls', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.totalPages = 3;
      component.currentPage = 1;
    });

    it('should navigate to next page', () => {
      spyOn(component, 'renderCurrentPage');
      
      component.nextPage();
      
      expect(component.currentPage).toBe(2);
      expect(component.renderCurrentPage).toHaveBeenCalled();
    });

    it('should navigate to previous page', () => {
      component.currentPage = 2;
      spyOn(component, 'renderCurrentPage');
      
      component.previousPage();
      
      expect(component.currentPage).toBe(1);
      expect(component.renderCurrentPage).toHaveBeenCalled();
    });

    it('should not go beyond page limits', () => {
      component.currentPage = 3;
      component.nextPage();
      expect(component.currentPage).toBe(3);
      
      component.currentPage = 1;
      component.previousPage();
      expect(component.currentPage).toBe(1);
    });

    it('should zoom in', () => {
      const initialZoom = component.zoomLevel;
      spyOn(component, 'renderCurrentPage');
      
      component.zoomIn();
      
      expect(component.zoomLevel).toBeGreaterThan(initialZoom);
      expect(component.renderCurrentPage).toHaveBeenCalled();
    });

    it('should zoom out', () => {
      component.zoomLevel = 1.5;
      const initialZoom = component.zoomLevel;
      spyOn(component, 'renderCurrentPage');
      
      component.zoomOut();
      
      expect(component.zoomLevel).toBeLessThan(initialZoom);
      expect(component.renderCurrentPage).toHaveBeenCalled();
    });

    it('should respect zoom limits', () => {
      component.zoomLevel = 0.25;
      component.zoomOut();
      expect(component.zoomLevel).toBe(0.25);
      
      component.zoomLevel = 3;
      component.zoomIn();
      expect(component.zoomLevel).toBe(3);
    });

    it('should render current page', () => {
      const canvas = document.createElement('canvas');
      spyOn(document, 'querySelector').and.returnValue(canvas);
      pdfViewerService.renderPage.and.returnValue(of(undefined));
      
      component.renderCurrentPage();
      
      expect(pdfViewerService.renderPage).toHaveBeenCalledWith(
        component.currentPage,
        canvas,
        component.zoomLevel
      );
    });
  });

  describe('Fill Job Creation', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.dataForm.patchValue({
        field1: 'Test Value 1',
        field2: '123'
      });
      component.isDataValid = true;
    });

    it('should create fill job successfully', () => {
      fillJobsService.createFillJob.and.returnValue(of(mockFillJob));
      
      component.createFillJob();
      
      expect(fillJobsService.createFillJob).toHaveBeenCalledWith({
        templateId: mockTemplate.id,
        inputData: component.dataForm.value
      });
      expect(component.fillJob).toEqual(mockFillJob);
      expect(component.isProcessing).toBe(false);
    });

    it('should handle fill job creation errors', () => {
      fillJobsService.createFillJob.and.returnValue(
        throwError(() => new Error('Creation failed'))
      );
      
      component.createFillJob();
      
      expect(component.isProcessing).toBe(false);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error creating fill job',
        'Close',
        { duration: 3000 }
      );
    });

    it('should not create job with invalid data', () => {
      component.isDataValid = false;
      
      component.createFillJob();
      
      expect(fillJobsService.createFillJob).not.toHaveBeenCalled();
    });

    it('should track job progress after creation', () => {
      const progressSubject = new BehaviorSubject(50);
      fillJobsService.createFillJob.and.returnValue(of(mockFillJob));
      fillJobsService.getJobProgress.and.returnValue(progressSubject.asObservable());
      
      component.createFillJob();
      
      expect(fillJobsService.getJobProgress).toHaveBeenCalledWith(mockFillJob.id);
      expect(component.jobProgress).toBe(50);
    });
  });

  describe('File Download', () => {
    beforeEach(() => {
      component.fillJob = mockFillJob;
    });

    it('should download result successfully', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      fillJobsService.downloadResult.and.returnValue(of(blob));
      
      spyOn(component, 'downloadBlob');
      
      component.downloadResult();
      
      expect(fillJobsService.downloadResult).toHaveBeenCalledWith(mockFillJob.id);
      expect(component.downloadBlob).toHaveBeenCalledWith(
        blob,
        `${mockTemplate.name}_filled.pdf`
      );
    });

    it('should handle download errors', () => {
      fillJobsService.downloadResult.and.returnValue(
        throwError(() => new Error('Download failed'))
      );
      
      component.downloadResult();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error downloading file',
        'Close',
        { duration: 3000 }
      );
    });

    it('should not download without fill job', () => {
      component.fillJob = null;
      
      component.downloadResult();
      
      expect(fillJobsService.downloadResult).not.toHaveBeenCalled();
    });

    it('should create download link and trigger download', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      const mockLink = {
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      };
      
      spyOn(document, 'createElement').and.returnValue(mockLink as any);
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(URL, 'revokeObjectURL');
      
      component.downloadBlob(blob, 'test.pdf');
      
      expect(mockLink.href).toBe('blob:url');
      expect(mockLink.download).toBe('test.pdf');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
  });

  describe('Dialog Actions', () => {
    it('should close dialog on cancel', () => {
      component.onCancel();
      
      expect(dialogRef.close).toHaveBeenCalledWith(null);
    });

    it('should close dialog with result on save', () => {
      component.fillJob = mockFillJob;
      
      component.onSave();
      
      expect(dialogRef.close).toHaveBeenCalledWith(mockFillJob);
    });

    it('should not save without fill job', () => {
      component.fillJob = null;
      
      component.onSave();
      
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should get field type icon', () => {
      expect(component.getFieldTypeIcon('text')).toBe('text_fields');
      expect(component.getFieldTypeIcon('number')).toBe('numbers');
      expect(component.getFieldTypeIcon('date')).toBe('calendar_today');
      expect(component.getFieldTypeIcon('checkbox')).toBe('check_box');
      expect(component.getFieldTypeIcon('unknown')).toBe('help_outline');
    });

    it('should format file size', () => {
      expect(component.formatFileSize(1024)).toBe('1.00 KB');
      expect(component.formatFileSize(1048576)).toBe('1.00 MB');
      expect(component.formatFileSize(500)).toBe('500 B');
    });

    it('should get validation error message', () => {
      const field1Control = component.dataForm.get('field1');
      field1Control?.setErrors({ required: true });
      
      expect(component.getErrorMessage('field1')).toBe('This field is required');
      
      field1Control?.setErrors({ pattern: true });
      expect(component.getErrorMessage('field1')).toBe('Invalid format');
    });

    it('should check if field has error', () => {
      const errors = [{ field: 'field1', message: 'Error message' }];
      component.validationErrors = errors;
      
      expect(component.hasFieldError('field1')).toBe(true);
      expect(component.hasFieldError('field2')).toBe(false);
    });

    it('should get field error message', () => {
      const errors = [{ field: 'field1', message: 'Custom error message' }];
      component.validationErrors = errors;
      
      expect(component.getFieldError('field1')).toBe('Custom error message');
      expect(component.getFieldError('field2')).toBe('');
    });
  });

  describe('Component Cleanup', () => {
    it('should dispose PDF viewer on destroy', () => {
      component.ngOnDestroy();
      
      expect(pdfViewerService.dispose).toHaveBeenCalled();
    });

    it('should unsubscribe from observables on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      fillJobsService.createFillJob.and.returnValue(
        throwError(() => ({ status: 0, message: 'Network error' }))
      );
      
      component.createFillJob();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Network error. Please check your connection.',
        'Close',
        { duration: 5000 }
      );
    });

    it('should handle server errors with specific messages', () => {
      fillJobsService.createFillJob.and.returnValue(
        throwError(() => ({ 
          status: 400, 
          error: { message: 'Invalid template data' }
        }))
      );
      
      component.createFillJob();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Invalid template data',
        'Close',
        { duration: 3000 }
      );
    });
  });
});