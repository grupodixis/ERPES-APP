import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FillJobsService } from './fill-jobs.service';
import {
  FillJob,
  CreateFillJobDto,
  FillJobFilters,
  PaginatedResult,
  EstadoFillJob
} from '../../../domain/documentos.types';

describe('FillJobsService', () => {
  let service: FillJobsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/fill-jobs';

  const mockFillJob: FillJob = {
    id: 1,
    templateId: 1,
    templateNombre: 'Contrato de Obra',
    estado: 'Completado',
    datosEntrada: {
      cliente: {
        nombre: 'Juan Pérez',
        documento: '12345678'
      },
      obra: {
        nombre: 'Construcción Edificio A',
        fecha_inicio: '2024-02-01'
      }
    },
    archivoResultadoUrl: '/uploads/filled/contrato-123.pdf',
    archivoResultadoNombre: 'contrato-123.pdf',
    archivoResultadoTamaño: 1024576,
    tiempoProcesamientoMs: 2500,
    errores: [],
    metadatos: {
      camposLlenados: 15,
      camposVacios: 2,
      porcentajeCompletitud: 88.2
    },
    creadoPorId: 1,
    creadoPor: 'Admin Usuario',
    empresaId: 1,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:32:30Z')
  };

  const mockPaginatedResult: PaginatedResult<FillJob> = {
    data: [mockFillJob],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FillJobsService]
    });
    service = TestBed.inject(FillJobsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFillJobs', () => {
    it('should fetch fill jobs with default parameters', () => {
      service.getFillJobs().subscribe(result => {
        expect(result).toEqual(mockPaginatedResult);
      });

      const req = httpMock.expectOne(`${baseUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });

    it('should fetch fill jobs with filters', () => {
      const filters: FillJobFilters & { page: number; limit: number } = {
        templateId: 1,
        estado: 'Completado',
        fechaDesde: new Date('2024-01-01'),
        fechaHasta: new Date('2024-01-31'),
        creadoPorId: 1,
        page: 2,
        limit: 25
      };

      service.getFillJobs(filters).subscribe(result => {
        expect(result).toEqual(mockPaginatedResult);
      });

      const expectedUrl = `${baseUrl}?templateId=1&estado=Completado&fechaDesde=2024-01-01T00%3A00%3A00.000Z&fechaHasta=2024-01-31T00%3A00%3A00.000Z&creadoPorId=1&page=2&limit=25`;
      const req = httpMock.expectOne((request) => {
        return request.url.includes('templateId=1') &&
               request.url.includes('estado=Completado') &&
               request.url.includes('page=2') &&
               request.url.includes('limit=25');
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });

    it('should handle empty filters', () => {
      const filters = {
        templateId: undefined,
        estado: undefined,
        page: 1,
        limit: 10
      };

      service.getFillJobs(filters).subscribe();

      const req = httpMock.expectOne(`${baseUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResult);
    });
  });

  describe('getFillJob', () => {
    it('should fetch a single fill job by id', () => {
      const jobId = 1;

      service.getFillJob(jobId).subscribe(job => {
        expect(job).toEqual(mockFillJob);
      });

      const req = httpMock.expectOne(`${baseUrl}/${jobId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFillJob);
    });
  });

  describe('createFillJob', () => {
    it('should create a new fill job', () => {
      const createDto: CreateFillJobDto = {
        templateId: 1,
        datosEntrada: {
          cliente: {
            nombre: 'Juan Pérez',
            documento: '12345678'
          }
        },
        empresaId: 1
      };

      service.createFillJob(createDto).subscribe(job => {
        expect(job).toEqual(mockFillJob);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockFillJob);
    });

    it('should handle optional metadata in create request', () => {
      const createDto: CreateFillJobDto = {
        templateId: 1,
        datosEntrada: { test: 'data' },
        empresaId: 1,
        metadatos: {
          origen: 'API',
          version: '1.0'
        }
      };

      service.createFillJob(createDto).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.body.metadatos).toEqual({
        origen: 'API',
        version: '1.0'
      });
      req.flush(mockFillJob);
    });
  });

  describe('retryFillJob', () => {
    it('should retry a failed fill job', () => {
      const jobId = 1;
      const retriedJob = { ...mockFillJob, estado: 'Procesando' as EstadoFillJob };

      service.retryFillJob(jobId).subscribe(job => {
        expect(job).toEqual(retriedJob);
      });

      const req = httpMock.expectOne(`${baseUrl}/${jobId}/retry`);
      expect(req.request.method).toBe('POST');
      req.flush(retriedJob);
    });
  });

  describe('cancelFillJob', () => {
    it('should cancel a running fill job', () => {
      const jobId = 1;
      const cancelledJob = { ...mockFillJob, estado: 'Cancelado' as EstadoFillJob };

      service.cancelFillJob(jobId).subscribe(job => {
        expect(job).toEqual(cancelledJob);
      });

      const req = httpMock.expectOne(`${baseUrl}/${jobId}/cancel`);
      expect(req.request.method).toBe('POST');
      req.flush(cancelledJob);
    });
  });

  describe('deleteFillJob', () => {
    it('should delete a fill job', () => {
      const jobId = 1;

      service.deleteFillJob(jobId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/${jobId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('downloadResult', () => {
    it('should download fill job result as blob', () => {
      const jobId = 1;
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

      service.downloadResult(jobId).subscribe(blob => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${baseUrl}/${jobId}/download`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('previewResult', () => {
    it('should get preview URL for fill job result', () => {
      const jobId = 1;
      const mockPreview = {
        previewUrl: '/api/fill-jobs/1/preview',
        expiresAt: new Date('2024-01-16T10:30:00Z')
      };

      service.previewResult(jobId).subscribe(preview => {
        expect(preview).toEqual(mockPreview);
      });

      const req = httpMock.expectOne(`${baseUrl}/${jobId}/preview`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPreview);
    });
  });

  describe('getFillJobStats', () => {
    it('should fetch fill job statistics', () => {
      const mockStats = {
        totalJobs: 150,
        completedJobs: 120,
        failedJobs: 15,
        pendingJobs: 15,
        averageProcessingTime: 3200,
        successRate: 80.0,
        jobsByTemplate: [
          { templateId: 1, templateNombre: 'Contrato', count: 50 },
          { templateId: 2, templateNombre: 'Factura', count: 30 }
        ],
        jobsByDay: [
          { date: '2024-01-15', count: 25 },
          { date: '2024-01-14', count: 18 }
        ]
      };

      service.getFillJobStats().subscribe(stats => {
        expect(stats).toEqual(mockStats);
      });

      const req = httpMock.expectOne(`${baseUrl}/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should fetch stats with date range filter', () => {
      const fechaDesde = new Date('2024-01-01');
      const fechaHasta = new Date('2024-01-31');

      service.getFillJobStats(fechaDesde, fechaHasta).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url.includes('fechaDesde=') && request.url.includes('fechaHasta=');
      });
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple fill jobs', () => {
      const jobIds = [1, 2, 3];
      const mockResult = {
        deleted: 3,
        failed: 0,
        errors: []
      };

      service.bulkDelete(jobIds).subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpMock.expectOne(`${baseUrl}/bulk-delete`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ jobIds });
      req.flush(mockResult);
    });
  });

  describe('bulkRetry', () => {
    it('should retry multiple failed fill jobs', () => {
      const jobIds = [1, 2, 3];
      const mockResult = {
        retried: 3,
        failed: 0,
        errors: []
      };

      service.bulkRetry(jobIds).subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpMock.expectOne(`${baseUrl}/bulk-retry`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ jobIds });
      req.flush(mockResult);
    });
  });

  describe('getJobProgress', () => {
    it('should get real-time progress of a fill job', () => {
      const jobId = 1;
      const mockProgress = {
        jobId: 1,
        estado: 'Procesando' as EstadoFillJob,
        progreso: 65,
        etapaActual: 'Llenando campos',
        tiempoTranscurrido: 1500,
        tiempoEstimado: 800
      };

      service.getJobProgress(jobId).subscribe(progress => {
        expect(progress).toEqual(mockProgress);
      });

      const req = httpMock.expectOne(`${baseUrl}/${jobId}/progress`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProgress);
    });
  });

  describe('validateInputData', () => {
    it('should validate input data against template', () => {
      const templateId = 1;
      const inputData = {
        cliente: {
          nombre: 'Juan Pérez',
          documento: '12345678'
        }
      };
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: ['Campo opcional "teléfono" no proporcionado'],
        missingFields: [],
        extraFields: []
      };

      service.validateInputData(templateId, inputData).subscribe(validation => {
        expect(validation).toEqual(mockValidation);
      });

      const req = httpMock.expectOne(`${baseUrl}/validate-input`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ templateId, inputData });
      req.flush(mockValidation);
    });

    it('should return validation errors for invalid data', () => {
      const templateId = 1;
      const inputData = { cliente: { nombre: '' } };
      const mockValidation = {
        isValid: false,
        errors: ['Campo "nombre" es requerido'],
        warnings: [],
        missingFields: ['cliente.documento'],
        extraFields: []
      };

      service.validateInputData(templateId, inputData).subscribe(validation => {
        expect(validation.isValid).toBeFalse();
        expect(validation.errors.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/validate-input`);
      req.flush(mockValidation);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors gracefully', () => {
      service.getFillJob(999).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Fill job not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', () => {
      service.getFillJobs().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}?page=1&limit=10`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle server errors during job creation', () => {
      const createDto: CreateFillJobDto = {
        templateId: 1,
        datosEntrada: {},
        empresaId: 1
      };

      service.createFillJob(createDto).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Internal server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('URL Building', () => {
    it('should build correct URLs with query parameters', () => {
      const filters = {
        templateId: 1,
        estado: 'Completado' as EstadoFillJob,
        fechaDesde: new Date('2024-01-01'),
        fechaHasta: new Date('2024-12-31'),
        creadoPorId: 1,
        empresaId: 1,
        page: 1,
        limit: 10
      };

      service.getFillJobs(filters).subscribe();

      const req = httpMock.expectOne((request) => {
        const url = request.url;
        return url.includes('templateId=1') &&
               url.includes('estado=Completado') &&
               url.includes('creadoPorId=1') &&
               url.includes('empresaId=1') &&
               url.includes('page=1') &&
               url.includes('limit=10');
      });
      
      req.flush(mockPaginatedResult);
    });
  });
});