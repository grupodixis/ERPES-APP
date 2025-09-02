import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkTableModule } from '@angular/cdk/table';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { AuditoriaService, EventoAuditoria, FiltrosAuditoria, EstadisticasAuditoria, TimelineEvento, ExportacionAuditoria } from './auditoria.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    CdkTableModule
  ],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss']
})
export class AuditoriaComponent implements OnInit, OnDestroy {
  private readonly auditoriaService = inject(AuditoriaService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // Formularios reactivos
  readonly filtrosForm = this.fb.group({
    fechaInicio: [null as Date | null],
    fechaFin: [null as Date | null],
    tipo: [''],
    categoria: [''],
    usuarioId: [null as number | null],
    modulo: [''],
    severidad: [''],
    busqueda: [''],
    ip: ['']
  });

  readonly configuracionForm = this.fb.group({
    vistaActual: ['eventos'], // eventos, timeline, estadisticas
    autoRefresh: [false],
    intervaloRefresh: [30], // segundos
    mostrarDetalles: [true],
    agruparPorFecha: [false],
    filtroRapido: [''] // hoy, ayer, semana, mes
  });

  // Estado local
  private readonly _vistaActual = signal<'eventos' | 'timeline' | 'estadisticas'>('eventos');
  private readonly _paginaActual = signal(0);
  private readonly _tamañoPagina = signal(25);
  private readonly _ordenamiento = signal<{ campo: string; direccion: 'asc' | 'desc' }>({ campo: 'fecha', direccion: 'desc' });
  private readonly _eventoSeleccionado = signal<EventoAuditoria | null>(null);
  private readonly _modoSeleccion = signal(false);
  private readonly _eventosSeleccionados = signal<string[]>([]);
  private readonly _autoRefreshActivo = signal(false);
  private readonly _intervalId = signal<number | null>(null);

  // Señales del servicio
  readonly cargando = this.auditoriaService.cargando;
  readonly error = this.auditoriaService.error;
  readonly eventos = this.auditoriaService.eventosFiltrados;
  readonly usuarios = this.auditoriaService.usuarios;
  readonly estadisticas = this.auditoriaService.estadisticas;
  readonly timeline = this.auditoriaService.timeline;
  readonly tiposUnicos = this.auditoriaService.tiposUnicos;
  readonly categoriasUnicas = this.auditoriaService.categoriasUnicas;
  readonly modulosUnicos = this.auditoriaService.modulosUnicos;
  readonly severidadesUnicas = this.auditoriaService.severidadesUnicas;
  readonly ipsUnicas = this.auditoriaService.ipsUnicas;

  // Señales computadas locales
  readonly vistaActual = this._vistaActual.asReadonly();
  readonly paginaActual = this._paginaActual.asReadonly();
  readonly tamañoPagina = this._tamañoPagina.asReadonly();
  readonly ordenamiento = this._ordenamiento.asReadonly();
  readonly eventoSeleccionado = this._eventoSeleccionado.asReadonly();
  readonly modoSeleccion = this._modoSeleccion.asReadonly();
  readonly eventosSeleccionados = this._eventosSeleccionados.asReadonly();
  readonly autoRefreshActivo = this._autoRefreshActivo.asReadonly();

  readonly eventosPaginados = computed(() => {
    const eventos = this.eventos();
    const pagina = this._paginaActual();
    const tamaño = this._tamañoPagina();
    const inicio = pagina * tamaño;
    const fin = inicio + tamaño;
    return eventos.slice(inicio, fin);
  });

  readonly totalEventos = computed(() => this.eventos().length);
  readonly totalPaginas = computed(() => Math.ceil(this.totalEventos() / this._tamañoPagina()));
  readonly hayEventosSeleccionados = computed(() => this._eventosSeleccionados().length > 0);
  readonly todosMarcados = computed(() => {
    const eventos = this.eventosPaginados();
    const seleccionados = this._eventosSeleccionados();
    return eventos.length > 0 && eventos.every(e => seleccionados.includes(e.id));
  });

  // Configuración de tabla
  readonly columnasEventos = ['seleccion', 'fecha', 'tipo', 'accion', 'recurso', 'usuario', 'severidad', 'descripcion', 'acciones'];
  readonly columnasTimeline = ['fecha', 'evento', 'usuario', 'detalles'];

  // Opciones de filtros rápidos
  readonly filtrosRapidos = [
    { valor: 'hoy', etiqueta: 'Hoy' },
    { valor: 'ayer', etiqueta: 'Ayer' },
    { valor: 'semana', etiqueta: 'Última semana' },
    { valor: 'mes', etiqueta: 'Último mes' },
    { valor: 'trimestre', etiqueta: 'Último trimestre' }
  ];

  // Opciones de exportación
  readonly formatosExportacion = [
    { valor: 'csv', etiqueta: 'CSV', icono: 'description' },
    { valor: 'excel', etiqueta: 'Excel', icono: 'table_chart' },
    { valor: 'pdf', etiqueta: 'PDF', icono: 'picture_as_pdf' },
    { valor: 'json', etiqueta: 'JSON', icono: 'code' }
  ];

  ngOnInit(): void {
    this.inicializarComponente();
    this.configurarSuscripciones();
  }

  ngOnDestroy(): void {
    this.detenerAutoRefresh();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Métodos de inicialización
  private inicializarComponente(): void {
    // Cargar datos iniciales
    this.cargarEventos();
    
    // Configurar valores por defecto
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 7); // Última semana por defecto
    
    this.filtrosForm.patchValue({
      fechaInicio,
      fechaFin
    });
  }

  private configurarSuscripciones(): void {
    // Suscribirse a cambios en filtros
    this.filtrosForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(filtros => {
        this.aplicarFiltros(filtros as FiltrosAuditoria);
      });

    // Suscribirse a cambios en configuración
    this.configuracionForm.get('autoRefresh')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(activo => {
        if (activo) {
          this.iniciarAutoRefresh();
        } else {
          this.detenerAutoRefresh();
        }
      });

    this.configuracionForm.get('vistaActual')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(vista => {
        this._vistaActual.set(vista as any);
      });

    this.configuracionForm.get('filtroRapido')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filtro => {
        if (filtro) {
          this.aplicarFiltroRapido(filtro as any);
        }
      });
  }

  // Métodos de carga de datos
  async cargarEventos(): Promise<void> {
    try {
      const filtros = this.filtrosForm.value as FiltrosAuditoria;
      await this.auditoriaService.cargarEventos(filtros);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  }

  async recargarDatos(): Promise<void> {
    this._paginaActual.set(0);
    await this.cargarEventos();
    this.toastService.showSuccess('Datos actualizados correctamente');
  }

  // Métodos de filtrado
  aplicarFiltros(filtros: FiltrosAuditoria): void {
    this.auditoriaService.actualizarFiltros(filtros);
    this._paginaActual.set(0);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.auditoriaService.limpiarFiltros();
    this._paginaActual.set(0);
  }

  aplicarFiltroRapido(tipo: 'hoy' | 'ayer' | 'semana' | 'mes' | 'trimestre'): void {
    this.auditoriaService.establecerFiltroRapido(tipo);
    
    // Actualizar formulario para reflejar las fechas
    const filtros = this.auditoriaService.filtros();
    this.filtrosForm.patchValue({
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin
    }, { emitEvent: false });
    
    this._paginaActual.set(0);
  }

  // Métodos de paginación
  cambiarPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas()) {
      this._paginaActual.set(pagina);
    }
  }

  cambiarTamañoPagina(tamaño: number): void {
    this._tamañoPagina.set(tamaño);
    this._paginaActual.set(0);
  }

  // Métodos de ordenamiento
  cambiarOrdenamiento(campo: string): void {
    const ordenActual = this._ordenamiento();
    const nuevaDireccion = ordenActual.campo === campo && ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    this._ordenamiento.set({ campo, direccion: nuevaDireccion });
  }

  // Métodos de selección
  alternarModoSeleccion(): void {
    this._modoSeleccion.set(!this._modoSeleccion());
    if (!this._modoSeleccion()) {
      this._eventosSeleccionados.set([]);
    }
  }

  alternarSeleccionEvento(eventoId: string): void {
    const seleccionados = this._eventosSeleccionados();
    const index = seleccionados.indexOf(eventoId);
    
    if (index === -1) {
      this._eventosSeleccionados.set([...seleccionados, eventoId]);
    } else {
      this._eventosSeleccionados.set(seleccionados.filter(id => id !== eventoId));
    }
  }

  alternarSeleccionTodos(): void {
    const eventos = this.eventosPaginados();
    const seleccionados = this._eventosSeleccionados();
    
    if (this.todosMarcados()) {
      // Deseleccionar todos los de la página actual
      const idsEventosPagina = eventos.map(e => e.id);
      this._eventosSeleccionados.set(seleccionados.filter(id => !idsEventosPagina.includes(id)));
    } else {
      // Seleccionar todos los de la página actual
      const idsEventosPagina = eventos.map(e => e.id);
      const nuevosSeleccionados = [...new Set([...seleccionados, ...idsEventosPagina])];
      this._eventosSeleccionados.set(nuevosSeleccionados);
    }
  }

  limpiarSeleccion(): void {
    this._eventosSeleccionados.set([]);
  }

  // Métodos de vista
  cambiarVista(vista: 'eventos' | 'timeline' | 'estadisticas'): void {
    this._vistaActual.set(vista);
    this.configuracionForm.patchValue({ vistaActual: vista }, { emitEvent: false });
  }

  verDetallesEvento(evento: EventoAuditoria): void {
    this._eventoSeleccionado.set(evento);
    // Aquí se podría abrir un diálogo con los detalles
  }

  // Métodos de auto-refresh
  iniciarAutoRefresh(): void {
    this.detenerAutoRefresh();
    
    const intervalo = this.configuracionForm.get('intervaloRefresh')?.value || 30;
    const intervalId = window.setInterval(() => {
      this.cargarEventos();
    }, intervalo * 1000);
    
    this._intervalId.set(intervalId);
    this._autoRefreshActivo.set(true);
  }

  detenerAutoRefresh(): void {
    const intervalId = this._intervalId();
    if (intervalId) {
      clearInterval(intervalId);
      this._intervalId.set(null);
    }
    this._autoRefreshActivo.set(false);
  }

  // Métodos de exportación
  async exportarEventos(formato: 'csv' | 'excel' | 'pdf' | 'json'): Promise<void> {
    try {
      const config: ExportacionAuditoria = {
        formato,
        filtros: this.auditoriaService.filtros(),
        incluirDetalles: this.configuracionForm.get('mostrarDetalles')?.value || false,
        incluirEstadisticas: true
      };
      
      await this.auditoriaService.exportarEventos(config);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  }

  // Métodos de análisis
  async analizarPatrones(): Promise<void> {
    try {
      const patrones = await this.auditoriaService.analizarPatrones();
      // Mostrar resultados en un diálogo o vista específica
      console.log('Patrones detectados:', patrones);
    } catch (error) {
      console.error('Error al analizar patrones:', error);
    }
  }

  async generarReporte(tipo: 'seguridad' | 'actividad' | 'errores' | 'completo'): Promise<void> {
    try {
      const reporte = await this.auditoriaService.generarReporte(tipo);
      // Mostrar o descargar el reporte
      console.log('Reporte generado:', reporte);
    } catch (error) {
      console.error('Error al generar reporte:', error);
    }
  }

  // Métodos de utilidad
  obtenerIconoSeveridad(severidad: string): string {
    const iconos: { [key: string]: string } = {
      'info': 'info',
      'warning': 'warning',
      'error': 'error',
      'critical': 'dangerous'
    };
    return iconos[severidad] || 'info';
  }

  obtenerColorSeveridad(severidad: string): string {
    const colores: { [key: string]: string } = {
      'info': 'primary',
      'warning': 'accent',
      'error': 'warn',
      'critical': 'warn'
    };
    return colores[severidad] || 'primary';
  }

  obtenerIconoTipo(tipo: string): string {
    return this.auditoriaService.obtenerIconoEvento(tipo, 'info');
  }

  formatearFecha(fecha: Date): string {
    return this.auditoriaService.formatearFecha(fecha);
  }

  formatearDuracion(inicio: Date, fin: Date): string {
    const diff = fin.getTime() - inicio.getTime();
    const minutos = Math.floor(diff / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    return `${minutos}m ${segundos}s`;
  }

  // Métodos de trackBy para optimización
  trackByEventoId(index: number, evento: EventoAuditoria): string {
    return evento.id;
  }

  trackByTimelineId(index: number, item: TimelineEvento): string {
    return item.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}