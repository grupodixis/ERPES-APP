import { TestBed } from '@angular/core/testing';
import { OperariosService } from './operarios.service';
import { Operario, OperarioCreateDto, EstadoSolicitudVacaciones } from '../domain/rrhh.types';

describe('OperariosService', () => {
  let service: OperariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOperarios', () => {
    it('should return all operarios', (done) => {
      service.getOperarios().subscribe(operarios => {
        expect(operarios).toBeDefined();
        expect(operarios.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should filter by activo status', (done) => {
      service.getOperarios({ activo: true }).subscribe(operarios => {
        expect(operarios.every(op => op.activo)).toBeTruthy();
        done();
      });
    });

    it('should filter by categoria', (done) => {
      const categoriaId = 1;
      service.getOperarios({ categoria: categoriaId }).subscribe(operarios => {
        expect(operarios.every(op => op.idCategoriaOperario === categoriaId)).toBeTruthy();
        done();
      });
    });
  });

  describe('getOperarioById', () => {
    it('should return operario when found', (done) => {
      const operarioId = 1;
      service.getOperarioById(operarioId).subscribe(operario => {
        expect(operario).toBeDefined();
        expect(operario?.idOperario).toBe(operarioId);
        done();
      });
    });

    it('should return null when not found', (done) => {
      const nonExistentId = 999;
      service.getOperarioById(nonExistentId).subscribe(operario => {
        expect(operario).toBeNull();
        done();
      });
    });
  });

  describe('createOperario', () => {
    it('should create new operario', (done) => {
      const newOperarioDto: OperarioCreateDto = {
        idPersona: 999,
        fechaAlta: '2024-01-20',
        costeHoraBase: 25.00,
        emailCorporativo: 'test@empresa.com'
      };

      service.createOperario(newOperarioDto).subscribe(operario => {
        expect(operario).toBeDefined();
        expect(operario.idPersona).toBe(newOperarioDto.idPersona);
        expect(operario.activo).toBeTruthy();
        done();
      });
    });
  });

  describe('updateOperario', () => {
    it('should update existing operario', (done) => {
      const updateDto = {
        idOperario: 1,
        costeHoraBase: 30.00,
        emailCorporativo: 'updated@empresa.com'
      };

      service.updateOperario(updateDto).subscribe(operario => {
        expect(operario).toBeDefined();
        expect(operario.costeHoraBase).toBe(updateDto.costeHoraBase);
        expect(operario.emailCorporativo).toBe(updateDto.emailCorporativo);
        done();
      });
    });

    it('should throw error for non-existent operario', (done) => {
      const updateDto = {
        idOperario: 999,
        costeHoraBase: 30.00
      };

      service.updateOperario(updateDto).subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('Operario no encontrado');
          done();
        }
      });
    });
  });

  describe('deleteOperario', () => {
    it('should mark operario as inactive', (done) => {
      const operarioId = 1;
      service.deleteOperario(operarioId).subscribe(result => {
        expect(result).toBeTruthy();
        
        // Verify operario is marked as inactive
        service.getOperarioById(operarioId).subscribe(operario => {
          expect(operario?.activo).toBeFalsy();
          done();
        });
      });
    });
  });

  describe('getCategorias', () => {
    it('should return active categories', (done) => {
      service.getCategorias().subscribe(categorias => {
        expect(categorias).toBeDefined();
        expect(categorias.length).toBeGreaterThan(0);
        expect(categorias.every(cat => cat.activa)).toBeTruthy();
        done();
      });
    });
  });

  describe('getContratosByOperario', () => {
    it('should return contracts for operario', (done) => {
      const operarioId = 1;
      service.getContratosByOperario(operarioId).subscribe(contratos => {
        expect(contratos).toBeDefined();
        expect(contratos.every(c => c.idOperario === operarioId)).toBeTruthy();
        done();
      });
    });
  });

  describe('createContrato', () => {
    it('should create new contract', (done) => {
      const contratoDto = {
        idOperario: 1,
        fechaInicio: '2024-02-01',
        tipoContrato: 'Indefinido',
        salarioBase: 2800.00
      };

      service.createContrato(contratoDto).subscribe(contrato => {
        expect(contrato).toBeDefined();
        expect(contrato.idOperario).toBe(contratoDto.idOperario);
        expect(contrato.salarioBase).toBe(contratoDto.salarioBase);
        done();
      });
    });
  });

  describe('getSolicitudesVacaciones', () => {
    it('should return all vacation requests', (done) => {
      service.getSolicitudesVacaciones().subscribe(solicitudes => {
        expect(solicitudes).toBeDefined();
        expect(solicitudes.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should filter by operario', (done) => {
      const operarioId = 1;
      service.getSolicitudesVacaciones(operarioId).subscribe(solicitudes => {
        expect(solicitudes.every(s => s.idOperario === operarioId)).toBeTruthy();
        done();
      });
    });
  });

  describe('createSolicitudVacaciones', () => {
    it('should create vacation request', (done) => {
      const solicitudDto = {
        idOperario: 1,
        fechaInicio: '2024-08-01',
        fechaFin: '2024-08-15',
        observaciones: 'Vacaciones de verano'
      };

      service.createSolicitudVacaciones(solicitudDto).subscribe(solicitud => {
        expect(solicitud).toBeDefined();
        expect(solicitud.idOperario).toBe(solicitudDto.idOperario);
        expect(solicitud.estado).toBe(EstadoSolicitudVacaciones.PENDIENTE);
        done();
      });
    });
  });

  describe('aprobarSolicitudVacaciones', () => {
    it('should approve vacation request', (done) => {
      const solicitudId = 1;
      service.aprobarSolicitudVacaciones(solicitudId).subscribe(result => {
        expect(result).toBeTruthy();
        done();
      });
    });
  });

  describe('rechazarSolicitudVacaciones', () => {
    it('should reject vacation request', (done) => {
      const solicitudId = 1;
      service.rechazarSolicitudVacaciones(solicitudId).subscribe(result => {
        expect(result).toBeTruthy();
        done();
      });
    });
  });

  describe('getMarcasReloj', () => {
    it('should return time clock marks', (done) => {
      service.getMarcasReloj().subscribe(marcas => {
        expect(marcas).toBeDefined();
        expect(marcas.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should filter by operario', (done) => {
      const operarioId = 1;
      service.getMarcasReloj(operarioId).subscribe(marcas => {
        expect(marcas.every(m => m.idOperario === operarioId)).toBeTruthy();
        done();
      });
    });
  });

  describe('createMarcaReloj', () => {
    it('should create time clock mark', (done) => {
      const marcaDto = {
        idOperario: 1,
        fecha: '2024-01-20',
        hora: '08:00:00',
        tipoMarca: 'Entrada',
        metodo: 'App'
      };

      service.createMarcaReloj(marcaDto).subscribe(marca => {
        expect(marca).toBeDefined();
        expect(marca.idOperario).toBe(marcaDto.idOperario);
        expect(marca.valida).toBeTruthy();
        done();
      });
    });
  });

  describe('getEstadisticasOperarios', () => {
    it('should return operarios statistics', (done) => {
      service.getEstadisticasOperarios().subscribe(stats => {
        expect(stats).toBeDefined();
        expect(stats.totalOperarios).toBeGreaterThan(0);
        expect(stats.operariosActivos).toBeGreaterThanOrEqual(0);
        expect(stats.contratosActivos).toBeGreaterThanOrEqual(0);
        expect(stats.solicitudesPendientes).toBeGreaterThanOrEqual(0);
        expect(stats.porcentajeActivos).toBeGreaterThanOrEqual(0);
        done();
      });
    });
  });
});