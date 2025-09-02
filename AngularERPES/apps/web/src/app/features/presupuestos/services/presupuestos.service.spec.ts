import { TestBed } from '@angular/core/testing';
import { PresupuestosService } from './presupuestos.service';
import { Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto, Capitulo, CreateCapituloDto, UpdateCapituloDto, Partida, CreatePartidaDto, UpdatePartidaDto, DesglosePartida, CreateDesglosePartidaDto, UpdateDesglosePartidaDto, EstadoPresupuesto } from '../../../domain/presupuestos.types';

describe('PresupuestosService', () => {
  let service: PresupuestosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresupuestosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Presupuestos CRUD', () => {
    it('should return initial mock presupuestos', () => {
      const presupuestos = service.presupuestos();
      expect(presupuestos).toBeDefined();
      expect(presupuestos.length).toBeGreaterThan(0);
      expect(presupuestos[0]).toHaveProperty('id');
      expect(presupuestos[0]).toHaveProperty('codigo');
      expect(presupuestos[0]).toHaveProperty('nombre');
    });

    it('should get presupuesto by id', async () => {
      const presupuestos = service.presupuestos();
      const firstId = presupuestos[0].id;
      
      const presupuesto = await service.obtenerPresupuesto(firstId);
      
      expect(presupuesto).toBeDefined();
      expect(presupuesto.id).toBe(firstId);
    });

    it('should throw error when getting non-existent presupuesto', async () => {
      await expectAsync(service.obtenerPresupuesto('non-existent-id'))
        .toBeRejectedWithError('Presupuesto no encontrado');
    });

    it('should create new presupuesto', async () => {
      const createDto: CreatePresupuestoDto = {
        codigo: 'TEST-001',
        nombre: 'Presupuesto Test',
        descripcion: 'Descripción test',
        cliente: 'Cliente Test',
        fechaValidez: new Date('2025-12-31'),
        observaciones: 'Observaciones test'
      };

      const initialCount = service.presupuestos().length;
      const newPresupuesto = await service.crearPresupuesto(createDto);
      const finalCount = service.presupuestos().length;

      expect(newPresupuesto).toBeDefined();
      expect(newPresupuesto.codigo).toBe(createDto.codigo);
      expect(newPresupuesto.nombre).toBe(createDto.nombre);
      expect(newPresupuesto.estado).toBe('borrador');
      expect(finalCount).toBe(initialCount + 1);
    });

    it('should update existing presupuesto', async () => {
      const presupuestos = service.presupuestos();
      const firstId = presupuestos[0].id;
      
      const updateDto: UpdatePresupuestoDto = {
        nombre: 'Nombre Actualizado',
        cliente: 'Cliente Actualizado'
      };

      const updatedPresupuesto = await service.actualizarPresupuesto(firstId, updateDto);
      
      expect(updatedPresupuesto.nombre).toBe(updateDto.nombre);
      expect(updatedPresupuesto.cliente).toBe(updateDto.cliente);
    });

    it('should delete presupuesto', async () => {
      const initialCount = service.presupuestos().length;
      const presupuestos = service.presupuestos();
      const firstId = presupuestos[0].id;

      await service.eliminarPresupuesto(firstId);
      const finalCount = service.presupuestos().length;

      expect(finalCount).toBe(initialCount - 1);
      await expectAsync(service.obtenerPresupuesto(firstId))
        .toBeRejectedWithError('Presupuesto no encontrado');
    });

    it('should duplicate presupuesto', async () => {
      const presupuestos = service.presupuestos();
      const originalId = presupuestos[0].id;
      const initialCount = presupuestos.length;

      const duplicated = await service.duplicarPresupuesto(originalId);
      const finalCount = service.presupuestos().length;

      expect(duplicated).toBeDefined();
      expect(duplicated.id).not.toBe(originalId);
      expect(duplicated.codigo).toContain('COPIA');
      expect(finalCount).toBe(initialCount + 1);
    });
  });

  describe('Capítulos CRUD', () => {
    let presupuestoId: string;

    beforeEach(async () => {
      const createDto: CreatePresupuestoDto = {
        codigo: 'TEST-CAP',
        nombre: 'Test Capítulos',
        descripcion: '',
        cliente: 'Cliente Test',
        fechaValidez: new Date(),
        observaciones: ''
      };
      const presupuesto = await service.crearPresupuesto(createDto);
      presupuestoId = presupuesto.id;
    });

    it('should create capitulo', async () => {
      const createDto: CreateCapituloDto = {
        codigo: 'CAP-001',
        nombre: 'Capítulo Test',
        descripcion: 'Descripción test'
      };

      const capitulo = await service.crearCapitulo(presupuestoId, createDto);
      
      expect(capitulo).toBeDefined();
      expect(capitulo.codigo).toBe(createDto.codigo);
      expect(capitulo.nombre).toBe(createDto.nombre);
    });

    it('should update capitulo', async () => {
      const createDto: CreateCapituloDto = {
        codigo: 'CAP-001',
        nombre: 'Capítulo Test',
        descripcion: 'Descripción test'
      };
      const capitulo = await service.crearCapitulo(presupuestoId, createDto);
      
      const updateDto: UpdateCapituloDto = {
        nombre: 'Capítulo Actualizado'
      };
      
      const updated = await service.actualizarCapitulo(presupuestoId, capitulo.id, updateDto);
      
      expect(updated.nombre).toBe(updateDto.nombre);
    });

    it('should delete capitulo', async () => {
      const createDto: CreateCapituloDto = {
        codigo: 'CAP-001',
        nombre: 'Capítulo Test',
        descripcion: 'Descripción test'
      };
      const capitulo = await service.crearCapitulo(presupuestoId, createDto);
      
      await service.eliminarCapitulo(presupuestoId, capitulo.id);
      
      const presupuesto = await service.obtenerPresupuesto(presupuestoId);
      const capituloExists = presupuesto.capitulos?.some(c => c.id === capitulo.id);
      
      expect(capituloExists).toBeFalsy();
    });
  });

  describe('Partidas CRUD', () => {
    let presupuestoId: string;
    let capituloId: string;

    beforeEach(async () => {
      const presupuestoDto: CreatePresupuestoDto = {
        codigo: 'TEST-PART',
        nombre: 'Test Partidas',
        descripcion: '',
        cliente: 'Cliente Test',
        fechaValidez: new Date(),
        observaciones: ''
      };
      const presupuesto = await service.crearPresupuesto(presupuestoDto);
      presupuestoId = presupuesto.id;

      const capituloDto: CreateCapituloDto = {
        codigo: 'CAP-001',
        nombre: 'Capítulo Test',
        descripcion: ''
      };
      const capitulo = await service.crearCapitulo(presupuestoId, capituloDto);
      capituloId = capitulo.id;
    });

    it('should create partida', async () => {
      const createDto: CreatePartidaDto = {
        codigo: 'PART-001',
        nombre: 'Partida Test',
        descripcion: 'Descripción test',
        tipoRecurso: 'material',
        unidadMedida: 'ud',
        cantidad: 10,
        precioUnitario: 25.50,
        tipoIva: 'general'
      };

      const partida = await service.crearPartida(presupuestoId, capituloId, createDto);
      
      expect(partida).toBeDefined();
      expect(partida.codigo).toBe(createDto.codigo);
      expect(partida.cantidad).toBe(createDto.cantidad);
      expect(partida.precioUnitario).toBe(createDto.precioUnitario);
    });

    it('should calculate partida totals correctly', async () => {
      const createDto: CreatePartidaDto = {
        codigo: 'PART-001',
        nombre: 'Partida Test',
        descripcion: '',
        tipoRecurso: 'material',
        unidadMedida: 'ud',
        cantidad: 10,
        precioUnitario: 100,
        tipoIva: 'general' // 21%
      };

      const partida = await service.crearPartida(presupuestoId, capituloId, createDto);
      
      expect(partida.totalBase).toBe(1000); // 10 * 100
      expect(partida.totalIva).toBe(210); // 1000 * 0.21
      expect(partida.totalFinal).toBe(1210); // 1000 + 210
    });
  });

  describe('Desglose CRUD', () => {
    let presupuestoId: string;
    let capituloId: string;
    let partidaId: string;

    beforeEach(async () => {
      const presupuestoDto: CreatePresupuestoDto = {
        codigo: 'TEST-DESG',
        nombre: 'Test Desglose',
        descripcion: '',
        cliente: 'Cliente Test',
        fechaValidez: new Date(),
        observaciones: ''
      };
      const presupuesto = await service.crearPresupuesto(presupuestoDto);
      presupuestoId = presupuesto.id;

      const capituloDto: CreateCapituloDto = {
        codigo: 'CAP-001',
        nombre: 'Capítulo Test',
        descripcion: ''
      };
      const capitulo = await service.crearCapitulo(presupuestoId, capituloDto);
      capituloId = capitulo.id;

      const partidaDto: CreatePartidaDto = {
        codigo: 'PART-001',
        nombre: 'Partida Test',
        descripcion: '',
        tipoRecurso: 'material',
        unidadMedida: 'ud',
        cantidad: 1,
        precioUnitario: 100,
        tipoIva: 'general'
      };
      const partida = await service.crearPartida(presupuestoId, capituloId, partidaDto);
      partidaId = partida.id;
    });

    it('should create desglose', async () => {
      const createDto: CreateDesglosePartidaDto = {
        codigo: 'DESG-001',
        nombre: 'Desglose Test',
        descripcion: '',
        tipoRecurso: 'material',
        unidadMedida: 'kg',
        cantidad: 5,
        precioUnitario: 20,
        tipoIva: 'general'
      };

      const desglose = await service.crearDesglosePartida(presupuestoId, capituloId, partidaId, createDto);
      
      expect(desglose).toBeDefined();
      expect(desglose.codigo).toBe(createDto.codigo);
      expect(desglose.cantidad).toBe(createDto.cantidad);
    });

    it('should update partida totals when desglose is added', async () => {
      const createDto: CreateDesglosePartidaDto = {
        codigo: 'DESG-001',
        nombre: 'Desglose Test',
        descripcion: '',
        tipoRecurso: 'material',
        unidadMedida: 'kg',
        cantidad: 5,
        precioUnitario: 20,
        tipoIva: 'general'
      };

      await service.crearDesglosePartida(presupuestoId, capituloId, partidaId, createDto);
      
      const presupuesto = await service.obtenerPresupuesto(presupuestoId);
      const partida = presupuesto.capitulos?.[0]?.partidas?.[0];
      
      expect(partida?.totalBase).toBeGreaterThan(100); // Original + desglose
    });
  });

  describe('Calculations', () => {
    it('should calculate presupuesto totals correctly', async () => {
      const presupuestoDto: CreatePresupuestoDto = {
        codigo: 'TEST-CALC',
        nombre: 'Test Cálculos',
        descripcion: '',
        cliente: 'Cliente Test',
        fechaValidez: new Date(),
        observaciones: ''
      };
      const presupuesto = await service.crearPresupuesto(presupuestoDto);
      
      const capituloDto: CreateCapituloDto = {
        codigo: 'CAP-001',
        nombre: 'Capítulo Test',
        descripcion: ''
      };
      const capitulo = await service.crearCapitulo(presupuesto.id, capituloDto);
      
      const partidaDto: CreatePartidaDto = {
        codigo: 'PART-001',
        nombre: 'Partida Test',
        descripcion: '',
        tipoRecurso: 'material',
        unidadMedida: 'ud',
        cantidad: 2,
        precioUnitario: 50,
        tipoIva: 'general' // 21%
      };
      await service.crearPartida(presupuesto.id, capitulo.id, partidaDto);
      
      const updatedPresupuesto = await service.obtenerPresupuesto(presupuesto.id);
      
      expect(updatedPresupuesto.totalBase).toBe(100); // 2 * 50
      expect(updatedPresupuesto.totalIva).toBe(21); // 100 * 0.21
      expect(updatedPresupuesto.totalFinal).toBe(121); // 100 + 21
    });
  });

  describe('Export functionality', () => {
    it('should export presupuesto', async () => {
      const presupuestos = service.presupuestos();
      const firstId = presupuestos[0].id;
      
      // Should not throw error
      await expectAsync(service.exportarPresupuesto(firstId)).toBeResolved();
    });
  });

  describe('Estado management', () => {
    it('should change presupuesto estado', async () => {
      const presupuestos = service.presupuestos();
      const firstId = presupuestos[0].id;
      const newEstado: EstadoPresupuesto = 'enviado';
      
      const updateDto: UpdatePresupuestoDto = {
        estado: newEstado
      };
      
      const updated = await service.actualizarPresupuesto(firstId, updateDto);
      
      expect(updated.estado).toBe(newEstado);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid presupuesto id', async () => {
      await expectAsync(service.actualizarPresupuesto('invalid-id', { nombre: 'Test' }))
        .toBeRejectedWithError('Presupuesto no encontrado');
    });

    it('should handle invalid capitulo id', async () => {
      const presupuestos = service.presupuestos();
      const validPresupuestoId = presupuestos[0].id;
      
      await expectAsync(service.actualizarCapitulo(validPresupuestoId, 'invalid-id', { nombre: 'Test' }))
        .toBeRejectedWithError('Capítulo no encontrado');
    });

    it('should handle invalid partida id', async () => {
      const presupuestos = service.presupuestos();
      const validPresupuestoId = presupuestos[0].id;
      
      await expectAsync(service.actualizarPartida(validPresupuestoId, 'invalid-cap-id', 'invalid-part-id', { nombre: 'Test' }))
        .toBeRejectedWithError('Capítulo no encontrado');
    });
  });
});