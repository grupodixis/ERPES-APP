import { Injectable, computed, signal } from '@angular/core';
import { CentroCoste, CreateCentroCosteDto, UpdateCentroCosteDto, CentroCosteFilters, CentroCosteArbol } from '../../../domain/configuracion.types';

@Injectable({
  providedIn: 'root'
})
export class CentrosCostelService {
  // Signals para estado reactivo
  private readonly _centrosCoste = signal<CentroCoste[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Propiedades públicas reactivas
  readonly centrosCoste = this._centrosCoste.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed properties
  readonly centrosActivos = computed(() => 
    this._centrosCoste().filter(centro => centro.activo)
  );

  readonly centrosRaiz = computed(() => 
    this._centrosCoste().filter(centro => centro.nivel === 0)
  );

  readonly totalCentros = computed(() => this._centrosCoste().length);

  // Mock data para desarrollo
  private mockCentrosCoste: CentroCoste[] = [
    {
      id: 1,
      codigo: 'ADM',
      nombre: 'Administración',
      descripcion: 'Centro de coste administrativo principal',
      activo: true,
      centroPadreId: undefined,
      empresaId: 1,
      nivel: 0,
      ruta: 'ADM',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
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
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 3,
      codigo: 'PROD-001',
      nombre: 'Línea de Producción 1',
      descripcion: 'Primera línea de producción',
      activo: true,
      centroPadreId: 2,
      empresaId: 1,
      nivel: 1,
      ruta: 'PROD/PROD-001',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 4,
      codigo: 'PROD-002',
      nombre: 'Línea de Producción 2',
      descripcion: 'Segunda línea de producción',
      activo: true,
      centroPadreId: 2,
      empresaId: 1,
      nivel: 1,
      ruta: 'PROD/PROD-002',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 5,
      codigo: 'VEN',
      nombre: 'Ventas',
      descripcion: 'Centro de coste de ventas',
      activo: true,
      centroPadreId: undefined,
      empresaId: 1,
      nivel: 0,
      ruta: 'VEN',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 6,
      codigo: 'VEN-001',
      nombre: 'Ventas Nacionales',
      descripcion: 'Ventas en territorio nacional',
      activo: true,
      centroPadreId: 5,
      empresaId: 1,
      nivel: 1,
      ruta: 'VEN/VEN-001',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 7,
      codigo: 'MANT',
      nombre: 'Mantenimiento',
      descripcion: 'Centro de coste de mantenimiento',
      activo: false,
      centroPadreId: undefined,
      empresaId: 1,
      nivel: 0,
      ruta: 'MANT',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z')
    }
  ];

  private nextId = 8;

  /**
   * Carga los centros de coste aplicando filtros opcionales
   */
  async cargarCentrosCoste(filters?: CentroCosteFilters): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simular delay de red
      await this.delay(300);

      let centrosFiltrados = [...this.mockCentrosCoste];

      if (filters) {
        if (filters.activo !== undefined) {
          centrosFiltrados = centrosFiltrados.filter(c => c.activo === filters.activo);
        }

        if (filters.centroPadreId !== undefined) {
          centrosFiltrados = centrosFiltrados.filter(c => c.centroPadreId === filters.centroPadreId);
        }

        if (filters.empresaId !== undefined) {
          centrosFiltrados = centrosFiltrados.filter(c => c.empresaId === filters.empresaId);
        }

        if (filters.nivel !== undefined) {
          centrosFiltrados = centrosFiltrados.filter(c => c.nivel === filters.nivel);
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          centrosFiltrados = centrosFiltrados.filter(c => 
            c.codigo.toLowerCase().includes(searchLower) ||
            c.nombre.toLowerCase().includes(searchLower) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(searchLower))
          );
        }
      }

      this._centrosCoste.set(centrosFiltrados);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Crea un nuevo centro de coste
   */
  async crearCentroCoste(createDto: CreateCentroCosteDto): Promise<CentroCoste> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simular delay de red
      await this.delay(500);

      // Validar código único por empresa
      const existeCodigo = this.mockCentrosCoste.some(
        c => c.codigo === createDto.codigo && c.empresaId === createDto.empresaId
      );
      
      if (existeCodigo) {
        throw new Error(`El código ${createDto.codigo} ya existe para esta empresa`);
      }

      // Calcular nivel y ruta
      let nivel = 0;
      let ruta = createDto.codigo;
      
      if (createDto.centroPadreId) {
        const centroPadre = this.mockCentrosCoste.find(c => c.id === createDto.centroPadreId);
        if (!centroPadre) {
          throw new Error('Centro padre no encontrado');
        }
        nivel = centroPadre.nivel + 1;
        ruta = `${centroPadre.ruta}/${createDto.codigo}`;
      }

      const nuevoCentro: CentroCoste = {
        id: this.nextId++,
        codigo: createDto.codigo,
        nombre: createDto.nombre,
        descripcion: createDto.descripcion,
        activo: true,
        centroPadreId: createDto.centroPadreId,
        empresaId: createDto.empresaId,
        nivel,
        ruta,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.mockCentrosCoste.push(nuevoCentro);
      
      // Actualizar signal si no hay filtros activos o el nuevo centro los cumple
      const centrosActuales = this._centrosCoste();
      this._centrosCoste.set([...centrosActuales, nuevoCentro]);

      return nuevoCentro;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Actualiza un centro de coste existente
   */
  async actualizarCentroCoste(id: number, updateDto: UpdateCentroCosteDto): Promise<CentroCoste> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simular delay de red
      await this.delay(400);

      const index = this.mockCentrosCoste.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Centro de coste no encontrado');
      }

      const centroActual = this.mockCentrosCoste[index];
      const centroActualizado: CentroCoste = {
        ...centroActual,
        ...updateDto,
        updatedAt: new Date()
      };

      // Si se cambia el padre, recalcular nivel y ruta
      if (updateDto.centroPadreId !== undefined && updateDto.centroPadreId !== centroActual.centroPadreId) {
        if (updateDto.centroPadreId) {
          const centroPadre = this.mockCentrosCoste.find(c => c.id === updateDto.centroPadreId);
          if (!centroPadre) {
            throw new Error('Centro padre no encontrado');
          }
          centroActualizado.nivel = centroPadre.nivel + 1;
          centroActualizado.ruta = `${centroPadre.ruta}/${centroActual.codigo}`;
        } else {
          centroActualizado.nivel = 0;
          centroActualizado.ruta = centroActual.codigo;
        }
      }

      this.mockCentrosCoste[index] = centroActualizado;
      
      // Actualizar signal
      const centrosActuales = this._centrosCoste();
      const indexSignal = centrosActuales.findIndex(c => c.id === id);
      if (indexSignal !== -1) {
        const nuevosCentros = [...centrosActuales];
        nuevosCentros[indexSignal] = centroActualizado;
        this._centrosCoste.set(nuevosCentros);
      }

      return centroActualizado;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Elimina un centro de coste
   */
  async eliminarCentroCoste(id: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simular delay de red
      await this.delay(300);

      const centro = this.mockCentrosCoste.find(c => c.id === id);
      if (!centro) {
        throw new Error('Centro de coste no encontrado');
      }

      // Verificar que no tenga centros hijos
      const tieneHijos = this.mockCentrosCoste.some(c => c.centroPadreId === id);
      if (tieneHijos) {
        throw new Error('No se puede eliminar un centro de coste que tiene centros hijos');
      }

      // Eliminar del mock
      const index = this.mockCentrosCoste.findIndex(c => c.id === id);
      this.mockCentrosCoste.splice(index, 1);
      
      // Actualizar signal
      const centrosActuales = this._centrosCoste();
      this._centrosCoste.set(centrosActuales.filter(c => c.id !== id));
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Obtiene la estructura jerárquica de centros de coste
   */
  async obtenerArbolCentrosCoste(filters?: CentroCosteFilters): Promise<CentroCosteArbol[]> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simular delay de red
      await this.delay(400);

      let centros = [...this.mockCentrosCoste];

      // Aplicar filtros
      if (filters) {
        if (filters.empresaId !== undefined) {
          centros = centros.filter(c => c.empresaId === filters.empresaId);
        }
        if (filters.activo !== undefined) {
          centros = centros.filter(c => c.activo === filters.activo);
        }
      }

      // Construir árbol
      const arbol = this.construirArbol(centros);
      return arbol;
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Construye la estructura jerárquica de centros
   */
  private construirArbol(centros: CentroCoste[]): CentroCosteArbol[] {
    const centrosRaiz = centros.filter(c => c.centroPadreId === undefined || c.centroPadreId === null);
    
    return centrosRaiz.map(centro => this.construirNodoArbol(centro, centros));
  }

  /**
   * Construye un nodo del árbol recursivamente
   */
  private construirNodoArbol(centro: CentroCoste, todosCentros: CentroCoste[]): CentroCosteArbol {
    const hijos = todosCentros
      .filter(c => c.centroPadreId === centro.id)
      .map(hijo => this.construirNodoArbol(hijo, todosCentros));

    return {
      id: centro.id,
      codigo: centro.codigo,
      nombre: centro.nombre,
      descripcion: centro.descripcion,
      activo: centro.activo,
      nivel: centro.nivel,
      hijos
    };
  }

  /**
   * Simula delay de red para testing
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Resetea el estado del servicio
   */
  reset(): void {
    this._centrosCoste.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}