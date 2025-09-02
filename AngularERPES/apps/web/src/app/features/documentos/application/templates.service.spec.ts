import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TemplatesService } from './templates.service';
import { 
  Template, 
  CreateTemplateDto, 
  UpdateTemplateDto, 
  TemplateFilters,
  PaginatedResult,
  ApiResponse,
  PdfAnalysisResponse,
  FieldMappingSuggestion
} from '../../../domain/documentos.types';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/templates';

  const mockTemplate: Template = {
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
  };

  const mockPaginatedResult: PaginatedResult<Template> = {
    data: [mockTemplate],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  const mockAnalysisResponse: PdfAnalysisResponse = {
    templateVersionId: 1,
    totalCampos: 15,
    camposDetectados: [],
    metadatos: {
      totalPaginas: 5,
      tipoFormulario: 'AcroForm',
      tiempoAnalisis: 2.5
    },
    sugerenciasMapeo: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TemplatesService]
    });
    service = TestBed.inject(TemplatesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTemplates', () => {
    it('should fetch templates with default parameters', () => {
      service.getTemplates().subscribe(result => {
        expect(result).toEqual(mockPaginatedResult);
      });

      const req = httpMock.expectOne(`${baseUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });

    it('should fetch templates with filters', () => {
      const filters: TemplateFilters & { page: number; limit: number } = {
        search: 'contrato',
        tipo: 'AcroForm',
        estado: 'Activa',
        page: 2,
        limit: 25
      };

      service.getTemplates(filters).subscribe(result => {
        expect(result).toEqual(mockPaginatedResult);
      });

      const expectedUrl = `${baseUrl}?search=contrato&tipo=AcroForm&estado=Activa&page=2&limit=25`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });

    it('should handle empty filters', () => {
      const filters = {
        search: '',
        tipo: undefined,
        estado: undefined,
        page: 1,
        limit: 10
      };

      service.getTemplates(filters).subscribe();

      const req = httpMock.expectOne(`${baseUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });
  });

  describe('getTemplate', () => {
    it('should fetch a single template by id', () => {
      const templateId = 1;

      service.getTemplate(templateId).subscribe(template => {
        expect(template).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne(`${baseUrl}/${templateId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', () => {
      const createDto: CreateTemplateDto = {
        nombre: 'Nueva Plantilla',
        descripcion: 'Descripción de prueba',
        archivo: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
        empresaId: 1
      };

      service.createTemplate(createDto).subscribe(template => {
        expect(template).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(mockTemplate);
    });

    it('should create FormData correctly', () => {
      const createDto: CreateTemplateDto = {
        nombre: 'Test Template',
        descripcion: 'Test Description',
        archivo: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
        empresaId: 1
      };

      service.createTemplate(createDto).subscribe();

      const req = httpMock.expectOne(baseUrl);
      const formData = req.request.body as FormData;
      
      expect(formData.get('nombre')).toBe('Test Template');
      expect(formData.get('descripcion')).toBe('Test Description');
      expect(formData.get('empresaId')).toBe('1');
      expect(formData.get('archivo')).toBeInstanceOf(File);
      
      req.flush(mockTemplate);
    });
  });

  describe('updateTemplate', () => {
    it('should update a template', () => {
      const templateId = 1;
      const updateDto: UpdateTemplateDto = {
        nombre: 'Nombre Actualizado',
        descripcion: 'Descripción actualizada',
        estado: 'Inactiva'
      };

      service.updateTemplate(templateId, updateDto).subscribe(template => {
        expect(template).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne(`${baseUrl}/${templateId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush(mockTemplate);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', () => {
      const templateId = 1;

      service.deleteTemplate(templateId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/${templateId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('duplicateTemplate', () => {
    it('should duplicate a template', () => {
      const templateId = 1;
      const duplicatedTemplate = { ...mockTemplate, id: 2, nombre: 'Contrato de Obra (Copia)' };

      service.duplicateTemplate(templateId).subscribe(template => {
        expect(template).toEqual(duplicatedTemplate);
      });

      const req = httpMock.expectOne(`${baseUrl}/${templateId}/duplicate`);
      expect(req.request.method).toBe('POST');
      req.flush(duplicatedTemplate);
    });
  });

  describe('analyzeTemplate', () => {
    it('should analyze a template and return field detection results', () => {
      const templateId = 1;

      service.analyzeTemplate(templateId).subscribe(analysis => {
        expect(analysis).toEqual(mockAnalysisResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${templateId}/analyze`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAnalysisResponse);
    });
  });

  describe('getTemplateVersions', () => {
    it('should fetch template versions', () => {
      const templateId = 1;
      const mockVersions = [
        {
          id: 1,
          templateId: 1,
          version: 1,
          descripcionCambios: 'Versión inicial',
          archivoUrl: '/uploads/templates/v1/contrato-obra.pdf',
          metadatos: {
            totalPaginas: 5,
            tipoFormulario: 'AcroForm',
            camposDetectados: 15
          },
          esActiva: true,
          creadoPorId: 1,
          creadoPor: 'Admin Usuario',
          createdAt: new Date('2024-01-01')
        }
      ];

      service.getTemplateVersions(templateId).subscribe(versions => {
        expect(versions).toEqual(mockVersions);
      });

      const req = httpMock.expectOne(`${baseUrl}/${templateId}/versions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVersions);
    });
  });

  describe('getTemplateFields', () => {
    it('should fetch template fields', () => {
      const templateId = 1;
      const versionId = 1;
      const mockFields = [
        {
          id: 1,
          templateVersionId: 1,
          nombreCampo: 'cliente_nombre',
          etiqueta: 'Nombre del Cliente',
          tipo: 'texto' as const,
          requerido: true,
          coordenadas: {
            x: 100,
            y: 200,
            width: 150,
            height: 20,
            pagina: 1
          },
          propiedades: {
            maxLength: 100
          },
          confianzaDeteccion: 0.95,
          validadoPorHumano: true,
          orden: 1,
          createdAt: new Date('2024-01-01')
        }
      ];

      service.getTemplateFields(templateId, versionId).subscribe(fields => {
        expect(fields).toEqual(mockFields);
      });

      const req = httpMock.expectOne(`${baseUrl}/${templateId}/versions/${versionId}/fields`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFields);
    });
  });

  describe('getFieldMappings', () => {
    it('should fetch field mappings for a template', () => {
      const templateId = 1;
      const mockMappings = [
        {
          id: 1,
          templateFieldId: 1,
          campoERP: 'obras.cliente.nombre',
          transformacionId: 1,
          transformacion: 'uppercase',
          valorPorDefecto: '',
          validaciones: {
            required: true,
            minLength: 2
          },
          confianzaMapeo: 0.88,
          validadoPorHumano: true,
          creadoPorId: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      service.getFieldMappings(templateId).subscribe(mappings => {
        expect(mappings).toEqual(mockMappings);
      });

      const req = httpMock.expectOne(`${baseUrl}/${templateId}/mappings`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMappings);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors gracefully', () => {
      service.getTemplate(1).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush('Template not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', () => {
      service.getTemplates().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}?page=1&limit=10`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('URL Building', () => {
    it('should build correct URLs with query parameters', () => {
      const filters = {
        search: 'test search',
        tipo: 'AcroForm' as const,
        estado: 'Activa' as const,
        fechaDesde: new Date('2024-01-01'),
        fechaHasta: new Date('2024-12-31'),
        page: 1,
        limit: 10
      };

      service.getTemplates(filters).subscribe();

      const req = httpMock.expectOne((request) => {
        const url = request.url;
        return url.includes('search=test%20search') &&
               url.includes('tipo=AcroForm') &&
               url.includes('estado=Activa') &&
               url.includes('page=1') &&
               url.includes('limit=10');
      });
      
      req.flush(mockPaginatedResult);
    });
  });
});