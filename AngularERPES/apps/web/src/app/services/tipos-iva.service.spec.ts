import { TestBed } from '@angular/core/testing';
import { TiposIvaService } from './tipos-iva.service';
import { TipoIva, CreateTipoIvaDto, UpdateTipoIvaDto, TipoIvaFilters } from '../domain/configuracion.types';

describe('TiposIvaService', () => {
  let service: TiposIvaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposIvaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cargarTiposIva', () => {
    it('should return all tipos de IVA without filters', (done) => {
      service.cargarTiposIva().subscribe(tipos => {
        expect(tipos.length).toBe(5);
        expect(tipos[0].codigo).toBe('IVA21');
        expect(tipos[0].porcentaje).toBe(21);
        done();
      });
    });

    it('should filter by activo status', (done) => {
      const filtros: TipoIvaFilters = { activo: true };
      service.cargarTiposIva(filtros).subscribe(tipos => {
        expect(tipos.length).toBe(4);
        tipos.forEach(tipo => expect(tipo.activo).toBe(true));
        done();
      });
    });

    it('should filter by empresaId', (done) => {
      const filtros: TipoIvaFilters = { empresaId: 1 };
      service.cargarTiposIva(filtros).subscribe(tipos => {
        expect(tipos.length).toBe(5);
        tipos.forEach(tipo => expect(tipo.empresaId).toBe(1));
        done();
      });
    });

    it('should filter by porcentaje range', (done) => {
      const filtros: TipoIvaFilters = { porcentajeMin: 10, porcentajeMax: 21 };
      service.cargarTiposIva(filtros).subscribe(tipos => {
        expect(tipos.length).toBe(2); // IVA21 y IVA10
        tipos.forEach(tipo => {
          expect(tipo.porcentaje).toBeGreaterThanOrEqual(10);
          expect(tipo.porcentaje).toBeLessThanOrEqual(21);
        });
        done();
      });
    });

    it('should filter by search text', (done) => {
      const filtros: TipoIvaFilters = { search: 'reducido' };
      service.cargarTiposIva(filtros).subscribe(tipos => {
        expect(tipos.length).toBe(2); // IVA Reducido y IVA Superreducido
        tipos.forEach(tipo => {
          expect(tipo.nombre.toLowerCase()).toContain('reducido');
        });
        done();
      });
    });

    it('should search by codigo', (done) => {
      const filtros: TipoIvaFilters = { search: 'IVA21' };
      service.cargarTiposIva(filtros).subscribe(tipos => {
        expect(tipos.length).toBe(1);
        expect(tipos[0].codigo).toBe('IVA21');
        done();
      });
    });

    it('should search by porcentaje', (done) => {
      const filtros: TipoIvaFilters = { search: '21' };
      service.cargarTiposIva(filtros).subscribe(tipos => {
        expect(tipos.length).toBe(1);
        expect(tipos[0].porcentaje).toBe(21);
        done();
      });
    });
  });

  describe('obtenerTipoIva', () => {
    it('should return tipo de IVA by id', (done) => {
      service.obtenerTipoIva(1).subscribe(tipo => {
        expect(tipo.id).toBe(1);
        expect(tipo.codigo).toBe('IVA21');
        expect(tipo.nombre).toBe('IVA General');
        expect(tipo.porcentaje).toBe(21);
        done();
      });
    });

    it('should throw error for non-existent id', (done) => {
      service.obtenerTipoIva(999).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('Tipo de IVA con ID 999 no encontrado');
          done();
        }
      });
    });
  });

  describe('crearTipoIva', () => {
    it('should create new tipo de IVA', (done) => {
      const dto: CreateTipoIvaDto = {
        codigo: 'IVA15',
        nombre: 'IVA Especial',
        porcentaje: 15,
        descripcion: 'Tipo especial de IVA',
        empresaId: 1
      };

      service.crearTipoIva(dto).subscribe(tipo => {
        expect(tipo.codigo).toBe('IVA15');
        expect(tipo.nombre).toBe('IVA Especial');
        expect(tipo.porcentaje).toBe(15);
        expect(tipo.activo).toBe(true);
        expect(tipo.id).toBeGreaterThan(5);
        done();
      });
    });

    it('should convert codigo to uppercase', (done) => {
      const dto: CreateTipoIvaDto = {
        codigo: 'iva12',
        nombre: 'IVA Test',
        porcentaje: 12,
        empresaId: 1
      };

      service.crearTipoIva(dto).subscribe(tipo => {
        expect(tipo.codigo).toBe('IVA12');
        done();
      });
    });

    it('should throw error for duplicate codigo', (done) => {
      const dto: CreateTipoIvaDto = {
        codigo: 'IVA21',
        nombre: 'Duplicado',
        porcentaje: 21,
        empresaId: 1
      };

      service.crearTipoIva(dto).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('Ya existe un tipo de IVA con el código');
          done();
        }
      });
    });

    it('should throw error for invalid porcentaje (negative)', (done) => {
      const dto: CreateTipoIvaDto = {
        codigo: 'INVALID',
        nombre: 'Invalid',
        porcentaje: -5,
        empresaId: 1
      };

      service.crearTipoIva(dto).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('El porcentaje debe estar entre 0 y 100');
          done();
        }
      });
    });

    it('should throw error for invalid porcentaje (over 100)', (done) => {
      const dto: CreateTipoIvaDto = {
        codigo: 'INVALID',
        nombre: 'Invalid',
        porcentaje: 150,
        empresaId: 1
      };

      service.crearTipoIva(dto).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('El porcentaje debe estar entre 0 y 100');
          done();
        }
      });
    });
  });

  describe('actualizarTipoIva', () => {
    it('should update existing tipo de IVA', (done) => {
      const dto: UpdateTipoIvaDto = {
        nombre: 'IVA General Actualizado',
        porcentaje: 22,
        descripcion: 'Descripción actualizada'
      };

      service.actualizarTipoIva(1, dto).subscribe(tipo => {
        expect(tipo.id).toBe(1);
        expect(tipo.nombre).toBe('IVA General Actualizado');
        expect(tipo.porcentaje).toBe(22);
        expect(tipo.descripcion).toBe('Descripción actualizada');
        expect(tipo.codigo).toBe('IVA21'); // No debe cambiar
        done();
      });
    });

    it('should update activo status', (done) => {
      const dto: UpdateTipoIvaDto = { activo: false };

      service.actualizarTipoIva(2, dto).subscribe(tipo => {
        expect(tipo.id).toBe(2);
        expect(tipo.activo).toBe(false);
        done();
      });
    });

    it('should throw error for non-existent id', (done) => {
      const dto: UpdateTipoIvaDto = { nombre: 'Test' };

      service.actualizarTipoIva(999, dto).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('Tipo de IVA con ID 999 no encontrado');
          done();
        }
      });
    });

    it('should throw error for invalid porcentaje', (done) => {
      const dto: UpdateTipoIvaDto = { porcentaje: -10 };

      service.actualizarTipoIva(1, dto).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('El porcentaje debe estar entre 0 y 100');
          done();
        }
      });
    });
  });

  describe('eliminarTipoIva', () => {
    it('should delete tipo de IVA not in use', (done) => {
      service.eliminarTipoIva(5).subscribe(() => {
        service.cargarTiposIva().subscribe(tipos => {
          expect(tipos.find(t => t.id === 5)).toBeUndefined();
          done();
        });
      });
    });

    it('should throw error when deleting tipo in use', (done) => {
      service.eliminarTipoIva(1).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('está siendo utilizado');
          done();
        }
      });
    });

    it('should throw error for non-existent id', (done) => {
      service.eliminarTipoIva(999).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('Tipo de IVA con ID 999 no encontrado');
          done();
        }
      });
    });
  });

  describe('puedeEliminar', () => {
    it('should return false for tipos in use', (done) => {
      service.puedeEliminar(1).subscribe(puede => {
        expect(puede).toBe(false);
        done();
      });
    });

    it('should return true for tipos not in use', (done) => {
      service.puedeEliminar(5).subscribe(puede => {
        expect(puede).toBe(true);
        done();
      });
    });
  });

  describe('calcularIva', () => {
    it('should calculate IVA correctly', (done) => {
      service.calcularIva(100, 1).subscribe(resultado => {
        expect(resultado.base).toBe(100);
        expect(resultado.iva).toBe(21);
        expect(resultado.total).toBe(121);
        done();
      });
    });

    it('should calculate IVA for zero percentage', (done) => {
      service.calcularIva(100, 4).subscribe(resultado => {
        expect(resultado.base).toBe(100);
        expect(resultado.iva).toBe(0);
        expect(resultado.total).toBe(100);
        done();
      });
    });

    it('should round amounts correctly', (done) => {
      service.calcularIva(33.33, 1).subscribe(resultado => {
        expect(resultado.base).toBe(33.33);
        expect(resultado.iva).toBe(7);
        expect(resultado.total).toBe(40.33);
        done();
      });
    });

    it('should throw error for non-existent tipo', (done) => {
      service.calcularIva(100, 999).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('Tipo de IVA con ID 999 no encontrado');
          done();
        }
      });
    });

    it('should throw error for inactive tipo', (done) => {
      service.calcularIva(100, 5).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('El tipo de IVA no está activo');
          done();
        }
      });
    });
  });

  describe('obtenerTiposActivos', () => {
    it('should return only active tipos', (done) => {
      service.obtenerTiposActivos().subscribe(tipos => {
        expect(tipos.length).toBe(4);
        tipos.forEach(tipo => expect(tipo.activo).toBe(true));
        done();
      });
    });
  });
});