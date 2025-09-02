import { Injectable, signal, computed } from '@angular/core';

export interface Recurso {
  id: string;
  name: string;
  tipo: 'operario' | 'obra';
  capacidad: number;
  color?: string;
}

export interface Evento {
  id: string;
  text: string;
  start: Date;
  end: Date;
  resource: string; // ID del operario
  obraId?: string;  // ID de la obra (opcional, para múltiples operarios en una obra)
  notas?: string;
  estado: 'pendiente' | 'en_progreso' | 'completado';
}

export interface Filtros {
  tipoRecurso: 'todos' | 'operario' | 'obra';
  estado: 'todos' | 'pendiente' | 'en_progreso' | 'completado';
  operario?: string;
  obra?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanificacionStore {
  // Recursos (operarios y obras)
  readonly recursos = signal<Recurso[]>([
    { id: 'op1', name: 'Juan Pérez', tipo: 'operario', capacidad: 8, color: '#2196F3' },
    { id: 'op2', name: 'María García', tipo: 'operario', capacidad: 6, color: '#4CAF50' },
    { id: 'op3', name: 'Carlos López', tipo: 'operario', capacidad: 8, color: '#FF9800' },
    { id: 'ob1', name: 'Obra Norte', tipo: 'obra', capacidad: 24, color: '#9C27B0' },
    { id: 'ob2', name: 'Obra Sur', tipo: 'obra', capacidad: 16, color: '#F44336' }
  ]);

  // Eventos de planificación
  readonly eventos = signal<Evento[]>([
    {
      id: 'ev1',
      text: 'Instalación eléctrica',
      start: new Date(2025, 0, 20, 8, 0),
      end: new Date(2025, 0, 20, 16, 0),
      resource: 'op1',
      obraId: 'ob1',
      notas: 'Instalar cuadro principal',
      estado: 'en_progreso'
    },
    {
      id: 'ev2',
      text: 'Cimentación',
      start: new Date(2025, 0, 20, 7, 0),
      end: new Date(2025, 0, 20, 15, 0),
      resource: 'op2',
      obraId: 'ob1',
      notas: 'Hormigonado de pilares',
      estado: 'pendiente'
    },
    {
      id: 'ev3',
      text: 'Pintura exterior',
      start: new Date(2025, 0, 21, 8, 0),
      end: new Date(2025, 0, 21, 14, 0),
      resource: 'op3',
      obraId: 'ob2',
      notas: 'Primera mano',
      estado: 'pendiente'
    },
    {
      id: 'ev4',
      text: 'Albañilería',
      start: new Date(2025, 0, 21, 9, 0),
      end: new Date(2025, 0, 21, 17, 0),
      resource: 'op1',
      obraId: 'ob2',
      notas: 'Levantar muros',
      estado: 'pendiente'
    }
  ]);

  // Filtros activos
  readonly filtros = signal<Filtros>({
    tipoRecurso: 'todos',
    estado: 'todos'
  });

  // Vista actual (semana, mes, etc.)
  readonly vista = signal<'semana' | 'mes' | 'dia'>('semana');

  // Rango de fechas
  readonly rangoFechas = signal<{ start: Date; end: Date }>({
    start: new Date(2025, 0, 13), // Lunes
    end: new Date(2025, 0, 19)    // Domingo
  });

  // Recursos filtrados
  readonly recursosFiltrados = computed(() => {
    const filtro = this.filtros();
    if (filtro.tipoRecurso === 'todos') return this.recursos();
    return this.recursos().filter(r => r.tipo === filtro.tipoRecurso);
  });

  // Eventos filtrados
  readonly eventosFiltrados = computed(() => {
    const filtro = this.filtros();
    let eventos = this.eventos();
    
    if (filtro.estado !== 'todos') {
      eventos = eventos.filter(e => e.estado === filtro.estado);
    }
    
    if (filtro.operario) {
      eventos = eventos.filter(e => e.resource === filtro.operario);
    }
    
    if (filtro.obra) {
      eventos = eventos.filter(e => e.resource === filtro.obra);
    }
    
    return eventos;
  });

  // Operarios disponibles
  readonly operarios = computed(() => 
    this.recursos().filter(r => r.tipo === 'operario')
  );

  // Obras disponibles
  readonly obras = computed(() => 
    this.recursos().filter(r => r.tipo === 'obra')
  );

  // Métodos para modificar el estado
  agregarEvento(evento: Omit<Evento, 'id'>): void {
    const nuevoEvento: Evento = {
      ...evento,
      id: `ev${Date.now()}`
    };
    this.eventos.update(arr => [...arr, nuevoEvento]);
  }

  actualizarEvento(id: string, cambios: Partial<Evento>): void {
    this.eventos.update(arr => 
      arr.map(e => e.id === id ? { ...e, ...cambios } : e)
    );
  }

  eliminarEvento(id: string): void {
    this.eventos.update(arr => arr.filter(e => e.id !== id));
  }

  actualizarFiltros(nuevosFiltros: Partial<Filtros>): void {
    this.filtros.update(f => ({ ...f, ...nuevosFiltros }));
  }

  cambiarVista(nuevaVista: 'semana' | 'mes' | 'dia'): void {
    this.vista.set(nuevaVista);
  }

  cambiarRangoFechas(start: Date, end: Date): void {
    this.rangoFechas.set({ start, end });
  }

  // Validar solape de eventos
  haySolape(evento: Evento, excluirId?: string): boolean {
    return this.eventos().some(e => {
      if (excluirId && e.id === excluirId) return false;
      if (e.resource !== evento.resource) return false;
      
      return (evento.start < e.end && evento.end > e.start);
    });
  }

  // Validar capacidad del recurso
  validarCapacidad(recursoId: string, fecha: Date): boolean {
    const recurso = this.recursos().find(r => r.id === recursoId);
    if (!recurso) return false;
    
    const eventosEnFecha = this.eventos().filter(e => 
      e.resource === recursoId && 
      e.start.toDateString() === fecha.toDateString()
    );
    
    const horasOcupadas = eventosEnFecha.reduce((total, e) => {
      const horas = (e.end.getTime() - e.start.getTime()) / (1000 * 60 * 60);
      return total + horas;
    }, 0);
    
    return horasOcupadas < recurso.capacidad;
  }
}
