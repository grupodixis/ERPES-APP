import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Inject } from '@angular/core';
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
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TemplatesService } from '../../application/templates.service';
import { PdfViewerService, ExtractedField } from '../../application/pdf-viewer.service';
import { MappingService } from '../../application/mapping.service';
import {
  Template,
  TemplateField,
  FieldMapping,
  TipoTemplate,
  EstadoTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
  TipoCampo
} from '../../../../domain/documentos.types';

export interface WizardDialogData {
  template: Template | null;
  mode: 'create' | 'edit';
}

export interface ErpField {
  name: string;
  label: string;
  type: string;
}

@Component({
  selector: 'app-template-wizard',
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
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    DragDropModule
  ],
  templateUrl: './template-wizard.component.html',
  styleUrls: ['./template-wizard.component.scss']
})
export class TemplateWizardComponent implements OnInit, OnDestroy {
  @ViewChild('pdfCanvas', { static: false }) pdfCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  private destroy$ = new Subject<void>();

  // Form and validation
  templateForm: FormGroup;
  
  // Wizard state
  currentStep = 0;
  totalSteps = 4;
  isEditMode = false;
  loading = false;
  
  // File handling
  selectedFile: File | null = null;
  pdfLoaded = false;
  
  // PDF viewer state
  currentPage = 1;
  totalPages = 0;
  zoomLevel = 1.0;
  
  // Field detection
  detectedFields: ExtractedField[] = [];
  fieldsDetected = false;
  templateFields: TemplateField[] = [];
  
  // Field mapping
  availableErpFields: ErpField[] = [];
  fieldMappings: FieldMapping[] = [];
  dragOverField: TemplateField | null = null;
  mappingErrors: string[] = [];
  
  // Exposed types for template

  constructor(
    private fb: FormBuilder,
    private templatesService: TemplatesService,
    private pdfViewerService: PdfViewerService,
    private mappingService: MappingService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TemplateWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WizardDialogData
  ) {
    this.templateForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit';
    
    if (this.isEditMode && this.data.template) {
      this.loadTemplateData(this.data.template);
    }
    
    this.loadAvailableErpFields();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pdfViewerService.dispose();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      tipo: ['FORMULARIO', Validators.required],
      archivoNombre: [''],
      archivoTamaño: [0]
    });
  }

  private loadTemplateData(template: Template): void {
    this.templateForm.patchValue({
      nombre: template.nombre,
      descripcion: template.descripcion,
      tipo: template.tipo,
      archivoNombre: template.nombre,
      archivoTamaño: 0
    });
    
    // Load existing fields and mappings if in edit mode
    if (template.id) {
      this.loadTemplateFields(template.id);
    }
  }

  private loadTemplateFields(templateId: number): void {
    this.templatesService.getTemplateFields(templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          this.templateFields = fields;
          this.fieldsDetected = fields.length > 0;
        },
        error: (error) => {
          console.error('Error loading template fields:', error);
        }
      });
  }

  private loadAvailableErpFields(): void {
    this.mappingService.getAvailableERPFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields: any) => {
          this.availableErpFields = fields;
        },
        error: (error: any) => {
          console.error('Error loading ERP fields:', error);
          this.snackBar.open(
            'Error al cargar campos del ERP',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
  }

  // File handling methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        this.snackBar.open(
          'Solo se permiten archivos PDF',
          'Cerrar',
          { duration: 3000 }
        );
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open(
          'El archivo no puede ser mayor a 10MB',
          'Cerrar',
          { duration: 3000 }
        );
        return;
      }
      
      this.selectedFile = file;
      this.templateForm.patchValue({
        archivoNombre: file.name,
        archivoTamaño: file.size
      });
      
      this.loadPdf();
    }
  }

  async loadPdf(): Promise<void> {
    if (!this.selectedFile) return;
    
    try {
      this.loading = true;
      await this.pdfViewerService.loadPdf(this.selectedFile);
      
      // Get total pages
      this.totalPages = await this.pdfViewerService.getPageCount();
      this.currentPage = 1;
      
      // Render first page
      await this.renderPage(1);
      
      this.pdfLoaded = true;
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.snackBar.open(
        'Error al cargar el PDF',
        'Cerrar',
        { duration: 3000 }
      );
    } finally {
      this.loading = false;
    }
  }

  async renderPage(pageNumber: number): Promise<void> {
    if (!this.pdfCanvas || !this.pdfLoaded) return;
    
    try {
      const canvas = this.pdfCanvas.nativeElement;
      await this.pdfViewerService.renderPage(pageNumber, canvas, this.zoomLevel);
      this.currentPage = pageNumber;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }

  // PDF navigation methods
  async nextPage(): Promise<void> {
    if (this.currentPage < this.totalPages) {
      await this.renderPage(this.currentPage + 1);
    }
  }

  async previousPage(): Promise<void> {
    if (this.currentPage > 1) {
      await this.renderPage(this.currentPage - 1);
    }
  }

  async zoomIn(): Promise<void> {
    this.zoomLevel = Math.min(this.zoomLevel * 1.25, 3.0);
    await this.renderPage(this.currentPage);
  }

  async zoomOut(): Promise<void> {
    this.zoomLevel = Math.max(this.zoomLevel / 1.25, 0.5);
    await this.renderPage(this.currentPage);
  }

  // Field detection methods
  async detectFields(): Promise<void> {
    if (!this.pdfLoaded) return;
    
    try {
      this.loading = true;
      this.detectedFields = await this.pdfViewerService.extractFormFields(1);
      this.fieldsDetected = true;
      
      // Convert detected fields to template fields
      this.convertToTemplateFields();
      
      this.snackBar.open(
        `Se detectaron ${this.detectedFields.length} campos`,
        'Cerrar',
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Error detecting fields:', error);
      this.fieldsDetected = false;
      this.snackBar.open(
        `Error al detectar campos: ${error}`,
        'Cerrar',
        { duration: 5000 }
      );
    } finally {
      this.loading = false;
    }
  }

  convertToTemplateFields(): void {
    this.templateFields = this.detectedFields.map((field, index) => ({
      id: 0,
      templateVersionId: 0,
      nombreCampo: field.name,
      etiqueta: this.formatFieldLabel(field.name),
      tipo: this.inferFieldType(field),
      requerido: (field as any).required || false,
      coordenadas: {
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
        pagina: field.page
      },
      propiedades: this.createFieldValidations(field),
      confianzaDeteccion: 0.8,
      validadoPorHumano: false,
      orden: index + 1,
      createdAt: new Date()
    }));
  }

  private formatFieldLabel(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private inferFieldType(field: ExtractedField): TipoCampo {
    const name = field.name.toLowerCase();
    const type = field.type.toLowerCase();
    
    if (name.includes('email') || name.includes('correo')) {
      return 'EMAIL';
    }
    if (name.includes('phone') || name.includes('telefono') || name.includes('tel')) {
      return 'TELEFONO';
    }
    if (name.includes('date') || name.includes('fecha')) {
      return 'FECHA';
    }
    if (type === 'checkbox') {
      return 'CHECKBOX';
    }
    if (type === 'select' || type === 'combobox') {
      return 'LISTA';
    }
    if (name.includes('number') || name.includes('numero') || name.includes('cantidad')) {
      return 'NUMERO';
    }
    
    return 'TEXTO';
  }

  private createFieldValidations(field: ExtractedField): any {
    const validations: any = {};
    
    if ((field.type as string) === 'email') {
      validations.pattern = '^[^@]+@[^@]+\\.[^@]+$';
    }
    
    return validations;
  }

  // Field editing methods
  editField(field: TemplateField, updatedField: Partial<TemplateField>): void {
    const index = this.templateFields.findIndex(f => f === field);
    if (index !== -1) {
      this.templateFields[index] = { ...field, ...updatedField };
    }
  }

  deleteField(field: TemplateField): void {
    const index = this.templateFields.findIndex(f => f === field);
    if (index !== -1) {
      this.templateFields.splice(index, 1);
      
      // Remove associated mappings
      this.fieldMappings = this.fieldMappings.filter(
        mapping => mapping.templateFieldId !== field.id
      );
    }
  }

  addField(fieldData: any): void {
    const newField: TemplateField = {
      id: 0,
      templateVersionId: 0,
      nombreCampo: fieldData.nombre || '',
      etiqueta: fieldData.etiqueta || '',
      tipo: fieldData.tipo || 'TEXTO',
      requerido: fieldData.requerido || false,
      coordenadas: {
        x: fieldData.posicionX || 0,
        y: fieldData.posicionY || 0,
        width: fieldData.ancho || 100,
        height: fieldData.alto || 20,
        pagina: fieldData.pagina || 1
      },
      propiedades: fieldData.validaciones || {},
      confianzaDeteccion: 0,
      validadoPorHumano: false,
      orden: this.templateFields.length + 1,
      createdAt: new Date()
    };
    
    this.templateFields.push(newField);
  }

  // Drag and drop methods
  onDragStart(event: DragEvent, erpField: ErpField): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', erpField.name);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragEnter(templateField: TemplateField): void {
    this.dragOverField = templateField;
  }

  onDragLeave(): void {
    this.dragOverField = null;
  }

  onFieldDrop(event: DragEvent, templateField: TemplateField): void {
    event.preventDefault();
    
    const erpFieldName = event.dataTransfer?.getData('text/plain');
    if (erpFieldName && templateField.id) {
      // Remove existing mapping for this field
      this.fieldMappings = this.fieldMappings.filter(
        mapping => mapping.templateFieldId !== templateField.id
      );
      
      // Create new mapping
      const newMapping: FieldMapping = {
        id: 0,
        templateFieldId: templateField.id,
        campoERP: erpFieldName,
        erpField: erpFieldName,
        transformacionId: undefined,
        transformacion: undefined,
        valorPorDefecto: undefined,
        validaciones: {},
        confianzaMapeo: 0,
        validadoPorHumano: false,
        creadoPorId: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.fieldMappings.push(newMapping);
    }
    
    this.dragOverField = null;
  }

  removeMapping(templateFieldId: number): void {
    this.fieldMappings = this.fieldMappings.filter(
      mapping => mapping.templateFieldId !== templateFieldId
    );
  }

  validateMappings(): void {
    this.mappingErrors = [];
    
    this.fieldMappings.forEach(mapping => {
      this.mappingService.validateMapping(mapping)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (!result.isValid) {
              this.mappingErrors.push(...result.errors);
            }
          },
          error: (error) => {
            console.error('Error validating mapping:', error);
          }
        });
    });
  }

  // Stepper navigation
  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep++;
    } else {
      this.snackBar.open(
        'Por favor complete todos los campos requeridos',
        'Cerrar',
        { duration: 3000 }
      );
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 0: // Basic info
        return this.templateForm.valid;
      case 1: // File upload
        return this.selectedFile !== null && this.pdfLoaded;
      case 2: // Field detection
        return this.templateFields.length > 0;
      case 3: // Field mapping
        return true; // Optional step
      default:
        return false;
    }
  }

  // Template save
  async saveTemplate(): Promise<void> {
    if (!this.templateForm.valid) {
      this.snackBar.open(
        'Por favor complete todos los campos requeridos',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }
    
    try {
      this.loading = true;
      
      const formData = new FormData();
      
      // Add form fields
      const formValue = this.templateForm.value;
      Object.keys(formValue).forEach(key => {
        if (formValue[key] !== null && formValue[key] !== undefined) {
          formData.append(key, formValue[key]);
        }
      });
      
      // Add file
      if (this.selectedFile) {
        formData.append('archivo', this.selectedFile);
      }
      
      // Add fields and mappings as JSON
      formData.append('campos', JSON.stringify(this.templateFields));
      formData.append('mapeos', JSON.stringify(this.fieldMappings));
      
      let result: Template;
      
      if (this.isEditMode && this.data.template?.id) {
        const updateDto: UpdateTemplateDto = {
          nombre: formValue.nombre,
          descripcion: formValue.descripcion
        };
        
        result = await this.templatesService.updateTemplate(
          this.data.template.id,
          updateDto
        ).toPromise() as Template;
        
        this.snackBar.open(
          'Plantilla actualizada exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
      } else {
        const createDto: CreateTemplateDto = {
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          archivo: formValue.archivo,
          empresaId: 1 // TODO: Get from auth service
        };
        
        result = await this.templatesService.createTemplate(createDto)
          .toPromise() as Template;
        
        this.snackBar.open(
          'Plantilla creada exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
      }
      
      this.dialogRef.close(result);
    } catch (error) {
      console.error('Error saving template:', error);
      this.snackBar.open(
        `Error al guardar la plantilla: ${error}`,
        'Cerrar',
        { duration: 5000 }
      );
    } finally {
      this.loading = false;
    }
  }

  // Utility methods
  getFieldTypeIcon(tipo: TipoCampo): string {
    switch (tipo) {
      case 'TEXTO':
        return 'text_fields';
      case 'NUMERO':
        return 'numbers';
      case 'EMAIL':
        return 'email';
      case 'FECHA':
        return 'calendar_today';
      case 'TELEFONO':
        return 'phone';
      case 'CHECKBOX':
        return 'check_box';
      case 'LISTA':
        return 'list';
      default:
        return 'text_fields';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isMapped(field: TemplateField): boolean {
    return this.fieldMappings.some(
      mapping => mapping.templateFieldId === field.id
    );
  }

  getMappedErpField(field: TemplateField): string | null {
    const mapping = this.fieldMappings.find(
      mapping => mapping.templateFieldId === field.id
    );
    return mapping ? (mapping.erpField || null) : null;
  }

  trackByFieldId(index: number, field: TemplateField): number {
    return field.id;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}