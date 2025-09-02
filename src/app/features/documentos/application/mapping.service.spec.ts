import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MappingService } from './mapping.service';
import {
  FieldMapping,
  TransformPreset,
  FieldMappingSuggestion,
  CreateFieldMappingDto,
  UpdateFieldMappingDto,
  ValidationResult
} from '../../../domain/documentos.types';
import { ExtractedField } from './pdf-viewer.service';

describe('MappingService', () => {
  let service: MappingService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/mappings';

  const mockFieldMapping: FieldMapping = {
    id: 1,
    templateFieldId: 1,
    campoERP: 'obras.cliente.nombre',
    transformacionId: 1,
    transformacion: 'uppercase',
    valorPorDefecto: '',
    validaciones: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    confianzaMapeo: 0.88,
    validadoPorHumano: true,
    creadoPorId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  };

  const mockTransformPreset: TransformPreset = {
    id: 1,
    nombre: 'Formato Nombre',
    descripcion: 'Convierte a mayúsculas y elimina espacios extra',
    transformacion: 'uppercase',
    parametros: {
      trim: true,
      removeExtraSpaces: true
    },
    esGlobal: true,
    empresaId: 1,
    creadoPorId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockExtractedField: ExtractedField = {
    id: 'field1',
    name: 'cliente_nombre',
    type: 'text',
    x: 100,
    y: 200,
    width: 150,
    height: 20,
    value: '',
    page: 1
  };

  const mockSuggestion: FieldMappingSuggestion = {
    templateFieldId: 1,
    campoERP: 'obras.cliente.nombre',
    confianza: 0.92,
    razon: 'Similitud semántica alta',
    transformacionSugerida: 'uppercase'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MappingService]
    });
    service = TestBed.inject(MappingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFieldMappings', () => {
    it('should fetch field mappings for a template', () => {
      const templateId = 1;
      const mockMappings = [mockFieldMapping];

      service.getFieldMappings(templateId).subscribe(mappings => {
        expect(mappings).toEqual(mockMappings);
      });

      const req = httpMock.expectOne(`${baseUrl}/template/${templateId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMappings);
    });
  });

  describe('createFieldMapping', () => {
    it('should create a new field mapping', () => {
      const createDto: CreateFieldMappingDto = {
        templateFieldId: 1,
        campoERP: 'obras.cliente.nombre',
        transformacionId: 1,
        valorPorDefecto: '',
        validaciones: {
          required: true
        }
      };

      service.createFieldMapping(createDto).subscribe(mapping => {
        expect(mapping).toEqual(mockFieldMapping);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockFieldMapping);
    });
  });

  describe('updateFieldMapping', () => {
    it('should update an existing field mapping', () => {
      const mappingId = 1;
      const updateDto: UpdateFieldMappingDto = {
        campoERP: 'obras.cliente.nombre_completo',
        transformacionId: 2,
        validaciones: {
          required: true,
          minLength: 5
        }
      };

      service.updateFieldMapping(mappingId, updateDto).subscribe(mapping => {
        expect(mapping).toEqual(mockFieldMapping);
      });

      const req = httpMock.expectOne(`${baseUrl}/${mappingId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush(mockFieldMapping);
    });
  });

  describe('deleteFieldMapping', () => {
    it('should delete a field mapping', () => {
      const mappingId = 1;

      service.deleteFieldMapping(mappingId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/${mappingId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getTransformPresets', () => {
    it('should fetch transform presets', () => {
      const mockPresets = [mockTransformPreset];

      service.getTransformPresets().subscribe(presets => {
        expect(presets).toEqual(mockPresets);
      });

      const req = httpMock.expectOne('/api/transform-presets');
      expect(req.request.method).toBe('GET');
      req.flush(mockPresets);
    });

    it('should fetch presets with empresa filter', () => {
      const empresaId = 1;
      const mockPresets = [mockTransformPreset];

      service.getTransformPresets(empresaId).subscribe(presets => {
        expect(presets).toEqual(mockPresets);
      });

      const req = httpMock.expectOne(`/api/transform-presets?empresaId=${empresaId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPresets);
    });
  });

  describe('createTransformPreset', () => {
    it('should create a new transform preset', () => {
      const createDto = {
        nombre: 'Nuevo Preset',
        descripcion: 'Descripción del preset',
        transformacion: 'lowercase',
        parametros: { trim: true },
        empresaId: 1
      };

      service.createTransformPreset(createDto).subscribe(preset => {
        expect(preset).toEqual(mockTransformPreset);
      });

      const req = httpMock.expectOne('/api/transform-presets');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockTransformPreset);
    });
  });

  describe('getSuggestions', () => {
    it('should get mapping suggestions for extracted fields', () => {
      const templateId = 1;
      const extractedFields = [mockExtractedField];
      const mockSuggestions = [mockSuggestion];

      service.getSuggestions(templateId, extractedFields).subscribe(suggestions => {
        expect(suggestions).toEqual(mockSuggestions);
      });

      const req = httpMock.expectOne(`${baseUrl}/suggestions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        templateId,
        extractedFields
      });
      req.flush(mockSuggestions);
    });
  });

  describe('validateMapping', () => {
    it('should validate a field mapping', () => {
      const mapping = mockFieldMapping;
      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };

      service.validateMapping(mapping).subscribe(result => {
        expect(result).toEqual(mockValidation);
      });

      const req = httpMock.expectOne(`${baseUrl}/validate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mapping);
      req.flush(mockValidation);
    });

    it('should return validation errors', () => {
      const mapping = { ...mockFieldMapping, campoERP: '' };
      const mockValidation: ValidationResult = {
        isValid: false,
        errors: ['Campo ERP es requerido'],
        warnings: []
      };

      service.validateMapping(mapping).subscribe(result => {
        expect(result.isValid).toBeFalse();
        expect(result.errors.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/validate`);
      req.flush(mockValidation);
    });
  });

  describe('validateAllMappings', () => {
    it('should validate all mappings for a template', () => {
      const templateId = 1;
      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['Algunos campos no están mapeados']
      };

      service.validateAllMappings(templateId).subscribe(result => {
        expect(result).toEqual(mockValidation);
      });

      const req = httpMock.expectOne(`${baseUrl}/template/${templateId}/validate`);
      expect(req.request.method).toBe('POST');
      req.flush(mockValidation);
    });
  });

  describe('applyTransformation', () => {
    it('should apply transformation to a value', () => {
      const value = 'juan pérez';
      const transformation = 'uppercase';
      const parameters = { trim: true };
      const expectedResult = 'JUAN PÉREZ';

      const result = service.applyTransformation(value, transformation, parameters);
      expect(result).toBe(expectedResult);
    });

    it('should handle lowercase transformation', () => {
      const value = 'JUAN PÉREZ';
      const transformation = 'lowercase';
      const expectedResult = 'juan pérez';

      const result = service.applyTransformation(value, transformation);
      expect(result).toBe(expectedResult);
    });

    it('should handle capitalize transformation', () => {
      const value = 'juan pérez garcía';
      const transformation = 'capitalize';
      const expectedResult = 'Juan Pérez García';

      const result = service.applyTransformation(value, transformation);
      expect(result).toBe(expectedResult);
    });

    it('should handle trim transformation', () => {
      const value = '  juan pérez  ';
      const transformation = 'trim';
      const expectedResult = 'juan pérez';

      const result = service.applyTransformation(value, transformation);
      expect(result).toBe(expectedResult);
    });

    it('should handle date formatting', () => {
      const value = '2024-01-15';
      const transformation = 'date';
      const parameters = { format: 'DD/MM/YYYY' };
      
      const result = service.applyTransformation(value, transformation, parameters);
      expect(result).toBe('15/01/2024');
    });

    it('should handle number formatting', () => {
      const value = '1234.56';
      const transformation = 'number';
      const parameters = { decimals: 2, thousandsSeparator: ',' };
      
      const result = service.applyTransformation(value, transformation, parameters);
      expect(result).toBe('1,234.56');
    });

    it('should handle regex replacement', () => {
      const value = 'ABC-123-XYZ';
      const transformation = 'regex';
      const parameters = { pattern: '-', replacement: '_', flags: 'g' };
      
      const result = service.applyTransformation(value, transformation, parameters);
      expect(result).toBe('ABC_123_XYZ');
    });

    it('should handle custom transformation', () => {
      const value = 'test';
      const transformation = 'custom';
      const parameters = { code: 'return value + "_suffix";' };
      
      const result = service.applyTransformation(value, transformation, parameters);
      expect(result).toBe('test_suffix');
    });

    it('should return original value for unknown transformation', () => {
      const value = 'test';
      const transformation = 'unknown';
      
      const result = service.applyTransformation(value, transformation);
      expect(result).toBe(value);
    });

    it('should handle transformation errors gracefully', () => {
      const value = 'test';
      const transformation = 'custom';
      const parameters = { code: 'throw new Error("test error");' };
      
      const result = service.applyTransformation(value, transformation, parameters);
      expect(result).toBe(value); // Should return original value on error
    });
  });

  describe('previewTransformation', () => {
    it('should preview transformation result', () => {
      const sampleValue = 'juan pérez';
      const transformation = 'uppercase';
      const parameters = { trim: true };
      
      const result = service.previewTransformation(sampleValue, transformation, parameters);
      expect(result).toBe('JUAN PÉREZ');
    });
  });

  describe('getAvailableERPFields', () => {
    it('should fetch available ERP fields', () => {
      const mockFields = [
        { path: 'obras.cliente.nombre', label: 'Nombre del Cliente', type: 'string' },
        { path: 'obras.fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
        { path: 'obras.presupuesto', label: 'Presupuesto', type: 'number' }
      ];

      service.getAvailableERPFields().subscribe(fields => {
        expect(fields).toEqual(mockFields);
      });

      const req = httpMock.expectOne('/api/erp-fields');
      expect(req.request.method).toBe('GET');
      req.flush(mockFields);
    });

    it('should fetch ERP fields with module filter', () => {
      const module = 'obras';
      const mockFields = [
        { path: 'obras.cliente.nombre', label: 'Nombre del Cliente', type: 'string' }
      ];

      service.getAvailableERPFields(module).subscribe(fields => {
        expect(fields).toEqual(mockFields);
      });

      const req = httpMock.expectOne(`/api/erp-fields?module=${module}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFields);
    });
  });

  describe('bulkCreateMappings', () => {
    it('should create multiple mappings at once', () => {
      const mappings = [
        {
          templateFieldId: 1,
          campoERP: 'obras.cliente.nombre',
          transformacionId: 1
        },
        {
          templateFieldId: 2,
          campoERP: 'obras.fecha_inicio',
          transformacionId: 2
        }
      ];
      const mockResults = [mockFieldMapping];

      service.bulkCreateMappings(mappings).subscribe(results => {
        expect(results).toEqual(mockResults);
      });

      const req = httpMock.expectOne(`${baseUrl}/bulk`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ mappings });
      req.flush(mockResults);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors gracefully', () => {
      service.getFieldMappings(1).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/template/1`);
      req.flush('Mappings not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle validation errors', () => {
      const invalidMapping = { ...mockFieldMapping, campoERP: '' };
      
      service.validateMapping(invalidMapping).subscribe(result => {
        expect(result.isValid).toBeFalse();
      });

      const req = httpMock.expectOne(`${baseUrl}/validate`);
      req.flush({
        isValid: false,
        errors: ['Campo ERP es requerido'],
        warnings: []
      });
    });
  });
});