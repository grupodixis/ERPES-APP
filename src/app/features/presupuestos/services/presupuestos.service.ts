import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  Presupuesto,
  CreatePresupuestoDto,
  UpdatePresupuestoDto,
  PresupuestoFilters,
  Capitulo,
  CreateCapituloDto,
  UpdateCapituloDto,
  CapituloFilters,
  CapituloArbol,
  Partida,
  CreatePartidaDto,
  UpdatePartidaDto,
  PartidaFilters,
  DesglosePartida,
  CreateDesglosePartidaDto,
  UpdateDesglosePartidaDto,
  DesgloseFilters,
  ArticuloDesglose,
  OperarioDesglose,
  MaquinariaDesglose,
  RecursoFilters,
  TipoRecurso,
  EstadoPresupuesto,
  ResumenTotales
} from '../../../domain/presupuestos.types';

@Injectable({
  providedIn: 'root'
})
export class PresupuestosService {
  // Signals para estado reactivo
  private _presupuestos = signal<Presupuesto[]>([]);
  private _capitulos = signal<Capitulo[]>([]);
  private _partidas = signal<Partida[]>([]);
  private _desgloses = signal<DesglosePartida[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Computed signals
  readonly presupuestos = this._presupuestos.asReadonly();
  readonly capitulos = this._capitulos.asReadonly();
  readonly partidas = this._partidas.asReadonly();
  readonly desgloses = this._desgloses.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Contadores para IDs
  private nextPresupuestoId = 4;
  private nextCapituloId = 10;
  private nextPartidaId = 20;
  private nextDesgloseId = 50;

  constructor() {
    this.initializeMockData();
  }

  // ===== INICIALIZACIÓN DE DATOS MOCK =====

  private initializeMockData(): void {
    // Presupuestos mock
    const mockPresupuestos: Presupuesto[] = [
      {
        id: 1,
        codigo: 'PRES-2024-001',
        nombre: 'Reforma Oficina Central',
        descripcion: 'Reforma integral de la oficina central incluyendo mobiliario y equipamiento',
        clienteId: 1,
        cliente: 'Empresa ABC S.L.',
        estado: 'Borrador',
        fechaCreacion: new Date('2024-01-15'),
        fechaModificacion: new Date('2024-01-20'),
        fechaValidez: new Date('2024-03-15'),
        observaciones: 'Pendiente de aprobación del cliente',
        totalSinIva: 28500, // 2725 + 10775 + 15000
        totalIva: 5985, // 572.25 + 2262.75 + 3150
        totalConIva: 34485, // 3297.25 + 13037.75 + 18150
        empresaId: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 2,
        codigo: 'PRES-2024-002',
        nombre: 'Instalación Sistema Climatización',
        descripcion: 'Instalación completa de sistema de climatización para nave industrial',
        clienteId: 2,
        cliente: 'Industrias XYZ S.A.',
        estado: 'Enviado',
        fechaCreacion: new Date('2024-01-10'),
        fechaModificacion: new Date('2024-01-25'),
        fechaValidez: new Date('2024-02-28'),
        observaciones: 'Enviado al cliente el 25/01/2024',
        totalSinIva: 78500,
        totalIva: 16485,
        totalConIva: 94985,
        empresaId: 1,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25')
      },
      {
        id: 3,
        codigo: 'PRES-2024-003',
        nombre: 'Construcción Almacén',
        descripcion: 'Construcción de almacén prefabricado de 500m²',
        clienteId: 3,
        cliente: 'Logística DEF S.L.',
        estado: 'Aceptado',
        fechaCreacion: new Date('2024-01-05'),
        fechaModificacion: new Date('2024-01-30'),
        fechaValidez: new Date('2024-04-05'),
        observaciones: 'Aceptado por el cliente. Inicio previsto para febrero.',
        totalSinIva: 125000,
        totalIva: 26250,
        totalConIva: 151250,
        empresaId: 1,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-30')
      }
    ];

    // Capítulos mock
    const mockCapitulos: Capitulo[] = [
      {
        id: 1,
        codigo: '01',
        nombre: 'Demoliciones y Movimiento de Tierras',
        descripcion: 'Trabajos previos de demolición y preparación del terreno',
        presupuestoId: 1,
        capituloPadreId: undefined,
        nivel: 1,
        orden: 1,
        ruta: '01',
        totalSinIva: 2725, // 1250 + 675 + 800
        totalIva: 572.25, // 262.5 + 141.75 + 168
        totalConIva: 3297.25, // 1512.5 + 816.75 + 968
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        codigo: '02',
        nombre: 'Estructura y Albañilería',
        descripcion: 'Trabajos de estructura y albañilería general',
        presupuestoId: 1,
        capituloPadreId: undefined,
        nivel: 1,
        orden: 2,
        ruta: '02',
        totalSinIva: 10775, // 3175 + 7600
        totalIva: 2262.75, // 666.75 + 1596
        totalConIva: 13037.75, // 3841.75 + 9196
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 3,
        codigo: '02.01',
        nombre: 'Cimentación',
        descripcion: 'Trabajos de cimentación y zapatas',
        presupuestoId: 1,
        capituloPadreId: 2,
        nivel: 2,
        orden: 1,
        ruta: '02/02.01',
        totalSinIva: 3175, // 875 + 1700 + 600
        totalIva: 666.75, // 183.75 + 357 + 126
        totalConIva: 3841.75, // 1058.75 + 2057 + 726
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 4,
        codigo: '02.02',
        nombre: 'Muros y Tabiques',
        descripcion: 'Construcción de muros y tabiques interiores',
        presupuestoId: 1,
        capituloPadreId: 2,
        nivel: 2,
        orden: 2,
        ruta: '02/02.02',
        totalSinIva: 7600, // 3600 + 4000
        totalIva: 1596, // 756 + 840
        totalConIva: 9196, // 4356 + 4840
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 5,
        codigo: '03',
        nombre: 'Instalaciones',
        descripcion: 'Instalaciones eléctricas, fontanería y climatización',
        presupuestoId: 1,
        capituloPadreId: undefined,
        nivel: 1,
        orden: 3,
        ruta: '03',
        totalSinIva: 15000, // 8500 + 4200 + 2300
        totalIva: 3150, // 1785 + 882 + 483
        totalConIva: 18150, // 10285 + 5082 + 2783
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    // Partidas mock
    const mockPartidas: Partida[] = [
      {
        id: 1,
        codigo: '01.001',
        nombre: 'Demolición muros existentes',
        descripcion: 'Demolición de muros interiores existentes',
        presupuestoId: 1,
        capituloId: 1,
        productoId: 1,
        producto: 'Demoliciones',
        unidadMedidaId: 1,
        unidadMedida: 'm²',
        cantidad: 50,
        precio: 25,
        largo: 10,
        ancho: 5,
        alto: undefined,
        totalSinIva: 1250,
        totalIva: 262.5,
        totalConIva: 1512.5,
        orden: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        codigo: '01.002',
        nombre: 'Retirada de escombros',
        descripcion: 'Retirada y transporte de escombros a vertedero',
        presupuestoId: 1,
        capituloId: 1,
        productoId: 2,
        producto: 'Transporte',
        unidadMedidaId: 2,
        unidadMedida: 'm³',
        cantidad: 15,
        precio: 45,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 675,
        totalIva: 141.75,
        totalConIva: 816.75,
        orden: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 3,
        codigo: '01.003',
        nombre: 'Limpieza y preparación',
        descripcion: 'Limpieza general y preparación del área de trabajo',
        presupuestoId: 1,
        capituloId: 1,
        productoId: 5,
        producto: 'Limpieza',
        unidadMedidaId: 1,
        unidadMedida: 'm²',
        cantidad: 100,
        precio: 8,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 800,
        totalIva: 168,
        totalConIva: 968,
        orden: 3,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 4,
        codigo: '02.01.001',
        nombre: 'Excavación zapatas',
        descripcion: 'Excavación para zapatas de cimentación',
        presupuestoId: 1,
        capituloId: 3,
        productoId: 3,
        producto: 'Movimiento tierras',
        unidadMedidaId: 2,
        unidadMedida: 'm³',
        cantidad: 25,
        precio: 35,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 875,
        totalIva: 183.75,
        totalConIva: 1058.75,
        orden: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 5,
        codigo: '02.01.002',
        nombre: 'Hormigón zapatas',
        descripcion: 'Suministro y colocación de hormigón HA-25 en zapatas',
        presupuestoId: 1,
        capituloId: 3,
        productoId: 4,
        producto: 'Hormigón',
        unidadMedidaId: 2,
        unidadMedida: 'm³',
        cantidad: 20,
        precio: 85,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 1700,
        totalIva: 357,
        totalConIva: 2057,
        orden: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 6,
        codigo: '02.01.003',
        nombre: 'Armadura zapatas',
        descripcion: 'Suministro y colocación de armadura para zapatas',
        presupuestoId: 1,
        capituloId: 3,
        productoId: 6,
        producto: 'Acero',
        unidadMedidaId: 3,
        unidadMedida: 'kg',
        cantidad: 500,
        precio: 1.2,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 600,
        totalIva: 126,
        totalConIva: 726,
        orden: 3,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 7,
        codigo: '02.02.001',
        nombre: 'Fábrica de ladrillo',
        descripcion: 'Fábrica de ladrillo hueco doble para tabiques',
        presupuestoId: 1,
        capituloId: 4,
        productoId: 7,
        producto: 'Ladrillo',
        unidadMedidaId: 1,
        unidadMedida: 'm²',
        cantidad: 80,
        precio: 45,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 3600,
        totalIva: 756,
        totalConIva: 4356,
        orden: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 8,
        codigo: '02.02.002',
        nombre: 'Enfoscado y pintado',
        descripcion: 'Enfoscado maestreado y pintado de paramentos',
        presupuestoId: 1,
        capituloId: 4,
        productoId: 8,
        producto: 'Revestimientos',
        unidadMedidaId: 1,
        unidadMedida: 'm²',
        cantidad: 160,
        precio: 25,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 4000,
        totalIva: 840,
        totalConIva: 4840,
        orden: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 9,
        codigo: '03.001',
        nombre: 'Instalación eléctrica',
        descripcion: 'Instalación eléctrica completa con cuadro general',
        presupuestoId: 1,
        capituloId: 5,
        productoId: 9,
        producto: 'Material eléctrico',
        unidadMedidaId: 4,
        unidadMedida: 'ud',
        cantidad: 1,
        precio: 8500,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 8500,
        totalIva: 1785,
        totalConIva: 10285,
        orden: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 10,
        codigo: '03.002',
        nombre: 'Instalación fontanería',
        descripcion: 'Instalación de fontanería y saneamiento',
        presupuestoId: 1,
        capituloId: 5,
        productoId: 10,
        producto: 'Material fontanería',
        unidadMedidaId: 4,
        unidadMedida: 'ud',
        cantidad: 1,
        precio: 4200,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 4200,
        totalIva: 882,
        totalConIva: 5082,
        orden: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 11,
        codigo: '03.003',
        nombre: 'Sistema climatización',
        descripcion: 'Sistema de climatización por conductos',
        presupuestoId: 1,
        capituloId: 5,
        productoId: 11,
        producto: 'Climatización',
        unidadMedidaId: 4,
        unidadMedida: 'ud',
        cantidad: 1,
        precio: 2300,
        largo: undefined,
        ancho: undefined,
        alto: undefined,
        totalSinIva: 2300,
        totalIva: 483,
        totalConIva: 2783,
        orden: 3,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    // Desgloses mock
    const mockDesgloses: DesglosePartida[] = [
      {
        id: 1,
        partidaId: 1,
        tipoRecurso: 'Operario',
        recursoId: 1,
        recursoNombre: 'Oficial 1ª Demolición',
        recursoUnidad: 'h',
        cantidad: 8,
        precio: 25,
        total: 200,
        observaciones: 'Incluye herramientas menores',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        partidaId: 1,
        tipoRecurso: 'Maquinaria',
        recursoId: 1,
        recursoNombre: 'Martillo neumático',
        recursoUnidad: 'h',
        cantidad: 6,
        precio: 15,
        total: 90,
        observaciones: 'Alquiler incluye combustible',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 3,
        partidaId: 2,
        tipoRecurso: 'Operario',
        recursoId: 2,
        recursoNombre: 'Peón especializado',
        recursoUnidad: 'h',
        cantidad: 4,
        precio: 20,
        total: 80,
        observaciones: 'Carga y descarga manual',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 4,
        partidaId: 2,
        tipoRecurso: 'Maquinaria',
        recursoId: 2,
        recursoNombre: 'Camión basculante',
        recursoUnidad: 'viaje',
        cantidad: 3,
        precio: 120,
        total: 360,
        observaciones: 'Transporte a vertedero autorizado',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    // Inicializar signals
    this._presupuestos.set(mockPresupuestos);
    this._capitulos.set(mockCapitulos);
    this._partidas.set(mockPartidas);
    this._desgloses.set(mockDesgloses);
  }

  // ===== MÉTODOS CRUD PRESUPUESTOS =====

  getPresupuestos(filters?: PresupuestoFilters): Observable<Presupuesto[]> {
    this._loading.set(true);
    this._error.set(null);

    return of(this._presupuestos()).pipe(
      delay(500), // Simular latencia de red
      map(presupuestos => {
        if (!filters) return presupuestos;

        return presupuestos.filter(p => {
          if (filters.clienteId && p.clienteId !== filters.clienteId) return false;
          if (filters.estado && p.estado !== filters.estado) return false;
          if (filters.empresaId && p.empresaId !== filters.empresaId) return false;
          if (filters.search) {
            const search = filters.search.toLowerCase();
            return p.codigo.toLowerCase().includes(search) ||
                   p.nombre.toLowerCase().includes(search) ||
                   (p.cliente?.toLowerCase().includes(search) ?? false);
          }
          if (filters.fechaDesde && p.fechaCreacion < filters.fechaDesde) return false;
          if (filters.fechaHasta && p.fechaCreacion > filters.fechaHasta) return false;
          return true;
        });
      }),
      tap(() => this._loading.set(false))
    );
  }

  getPresupuesto(id: number): Observable<Presupuesto | null> {
    this._loading.set(true);
    this._error.set(null);

    return of(this._presupuestos().find(p => p.id === id) || null).pipe(
      delay(300),
      tap(() => this._loading.set(false))
    );
  }

  createPresupuesto(dto: CreatePresupuestoDto): Observable<Presupuesto> {
    this._loading.set(true);
    this._error.set(null);

    const newPresupuesto: Presupuesto = {
      id: this.nextPresupuestoId++,
      ...dto,
      cliente: `Cliente ${dto.clienteId}`, // Mock
      estado: 'Borrador',
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      totalSinIva: 0,
      totalIva: 0,
      totalConIva: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(newPresupuesto).pipe(
      delay(800),
      tap(presupuesto => {
        this._presupuestos.update(list => [...list, presupuesto]);
        this._loading.set(false);
      })
    );
  }

  updatePresupuesto(id: number, dto: UpdatePresupuestoDto): Observable<Presupuesto> {
    this._loading.set(true);
    this._error.set(null);

    const presupuesto = this._presupuestos().find(p => p.id === id);
    if (!presupuesto) {
      return throwError(() => new Error('Presupuesto no encontrado'));
    }

    const updatedPresupuesto: Presupuesto = {
      ...presupuesto,
      ...dto,
      fechaModificacion: new Date(),
      updatedAt: new Date()
    };

    return of(updatedPresupuesto).pipe(
      delay(600),
      tap(updated => {
        this._presupuestos.update(list => 
          list.map(p => p.id === id ? updated : p)
        );
        this._loading.set(false);
      })
    );
  }

  deletePresupuesto(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return of(void 0).pipe(
      delay(400),
      tap(() => {
        this._presupuestos.update(list => list.filter(p => p.id !== id));
        // También eliminar capítulos, partidas y desgloses relacionados
        this._capitulos.update(list => list.filter(c => c.presupuestoId !== id));
        this._partidas.update(list => list.filter(p => p.presupuestoId !== id));
        this._loading.set(false);
      })
    );
  }

  // ===== MÉTODOS CRUD CAPÍTULOS =====

  getCapitulos(filters?: CapituloFilters): Observable<Capitulo[]> {
    this._loading.set(true);
    this._error.set(null);

    return of(this._capitulos()).pipe(
      delay(300),
      map(capitulos => {
        if (!filters) return capitulos;

        return capitulos.filter(c => {
          if (filters.presupuestoId && c.presupuestoId !== filters.presupuestoId) return false;
          if (filters.capituloPadreId !== undefined && c.capituloPadreId !== filters.capituloPadreId) return false;
          if (filters.search) {
            const search = filters.search.toLowerCase();
            return c.codigo.toLowerCase().includes(search) ||
                   c.nombre.toLowerCase().includes(search);
          }
          return true;
        });
      }),
      tap(() => this._loading.set(false))
    );
  }

  getCapitulosArbol(presupuestoId: number): Observable<CapituloArbol[]> {
    this._loading.set(true);
    this._error.set(null);

    return of(this.buildCapitulosArbol(presupuestoId)).pipe(
      delay(400),
      tap(() => this._loading.set(false))
    );
  }

  private buildCapitulosArbol(presupuestoId: number): CapituloArbol[] {
    const capitulos = this._capitulos().filter(c => c.presupuestoId === presupuestoId);
    const partidas = this._partidas().filter(p => p.presupuestoId === presupuestoId);
    
    const buildTree = (parentId?: number): CapituloArbol[] => {
      return capitulos
        .filter(c => c.capituloPadreId === parentId)
        .sort((a, b) => a.orden - b.orden)
        .map(capitulo => ({
          id: capitulo.id,
          codigo: capitulo.codigo,
          nombre: capitulo.nombre,
          descripcion: capitulo.descripcion,
          nivel: capitulo.nivel,
          orden: capitulo.orden,
          totalSinIva: capitulo.totalSinIva,
          totalConIva: capitulo.totalConIva,
          hijos: buildTree(capitulo.id),
          partidas: partidas
            .filter(p => p.capituloId === capitulo.id)
            .sort((a, b) => a.orden - b.orden)
        }));
    };

    return buildTree();
  }

  createCapitulo(dto: CreateCapituloDto): Observable<Capitulo> {
    this._loading.set(true);
    this._error.set(null);

    const parentCapitulo = dto.capituloPadreId ? 
      this._capitulos().find(c => c.id === dto.capituloPadreId) : null;
    
    const nivel = parentCapitulo ? parentCapitulo.nivel + 1 : 1;
    const ruta = parentCapitulo ? 
      `${parentCapitulo.ruta}/${dto.codigo}` : dto.codigo;

    const newCapitulo: Capitulo = {
      id: this.nextCapituloId++,
      ...dto,
      nivel,
      ruta,
      orden: dto.orden || 1,
      totalSinIva: 0,
      totalIva: 0,
      totalConIva: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(newCapitulo).pipe(
      delay(600),
      tap(capitulo => {
        this._capitulos.update(list => [...list, capitulo]);
        this._loading.set(false);
      })
    );
  }

  updateCapitulo(id: number, dto: UpdateCapituloDto): Observable<Capitulo> {
    this._loading.set(true);
    this._error.set(null);

    const capitulo = this._capitulos().find(c => c.id === id);
    if (!capitulo) {
      return throwError(() => new Error('Capítulo no encontrado'));
    }

    const updatedCapitulo: Capitulo = {
      ...capitulo,
      ...dto,
      updatedAt: new Date()
    };

    return of(updatedCapitulo).pipe(
      delay(500),
      tap(updated => {
        this._capitulos.update(list => 
          list.map(c => c.id === id ? updated : c)
        );
        this._loading.set(false);
      })
    );
  }

  deleteCapitulo(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return of(void 0).pipe(
      delay(400),
      tap(() => {
        // Eliminar capítulo y sus hijos
        const toDelete = this.getCapituloHijos(id);
        toDelete.push(id);
        
        this._capitulos.update(list => 
          list.filter(c => !toDelete.includes(c.id))
        );
        
        // Eliminar partidas relacionadas
        this._partidas.update(list => 
          list.filter(p => !toDelete.includes(p.capituloId))
        );
        
        this._loading.set(false);
      })
    );
  }

  private getCapituloHijos(capituloId: number): number[] {
    const hijos: number[] = [];
    const directos = this._capitulos().filter(c => c.capituloPadreId === capituloId);
    
    for (const hijo of directos) {
      hijos.push(hijo.id);
      hijos.push(...this.getCapituloHijos(hijo.id));
    }
    
    return hijos;
  }

  // ===== MÉTODOS CRUD PARTIDAS =====

  getPartidas(filters?: PartidaFilters): Observable<Partida[]> {
    this._loading.set(true);
    this._error.set(null);

    return of(this._partidas()).pipe(
      delay(300),
      map(partidas => {
        if (!filters) return partidas;

        return partidas.filter(p => {
          if (filters.presupuestoId && p.presupuestoId !== filters.presupuestoId) return false;
          if (filters.capituloId && p.capituloId !== filters.capituloId) return false;
          if (filters.productoId && p.productoId !== filters.productoId) return false;
          if (filters.search) {
            const search = filters.search.toLowerCase();
            return p.codigo.toLowerCase().includes(search) ||
                   p.nombre.toLowerCase().includes(search) ||
                   (p.descripcion?.toLowerCase().includes(search) ?? false);
          }
          return true;
        });
      }),
      tap(() => this._loading.set(false))
    );
  }

  getPartida(id: number): Observable<Partida | null> {
    this._loading.set(true);
    this._error.set(null);

    return of(this._partidas().find(p => p.id === id) || null).pipe(
      delay(200),
      tap(() => this._loading.set(false))
    );
  }

  createPartida(dto: CreatePartidaDto): Observable<Partida> {
    this._loading.set(true);
    this._error.set(null);

    const newPartida: Partida = {
      id: this.nextPartidaId++,
      ...dto,
      producto: `Producto ${dto.productoId}`, // Mock
      unidadMedida: 'ud', // Mock
      totalSinIva: dto.cantidad * dto.precio,
      totalIva: dto.cantidad * dto.precio * 0.21,
      totalConIva: dto.cantidad * dto.precio * 1.21,
      orden: dto.orden || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(newPartida).pipe(
      delay(700),
      tap(partida => {
        this._partidas.update(list => [...list, partida]);
        this.recalcularTotalesCapitulo(partida.capituloId);
        this._loading.set(false);
      })
    );
  }

  updatePartida(id: number, dto: UpdatePartidaDto): Observable<Partida> {
    this._loading.set(true);
    this._error.set(null);

    const partida = this._partidas().find(p => p.id === id);
    if (!partida) {
      return throwError(() => new Error('Partida no encontrada'));
    }

    const updatedPartida: Partida = {
      ...partida,
      ...dto,
      totalSinIva: (dto.cantidad ?? partida.cantidad) * (dto.precio ?? partida.precio),
      totalIva: (dto.cantidad ?? partida.cantidad) * (dto.precio ?? partida.precio) * 0.21,
      totalConIva: (dto.cantidad ?? partida.cantidad) * (dto.precio ?? partida.precio) * 1.21,
      updatedAt: new Date()
    };

    return of(updatedPartida).pipe(
      delay(500),
      tap(updated => {
        this._partidas.update(list => 
          list.map(p => p.id === id ? updated : p)
        );
        this.recalcularTotalesCapitulo(updated.capituloId);
        this._loading.set(false);
      })
    );
  }

  deletePartida(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    const partida = this._partidas().find(p => p.id === id);
    if (!partida) {
      return throwError(() => new Error('Partida no encontrada'));
    }

    return of(void 0).pipe(
      delay(400),
      tap(() => {
        this._partidas.update(list => list.filter(p => p.id !== id));
        this._desgloses.update(list => list.filter(d => d.partidaId !== id));
        this.recalcularTotalesCapitulo(partida.capituloId);
        this._loading.set(false);
      })
    );
  }

  // ===== MÉTODOS CRUD DESGLOSE =====

  getDesgloses(filters?: DesgloseFilters): Observable<DesglosePartida[]> {
    this._loading.set(true);
    this._error.set(null);

    return of(this._desgloses()).pipe(
      delay(200),
      map(desgloses => {
        if (!filters) return desgloses;

        return desgloses.filter(d => {
          if (filters.partidaId && d.partidaId !== filters.partidaId) return false;
          if (filters.tipoRecurso && d.tipoRecurso !== filters.tipoRecurso) return false;
          if (filters.search) {
            const search = filters.search.toLowerCase();
            return (d.recursoNombre?.toLowerCase().includes(search) ?? false) ||
                   (d.observaciones?.toLowerCase().includes(search) ?? false);
          }
          return true;
        });
      }),
      tap(() => this._loading.set(false))
    );
  }

  createDesglosePartida(dto: CreateDesglosePartidaDto): Observable<DesglosePartida> {
    this._loading.set(true);
    this._error.set(null);

    const newDesglose: DesglosePartida = {
      id: this.nextDesgloseId++,
      ...dto,
      recursoNombre: `Recurso ${dto.recursoId}`, // Mock
      recursoUnidad: 'ud', // Mock
      total: dto.cantidad * dto.precio,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(newDesglose).pipe(
      delay(500),
      tap(desglose => {
        this._desgloses.update(list => [...list, desglose]);
        this._loading.set(false);
      })
    );
  }

  updateDesglosePartida(id: number, dto: UpdateDesglosePartidaDto): Observable<DesglosePartida> {
    this._loading.set(true);
    this._error.set(null);

    const desglose = this._desgloses().find(d => d.id === id);
    if (!desglose) {
      return throwError(() => new Error('Desglose no encontrado'));
    }

    const updatedDesglose: DesglosePartida = {
      ...desglose,
      ...dto,
      total: (dto.cantidad ?? desglose.cantidad) * (dto.precio ?? desglose.precio),
      updatedAt: new Date()
    };

    return of(updatedDesglose).pipe(
      delay(400),
      tap(updated => {
        this._desgloses.update(list => 
          list.map(d => d.id === id ? updated : d)
        );
        this._loading.set(false);
      })
    );
  }

  deleteDesglosePartida(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return of(void 0).pipe(
      delay(300),
      tap(() => {
        this._desgloses.update(list => list.filter(d => d.id !== id));
        this._loading.set(false);
      })
    );
  }

  // ===== MÉTODOS DE RECURSOS PARA DESGLOSE =====

  getArticulosDesglose(filters?: RecursoFilters): Observable<ArticuloDesglose[]> {
    const mockArticulos: ArticuloDesglose[] = [
      { id: 1, codigo: 'ART001', nombre: 'Cemento Portland', unidadMedida: 'kg', precio: 0.15, activo: true },
      { id: 2, codigo: 'ART002', nombre: 'Arena de río', unidadMedida: 'm³', precio: 25, activo: true },
      { id: 3, codigo: 'ART003', nombre: 'Grava 20mm', unidadMedida: 'm³', precio: 30, activo: true },
      { id: 4, codigo: 'ART004', nombre: 'Ladrillo hueco', unidadMedida: 'ud', precio: 0.35, activo: true },
      { id: 5, codigo: 'ART005', nombre: 'Mortero M-5', unidadMedida: 'kg', precio: 0.12, activo: true }
    ];

    return of(mockArticulos).pipe(
      delay(200),
      map(articulos => {
        if (!filters?.search) return articulos;
        const search = filters.search.toLowerCase();
        return articulos.filter(a => 
          a.codigo.toLowerCase().includes(search) ||
          a.nombre.toLowerCase().includes(search)
        );
      })
    );
  }

  getOperariosDesglose(filters?: RecursoFilters): Observable<OperarioDesglose[]> {
    const mockOperarios: OperarioDesglose[] = [
      { id: 1, codigo: 'OP001', nombre: 'Oficial 1ª Albañil', categoria: 'Oficial 1ª', costeHora: 25, activo: true },
      { id: 2, codigo: 'OP002', nombre: 'Oficial 2ª Albañil', categoria: 'Oficial 2ª', costeHora: 22, activo: true },
      { id: 3, codigo: 'OP003', nombre: 'Peón especializado', categoria: 'Peón Esp.', costeHora: 20, activo: true },
      { id: 4, codigo: 'OP004', nombre: 'Peón ordinario', categoria: 'Peón', costeHora: 18, activo: true },
      { id: 5, codigo: 'OP005', nombre: 'Oficial 1ª Electricista', categoria: 'Oficial 1ª', costeHora: 28, activo: true }
    ];

    return of(mockOperarios).pipe(
      delay(200),
      map(operarios => {
        if (!filters?.search) return operarios;
        const search = filters.search.toLowerCase();
        return operarios.filter(o => 
          o.codigo.toLowerCase().includes(search) ||
          o.nombre.toLowerCase().includes(search) ||
          o.categoria.toLowerCase().includes(search)
        );
      })
    );
  }

  getMaquinariaDesglose(filters?: RecursoFilters): Observable<MaquinariaDesglose[]> {
    const mockMaquinaria: MaquinariaDesglose[] = [
      { id: 1, codigo: 'MAQ001', nombre: 'Hormigonera 300L', tipo: 'Hormigonera', costeHora: 8, activo: true },
      { id: 2, codigo: 'MAQ002', nombre: 'Martillo neumático', tipo: 'Herramienta', costeHora: 15, activo: true },
      { id: 3, codigo: 'MAQ003', nombre: 'Grúa torre 40m', tipo: 'Grúa', costeHora: 45, activo: true },
      { id: 4, codigo: 'MAQ004', nombre: 'Camión basculante', tipo: 'Transporte', costeHora: 35, activo: true },
      { id: 5, codigo: 'MAQ005', nombre: 'Compresor 7m³/min', tipo: 'Compresor', costeHora: 12, activo: true }
    ];

    return of(mockMaquinaria).pipe(
      delay(200),
      map(maquinaria => {
        if (!filters?.search) return maquinaria;
        const search = filters.search.toLowerCase();
        return maquinaria.filter(m => 
          m.codigo.toLowerCase().includes(search) ||
          m.nombre.toLowerCase().includes(search) ||
          m.tipo.toLowerCase().includes(search)
        );
      })
    );
  }

  // ===== MÉTODOS DE CÁLCULO Y UTILIDADES =====

  private recalcularTotalesCapitulo(capituloId: number): void {
    const partidas = this._partidas().filter(p => p.capituloId === capituloId);
    const totalSinIva = partidas.reduce((sum, p) => sum + p.totalSinIva, 0);
    const totalIva = partidas.reduce((sum, p) => sum + p.totalIva, 0);
    const totalConIva = partidas.reduce((sum, p) => sum + p.totalConIva, 0);

    this._capitulos.update(list => 
      list.map(c => c.id === capituloId ? {
        ...c,
        totalSinIva,
        totalIva,
        totalConIva,
        updatedAt: new Date()
      } : c)
    );

    // Recalcular presupuesto
    const capitulo = this._capitulos().find(c => c.id === capituloId);
    if (capitulo) {
      this.recalcularTotalesPresupuesto(capitulo.presupuestoId);
    }
  }

  private recalcularTotalesPresupuesto(presupuestoId: number): void {
    const capitulos = this._capitulos().filter(c => c.presupuestoId === presupuestoId);
    const totalSinIva = capitulos.reduce((sum, c) => sum + c.totalSinIva, 0);
    const totalIva = capitulos.reduce((sum, c) => sum + c.totalIva, 0);
    const totalConIva = capitulos.reduce((sum, c) => sum + c.totalConIva, 0);

    this._presupuestos.update(list => 
      list.map(p => p.id === presupuestoId ? {
        ...p,
        totalSinIva,
        totalIva,
        totalConIva,
        fechaModificacion: new Date(),
        updatedAt: new Date()
      } : p)
    );
  }

  getResumenTotales(presupuestoId: number): Observable<ResumenTotales> {
    const capitulos = this._capitulos().filter(c => c.presupuestoId === presupuestoId);
    const partidas = this._partidas().filter(p => p.presupuestoId === presupuestoId);
    
    const resumen: ResumenTotales = {
      totalSinIva: capitulos.reduce((sum, c) => sum + c.totalSinIva, 0),
      totalIva: capitulos.reduce((sum, c) => sum + c.totalIva, 0),
      totalConIva: capitulos.reduce((sum, c) => sum + c.totalConIva, 0),
      numeroPartidas: partidas.length,
      numeroCapitulos: capitulos.length
    };

    return of(resumen).pipe(delay(100));
  }

  duplicarPresupuesto(id: number, nuevoCodigo: string, nuevoNombre: string): Observable<Presupuesto> {
    this._loading.set(true);
    this._error.set(null);

    const presupuestoOriginal = this._presupuestos().find(p => p.id === id);
    if (!presupuestoOriginal) {
      return throwError(() => new Error('Presupuesto no encontrado'));
    }

    const nuevoPresupuesto: Presupuesto = {
      ...presupuestoOriginal,
      id: this.nextPresupuestoId++,
      codigo: nuevoCodigo,
      nombre: nuevoNombre,
      estado: 'Borrador',
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(nuevoPresupuesto).pipe(
      delay(1000),
      tap(presupuesto => {
        this._presupuestos.update(list => [...list, presupuesto]);
        // TODO: Duplicar también capítulos y partidas
        this._loading.set(false);
      })
    );
  }

  cambiarEstadoPresupuesto(id: number, nuevoEstado: EstadoPresupuesto): Observable<Presupuesto> {
    return this.updatePresupuesto(id, { estado: nuevoEstado });
  }

  exportarPresupuesto(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    const presupuesto = this._presupuestos().find(p => p.id === id);
    if (!presupuesto) {
      return throwError(() => new Error('Presupuesto no encontrado'));
    }

    // Simular exportación
    return of(void 0).pipe(
      delay(1500),
      tap(() => {
        this._loading.set(false);
        // En una implementación real, aquí se generaría y descargaría el archivo
        console.log(`Exportando presupuesto: ${presupuesto.codigo}`);
      })
    );
  }

  eliminarPresupuesto(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    const presupuesto = this._presupuestos().find(p => p.id === id);
    if (!presupuesto) {
      return throwError(() => new Error('Presupuesto no encontrado'));
    }

    return of(void 0).pipe(
      delay(800),
      tap(() => {
        this._presupuestos.update(list => list.filter(p => p.id !== id));
        // También eliminar capítulos, partidas y desgloses relacionados
        this._capitulos.update(list => list.filter(c => c.presupuestoId !== id));
        this._partidas.update(list => {
          const capitulosIds = this._capitulos().filter(c => c.presupuestoId === id).map(c => c.id);
          return list.filter(p => !capitulosIds.includes(p.capituloId));
        });
        this._loading.set(false);
      })
    );
  }
}