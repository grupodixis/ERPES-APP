import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Subject, debounceTime, takeUntil, switchMap, catchError } from 'rxjs';
import { of } from 'rxjs';

import { FillJobsService } from '../../application/fill-jobs.service';
import { TemplatesService } from '../../application/templates.service';
import { PdfViewerService } from '../../application/pdf-viewer.service';
import { 
  Template, 
  TemplateField, 
  FillJob, 
  FillJobStatus,
  InputValidationResult,
  PreviewResult
} from '../../domain/models';

export interface FillPreviewDialogData {
  template: Template;
  mode: 'create' | 'edit';
  fillJob?: FillJob;
}

export interface ValidationError {
  field: string;
  message: string;
}

@Component({
  selector: 'app-fill-preview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDatepickerModule
  ],
  templateUrl: './fill-preview.component.html',
  styleUrls: ['./fill-preview.component.scss']
})
export class FillPreviewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly formChanges$ = new Subject<void>();

  // Component state
  template: Template;
  mode: 'create' | 'edit';
  fillJob: FillJob | null = null;
  
  // Form management
  dataForm: FormGroup;
  validationErrors: ValidationError[] = [];
  isDataValid = false;
  
  // Preview state
  previewUrl: string | null = null;
  isPreviewLoading = false;
  previewError: string | null = null;
  
  // PDF viewer state
  currentPage = 1;
  totalPages = 0;
  zoomLevel = 1;
  
  // Processing state
  isProcessing = false;
  jobProgress = 0;
  
  // Constants
  readonly minZoom = 0.25;
  readonly maxZoom = 3;
  readonly zoomStep = 0.25;

  constructor(
    private fb: FormBuilder,
    private fillJobsService: FillJobsService,
    private templatesService: TemplatesService,
    private pdfViewerService: PdfViewerService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<FillPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FillPreviewDialogData
  ) {
    this.template = data.template;
    this.mode = data.mode;
    if (data.fillJob) {
      this.fillJob = data.fillJob;
    }
    
    this.dataForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormValidation();
    
    if (this.mode === 'edit' && this.fillJob) {
      this.loadExistingData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pdfViewerService.dispose();
  }

  private initializeForm(): void {
    const formControls: { [key: string]: any } = {};
    
    this.template.fields.forEach(field => {
      const validators = [];
      
      if (field.required) {
        validators.push(Validators.required);
      }
      
      // Add type-specific validators
      if (field.type === 'number') {
        validators.push(Validators.pattern(/^-?\d*\.?\d+$/));
      } else if (field.type === 'email') {
        validators.push(Validators.email);
      }
      
      formControls[field.name] = [
        field.defaultValue || '',
        validators
      ];
    });
    
    this.dataForm = this.fb.group(formControls);
  }

  private setupFormValidation(): void {
    // Auto-validate on form changes with debounce
    this.dataForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.validateData();
        if (this.isDataValid) {
          this.formChanges$.next();
        }
      });
    
    // Auto-generate preview when data changes
    this.formChanges$
      .pipe(
        debounceTime(500),
        switchMap(() => this.isDataValid ? this.generatePreviewInternal() : of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private loadExistingData(): void {
    if (this.fillJob?.inputData) {
      this.dataForm.patchValue(this.fillJob.inputData);
      this.jobProgress = this.fillJob.progress || 0;
      
      if (this.fillJob.outputPdfUrl) {
        this.previewUrl = this.fillJob.outputPdfUrl;
        this.loadPdfPreview(this.previewUrl);
      }
    }
  }

  validateData(): void {
    const formData = this.dataForm.value;
    
    this.fillJobsService.validateInputData(this.template.id, formData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Validation error:', error);
          return of({ isValid: false, errors: [{ field: 'general', message: 'Validation failed' }] });
        })
      )
      .subscribe((result: InputValidationResult) => {
        this.isDataValid = result.isValid;
        this.validationErrors = result.errors || [];
      });
  }

  generatePreview(): void {
    if (!this.isDataValid) {
      return;
    }
    
    this.generatePreviewInternal().subscribe();
  }

  private generatePreviewInternal() {
    this.isPreviewLoading = true;
    this.previewError = null;
    
    const formData = this.dataForm.value;
    
    return this.fillJobsService.previewResult(this.template.id, formData)
      .pipe(
        switchMap((result: PreviewResult) => {
          this.previewUrl = result.previewUrl;
          return this.loadPdfPreview(result.previewUrl);
        }),
        catchError(error => {
          console.error('Preview generation error:', error);
          this.previewError = 'Error generating preview';
          this.isPreviewLoading = false;
          this.showError('Error generating preview');
          return of(null);
        })
      );
  }

  private loadPdfPreview(url: string) {
    return this.pdfViewerService.loadPdf(url)
      .pipe(
        switchMap(() => {
          this.totalPages = this.pdfViewerService.getPageCount();
          this.currentPage = 1;
          this.isPreviewLoading = false;
          this.renderCurrentPage();
          return of(true);
        }),
        catchError(error => {
          console.error('PDF loading error:', error);
          this.previewError = 'Error loading PDF preview';
          this.isPreviewLoading = false;
          return of(false);
        })
      );
  }

  // PDF Viewer Controls
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderCurrentPage();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderCurrentPage();
    }
  }

  zoomIn(): void {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
      this.renderCurrentPage();
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
      this.renderCurrentPage();
    }
  }

  renderCurrentPage(): void {
    const canvas = document.querySelector('#pdf-canvas') as HTMLCanvasElement;
    if (canvas && this.previewUrl) {
      this.pdfViewerService.renderPage(this.currentPage, canvas, this.zoomLevel)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  // Fill Job Management
  createFillJob(): void {
    if (!this.isDataValid) {
      this.showError('Please fix validation errors before proceeding');
      return;
    }
    
    this.isProcessing = true;
    const formData = this.dataForm.value;
    
    this.fillJobsService.createFillJob({
      templateId: this.template.id,
      inputData: formData
    })
      .pipe(
        switchMap((job: FillJob) => {
          this.fillJob = job;
          // Start tracking progress
          return this.fillJobsService.getJobProgress(job.id);
        }),
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Fill job creation error:', error);
          this.isProcessing = false;
          
          if (error.status === 0) {
            this.showError('Network error. Please check your connection.', 5000);
          } else if (error.error?.message) {
            this.showError(error.error.message);
          } else {
            this.showError('Error creating fill job');
          }
          
          return of(null);
        })
      )
      .subscribe(progress => {
        if (progress !== null) {
          this.jobProgress = progress;
          if (progress >= 100) {
            this.isProcessing = false;
            this.showSuccess('Fill job completed successfully!');
          }
        }
      });
  }

  // File Download
  downloadResult(): void {
    if (!this.fillJob) {
      return;
    }
    
    this.fillJobsService.downloadResult(this.fillJob.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Download error:', error);
          this.showError('Error downloading file');
          return of(null);
        })
      )
      .subscribe(blob => {
        if (blob) {
          const filename = `${this.template.name}_filled.pdf`;
          this.downloadBlob(blob, filename);
        }
      });
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Dialog Actions
  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    if (this.fillJob) {
      this.dialogRef.close(this.fillJob);
    }
  }

  // Utility Methods
  getFieldTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'text': 'text_fields',
      'number': 'numbers',
      'date': 'calendar_today',
      'email': 'email',
      'checkbox': 'check_box',
      'select': 'arrow_drop_down',
      'textarea': 'notes'
    };
    
    return iconMap[type] || 'help_outline';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getErrorMessage(fieldName: string): string {
    const control = this.dataForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['pattern']) {
        return 'Invalid format';
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    return this.validationErrors.some(error => error.field === fieldName);
  }

  getFieldError(fieldName: string): string {
    const error = this.validationErrors.find(error => error.field === fieldName);
    return error?.message || '';
  }

  getFieldByName(fieldName: string): TemplateField | undefined {
    return this.template.fields.find(field => field.name === fieldName);
  }

  isFieldRequired(fieldName: string): boolean {
    const field = this.getFieldByName(fieldName);
    return field?.required || false;
  }

  getJobStatusIcon(): string {
    if (!this.fillJob) return 'help_outline';
    
    switch (this.fillJob.status) {
      case FillJobStatus.PENDING:
        return 'schedule';
      case FillJobStatus.PROCESSING:
        return 'autorenew';
      case FillJobStatus.COMPLETED:
        return 'check_circle';
      case FillJobStatus.FAILED:
        return 'error';
      default:
        return 'help_outline';
    }
  }

  getJobStatusColor(): string {
    if (!this.fillJob) return 'default';
    
    switch (this.fillJob.status) {
      case FillJobStatus.PENDING:
        return 'accent';
      case FillJobStatus.PROCESSING:
        return 'primary';
      case FillJobStatus.COMPLETED:
        return 'primary';
      case FillJobStatus.FAILED:
        return 'warn';
      default:
        return 'default';
    }
  }

  canDownload(): boolean {
    return this.fillJob?.status === FillJobStatus.COMPLETED && !!this.fillJob.outputPdfUrl;
  }

  canCreateJob(): boolean {
    return this.isDataValid && !this.isProcessing && this.mode === 'create';
  }

  private showError(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', { duration });
  }

  private showSuccess(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', { 
      duration,
      panelClass: ['success-snackbar']
    });
  }
}