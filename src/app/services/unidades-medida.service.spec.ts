import { TestBed } from '@angular/core/testing';
import { UnidadesMedidaService } from './unidades-medida.service';
import {
  UnidadMedida,
  CreateUnidadMedidaDto,
  UpdateUnidadMedidaDto,
  UnidadMedidaFilters,
  ConvertirUnidadDto
} from '../domain/configuracion.types';
import { firstValueFrom } from 'rxjs';

describe('UnidadesMedidaService', () => {
  let service: UnidadesMedidaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidadesMedidaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cargarUnidadesMedida', () => {
    it('should return all unidades medida when no filters', async () => {
      const result = await firstValueFrom(service.cargarUnidadesMedida());
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBeDefined();
      expect(result[0].codigo).toBeDefined();
      expect(result[0].nombre).toBeDefined();
      expect(result[0].magnitud).toBeDefined();
    });

    it('should filter by magnitud', async () => {
      const filtros: UnidadMedidaFilters = { magnitud: 'peso' };
      const result = await firstValueFrom(service.cargarUnidadesMedida(filtros));
      expect(result.every(um => um.magnitud === 'peso')).toBeTruthy();
    });

    it('should filter by esBase', async () => {
      const filtros: UnidadMedidaFilters = { esBase: true };
      const result = await firstValueFrom(service.cargarUnidadesMedida(filtros));
      expect(result.every(um => um.esBase === true)).toBeTruthy();
    });

    it('should filter by activa', async () => {
      const filtros: UnidadMedidaFilters = { activa: false };
      const result = await firstValueFrom(service.cargarUnidadesMedida(filtros));
      expect(result.every(um => um.activa === false)).toBeTruthy();
    });

    it('should filter by empresaId', async () => {
      const filtros: UnidadMedidaFilters = { empresaId: 1 };
      const result = await firstValueFrom(service.cargarUnidadesMedida(filtros));
      expect(result.every(um => um.empresaId === 1)).toBeTruthy();
    });

    it('should filter by search term', async () => {
      const filtros: UnidadMedidaFilters = { search: 'kilo' };
      const result = await firstValueFrom(service.cargarUnidadesMedida(filtros));
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(um => 
        um.codigo.toLowerCase().includes('kilo') ||
        um.nombre.toLowerCase().includes('kilo') ||
        um.simbolo.toLowerCase().includes('kilo')
      )).toBeTruthy();
    });

    it('should combine multiple filters', async () => {
      const filtros: UnidadMedidaFilters = { 
        magnitud: 'peso',
        activa: true,
        esBase: false
      };
      const result = await firstValueFrom(service.cargarUnidadesMedida(filtros));
      expect(result.every(um => 
        um.magnitud === 'peso' && 
        um.activa === true && 
        um.esBase === false
      )).toBeTruthy();
    });
  });

  describe('obtenerUnidadMedida', () => {
    it('should return unidad medida by id', async () => {
      const result = await firstValueFrom(service.obtenerUnidadMedida(1));
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw error for non-existent id', async () => {
      try {
        await firstValueFrom(service.obtenerUnidadMedida(999));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });
  });

  describe('crearUnidadMedida', () => {
    it('should create new unidad medida', async () => {
      const dto: CreateUnidadMedidaDto = {
        codigo: 'TEST',
        nombre: 'Test Unit',
        simbolo: 'test',
        magnitud: 'test',
        empresaId: 1
      };

      const result = await firstValueFrom(service.crearUnidadMedida(dto));
      expect(result).toBeDefined();
      expect(result.codigo).toBe(dto.codigo);
      expect(result.nombre).toBe(dto.nombre);
      expect(result.activa).toBe(true);
      expect(result.id).toBeGreaterThan(0);
    });

    it('should create unidad medida with optional fields', async () => {
      const dto: CreateUnidadMedidaDto = {
        codigo: 'TEST2',
        nombre: 'Test Unit 2',
        simbolo: 'test2',
        magnitud: 'test',
        esBase: true,
        factorConversion: 2.5,
        descripcion: 'Test description',
        empresaId: 1
      };

      const result = await firstValueFrom(service.crearUnidadMedida(dto));
      expect(result.esBase).toBe(true);
      expect(result.factorConversion).toBe(2.5);
      expect(result.descripcion).toBe('Test description');
    });

    it('should throw error for duplicate codigo', async () => {
      const dto: CreateUnidadMedidaDto = {
        codigo: 'KG', // Código que ya existe
        nombre: 'Test',
        simbolo: 'test',
        magnitud: 'test',
        empresaId: 1
      };

      try {
        await firstValueFrom(service.crearUnidadMedida(dto));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Ya existe');
      }
    });

    it('should unmark other base units when creating new base unit', async () => {
      // Primero verificar que KG es base
      const kgAntes = await firstValueFrom(service.obtenerUnidadMedida(2));
      expect(kgAntes.esBase).toBe(true);

      const dto: CreateUnidadMedidaDto = {
        codigo: 'LB',
        nombre: 'Libra',
        simbolo: 'lb',
        magnitud: 'peso',
        esBase: true,
        empresaId: 1
      };

      await firstValueFrom(service.crearUnidadMedida(dto));

      // Verificar que KG ya no es base
      const kgDespues = await firstValueFrom(service.obtenerUnidadMedida(2));
      expect(kgDespues.esBase).toBe(false);
    });
  });

  describe('actualizarUnidadMedida', () => {
    it('should update unidad medida', async () => {
      const dto: UpdateUnidadMedidaDto = {
        nombre: 'Nombre Actualizado',
        descripcion: 'Descripción actualizada'
      };

      const result = await firstValueFrom(service.actualizarUnidadMedida(1, dto));
      expect(result.nombre).toBe('Nombre Actualizado');
      expect(result.descripcion).toBe('Descripción actualizada');
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error for non-existent id', async () => {
      const dto: UpdateUnidadMedidaDto = { nombre: 'Test' };

      try {
        await firstValueFrom(service.actualizarUnidadMedida(999, dto));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });

    it('should unmark other base units when updating to base', async () => {
      // Crear una unidad no base primero
      const createDto: CreateUnidadMedidaDto = {
        codigo: 'OZ',
        nombre: 'Onza',
        simbolo: 'oz',
        magnitud: 'peso',
        esBase: false,
        empresaId: 1
      };
      const nuevaUnidad = await firstValueFrom(service.crearUnidadMedida(createDto));

      // Verificar que KG es base
      const kgAntes = await firstValueFrom(service.obtenerUnidadMedida(2));
      expect(kgAntes.esBase).toBe(true);

      // Actualizar la nueva unidad para que sea base
      const updateDto: UpdateUnidadMedidaDto = {
        esBase: true,
        magnitud: 'peso'
      };
      await firstValueFrom(service.actualizarUnidadMedida(nuevaUnidad.id, updateDto));

      // Verificar que KG ya no es base
      const kgDespues = await firstValueFrom(service.obtenerUnidadMedida(2));
      expect(kgDespues.esBase).toBe(false);
    });
  });

  describe('eliminarUnidadMedida', () => {
    it('should delete non-base unidad medida', async () => {
      // Crear una unidad no base para eliminar
      const createDto: CreateUnidadMedidaDto = {
        codigo: 'DEL',
        nombre: 'Para Eliminar',
        simbolo: 'del',
        magnitud: 'test',
        esBase: false,
        empresaId: 1
      };
      const nuevaUnidad = await firstValueFrom(service.crearUnidadMedida(createDto));

      await firstValueFrom(service.eliminarUnidadMedida(nuevaUnidad.id));

      // Verificar que ya no existe
      try {
        await firstValueFrom(service.obtenerUnidadMedida(nuevaUnidad.id));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });

    it('should throw error when deleting base unit', async () => {
      try {
        await firstValueFrom(service.eliminarUnidadMedida(2)); // KG es base
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('unidad base');
      }
    });

    it('should throw error for non-existent id', async () => {
      try {
        await firstValueFrom(service.eliminarUnidadMedida(999));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no encontrada');
      }
    });
  });

  describe('obtenerMagnitudes', () => {
    it('should return unique magnitudes sorted', async () => {
      const result = await firstValueFrom(service.obtenerMagnitudes());
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('peso');
      expect(result).toContain('longitud');
      expect(result).toContain('volumen');
      expect(result).toContain('cantidad');
      
      // Verificar que está ordenado
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  describe('obtenerUnidadesPorMagnitud', () => {
    it('should return units for specific magnitud', async () => {
      const result = await firstValueFrom(service.obtenerUnidadesPorMagnitud('peso'));
      expect(result.every(um => um.magnitud === 'peso')).toBeTruthy();
      expect(result.every(um => um.activa === true)).toBeTruthy();
    });

    it('should return empty array for non-existent magnitud', async () => {
      const result = await firstValueFrom(service.obtenerUnidadesPorMagnitud('inexistente'));
      expect(result).toEqual([]);
    });
  });

  describe('convertirUnidad', () => {
    it('should convert between units of same magnitud', async () => {
      const dto: ConvertirUnidadDto = {
        cantidad: 1000,
        unidadOrigenId: 3, // Gramos
        unidadDestinoId: 2  // Kilogramos
      };

      const result = await firstValueFrom(service.convertirUnidad(dto));
      expect(result.cantidadOriginal).toBe(1000);
      expect(result.cantidadConvertida).toBe(1); // 1000g = 1kg
      expect(result.unidadOrigen).toBe('g');
      expect(result.unidadDestino).toBe('kg');
    });

    it('should convert from base to derived unit', async () => {
      const dto: ConvertirUnidadDto = {
        cantidad: 1,
        unidadOrigenId: 2, // Kilogramos (base)
        unidadDestinoId: 3  // Gramos
      };

      const result = await firstValueFrom(service.convertirUnidad(dto));
      expect(result.cantidadOriginal).toBe(1);
      expect(result.cantidadConvertida).toBe(1000); // 1kg = 1000g
    });

    it('should throw error for non-existent units', async () => {
      const dto: ConvertirUnidadDto = {
        cantidad: 100,
        unidadOrigenId: 999,
        unidadDestinoId: 2
      };

      try {
        await firstValueFrom(service.convertirUnidad(dto));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('no fueron encontradas');
      }
    });

    it('should throw error for different magnitudes', async () => {
      const dto: ConvertirUnidadDto = {
        cantidad: 100,
        unidadOrigenId: 2, // Kilogramos (peso)
        unidadDestinoId: 5  // Metros (longitud)
      };

      try {
        await firstValueFrom(service.convertirUnidad(dto));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('diferentes magnitudes');
      }
    });
  });

  describe('puedeEliminar', () => {
    it('should return false for base units', async () => {
      const result = await firstValueFrom(service.puedeEliminar(2)); // KG es base
      expect(result).toBe(false);
    });

    it('should return false for units in use', async () => {
      const result = await firstValueFrom(service.puedeEliminar(1)); // Simulado como en uso
      expect(result).toBe(false);
    });

    it('should return true for non-base units not in use', async () => {
      const result = await firstValueFrom(service.puedeEliminar(6)); // CM no está en uso
      expect(result).toBe(true);
    });

    it('should return false for non-existent units', async () => {
      const result = await firstValueFrom(service.puedeEliminar(999));
      expect(result).toBe(false);
    });
  });
});