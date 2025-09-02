import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MappingRulesEditorComponent } from './mapping-rules-editor.component';
import { MappingService } from '../../application/mapping.service';
import { FieldMapping, TransformPreset, TransformationType, ERPField } from '../../domain/models';

describe('MappingRulesEditorComponent', () => {
  let component: MappingRulesEditorComponent;
  let fixture: ComponentFixture<MappingRulesEditorComponent>;
  let mappingService: jasmine.SpyObj<MappingService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<MappingRulesEditorComponent>>;

  const mockERPFields: ERPField[] = [
    { id: '1', name: 'cliente_nombre', label: 'Nombre Cliente', type: 'string', required: true, module: 'clientes' },
    { id: '2', name: 'factura_numero', label: 'Número Factura', type: 'string', required: true, module: 'facturacion' },
    { id: '3', name: 'fecha_emision', label: 'Fecha Emisión', type: 'date', required: true, module: 'facturacion' },
    { id: '4', name: 'importe_total', label: 'Importe Total', type: 'number', required: true, module: 'facturacion' }
  ];

  const mockTransformPresets: TransformPreset[] = [
    {
      id: '1',
      name: 'Formato Nombre',
      description: 'Convierte a mayúsculas y elimina espacios',
      transformations: [
        { type: TransformationType.UPPERCASE, parameters: {} },
        { type: TransformationType.TRIM, parameters: {} }
      ],
      isGlobal: true,
      createdBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Formato Fecha',
      description: 'Convierte fecha a formato DD/MM/YYYY',
      transformations: [
        { type: TransformationType.DATE, parameters: { format: 'DD/MM/YYYY' } }
      ],
      isGlobal: false,
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockFieldMapping: FieldMapping = {
    id: '1',
    templateId: 'template1',
    templateFieldId: 'field1',
    erpFieldId: '1',
    transformations: [
      { type: TransformationType.UPPERCASE, parameters: {} }
    ],
    isRequired: true,
    defaultValue: '',
    validationRules: [],
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockDialogData = {
    mapping: mockFieldMapping,
    templateField: {
      id: 'field1',
      name: 'cliente',
      type: 'text',
      x: 100,
      y: 200,
      width: 150,
      height: 20,
      page: 1,
      confidence: 0.95,
      value: 'Juan Pérez'
    },
    erpFields: mockERPFields,
    mode: 'edit' as 'create' | 'edit'
  };

  beforeEach(async () => {
    const mappingServiceSpy = jasmine.createSpyObj('MappingService', [
      'getTransformPresets',
      'createTransformPreset',
      'updateTransformPreset',
      'deleteTransformPreset',
      'validateMapping',
      'previewTransformation',
      'getERPFields',
      'getSuggestions'
    ]);

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [MappingRulesEditorComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatTabsModule,
        MatExpansionModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MappingService, useValue: mappingServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MappingRulesEditorComponent);
    component = fixture.componentInstance;
    mappingService = TestBed.inject(MappingService) as jasmine.SpyObj<MappingService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<MappingRulesEditorComponent>>;

    // Setup default service responses
    mappingService.getTransformPresets.and.returnValue(of(mockTransformPresets));
    mappingService.getERPFields.and.returnValue(of(mockERPFields));
    mappingService.getSuggestions.and.returnValue(of([]));
    mappingService.validateMapping.and.returnValue(of({ isValid: true, errors: [] }));
    mappingService.previewTransformation.and.returnValue(of({ result: 'JUAN PÉREZ', success: true }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize in edit mode with existing mapping', () => {
      fixture.detectChanges();

      expect(component.mode).toBe('edit');
      expect(component.mapping).toEqual(mockFieldMapping);
      expect(component.templateField).toEqual(mockDialogData.templateField);
      expect(component.erpFields).toEqual(mockERPFields);
    });

    it('should initialize in create mode with empty mapping', () => {
      const createData = { ...mockDialogData, mapping: null, mode: 'create' as const };
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: createData });
      fixture = TestBed.createComponent(MappingRulesEditorComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.mode).toBe('create');
      expect(component.mapping).toBeNull();
      expect(component.mappingForm.get('erpFieldId')?.value).toBe('');
    });

    it('should load transform presets on init', () => {
      fixture.detectChanges();

      expect(mappingService.getTransformPresets).toHaveBeenCalled();
      expect(component.transformPresets).toEqual(mockTransformPresets);
    });

    it('should setup form with mapping data in edit mode', () => {
      fixture.detectChanges();

      const form = component.mappingForm;
      expect(form.get('erpFieldId')?.value).toBe('1');
      expect(form.get('isRequired')?.value).toBe(true);
      expect(form.get('defaultValue')?.value).toBe('');
    });
  });

  describe('Form Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      const form = component.mappingForm;
      form.get('erpFieldId')?.setValue('');
      form.markAllAsTouched();

      expect(form.get('erpFieldId')?.hasError('required')).toBe(true);
      expect(form.invalid).toBe(true);
    });

    it('should update form when ERP field changes', () => {
      const form = component.mappingForm;
      form.get('erpFieldId')?.setValue('3'); // fecha_emision

      component.onERPFieldChange();

      expect(component.selectedERPField).toEqual(mockERPFields[2]);
    });

    it('should reset transformations when ERP field changes', () => {
      component.transformations = [{ type: TransformationType.UPPERCASE, parameters: {} }];
      const form = component.mappingForm;
      form.get('erpFieldId')?.setValue('2');

      component.onERPFieldChange();

      expect(component.transformations).toEqual([]);
    });
  });

  describe('Transformation Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add transformation', () => {
      const transformation = { type: TransformationType.LOWERCASE, parameters: {} };
      
      component.addTransformation(transformation);

      expect(component.transformations).toContain(transformation);
    });

    it('should remove transformation', () => {
      component.transformations = [
        { type: TransformationType.UPPERCASE, parameters: {} },
        { type: TransformationType.TRIM, parameters: {} }
      ];

      component.removeTransformation(0);

      expect(component.transformations.length).toBe(1);
      expect(component.transformations[0].type).toBe(TransformationType.TRIM);
    });

    it('should move transformation up', () => {
      component.transformations = [
        { type: TransformationType.UPPERCASE, parameters: {} },
        { type: TransformationType.TRIM, parameters: {} }
      ];

      component.moveTransformationUp(1);

      expect(component.transformations[0].type).toBe(TransformationType.TRIM);
      expect(component.transformations[1].type).toBe(TransformationType.UPPERCASE);
    });

    it('should move transformation down', () => {
      component.transformations = [
        { type: TransformationType.UPPERCASE, parameters: {} },
        { type: TransformationType.TRIM, parameters: {} }
      ];

      component.moveTransformationDown(0);

      expect(component.transformations[0].type).toBe(TransformationType.TRIM);
      expect(component.transformations[1].type).toBe(TransformationType.UPPERCASE);
    });

    it('should not move transformation up if already first', () => {
      const originalTransformations = [
        { type: TransformationType.UPPERCASE, parameters: {} },
        { type: TransformationType.TRIM, parameters: {} }
      ];
      component.transformations = [...originalTransformations];

      component.moveTransformationUp(0);

      expect(component.transformations).toEqual(originalTransformations);
    });

    it('should not move transformation down if already last', () => {
      const originalTransformations = [
        { type: TransformationType.UPPERCASE, parameters: {} },
        { type: TransformationType.TRIM, parameters: {} }
      ];
      component.transformations = [...originalTransformations];

      component.moveTransformationDown(1);

      expect(component.transformations).toEqual(originalTransformations);
    });
  });

  describe('Preset Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should apply preset transformations', () => {
      const preset = mockTransformPresets[0];
      
      component.applyPreset(preset);

      expect(component.transformations).toEqual(preset.transformations);
    });

    it('should open create preset dialog', () => {
      component.transformations = [
        { type: TransformationType.UPPERCASE, parameters: {} }
      ];

      component.createPreset();

      expect(component.showCreatePresetDialog).toBe(true);
      expect(component.presetForm.get('name')?.value).toBe('');
      expect(component.presetForm.get('description')?.value).toBe('');
      expect(component.presetForm.get('isGlobal')?.value).toBe(false);
    });

    it('should save new preset', () => {
      const newPreset = {
        name: 'Test Preset',
        description: 'Test Description',
        transformations: [{ type: TransformationType.UPPERCASE, parameters: {} }],
        isGlobal: true
      };
      
      mappingService.createTransformPreset.and.returnValue(of({
        id: '3',
        ...newPreset,
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      component.transformations = newPreset.transformations;
      component.presetForm.patchValue({
        name: newPreset.name,
        description: newPreset.description,
        isGlobal: newPreset.isGlobal
      });

      component.savePreset();

      expect(mappingService.createTransformPreset).toHaveBeenCalledWith(jasmine.objectContaining({
        name: newPreset.name,
        description: newPreset.description,
        transformations: newPreset.transformations,
        isGlobal: newPreset.isGlobal
      }));
    });

    it('should handle preset creation error', () => {
      mappingService.createTransformPreset.and.returnValue(throwError({ message: 'Error creating preset' }));
      spyOn(console, 'error');

      component.transformations = [{ type: TransformationType.UPPERCASE, parameters: {} }];
      component.presetForm.patchValue({ name: 'Test', description: 'Test' });

      component.savePreset();

      expect(console.error).toHaveBeenCalled();
      expect(component.showCreatePresetDialog).toBe(true);
    });

    it('should cancel preset creation', () => {
      component.showCreatePresetDialog = true;
      
      component.cancelPresetCreation();

      expect(component.showCreatePresetDialog).toBe(false);
      expect(component.presetForm.get('name')?.value).toBe('');
    });

    it('should delete preset', () => {
      mappingService.deleteTransformPreset.and.returnValue(of(void 0));
      const presetToDelete = mockTransformPresets[0];

      component.deletePreset(presetToDelete);

      expect(mappingService.deleteTransformPreset).toHaveBeenCalledWith(presetToDelete.id);
    });
  });

  describe('Transformation Preview', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should preview transformation result', () => {
      const sampleValue = 'juan pérez';
      const transformations = [{ type: TransformationType.UPPERCASE, parameters: {} }];
      
      component.previewTransformation(sampleValue, transformations);

      expect(mappingService.previewTransformation).toHaveBeenCalledWith(sampleValue, transformations);
      expect(component.previewResult).toBe('JUAN PÉREZ');
    });

    it('should handle preview error', () => {
      mappingService.previewTransformation.and.returnValue(throwError({ message: 'Preview error' }));
      spyOn(console, 'error');

      component.previewTransformation('test', []);

      expect(console.error).toHaveBeenCalled();
      expect(component.previewResult).toBe('');
    });

    it('should auto-preview when transformations change', () => {
      spyOn(component, 'previewTransformation');
      component.templateField.value = 'test value';
      
      component.transformations = [{ type: TransformationType.UPPERCASE, parameters: {} }];
      component.onTransformationsChange();

      expect(component.previewTransformation).toHaveBeenCalledWith('test value', component.transformations);
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate mapping', () => {
      const mappingData = {
        erpFieldId: '1',
        transformations: [{ type: TransformationType.UPPERCASE, parameters: {} }],
        isRequired: true,
        defaultValue: ''
      };

      component.validateMapping(mappingData);

      expect(mappingService.validateMapping).toHaveBeenCalledWith(jasmine.objectContaining(mappingData));
      expect(component.validationErrors).toEqual([]);
    });

    it('should handle validation errors', () => {
      const validationResult = {
        isValid: false,
        errors: ['ERP field is required', 'Invalid transformation parameters']
      };
      mappingService.validateMapping.and.returnValue(of(validationResult));

      component.validateMapping({ erpFieldId: '', transformations: [], isRequired: false, defaultValue: '' });

      expect(component.validationErrors).toEqual(validationResult.errors);
    });

    it('should validate form before saving', () => {
      spyOn(component, 'validateMapping');
      component.mappingForm.get('erpFieldId')?.setValue('');

      component.save();

      expect(component.validateMapping).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Save and Cancel', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should save valid mapping', () => {
      const form = component.mappingForm;
      form.patchValue({
        erpFieldId: '2',
        isRequired: false,
        defaultValue: 'test'
      });
      component.transformations = [{ type: TransformationType.TRIM, parameters: {} }];

      component.save();

      expect(dialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({
        erpFieldId: '2',
        transformations: component.transformations,
        isRequired: false,
        defaultValue: 'test'
      }));
    });

    it('should not save invalid form', () => {
      component.mappingForm.get('erpFieldId')?.setValue('');
      component.mappingForm.markAllAsTouched();

      component.save();

      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should cancel and close dialog', () => {
      component.cancel();

      expect(dialogRef.close).toHaveBeenCalledWith(null);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get transformation type label', () => {
      expect(component.getTransformationTypeLabel(TransformationType.UPPERCASE)).toBe('Mayúsculas');
      expect(component.getTransformationTypeLabel(TransformationType.LOWERCASE)).toBe('Minúsculas');
      expect(component.getTransformationTypeLabel(TransformationType.CAPITALIZE)).toBe('Capitalizar');
      expect(component.getTransformationTypeLabel(TransformationType.TRIM)).toBe('Eliminar espacios');
      expect(component.getTransformationTypeLabel(TransformationType.DATE)).toBe('Formato fecha');
      expect(component.getTransformationTypeLabel(TransformationType.NUMBER)).toBe('Formato número');
    });

    it('should get transformation type icon', () => {
      expect(component.getTransformationTypeIcon(TransformationType.UPPERCASE)).toBe('text_fields');
      expect(component.getTransformationTypeIcon(TransformationType.DATE)).toBe('event');
      expect(component.getTransformationTypeIcon(TransformationType.NUMBER)).toBe('pin');
      expect(component.getTransformationTypeIcon(TransformationType.REGEX)).toBe('code');
    });

    it('should check if transformation has parameters', () => {
      expect(component.hasTransformationParameters(TransformationType.UPPERCASE)).toBe(false);
      expect(component.hasTransformationParameters(TransformationType.DATE)).toBe(true);
      expect(component.hasTransformationParameters(TransformationType.NUMBER)).toBe(true);
      expect(component.hasTransformationParameters(TransformationType.REGEX)).toBe(true);
    });

    it('should get ERP field by id', () => {
      const field = component.getERPFieldById('2');
      expect(field).toEqual(mockERPFields[1]);
    });

    it('should return undefined for non-existent ERP field', () => {
      const field = component.getERPFieldById('999');
      expect(field).toBeUndefined();
    });
  });

  describe('UI Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display template field information', () => {
      const templateFieldInfo = fixture.debugElement.query(By.css('.template-field-info'));
      expect(templateFieldInfo).toBeTruthy();
      expect(templateFieldInfo.nativeElement.textContent).toContain('cliente');
      expect(templateFieldInfo.nativeElement.textContent).toContain('Juan Pérez');
    });

    it('should display ERP field selector', () => {
      const erpFieldSelect = fixture.debugElement.query(By.css('mat-select[formControlName="erpFieldId"]'));
      expect(erpFieldSelect).toBeTruthy();
    });

    it('should display transformation list', () => {
      component.transformations = [
        { type: TransformationType.UPPERCASE, parameters: {} },
        { type: TransformationType.TRIM, parameters: {} }
      ];
      fixture.detectChanges();

      const transformationItems = fixture.debugElement.queryAll(By.css('.transformation-item'));
      expect(transformationItems.length).toBe(2);
    });

    it('should display preset list', () => {
      const presetItems = fixture.debugElement.queryAll(By.css('.preset-item'));
      expect(presetItems.length).toBe(mockTransformPresets.length);
    });

    it('should show preview result', () => {
      component.previewResult = 'JUAN PÉREZ';
      fixture.detectChanges();

      const previewResult = fixture.debugElement.query(By.css('.preview-result'));
      expect(previewResult).toBeTruthy();
      expect(previewResult.nativeElement.textContent).toContain('JUAN PÉREZ');
    });

    it('should show validation errors', () => {
      component.validationErrors = ['Error 1', 'Error 2'];
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(By.css('.validation-error'));
      expect(errorMessages.length).toBe(2);
    });

    it('should disable save button when form is invalid', () => {
      component.mappingForm.get('erpFieldId')?.setValue('');
      component.mappingForm.markAllAsTouched();
      fixture.detectChanges();

      const saveButton = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect(saveButton.nativeElement.disabled).toBe(true);
    });

    it('should enable save button when form is valid', () => {
      const saveButton = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect(saveButton.nativeElement.disabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle preset loading error', () => {
      mappingService.getTransformPresets.and.returnValue(throwError({ message: 'Load error' }));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
      expect(component.transformPresets).toEqual([]);
    });

    it('should handle validation service error', () => {
      mappingService.validateMapping.and.returnValue(throwError({ message: 'Validation error' }));
      spyOn(console, 'error');

      component.validateMapping({ erpFieldId: '1', transformations: [], isRequired: false, defaultValue: '' });

      expect(console.error).toHaveBeenCalled();
      expect(component.validationErrors).toEqual([]);
    });
  });
});