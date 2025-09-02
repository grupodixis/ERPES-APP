// ===== TESTS PARA TIPOS DE DOMINIO DOCUMENTOS =====

import {
  Template,
  TemplateVersion,
  TemplateField,
  FieldMapping,
  TransformPreset,
  FillJob,
  AuditLog,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateFieldMappingDto,
  FillRequestDto,
  TemplateFilters,
  FillJobFilters,
  EstadoTemplate,
  TipoTemplate,
  EstadoFillJob,
  TipoCampo,
  TipoTransformacion
} from './documentos.types';

describe('Documentos Types', () => {
  
  describe('Template', () => {
    it('should create a valid Template object', () => {
      const template: Template = {
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

      expect(template).toBeDefined();
      expect(template.id).toBe(1);
      expect(template.nombre).toBe('Contrato de Obra');
      expect(template.tipo).toBe('AcroForm');
      expect(template.estado).toBe('Activa');
      expect(template.porcentajeCompletitud).toBe(80);
    });

    it('should validate required fields', () => {
      const template: Partial<Template> = {
        nombre: 'Test Template',
        tipo: 'Plano'
      };

      expect(template.nombre).toBeDefined();
      expect(template.tipo).toBeDefined();
    });
  });

  describe('TemplateVersion', () => {
    it('should create a valid TemplateVersion object', () => {
      const version: TemplateVersion = {
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
      };

      expect(version).toBeDefined();
      expect(version.templateId).toBe(1);
      expect(version.version).toBe(1);
      expect(version.esActiva).toBe(true);
      expect(version.metadatos.totalPaginas).toBe(5);
    });
  });

  describe('TemplateField', () => {
    it('should create a valid TemplateField object', () => {
      const field: TemplateField = {
        id: 1,
        templateVersionId: 1,
        nombreCampo: 'cliente_nombre',
        etiqueta: 'Nombre del Cliente',
        tipo: 'texto',
        requerido: true,
        coordenadas: {
          x: 100,
          y: 200,
          width: 150,
          height: 20,
          pagina: 1
        },
        propiedades: {
          maxLength: 100,
          placeholder: 'Ingrese el nombre del cliente'
        },
        confianzaDeteccion: 0.95,
        validadoPorHumano: true,
        orden: 1,
        createdAt: new Date('2024-01-01')
      };

      expect(field).toBeDefined();
      expect(field.nombreCampo).toBe('cliente_nombre');
      expect(field.tipo).toBe('texto');
      expect(field.requerido).toBe(true);
      expect(field.coordenadas.x).toBe(100);
      expect(field.confianzaDeteccion).toBe(0.95);
    });
  });

  describe('FieldMapping', () => {
    it('should create a valid FieldMapping object', () => {
      const mapping: FieldMapping = {
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
        updatedAt: new Date('2024-01-01')
      };

      expect(mapping).toBeDefined();
      expect(mapping.campoERP).toBe('obras.cliente.nombre');
      expect(mapping.transformacion).toBe('uppercase');
      expect(mapping.confianzaMapeo).toBe(0.88);
      expect(mapping.validaciones.required).toBe(true);
    });
  });

  describe('TransformPreset', () => {
    it('should create a valid TransformPreset object', () => {
      const preset: TransformPreset = {
        id: 1,
        nombre: 'Formato Fecha Española',
        descripcion: 'Convierte fechas al formato DD/MM/YYYY',
        tipo: 'fecha',
        configuracion: {
          formatoEntrada: 'YYYY-MM-DD',
          formatoSalida: 'DD/MM/YYYY',
          locale: 'es-ES'
        },
        esGlobal: true,
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      expect(preset).toBeDefined();
      expect(preset.nombre).toBe('Formato Fecha Española');
      expect(preset.tipo).toBe('fecha');
      expect(preset.esGlobal).toBe(true);
      expect(preset.configuracion.locale).toBe('es-ES');
    });
  });

  describe('FillJob', () => {
    it('should create a valid FillJob object', () => {
      const job: FillJob = {
        id: 1,
        templateId: 1,
        template: 'Contrato de Obra',
        datosOrigen: {
          tipo: 'obra',
          id: 123,
          nombre: 'Construcción Edificio A'
        },
        estado: 'Completado',
        archivoGeneradoUrl: '/uploads/filled/contrato-123.pdf',
        archivoGeneradoNombre: 'contrato-obra-123.pdf',
        archivoGeneradoTamaño: 2156789,
        tiempoGeneracion: 5.2,
        errores: [],
        metadatos: {
          camposRellenados: 15,
          camposVacios: 0,
          fechaGeneracion: new Date('2024-01-15')
        },
        creadoPorId: 1,
        creadoPor: 'Usuario Test',
        empresaId: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      };

      expect(job).toBeDefined();
      expect(job.templateId).toBe(1);
      expect(job.estado).toBe('Completado');
      expect(job.datosOrigen.tipo).toBe('obra');
      expect(job.tiempoGeneracion).toBe(5.2);
      expect(job.errores).toEqual([]);
    });
  });

  describe('DTOs', () => {
    it('should create a valid CreateTemplateDto', () => {
      const dto: CreateTemplateDto = {
        nombre: 'Nueva Plantilla',
        descripcion: 'Descripción de la plantilla',
        archivo: new File(['content'], 'template.pdf', { type: 'application/pdf' }),
        empresaId: 1
      };

      expect(dto).toBeDefined();
      expect(dto.nombre).toBe('Nueva Plantilla');
      expect(dto.archivo).toBeInstanceOf(File);
      expect(dto.empresaId).toBe(1);
    });

    it('should create a valid FillRequestDto', () => {
      const dto: FillRequestDto = {
        templateId: 1,
        datosOrigen: {
          tipo: 'presupuesto',
          id: 456
        },
        configuracion: {
          aplanar: true,
          optimizar: true,
          marca_agua: false
        }
      };

      expect(dto).toBeDefined();
      expect(dto.templateId).toBe(1);
      expect(dto.datosOrigen.tipo).toBe('presupuesto');
      expect(dto.configuracion.aplanar).toBe(true);
    });
  });

  describe('Enums and Types', () => {
    it('should validate EstadoTemplate values', () => {
      const estados: EstadoTemplate[] = ['Borrador', 'Activa', 'Inactiva', 'Archivada'];
      
      estados.forEach(estado => {
        expect(['Borrador', 'Activa', 'Inactiva', 'Archivada']).toContain(estado);
      });
    });

    it('should validate TipoTemplate values', () => {
      const tipos: TipoTemplate[] = ['AcroForm', 'XFA', 'Plano'];
      
      tipos.forEach(tipo => {
        expect(['AcroForm', 'XFA', 'Plano']).toContain(tipo);
      });
    });

    it('should validate EstadoFillJob values', () => {
      const estados: EstadoFillJob[] = ['Pendiente', 'Procesando', 'Completado', 'Error'];
      
      estados.forEach(estado => {
        expect(['Pendiente', 'Procesando', 'Completado', 'Error']).toContain(estado);
      });
    });

    it('should validate TipoCampo values', () => {
      const tipos: TipoCampo[] = ['TEXTO', 'NUMERO', 'EMAIL', 'FECHA', 'TELEFONO', 'CHECKBOX', 'LISTA', 'FIRMA', 'IMAGEN'];
      
      tipos.forEach(tipo => {
        expect(['TEXTO', 'NUMERO', 'EMAIL', 'FECHA', 'TELEFONO', 'CHECKBOX', 'LISTA', 'FIRMA', 'IMAGEN']).toContain(tipo);
      });
    });

    it('should validate TipoTransformacion values', () => {
      const tipos: TipoTransformacion[] = ['UPPERCASE', 'LOWERCASE', 'CAPITALIZE', 'TRIM', 'DATE', 'NUMBER', 'REGEX', 'CUSTOM', 'CONCATENATE', 'EXTRACT', 'REPLACE', 'CONDITIONAL'];
      
      tipos.forEach(tipo => {
        expect(['UPPERCASE', 'LOWERCASE', 'CAPITALIZE', 'TRIM', 'DATE', 'NUMBER', 'REGEX', 'CUSTOM', 'CONCATENATE', 'EXTRACT', 'REPLACE', 'CONDITIONAL']).toContain(tipo);
      });
    });
  });

  describe('Filters', () => {
    it('should create valid TemplateFilters', () => {
      const filters: TemplateFilters = {
        tipo: 'AcroForm',
        estado: 'Activa',
        creadoPorId: 1,
        fechaDesde: new Date('2024-01-01'),
        fechaHasta: new Date('2024-12-31'),
        search: 'contrato',
        empresaId: 1
      };

      expect(filters).toBeDefined();
      expect(filters.tipo).toBe('AcroForm');
      expect(filters.search).toBe('contrato');
    });

    it('should create valid FillJobFilters', () => {
      const filters: FillJobFilters = {
        templateId: 1,
        estado: 'Completado',
        tipoOrigen: 'obra',
        creadoPorId: 1,
        fechaDesde: new Date('2024-01-01'),
        fechaHasta: new Date('2024-12-31'),
        empresaId: 1
      };

      expect(filters).toBeDefined();
      expect(filters.templateId).toBe(1);
      expect(filters.tipoOrigen).toBe('obra');
    });
  });
});