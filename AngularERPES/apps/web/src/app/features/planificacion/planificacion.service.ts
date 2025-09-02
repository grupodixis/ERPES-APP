import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Partida {
  id: string;
  name: string;
  codigo: string;
  descripcion: string;
  estado: 'en_curso' | 'completada' | 'pendiente';
}

export interface Operario {
  id: string;
  name: string;
  especialidad: string;
  color: string;
}

export interface Asignacion {
  id: string;
  resource: string; // ID de la partida
  start: string; // ISO string
  end: string; // ISO string
  text: string; // Nombres de operarios
  operarios: string[]; // IDs de operarios
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanificacionService {
  private partidasSubject = new BehaviorSubject<Partida[]>([]);
  private asignacionesSubject = new BehaviorSubject<Asignacion[]>([]);
  private operariosSubject = new BehaviorSubject<Operario[]>([]);

  constructor() {
    this.inicializarDatosMock();
  }

  // Getters para observables
  get partidasEnCurso$(): Observable<Partida[]> {
    return this.partidasSubject.asObservable();
  }

  get asignaciones$(): Observable<Asignacion[]> {
    return this.asignacionesSubject.asObservable();
  }

  get operarios$(): Observable<Operario[]> {
    return this.operariosSubject.asObservable();
  }

  // Getters para valores actuales
  get partidasEnCurso(): Partida[] {
    return this.partidasSubject.value;
  }

  get asignaciones(): Asignacion[] {
    return this.asignacionesSubject.value;
  }

  get operarios(): Operario[] {
    return this.operariosSubject.value;
  }

  private inicializarDatosMock(): void {
    // Partidas en curso
    const partidas: Partida[] = [
      {
        id: 'p001',
        name: 'P001 - Instalación Eléctrica',
        codigo: 'P001',
        descripcion: 'Instalación completa del sistema eléctrico en edificio A',
        estado: 'en_curso'
      },
      {
        id: 'p002',
        name: 'P002 - Fontanería',
        codigo: 'P002',
        descripcion: 'Sistema de fontanería y desagües',
        estado: 'en_curso'
      },
      {
        id: 'p003',
        name: 'P003 - Albañilería',
        codigo: 'P003',
        descripcion: 'Trabajos de albañilería y mampostería',
        estado: 'en_curso'
      },
      {
        id: 'p004',
        name: 'P004 - Pintura',
        codigo: 'P004',
        descripcion: 'Pintura interior y exterior',
        estado: 'en_curso'
      },
      {
        id: 'p005',
        name: 'P005 - Carpintería',
        codigo: 'P005',
        descripcion: 'Instalación de puertas y ventanas',
        estado: 'en_curso'
      }
      ,
      {
        id: 'p006',
        name: 'P006 - Climatización',
        codigo: 'P006',
        descripcion: 'Montaje de sistemas de climatización',
        estado: 'en_curso'
      },
      {
        id: 'p007',
        name: 'P007 - Seguridad',
        codigo: 'P007',
        descripcion: 'Instalación de CCTV y alarmas',
        estado: 'en_curso'
      },
      {
        id: 'p008',
        name: 'P008 - Jardinería',
        codigo: 'P008',
        descripcion: 'Acondicionamiento de zonas verdes',
        estado: 'en_curso'
      },
      {
        id: 'p009',
        name: 'P009 - Limpieza Final',
        codigo: 'P009',
        descripcion: 'Limpieza y entrega de obra',
        estado: 'en_curso'
      }
    ];

    // Operarios disponibles
    const operarios: Operario[] = [
      {
        id: 'op001',
        name: 'Juan Pérez',
        especialidad: 'Electricista',
        color: '#2196F3'
      },
      {
        id: 'op002',
        name: 'María García',
        especialidad: 'Fontanera',
        color: '#4CAF50'
      },
      {
        id: 'op003',
        name: 'Carlos López',
        especialidad: 'Albañil',
        color: '#FF9800'
      },
      {
        id: 'op004',
        name: 'Ana Martínez',
        especialidad: 'Pintora',
        color: '#9C27B0'
      },
      {
        id: 'op005',
        name: 'Luis Rodríguez',
        especialidad: 'Carpintero',
        color: '#795548'
      },
      {
        id: 'op006',
        name: 'Elena Sánchez',
        especialidad: 'Electricista',
        color: '#607D8B'
      }
    ];

    // Asignaciones predefinidas - vacías para empezar
    const asignaciones: Asignacion[] = [];

    this.partidasSubject.next(partidas);
    this.operariosSubject.next(operarios);
    this.asignacionesSubject.next(asignaciones);
  }

  // Método para agregar nueva asignación
  agregarAsignacion(asignacion: Omit<Asignacion, 'id'>): void {
    const nuevaAsignacion: Asignacion = {
      ...asignacion,
      id: `asg${Date.now()}` // ID único basado en timestamp
    };

    const asignacionesActuales = this.asignacionesSubject.value;
    this.asignacionesSubject.next([...asignacionesActuales, nuevaAsignacion]);
  }

  // Método para eliminar asignación
  eliminarAsignacion(id: string): void {
    const asignacionesActuales = this.asignacionesSubject.value;
    const asignacionesFiltradas = asignacionesActuales.filter(asg => asg.id !== id);
    this.asignacionesSubject.next(asignacionesFiltradas);
  }

  // Método para actualizar asignación
  actualizarAsignacion(id: string, cambios: Partial<Asignacion>): void {
    const asignacionesActuales = this.asignacionesSubject.value;
    const asignacionesActualizadas = asignacionesActuales.map(asg => 
      asg.id === id ? { ...asg, ...cambios } : asg
    );
    this.asignacionesSubject.next(asignacionesActualizadas);
  }

  // Método para obtener operarios por IDs
  getOperariosPorIds(ids: string[]): Operario[] {
    return this.operarios.filter(op => ids.includes(op.id));
  }

  // Método para obtener color de operarios
  getColorOperarios(operariosIds: string[]): string {
    const operarios = this.getOperariosPorIds(operariosIds);
    if (operarios.length === 1) {
      return operarios[0].color;
    }
    // Si hay múltiples operarios, usar un color mixto
    return '#607D8B';
  }
}
