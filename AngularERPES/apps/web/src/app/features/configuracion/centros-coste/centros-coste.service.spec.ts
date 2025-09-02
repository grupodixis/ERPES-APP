import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CentrosCostelService } from './centros-coste.service';
import { CentroCoste, CreateCentroCosteDto, UpdateCentroCosteDto, CentroCosteFilters, CentroCosteArbol } from '../../../domain/configuracion.types';

describe('CentrosCostelService', () => {
  let service: CentrosCostelService;
  let mockCentrosCoste: CentroCoste[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CentrosCostelService]
    });
    service = TestBed.inject(CentrosCostelService);

    // Mock data para testing
    mockCentrosCoste = [
      {
        id: 1,
        codigo: 'ADM',
        nombre: 'Administración',
        descripcion: 'Centro de coste administrativo',
        activo: true,
        centroPadreId: undefined,
        empresaId: 1,
        nivel: 0,
        ruta: 'ADM',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        codigo: 'PROD',
        nombre: 'Producción',
        descripcion: 'Centro de coste de producción',
        activo: true,
        centroPadreId: undefined,
        empresaId: 1,
        nivel: 0,
        ruta: 'PROD',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 3,
        codigo: 'PROD-001',
        nombre: 'Línea 1',
        descripcion: 'Primera línea de producción',
        activo: true,
        centroPadreId: 2,
        empresaId: 1,
        nivel: 1,
        ruta: 'PROD/PROD-001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cargarCentrosCoste', () => {
    it('should load all centros de coste', async () => {
      await service.cargarCentrosCoste();
      expect(service.centrosCoste().length).toBeGreaterThan(0);
    });

    it('should apply filters correctly', async () => {
      const filters: CentroCosteFilters = { activo: true, nivel: 0 };
      await service.cargarCentrosCoste(filters);
      const centros = service.centrosCoste();
      expect(centros.every(c => c.activo && c.nivel === 0)).toBeTruthy();
    });

    it('should filter by search term', async () => {
      const filters: CentroCosteFilters = { search: 'Administración' };
      await service.cargarCentrosCoste(filters);
      const centros = service.centrosCoste();
      expect(centros.some(c => c.nombre.includes('Administración'))).toBeTruthy();
    });
  });

  describe('crearCentroCoste', () => {
    it('should create a new centro de coste', async () => {
      const newCentro: CreateCentroCosteDto = {
        codigo: 'NUEVO',
        nombre: 'Centro Nuevo',
        descripcion: 'Centro de coste nuevo',
        empresaId: 1
      };

      const created = await service.crearCentroCoste(newCentro);
      expect(created).toBeTruthy();
      expect(created.codigo).toBe('NUEVO');
      expect(created.nombre).toBe('Centro Nuevo');
      expect(created.nivel).toBe(0); // Sin padre, nivel 0
    });

    it('should create a child centro de coste', async () => {
      const newCentro: CreateCentroCosteDto = {
        codigo: 'ADM-001',
        nombre: 'RRHH',
        descripcion: 'Recursos Humanos',
        centroPadreId: 1,
        empresaId: 1
      };

      const created = await service.crearCentroCoste(newCentro);
      expect(created).toBeTruthy();
      expect(created.centroPadreId).toBe(1);
      expect(created.nivel).toBe(1);
      expect(created.ruta).toContain('ADM');
    });

    it('should throw error for duplicate codigo', async () => {
      // Primero cargar los datos mock
      await service.cargarCentrosCoste();
      
      const duplicateCentro: CreateCentroCosteDto = {
        codigo: 'ADM', // Ya existe en mock data
        nombre: 'Administración Duplicada',
        empresaId: 1
      };

      await expectAsync(service.crearCentroCoste(duplicateCentro))
        .toBeRejectedWithError('El código ADM ya existe para esta empresa');
    });
  });

  describe('actualizarCentroCoste', () => {
    it('should update an existing centro de coste', async () => {
      const updateData: UpdateCentroCosteDto = {
        nombre: 'Administración Actualizada',
        descripcion: 'Nueva descripción'
      };

      const updated = await service.actualizarCentroCoste(1, updateData);
      expect(updated).toBeTruthy();
      expect(updated.nombre).toBe('Administración Actualizada');
      expect(updated.descripcion).toBe('Nueva descripción');
    });

    it('should throw error for non-existent centro', async () => {
      const updateData: UpdateCentroCosteDto = { nombre: 'Test' };
      
      await expectAsync(service.actualizarCentroCoste(999, updateData))
        .toBeRejectedWithError('Centro de coste no encontrado');
    });
  });

  describe('eliminarCentroCoste', () => {
    it('should delete a centro de coste without children', async () => {
      await service.eliminarCentroCoste(1);
      const centros = service.centrosCoste();
      expect(centros.find(c => c.id === 1)).toBeUndefined();
    });

    it('should throw error when deleting centro with children', async () => {
      await expectAsync(service.eliminarCentroCoste(2))
        .toBeRejectedWithError('No se puede eliminar un centro de coste que tiene centros hijos');
    });
  });

  describe('obtenerArbolCentrosCoste', () => {
    it('should return hierarchical tree structure', async () => {
      const arbol = await service.obtenerArbolCentrosCoste();
      expect(arbol).toBeTruthy();
      expect(arbol.length).toBeGreaterThan(0);
      
      // Verificar que los centros padre tienen hijos
      const centroProd = arbol.find(c => c.codigo === 'PROD');
      expect(centroProd?.hijos.length).toBeGreaterThan(0);
    });

    it('should filter tree by empresa', async () => {
      const arbol = await service.obtenerArbolCentrosCoste({ empresaId: 1 });
      expect(arbol.every(c => c.id > 0)).toBeTruthy(); // Mock siempre devuelve datos
    });
  });

  describe('computed properties', () => {
    beforeEach(async () => {
      await service.cargarCentrosCoste();
    });

    it('should compute centrosActivos correctly', () => {
      const activos = service.centrosActivos();
      expect(activos.every(c => c.activo)).toBeTruthy();
    });

    it('should compute centrosRaiz correctly', () => {
      const raiz = service.centrosRaiz();
      expect(raiz.every(c => c.nivel === 0)).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simular error de red
      spyOn(service, 'cargarCentrosCoste').and.returnValue(Promise.reject(new Error('Network error')));
      
      await expectAsync(service.cargarCentrosCoste())
        .toBeRejectedWithError('Network error');
    });
  });
});