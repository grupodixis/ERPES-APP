import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Obra,
  CreateObraDto,
  UpdateObraDto,
  ObraFilters,
  CapituloObra,
  CreateCapituloObraDto,
  PartidaObra,
  CreatePartidaObraDto,
  OrdenTrabajo,
  CreateOrdenTrabajoDto,
  EstadoObra
} from '../../domain/obras.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObrasService {
  private readonly apiUrl = `${environment.apiBaseUrl}/obras`;
  private obrasSubject = new BehaviorSubject<Obra[]>([]);
  public obras$ = this.obrasSubject.asObservable();

  // Mock data para desarrollo
  private mockObras: Obra[] = [
    {
      id: 1,
      codigo: 'OBR-2024-001',
      nombre: 'Construcción Edificio Residencial',
      estado: 'EnCurso',
      clienteId: 1,
      cliente: 'Constructora ABC S.L.',
      responsableId: 1,
      responsable: 'Juan Pérez',
      fechaInicioPrevista: new Date('2024-01-15'),
      fechaFinPrevista: new Date('2024-12-15'),
      fechaInicioReal: new Date('2024-01-15'),
      fechaFinReal: undefined,
      presupuestoObjetivo: 850000,
      esProvisional: false,
      empresaId: 1,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 2,
      codigo: 'OBR-2024-002',
      nombre: 'Reforma Oficinas Corporativas',
      estado: 'Planificacion',
      clienteId: 2,
      cliente: 'Empresa XYZ S.A.',
      responsableId: 2,
      responsable: 'María García',
      fechaInicioPrevista: new Date('2024-03-01'),
      fechaFinPrevista: new Date('2024-06-30'),
      fechaInicioReal: undefined,
      fechaFinReal: undefined,
      presupuestoObjetivo: 125000,
      esProvisional: false,
      empresaId: 1,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 3,
      codigo: 'OBR-2023-015',
      nombre: 'Instalación Sistema Solar',
      estado: 'Finalizada',
      clienteId: 3,
      cliente: 'Industrias DEF S.L.',
      responsableId: 1,
      responsable: 'Juan Pérez',
      fechaInicioPrevista: new Date('2023-09-01'),
      fechaFinPrevista: new Date('2023-11-30'),
      fechaInicioReal: new Date('2023-09-01'),
      fechaFinReal: new Date('2023-11-25'),
      presupuestoObjetivo: 75000,
      esProvisional: false,
      empresaId: 1,
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date('2023-11-25')
    }
  ];

  constructor(private http: HttpClient) {
    // Inicializar con datos mock
    this.obrasSubject.next(this.mockObras);
  }

  // Métodos para Obras
  getObras(filtros?: ObraFilters): Observable<Obra[]> {
    // En producción, esto haría una llamada HTTP
    // return this.http.get<Obra[]>(this.apiUrl, { params: this.buildHttpParams(filtros) });
    
    // Mock implementation
    return of(this.mockObras).pipe(
      map(obras => this.aplicarFiltros(obras, filtros))
    );
  }

  getObraById(id: number): Observable<Obra | null> {
    // return this.http.get<Obra>(`${this.apiUrl}/${id}`);
    
    // Mock implementation
    const obra = this.mockObras.find(o => o.id === id);
    return of(obra || null);
  }

  crearObra(obraDTO: CreateObraDto): Observable<Obra> {
    // return this.http.post<Obra>(this.apiUrl, obraDTO);
    
    // Mock implementation
    const nuevaObra: Obra = {
      ...obraDTO,
      id: Math.max(...this.mockObras.map(o => o.id)) + 1,
      estado: 'Planificacion',
      esProvisional: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockObras.push(nuevaObra);
    this.obrasSubject.next([...this.mockObras]);
    
    return of(nuevaObra);
  }

  actualizarObra(id: number, obraDTO: Partial<UpdateObraDto>): Observable<Obra> {
    // return this.http.put<Obra>(`${this.apiUrl}/${id}`, obraDTO);
    
    // Mock implementation
    const index = this.mockObras.findIndex(o => o.id === id);
    if (index !== -1) {
      this.mockObras[index] = {
        ...this.mockObras[index],
        ...obraDTO,
        updatedAt: new Date()
      };
      this.obrasSubject.next([...this.mockObras]);
      return of(this.mockObras[index]);
    }
    
    throw new Error('Obra no encontrada');
  }

  eliminarObra(id: number): Observable<boolean> {
    // return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    
    // Mock implementation
    const index = this.mockObras.findIndex(o => o.id === id);
    if (index !== -1) {
      this.mockObras.splice(index, 1);
      this.obrasSubject.next([...this.mockObras]);
      return of(true);
    }
    
    return of(false);
  }

  // Métodos para Capítulos
  getCapitulosByObra(obraId: number): Observable<CapituloObra[]> {
    // return this.http.get<CapituloObra[]>(`${this.apiUrl}/${obraId}/capitulos`);
    
    // Mock implementation - retornar array vacío por ahora
    return of([]);
  }

  crearCapitulo(obraId: number, capituloDTO: CreateCapituloObraDto): Observable<CapituloObra> {
    // return this.http.post<CapituloObra>(`${this.apiUrl}/${obraId}/capitulos`, capituloDTO);
    
    // Mock implementation
    const nuevoCapitulo: CapituloObra = {
      ...capituloDTO,
      id: Date.now(), // ID temporal
      estado: 'Pendiente',
      nivel: 1,
      orden: 1,
      ruta: capituloDTO.codigo,
      esProvisional: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of(nuevoCapitulo);
  }

  // Métodos para Partidas
  getPartidasByCapitulo(capituloId: number): Observable<PartidaObra[]> {
    // return this.http.get<PartidaObra[]>(`${this.apiUrl}/capitulos/${capituloId}/partidas`);
    
    // Mock implementation
    return of([]);
  }

  crearPartida(capituloId: number, partidaDTO: CreatePartidaObraDto): Observable<PartidaObra> {
    // return this.http.post<PartidaObra>(`${this.apiUrl}/capitulos/${capituloId}/partidas`, partidaDTO);
    
    // Mock implementation
    const nuevaPartida: PartidaObra = {
      ...partidaDTO,
      id: Date.now(),
      estado: 'Pendiente',
      alto: partidaDTO.alto || 1,
      ancho: partidaDTO.ancho || 1,
      largo: partidaDTO.largo || 1,
      orden: partidaDTO.orden || 1,
      esProvisional: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of(nuevaPartida);
  }

  // Métodos para Órdenes de Trabajo
  getOrdenesByPartida(partidaId: number): Observable<OrdenTrabajo[]> {
    // return this.http.get<OrdenTrabajo[]>(`${this.apiUrl}/partidas/${partidaId}/ordenes`);
    
    // Mock implementation
    return of([]);
  }

  crearOrdenTrabajo(partidaId: number, ordenDTO: CreateOrdenTrabajoDto): Observable<OrdenTrabajo> {
    // return this.http.post<OrdenTrabajo>(`${this.apiUrl}/partidas/${partidaId}/ordenes`, ordenDTO);
    
    // Mock implementation
    const nuevaOrden: OrdenTrabajo = {
      ...ordenDTO,
      id: Date.now(),
      estado: 'Creada',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of(nuevaOrden);
  }

  // Métodos auxiliares
  private aplicarFiltros(obras: Obra[], filtros?: ObraFilters): Obra[] {
    if (!filtros) return obras;

    return obras.filter(obra => {
      if (filtros.search) {
        const busqueda = filtros.search.toLowerCase();
        const coincide = 
          obra.nombre.toLowerCase().includes(busqueda) ||
          obra.codigo.toLowerCase().includes(busqueda) ||
          obra.cliente?.toLowerCase().includes(busqueda);
        
        if (!coincide) return false;
      }

      if (filtros.estado && obra.estado !== filtros.estado) {
        return false;
      }

      if (filtros.clienteId && obra.clienteId !== filtros.clienteId) {
        return false;
      }

      if (filtros.fechaDesde && obra.fechaInicioReal && obra.fechaInicioReal < filtros.fechaDesde) {
        return false;
      }

      if (filtros.fechaHasta && obra.fechaInicioReal && obra.fechaInicioReal > filtros.fechaHasta) {
        return false;
      }

      return true;
    });
  }

  private buildHttpParams(filtros?: ObraFilters): HttpParams {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.search) params = params.set('search', filtros.search);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.clienteId) params = params.set('clienteId', filtros.clienteId.toString());
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
    }
    
    return params;
  }
}