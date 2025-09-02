import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MappingService } from '../../application/mapping.service';
import {
  FieldMapping,
  TransformPreset,
  Transformation,
  TransformationType,
  ERPField,
  TemplateField,
  ValidationResult
} from '../../domain/models';

export interface MappingRulesEditorData {
  mapping: FieldMapping | null;
  templateField: TemplateField;
  erpFields: ERPField[];
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-mapping-rules-editor',
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
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    DragDropModule
  ],
  templateUrl: './mapping-rules-editor.component.html',
  styleUrls: ['./mapping-rules-editor.component.scss']
})
export class MappingRulesEditorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  mappingForm: FormGroup;
  presetForm: FormGroup;
  
  mode: 'create' | 'edit';
  mapping: FieldMapping | null;
  templateField: TemplateField;
  erpFields: ERPField[];
  selectedERPField: ERPField | null = null;
  
  transformations: Transformation[] = [];
  transformPresets: TransformPreset[] = [];
  
  previewResult = '';
  validationErrors: string[] = [];
  
  showCreatePresetDialog = false;
  isLoading = false;
  
  // Available transformation types
  transformationTypes = Object.values(TransformationType);
  
  constructor(
    private fb: FormBuilder,
    private mappingService: MappingService,
    private dialogRef: MatDialogRef<MappingRulesEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MappingRulesEditorData
  ) {
    this.mode = data.mode;
    this.mapping = data.mapping;
    this.templateField = data.templateField;
    this.erpFields = data.erpFields;
    
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadTransformPresets();
    this.setupFormData();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.mappingForm = this.fb.group({
      erpFieldId: ['', Validators.required],
      isRequired: [false],
      defaultValue: ['']
    });

    this.presetForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isGlobal: [false]
    });
  }

  private setupFormData(): void {
    if (this.mapping) {
      this.mappingForm.patchValue({
        erpFieldId: this.mapping.erpFieldId,
        isRequired: this.mapping.isRequired,
        defaultValue: this.mapping.defaultValue || ''
      });
      
      this.transformations = [...this.mapping.transformations];
      this.selectedERPField = this.getERPFieldById(this.mapping.erpFieldId) || null;
    }
  }

  private setupFormValidation(): void {
    // Auto-validate when form changes
    this.mappingForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.mappingForm.valid) {
          this.validateCurrentMapping();
        }
      });
  }

  private loadTransformPresets(): void {
    this.mappingService.getTransformPresets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (presets) => {
          this.transformPresets = presets;
        },
        error: (error) => {
          console.error('Error loading transform presets:', error);
          this.transformPresets = [];
        }
      });
  }

  onERPFieldChange(): void {
    const erpFieldId = this.mappingForm.get('erpFieldId')?.value;
    this.selectedERPField = this.getERPFieldById(erpFieldId) || null;
    
    // Reset transformations when ERP field changes
    this.transformations = [];
    this.previewResult = '';
    this.validationErrors = [];
  }

  // Transformation Management
  addTransformation(transformation: Transformation): void {
    this.transformations.push(transformation);
    this.onTransformationsChange();
  }

  removeTransformation(index: number): void {
    if (index >= 0 && index < this.transformations.length) {
      this.transformations.splice(index, 1);
      this.onTransformationsChange();
    }
  }

  moveTransformationUp(index: number): void {
    if (index > 0) {
      const temp = this.transformations[index];
      this.transformations[index] = this.transformations[index - 1];
      this.transformations[index - 1] = temp;
      this.onTransformationsChange();
    }
  }

  moveTransformationDown(index: number): void {
    if (index < this.transformations.length - 1) {
      const temp = this.transformations[index];
      this.transformations[index] = this.transformations[index + 1];
      this.transformations[index + 1] = temp;
      this.onTransformationsChange();
    }
  }

  onTransformationsChange(): void {
    if (this.templateField.value && this.transformations.length > 0) {
      this.previewTransformation(this.templateField.value, this.transformations);
    } else {
      this.previewResult = this.templateField.value || '';
    }
    
    this.validateCurrentMapping();
  }

  // Preset Management
  applyPreset(preset: TransformPreset): void {
    this.transformations = [...preset.transformations];
    this.onTransformationsChange();
  }

  createPreset(): void {
    if (this.transformations.length === 0) {
      return;
    }
    
    this.presetForm.reset({
      name: '',
      description: '',
      isGlobal: false
    });
    
    this.showCreatePresetDialog = true;
  }

  savePreset(): void {
    if (this.presetForm.invalid || this.transformations.length === 0) {
      return;
    }

    const presetData = {
      name: this.presetForm.get('name')?.value,
      description: this.presetForm.get('description')?.value,
      transformations: [...this.transformations],
      isGlobal: this.presetForm.get('isGlobal')?.value
    };

    this.isLoading = true;
    this.mappingService.createTransformPreset(presetData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preset) => {
          this.transformPresets.push(preset);
          this.showCreatePresetDialog = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating preset:', error);
          this.isLoading = false;
        }
      });
  }

  cancelPresetCreation(): void {
    this.showCreatePresetDialog = false;
    this.presetForm.reset();
  }

  deletePreset(preset: TransformPreset): void {
    this.mappingService.deleteTransformPreset(preset.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const index = this.transformPresets.findIndex(p => p.id === preset.id);
          if (index >= 0) {
            this.transformPresets.splice(index, 1);
          }
        },
        error: (error) => {
          console.error('Error deleting preset:', error);
        }
      });
  }

  // Preview and Validation
  previewTransformation(value: string, transformations: Transformation[]): void {
    if (!value || transformations.length === 0) {
      this.previewResult = value || '';
      return;
    }

    this.mappingService.previewTransformation(value, transformations)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.previewResult = result.success ? result.result : value;
        },
        error: (error) => {
          console.error('Error previewing transformation:', error);
          this.previewResult = '';
        }
      });
  }

  validateMapping(mappingData: any): void {
    const mapping: Partial<FieldMapping> = {
      templateFieldId: this.templateField.id,
      erpFieldId: mappingData.erpFieldId,
      transformations: this.transformations,
      isRequired: mappingData.isRequired,
      defaultValue: mappingData.defaultValue
    };

    this.mappingService.validateMapping(mapping)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ValidationResult) => {
          this.validationErrors = result.isValid ? [] : result.errors;
        },
        error: (error) => {
          console.error('Error validating mapping:', error);
          this.validationErrors = [];
        }
      });
  }

  private validateCurrentMapping(): void {
    if (this.mappingForm.valid) {
      this.validateMapping(this.mappingForm.value);
    }
  }

  // Save and Cancel
  save(): void {
    if (this.mappingForm.invalid) {
      this.mappingForm.markAllAsTouched();
      return;
    }

    const formValue = this.mappingForm.value;
    const mappingData: Partial<FieldMapping> = {
      templateFieldId: this.templateField.id,
      erpFieldId: formValue.erpFieldId,
      transformations: [...this.transformations],
      isRequired: formValue.isRequired,
      defaultValue: formValue.defaultValue,
      validationRules: []
    };

    if (this.mode === 'edit' && this.mapping) {
      mappingData.id = this.mapping.id;
    }

    this.dialogRef.close(mappingData);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  // Utility Methods
  getTransformationTypeLabel(type: TransformationType): string {
    const labels: Record<TransformationType, string> = {
      [TransformationType.UPPERCASE]: 'Mayúsculas',
      [TransformationType.LOWERCASE]: 'Minúsculas',
      [TransformationType.CAPITALIZE]: 'Capitalizar',
      [TransformationType.TRIM]: 'Eliminar espacios',
      [TransformationType.DATE]: 'Formato fecha',
      [TransformationType.NUMBER]: 'Formato número',
      [TransformationType.REGEX]: 'Expresión regular',
      [TransformationType.CUSTOM]: 'Personalizado',
      [TransformationType.CONCATENATE]: 'Concatenar',
      [TransformationType.EXTRACT]: 'Extraer',
      [TransformationType.REPLACE]: 'Reemplazar',
      [TransformationType.CONDITIONAL]: 'Condicional'
    };
    
    return labels[type] || type;
  }

  getTransformationTypeIcon(type: TransformationType): string {
    const icons: Record<TransformationType, string> = {
      [TransformationType.UPPERCASE]: 'text_fields',
      [TransformationType.LOWERCASE]: 'text_fields',
      [TransformationType.CAPITALIZE]: 'text_fields',
      [TransformationType.TRIM]: 'content_cut',
      [TransformationType.DATE]: 'event',
      [TransformationType.NUMBER]: 'pin',
      [TransformationType.REGEX]: 'code',
      [TransformationType.CUSTOM]: 'extension',
      [TransformationType.CONCATENATE]: 'merge',
      [TransformationType.EXTRACT]: 'content_copy',
      [TransformationType.REPLACE]: 'find_replace',
      [TransformationType.CONDITIONAL]: 'alt_route'
    };
    
    return icons[type] || 'transform';
  }

  hasTransformationParameters(type: TransformationType): boolean {
    const typesWithParameters = [
      TransformationType.DATE,
      TransformationType.NUMBER,
      TransformationType.REGEX,
      TransformationType.CUSTOM,
      TransformationType.CONCATENATE,
      TransformationType.EXTRACT,
      TransformationType.REPLACE,
      TransformationType.CONDITIONAL
    ];
    
    return typesWithParameters.includes(type);
  }

  getERPFieldById(id: string): ERPField | undefined {
    return this.erpFields.find(field => field.id === id);
  }

  getERPFieldTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'string': 'text_fields',
      'number': 'pin',
      'date': 'event',
      'boolean': 'toggle_on',
      'email': 'email',
      'url': 'link',
      'phone': 'phone'
    };
    
    return icons[type] || 'help';
  }

  isPresetApplicable(preset: TransformPreset): boolean {
    if (!this.selectedERPField) {
      return true;
    }
    
    // Check if preset transformations are compatible with selected ERP field type
    return preset.transformations.every(transformation => {
      switch (transformation.type) {
        case TransformationType.DATE:
          return this.selectedERPField?.type === 'date';
        case TransformationType.NUMBER:
          return this.selectedERPField?.type === 'number';
        default:
          return true;
      }
    });
  }
}