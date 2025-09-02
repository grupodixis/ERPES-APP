import { TestBed } from '@angular/core/testing';
import { FormasPagoService } from './formas-pago.service';
import {
  FormaPago,
  CreateFormaPagoDto,
  UpdateFormaPagoDto,
  FormaPagoFilters
} from '../domain/configuracion.types';

describe('FormasPagoService', () => {
  let service: FormasPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormasPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cargarFormasPago', () => {
    it('should return all formas de pago without filters', (done) => {
      service.cargarFormasPago().subscribe(formas => {
        expect(formas).toBeDefined();
        expect(formas.length).toBeGreaterThan(0);
        expect(formas[0].codigo).toBeDefined();
        expect(formas[0].nombre).toBeDefined();
        expect(formas[0].tipo).toBeDefined();
        done();
      });
    });

    it('should filter by search term', (done) => {
      const filtros: FormaPagoFilters = { search: 'efectivo' };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas.length).toBeGreaterThan(0);
        expect(formas.every(f => 
          f.codigo.toLowerCase().includes('efectivo') ||
          f.nombre.toLowerCase().includes('efectivo') ||
          (f.descripcion && f.descripcion.toLowerCase().includes('efectivo'))
        )).toBe(true);
        done();
      });
    });

    it('should filter by tipo', (done) => {
      const filtros: FormaPagoFilters = { tipo: 'transferencia' };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas.length).toBeGreaterThan(0);
        expect(formas.every(f => f.tipo === 'transferencia')).toBe(true);
        done();
      });
    });

    it('should filter by requiereCuenta', (done) => {
      const filtros: FormaPagoFilters = { requiereCuenta: true };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas.length).toBeGreaterThan(0);
        expect(formas.every(f => f.requiereCuenta === true)).toBe(true);
        done();
      });
    });

    it('should filter by activa status', (done) => {
      const filtros: FormaPagoFilters = { activa: false };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas.length).toBeGreaterThan(0);
        expect(formas.every(f => f.activa === false)).toBe(true);
        done();
      });
    });

    it('should filter by empresaId', (done) => {
      const filtros: FormaPagoFilters = { empresaId: 1 };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas.length).toBeGreaterThan(0);
        expect(formas.every(f => f.empresaId === 1)).toBe(true);
        done();
      });
    });

    it('should return empty array when no matches found', (done) => {
      const filtros: FormaPagoFilters = { search: 'inexistente' };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas).toEqual([]);
        done();
      });
    });

    it('should handle multiple filters', (done) => {
      const filtros: FormaPagoFilters = { 
        tipo: 'transferencia',
        activa: true,
        requiereCuenta: true
      };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas.every(f => 
          f.tipo === 'transferencia' && 
          f.activa === true && 
          f.requiereCuenta === true
        )).toBe(true);
        done();
      });
    });
  });

  describe('obtenerFormaPago', () => {
    it('should return forma de pago by id', (done) => {
      service.obtenerFormaPago(1).subscribe(forma => {
        expect(forma).toBeDefined();
        expect(forma.id).toBe(1);
        expect(forma.codigo).toBeDefined();
        expect(forma.nombre).toBeDefined();
        done();
      });
    });

    it('should throw error when forma de pago not found', (done) => {
      service.obtenerFormaPago(999).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('no encontrada');
          done();
        }
      });
    });
  });

  describe('crearFormaPago', () => {
    it('should create new forma de pago', (done) => {
      const dto: CreateFormaPagoDto = {
        codigo: 'TEST',
        nombre: 'Test Forma Pago',
        descripcion: 'Forma de pago de prueba',
        tipo: 'otro',
        requiereCuenta: false,
        empresaId: 1
      };

      service.crearFormaPago(dto).subscribe(forma => {
        expect(forma).toBeDefined();
        expect(forma.codigo).toBe('TEST');
        expect(forma.nombre).toBe('Test Forma Pago');
        expect(forma.tipo).toBe('otro');
        expect(forma.requiereCuenta).toBe(false);
        expect(forma.activa).toBe(true);
        expect(forma.id).toBeDefined();
        expect(forma.createdAt).toBeDefined();
        expect(forma.updatedAt).toBeDefined();
        done();
      });
    });

    it('should create forma de pago with optional fields', (done) => {
      const dto: CreateFormaPagoDto = {
        codigo: 'MINIMAL',
        nombre: 'Minimal',
        tipo: 'efectivo',
        empresaId: 1
      };

      service.crearFormaPago(dto).subscribe(forma => {
        expect(forma.codigo).toBe('MINIMAL');
        expect(forma.nombre).toBe('Minimal');
        expect(forma.descripcion).toBeUndefined();
        expect(forma.requiereCuenta).toBe(false);
        expect(forma.diasVencimiento).toBeUndefined();
        done();
      });
    });

    it('should convert codigo to uppercase', (done) => {
      const dto: CreateFormaPagoDto = {
        codigo: 'lowercase',
        nombre: 'Test',
        tipo: 'efectivo',
        empresaId: 1
      };

      service.crearFormaPago(dto).subscribe(forma => {
        expect(forma.codigo).toBe('LOWERCASE');
        done();
      });
    });

    it('should throw error when codigo already exists', (done) => {
      const dto: CreateFormaPagoDto = {
        codigo: 'EFECTIVO', // Ya existe
        nombre: 'Duplicado',
        tipo: 'efectivo',
        empresaId: 1
      };

      service.crearFormaPago(dto).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('Ya existe una forma de pago');
          done();
        }
      });
    });
  });

  describe('actualizarFormaPago', () => {
    it('should update forma de pago', (done) => {
      const dto: UpdateFormaPagoDto = {
        nombre: 'Nombre Actualizado',
        descripcion: 'Descripción actualizada',
        activa: false
      };

      service.actualizarFormaPago(1, dto).subscribe(forma => {
        expect(forma.id).toBe(1);
        expect(forma.nombre).toBe('Nombre Actualizado');
        expect(forma.descripcion).toBe('Descripción actualizada');
        expect(forma.activa).toBe(false);
        expect(forma.updatedAt).toBeDefined();
        done();
      });
    });

    it('should update only provided fields', (done) => {
      const dto: UpdateFormaPagoDto = {
        nombre: 'Solo Nombre'
      };

      service.actualizarFormaPago(2, dto).subscribe(forma => {
        expect(forma.nombre).toBe('Solo Nombre');
        expect(forma.codigo).toBe('TRANSFERENCIA'); // No cambiado
        expect(forma.tipo).toBe('transferencia'); // No cambiado
        done();
      });
    });

    it('should throw error when forma de pago not found', (done) => {
      const dto: UpdateFormaPagoDto = { nombre: 'Test' };

      service.actualizarFormaPago(999, dto).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('no encontrada');
          done();
        }
      });
    });
  });

  describe('eliminarFormaPago', () => {
    it('should delete forma de pago', (done) => {
      service.eliminarFormaPago(1).subscribe(() => {
        // Verificar que se eliminó
        service.obtenerFormaPago(1).subscribe({
          next: () => fail('Should have been deleted'),
          error: () => {
            expect(true).toBe(true); // Se eliminó correctamente
            done();
          }
        });
      });
    });

    it('should throw error when forma de pago not found', (done) => {
      service.eliminarFormaPago(999).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('no encontrada');
          done();
        }
      });
    });
  });

  describe('obtenerTiposFormaPago', () => {
    it('should return available tipos', (done) => {
      service.obtenerTiposFormaPago().subscribe(tipos => {
        expect(tipos).toBeDefined();
        expect(tipos.length).toBeGreaterThan(0);
        expect(tipos[0].value).toBeDefined();
        expect(tipos[0].label).toBeDefined();
        
        const tiposValues = tipos.map(t => t.value);
        expect(tiposValues).toContain('efectivo');
        expect(tiposValues).toContain('transferencia');
        expect(tiposValues).toContain('cheque');
        expect(tiposValues).toContain('tarjeta');
        done();
      });
    });
  });

  describe('puedeEliminar', () => {
    it('should return true for deletable forma de pago', (done) => {
      service.puedeEliminar(1).subscribe(puede => {
        expect(puede).toBe(true);
        done();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search filter', (done) => {
      const filtros: FormaPagoFilters = { search: '' };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should handle case-insensitive search', (done) => {
      const filtros: FormaPagoFilters = { search: 'EFECTIVO' };
      service.cargarFormasPago(filtros).subscribe(formas => {
        expect(formas.length).toBeGreaterThan(0);
        expect(formas.some(f => f.codigo.toLowerCase().includes('efectivo'))).toBe(true);
        done();
      });
    });

    it('should maintain data consistency after CRUD operations', (done) => {
      const initialCount$ = service.cargarFormasPago();
      
      initialCount$.subscribe(initialFormas => {
        const initialCount = initialFormas.length;
        
        // Crear
        const createDto: CreateFormaPagoDto = {
          codigo: 'TEMP',
          nombre: 'Temporal',
          tipo: 'otro',
          empresaId: 1
        };
        
        service.crearFormaPago(createDto).subscribe(nuevaForma => {
          // Verificar incremento
          service.cargarFormasPago().subscribe(formasPostCrear => {
            expect(formasPostCrear.length).toBe(initialCount + 1);
            
            // Eliminar
            service.eliminarFormaPago(nuevaForma.id).subscribe(() => {
              // Verificar decremento
              service.cargarFormasPago().subscribe(formasPostEliminar => {
                expect(formasPostEliminar.length).toBe(initialCount);
                done();
              });
            });
          });
        });
      });
    });
  });
});