import { TestBed } from '@angular/core/testing';
import { CondicionesPagoService } from './condiciones-pago.service';
import {
  CondicionPago,
  CreateCondicionPagoDto,
  UpdateCondicionPagoDto,
  CondicionPagoFilters,
  SimularVencimientoDto
} from '../domain/configuracion.types';
import { firstValueFrom } from 'rxjs';

describe('CondicionesPagoService', () => {
  let service: CondicionesPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CondicionesPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cargarCondicionesPago', () => {
    it('should return all condiciones de pago when no filters applied', async () => {
      const condiciones = await firstValueFrom(service.cargarCondicionesPago());
      
      expect(condiciones).toBeDefined();
      expect(condiciones.length).toBeGreaterThan(0);
      expect(condiciones[0].id).toBeDefined();
      expect(condiciones[0].codigo).toBeDefined();
      expect(condiciones[0].nombre).toBeDefined();
      expect(condiciones[0].tipo).toBeDefined();
    });

    it('should filter by activa status', async () => {
      const filtros: CondicionPagoFilters = { activa: true };
      const condiciones = await firstValueFrom(service.cargarCondicionesPago(filtros));
      
      expect(condiciones.every(c => c.activa === true)).toBeTruthy();
    });

    it('should filter by tipo', async () => {
      const filtros: CondicionPagoFilters = { tipo: 'contado' };
      const condiciones = await firstValueFrom(service.cargarCondicionesPago(filtros));
      
      expect(condiciones.every(c => c.tipo === 'contado')).toBeTruthy();
    });

    it('should filter by empresaId', async () => {
      const filtros: CondicionPagoFilters = { empresaId: 1 };
      const condiciones = await firstValueFrom(service.cargarCondicionesPago(filtros));
      
      expect(condiciones.every(c => c.empresaId === 1)).toBeTruthy();
    });

    it('should filter by search term in codigo', async () => {
      const filtros: CondicionPagoFilters = { search: 'CONTADO' };
      const condiciones = await firstValueFrom(service.cargarCondicionesPago(filtros));
      
      expect(condiciones.length).toBeGreaterThan(0);
      expect(condiciones.some(c => c.codigo.includes('CONTADO'))).toBeTruthy();
    });

    it('should filter by search term in nombre', async () => {
      const filtros: CondicionPagoFilters = { search: '30 días' };
      const condiciones = await firstValueFrom(service.cargarCondicionesPago(filtros));
      
      expect(condiciones.length).toBeGreaterThan(0);
      expect(condiciones.some(c => c.nombre.includes('30 días'))).toBeTruthy();
    });

    it('should return empty array when no matches found', async () => {
      const filtros: CondicionPagoFilters = { search: 'INEXISTENTE' };
      const condiciones = await firstValueFrom(service.cargarCondicionesPago(filtros));
      
      expect(condiciones).toEqual([]);
    });
  });

  describe('obtenerCondicionPago', () => {
    it('should return condicion de pago by id', async () => {
      const condicion = await firstValueFrom(service.obtenerCondicionPago(1));
      
      expect(condicion).toBeDefined();
      expect(condicion.id).toBe(1);
      expect(condicion.codigo).toBe('CONTADO');
    });

    it('should throw error when condicion de pago not found', async () => {
      try {
        await firstValueFrom(service.obtenerCondicionPago(999));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });
  });

  describe('crearCondicionPago', () => {
    it('should create new condicion de pago', async () => {
      const dto: CreateCondicionPagoDto = {
        codigo: 'TEST',
        nombre: 'Condición Test',
        descripcion: 'Descripción de prueba',
        tipo: 'credito',
        diasVencimiento: 45,
        empresaId: 1
      };

      const condicion = await firstValueFrom(service.crearCondicionPago(dto));
      
      expect(condicion).toBeDefined();
      expect(condicion.codigo).toBe(dto.codigo);
      expect(condicion.nombre).toBe(dto.nombre);
      expect(condicion.tipo).toBe(dto.tipo);
      expect(condicion.diasVencimiento).toBe(dto.diasVencimiento);
      expect(condicion.activa).toBe(true);
      expect(condicion.id).toBeGreaterThan(0);
    });

    it('should create condicion de pago with optional fields', async () => {
      const dto: CreateCondicionPagoDto = {
        codigo: 'TEST2',
        nombre: 'Test con descuento',
        tipo: 'credito',
        diasVencimiento: 30,
        finMes: true,
        descuentoProntoPago: 2.5,
        diasDescuento: 10,
        empresaId: 1
      };

      const condicion = await firstValueFrom(service.crearCondicionPago(dto));
      
      expect(condicion.finMes).toBe(true);
      expect(condicion.descuentoProntoPago).toBe(2.5);
      expect(condicion.diasDescuento).toBe(10);
    });

    it('should throw error when codigo already exists', async () => {
      const dto: CreateCondicionPagoDto = {
        codigo: 'CONTADO', // Código que ya existe
        nombre: 'Duplicado',
        tipo: 'contado',
        diasVencimiento: 0,
        empresaId: 1
      };

      try {
        await firstValueFrom(service.crearCondicionPago(dto));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Ya existe una condición de pago');
      }
    });
  });

  describe('actualizarCondicionPago', () => {
    it('should update existing condicion de pago', async () => {
      const dto: UpdateCondicionPagoDto = {
        nombre: 'Nombre Actualizado',
        descripcion: 'Descripción actualizada',
        diasVencimiento: 45
      };

      const condicion = await firstValueFrom(service.actualizarCondicionPago(1, dto));
      
      expect(condicion.nombre).toBe(dto.nombre!);
      expect(condicion.descripcion).toBe(dto.descripcion!);
      expect(condicion.diasVencimiento).toBe(dto.diasVencimiento!);
      expect(condicion.updatedAt).toBeInstanceOf(Date);
    });

    it('should update activa status', async () => {
      const dto: UpdateCondicionPagoDto = { activa: false };
      const condicion = await firstValueFrom(service.actualizarCondicionPago(1, dto));
      
      expect(condicion.activa).toBe(false);
    });

    it('should throw error when condicion de pago not found', async () => {
      const dto: UpdateCondicionPagoDto = { nombre: 'Test' };
      
      try {
        await firstValueFrom(service.actualizarCondicionPago(999, dto));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });
  });

  describe('eliminarCondicionPago', () => {
    it('should delete existing condicion de pago', async () => {
      // Primero crear una condición para eliminar
      const dto: CreateCondicionPagoDto = {
        codigo: 'DELETE_TEST',
        nombre: 'Para Eliminar',
        tipo: 'credito',
        diasVencimiento: 30,
        empresaId: 1
      };
      
      const nuevaCondicion = await firstValueFrom(service.crearCondicionPago(dto));
      
      // Eliminar la condición
      await firstValueFrom(service.eliminarCondicionPago(nuevaCondicion.id));
      
      // Verificar que ya no existe
      try {
        await firstValueFrom(service.obtenerCondicionPago(nuevaCondicion.id));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });

    it('should throw error when condicion de pago not found', async () => {
      try {
        await firstValueFrom(service.eliminarCondicionPago(999));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });
  });

  describe('simularVencimiento', () => {
    it('should simulate vencimiento for contado payment', async () => {
      const dto: SimularVencimientoDto = {
        importe: 1000,
        fechaFactura: new Date('2024-01-15')
      };

      const simulacion = await firstValueFrom(service.simularVencimiento(1, dto)); // CONTADO
      
      expect(simulacion).toBeDefined();
      expect(simulacion.importe).toBe(1000);
      expect(simulacion.fechaVencimiento).toBeInstanceOf(Date);
      expect(simulacion.aplicaDescuento).toBe(false);
    });

    it('should simulate vencimiento with pronto pago discount', async () => {
      const dto: SimularVencimientoDto = {
        importe: 1000,
        fechaFactura: new Date() // Fecha actual para que aplique descuento
      };

      const simulacion = await firstValueFrom(service.simularVencimiento(5, dto)); // PP15
      
      expect(simulacion.aplicaDescuento).toBe(true);
      expect(simulacion.importeConDescuento).toBeLessThan(simulacion.importe);
      expect(simulacion.importeConDescuento).toBe(980); // 1000 - 2%
    });

    it('should calculate days until vencimiento', async () => {
      const fechaFactura = new Date();
      fechaFactura.setDate(fechaFactura.getDate() - 10); // Hace 10 días
      
      const dto: SimularVencimientoDto = {
        importe: 1000,
        fechaFactura
      };

      const simulacion = await firstValueFrom(service.simularVencimiento(2, dto)); // 30D
      
      expect(simulacion.diasHastaVencimiento).toBeCloseTo(20, 1); // Aproximadamente 20 días
    });

    it('should throw error when condicion de pago not found', async () => {
      const dto: SimularVencimientoDto = {
        importe: 1000,
        fechaFactura: new Date()
      };

      try {
        await firstValueFrom(service.simularVencimiento(999, dto));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });
  });

  describe('edge cases and data integrity', () => {
    it('should handle empty search filter', async () => {
      const filtros: CondicionPagoFilters = { search: '' };
      const condiciones = await firstValueFrom(service.cargarCondicionesPago(filtros));
      
      expect(condiciones.length).toBeGreaterThan(0);
    });

    it('should handle case insensitive search', async () => {
      const filtros: CondicionPagoFilters = { search: 'contado' }; // lowercase
      const condiciones = await firstValueFrom(service.cargarCondicionesPago(filtros));
      
      expect(condiciones.length).toBeGreaterThan(0);
      expect(condiciones.some(c => c.codigo === 'CONTADO')).toBeTruthy();
    });

    it('should maintain data consistency after operations', async () => {
      const initialCount = (await firstValueFrom(service.cargarCondicionesPago())).length;
      
      // Crear
      const dto: CreateCondicionPagoDto = {
        codigo: 'CONSISTENCY_TEST',
        nombre: 'Test Consistencia',
        tipo: 'credito',
        diasVencimiento: 30,
        empresaId: 1
      };
      
      const nueva = await firstValueFrom(service.crearCondicionPago(dto));
      let currentCount = (await firstValueFrom(service.cargarCondicionesPago())).length;
      expect(currentCount).toBe(initialCount + 1);
      
      // Actualizar
      await firstValueFrom(service.actualizarCondicionPago(nueva.id, { nombre: 'Actualizado' }));
      currentCount = (await firstValueFrom(service.cargarCondicionesPago())).length;
      expect(currentCount).toBe(initialCount + 1);
      
      // Eliminar
      await firstValueFrom(service.eliminarCondicionPago(nueva.id));
      currentCount = (await firstValueFrom(service.cargarCondicionesPago())).length;
      expect(currentCount).toBe(initialCount);
    });
  });
});