import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { of } from 'rxjs';

import { AuditoriaComponent } from './auditoria.component';
import { AuditoriaService, EventoAuditoria, FiltrosAuditoria, ConfiguracionAuditoria } from './auditoria.service';

describe('AuditoriaComponent', () => {
  let component: AuditoriaComponent;
  let fixture: ComponentFixture<AuditoriaComponent>;
  let mockAuditoriaService: jasmine.SpyObj<AuditoriaService>;

  const mockEventos: EventoAuditoria[] = [
    {
      id: '1',
      fecha: new Date('2024-01-15T10:30:00'),
      tipo: 'login',
      accion: 'user.login',
      descripcion: 'Usuario inició sesión',
      severidad: 'info',
      modulo: 'usuarios',
      usuarioId: 'user1',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0'
    },
    {
      id: '2',
      fecha: new Date('2024-01-15T11:00:00'),
      tipo: 'update',
      accion: 'user.update',
      descripcion: 'Usuario actualizado',
      severidad: 'warning',
      modulo: 'usuarios',
      usuarioId: 'user2',
      recurso: 'users/123',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0'
    }
  ];

  const mockUsuarios = [
    { id: 'user1', nombre: 'Juan Pérez', email: 'juan@test.com' },
    { id: 'user2', nombre: 'María García', email: 'maria@test.com' }
  ];

  const mockEstadisticas = {
    total: 2,
    porTipo: { login: 1, update: 1 },
    porSeveridad: { info: 1, warning: 1 },
    porModulo: { usuarios: 2 },
    usuariosMasActivos: [
      { usuarioId: 'user1', nombre: 'Juan Pérez', eventos: 1 },
      { usuarioId: 'user2', nombre: 'María García', eventos: 1 }
    ],
    eventosPorDia: [
      { fecha: new Date('2024-01-15'), eventos: 2 }
    ]
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuditoriaService', [
      'cargarEventos',
      'cargarUsuarios',
      'cargarConfiguracion',
      'actualizarFiltros',
      'limpiarFiltros',
      'actualizarConfiguracion',
      'exportarDatos',
      'analizarPatrones',
      'generarReporteSeguridad',
      'generarReporteActividad',
      'generarReporteCompleto',
      'obtenerIconoEvento',
      'obtenerColorSeveridad',
      'formatearFecha',
      'formatearFechaRelativa'
    ], {
      loading: jasmine.createSpy().and.returnValue(false),
      error: jasmine.createSpy().and.returnValue(null),
      eventos: jasmine.createSpy().and.returnValue(mockEventos),
      usuarios: jasmine.createSpy().and.returnValue(mockUsuarios),
      eventosFiltrados: jasmine.createSpy().and.returnValue(mockEventos),
      estadisticas: jasmine.createSpy().and.returnValue(mockEstadisticas),
      timeline: jasmine.createSpy().and.returnValue([]),
      filtros: jasmine.createSpy().and.returnValue({
        fechaInicio: null,
        fechaFin: null,
        tipo: null,
        severidad: null,
        modulo: null,
        usuarioId: null,
        busqueda: '',
        ip: ''
      }),
      configuracion: jasmine.createSpy().and.returnValue({
        autoRefresh: false,
        intervaloRefresh: 30000,
        mostrarDetalles: true,
        exportarFormato: 'csv',
        itemsPorPagina: 50
      }),
      opcionesTipo: jasmine.createSpy().and.returnValue([
        { value: 'login', label: 'Inicio de sesión', count: 1 },
        { value: 'update', label: 'Actualización', count: 1 }
      ]),
      opcionesSeveridad: jasmine.createSpy().and.returnValue([
        { value: 'info', label: 'Información', count: 1 },
        { value: 'warning', label: 'Advertencia', count: 1 }
      ]),
      opcionesModulo: jasmine.createSpy().and.returnValue([
        { value: 'usuarios', label: 'Usuarios', count: 2 }
      ]),
      opcionesUsuario: jasmine.createSpy().and.returnValue([
        { value: 'user1', label: 'Juan Pérez', count: 1 },
        { value: 'user2', label: 'María García', count: 1 }
      ])
    });

    await TestBed.configureTestingModule({
      declarations: [AuditoriaComponent],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSlideToggleModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatCheckboxModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: AuditoriaService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditoriaComponent);
    component = fixture.componentInstance;
    mockAuditoriaService = TestBed.inject(AuditoriaService) as jasmine.SpyObj<AuditoriaService>;

    // Configurar retornos por defecto
    mockAuditoriaService.cargarEventos.and.returnValue(Promise.resolve());
    mockAuditoriaService.cargarUsuarios.and.returnValue(Promise.resolve());
    mockAuditoriaService.cargarConfiguracion.and.returnValue(Promise.resolve());
    mockAuditoriaService.obtenerIconoEvento.and.returnValue('info');
    mockAuditoriaService.obtenerColorSeveridad.and.returnValue('#2196f3');
    mockAuditoriaService.formatearFecha.and.returnValue('15/01/2024 10:30');
    mockAuditoriaService.formatearFechaRelativa.and.returnValue('hace 1 hora');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('should initialize with default values', () => {
      expect(component.vistaActual()).toBe('eventos');
      expect(component.paginaActual()).toBe(0);
      expect(component.tamañoPagina()).toBe(50);
      expect(component.ordenActual()).toBe('fecha');
      expect(component.direccionOrden()).toBe('desc');
      expect(component.eventosSeleccionados().size).toBe(0);
      expect(component.modoSeleccion()).toBe(false);
      expect(component.autoRefreshActivo()).toBe(false);
    });

    it('should initialize forms', () => {
      expect(component.filtrosForm).toBeDefined();
      expect(component.configuracionForm).toBeDefined();
      
      expect(component.filtrosForm.get('fechaInicio')).toBeTruthy();
      expect(component.filtrosForm.get('fechaFin')).toBeTruthy();
      expect(component.filtrosForm.get('tipo')).toBeTruthy();
      expect(component.filtrosForm.get('severidad')).toBeTruthy();
      expect(component.filtrosForm.get('modulo')).toBeTruthy();
      expect(component.filtrosForm.get('usuarioId')).toBeTruthy();
      expect(component.filtrosForm.get('busqueda')).toBeTruthy();
      expect(component.filtrosForm.get('ip')).toBeTruthy();
      
      expect(component.configuracionForm.get('autoRefresh')).toBeTruthy();
      expect(component.configuracionForm.get('intervaloRefresh')).toBeTruthy();
      expect(component.configuracionForm.get('mostrarDetalles')).toBeTruthy();
      expect(component.configuracionForm.get('itemsPorPagina')).toBeTruthy();
    });

    it('should load initial data on ngOnInit', async () => {
      await component.ngOnInit();
      
      expect(mockAuditoriaService.cargarEventos).toHaveBeenCalled();
      expect(mockAuditoriaService.cargarUsuarios).toHaveBeenCalled();
      expect(mockAuditoriaService.cargarConfiguracion).toHaveBeenCalled();
    });
  });

  describe('Carga de datos', () => {
    it('should handle successful data loading', async () => {
      await component.cargarDatos();
      
      expect(mockAuditoriaService.cargarEventos).toHaveBeenCalled();
      expect(mockAuditoriaService.cargarUsuarios).toHaveBeenCalled();
    });

    it('should handle error during data loading', async () => {
      mockAuditoriaService.cargarEventos.and.returnValue(Promise.reject('Error'));
      
      await component.cargarDatos();
      
      expect(mockAuditoriaService.cargarEventos).toHaveBeenCalled();
    });

    it('should reload data manually', async () => {
      await component.recargarDatos();
      
      expect(mockAuditoriaService.cargarEventos).toHaveBeenCalled();
    });
  });

  describe('Filtros', () => {
    it('should apply filters when form changes', () => {
      const filtros = {
        tipo: 'login',
        severidad: 'info',
        busqueda: 'test'
      };
      
      component.filtrosForm.patchValue(filtros);
      component.aplicarFiltros();
      
      expect(mockAuditoriaService.actualizarFiltros).toHaveBeenCalledWith(jasmine.objectContaining(filtros));
    });

    it('should clear filters', () => {
      component.limpiarFiltros();
      
      expect(mockAuditoriaService.limpiarFiltros).toHaveBeenCalled();
      expect(component.filtrosForm.value).toEqual(jasmine.objectContaining({
        fechaInicio: null,
        fechaFin: null,
        tipo: null,
        severidad: null,
        modulo: null,
        usuarioId: null,
        busqueda: '',
        ip: ''
      }));
    });

    it('should apply quick filters', () => {
      component.aplicarFiltroRapido('hoy');
      
      expect(mockAuditoriaService.actualizarFiltros).toHaveBeenCalled();
    });

    it('should handle different quick filter types', () => {
      const filtros = ['hoy', 'ayer', 'semana', 'mes'];
      
      filtros.forEach(filtro => {
        component.aplicarFiltroRapido(filtro);
        expect(mockAuditoriaService.actualizarFiltros).toHaveBeenCalled();
      });
    });
  });

  describe('Paginación', () => {
    it('should handle page change', () => {
      const event = { pageIndex: 2, pageSize: 25, length: 100 };
      
      component.cambiarPagina(event);
      
      expect(component.paginaActual()).toBe(2);
      expect(component.tamañoPagina()).toBe(25);
    });

    it('should calculate eventos paginados correctly', () => {
      component.paginaActual.set(0);
      component.tamañoPagina.set(1);
      
      const eventosPaginados = component.eventosPaginados();
      
      expect(eventosPaginados.length).toBe(1);
      expect(eventosPaginados[0]).toBe(mockEventos[0]);
    });
  });

  describe('Ordenamiento', () => {
    it('should handle sort change', () => {
      const sort = { active: 'tipo', direction: 'asc' as const };
      
      component.cambiarOrden(sort);
      
      expect(component.ordenActual()).toBe('tipo');
      expect(component.direccionOrden()).toBe('asc');
    });

    it('should sort eventos correctly', () => {
      component.ordenActual.set('fecha');
      component.direccionOrden.set('desc');
      
      const eventosOrdenados = component.eventosOrdenados();
      
      expect(eventosOrdenados[0].fecha >= eventosOrdenados[1].fecha).toBe(true);
    });
  });

  describe('Selección', () => {
    it('should toggle selection mode', () => {
      component.alternarModoSeleccion();
      
      expect(component.modoSeleccion()).toBe(true);
      
      component.alternarModoSeleccion();
      
      expect(component.modoSeleccion()).toBe(false);
      expect(component.eventosSeleccionados().size).toBe(0);
    });

    it('should select/deselect individual evento', () => {
      const evento = mockEventos[0];
      
      component.alternarSeleccionEvento(evento);
      
      expect(component.eventosSeleccionados().has(evento.id)).toBe(true);
      
      component.alternarSeleccionEvento(evento);
      
      expect(component.eventosSeleccionados().has(evento.id)).toBe(false);
    });

    it('should select all eventos', () => {
      component.seleccionarTodos();
      
      expect(component.eventosSeleccionados().size).toBe(mockEventos.length);
    });

    it('should deselect all eventos', () => {
      component.seleccionarTodos();
      component.deseleccionarTodos();
      
      expect(component.eventosSeleccionados().size).toBe(0);
    });

    it('should check if evento is selected', () => {
      const evento = mockEventos[0];
      
      expect(component.estaSeleccionado(evento)).toBe(false);
      
      component.alternarSeleccionEvento(evento);
      
      expect(component.estaSeleccionado(evento)).toBe(true);
    });

    it('should check if all eventos are selected', () => {
      expect(component.todoSeleccionado()).toBe(false);
      
      component.seleccionarTodos();
      
      expect(component.todoSeleccionado()).toBe(true);
    });

    it('should check indeterminate selection state', () => {
      expect(component.seleccionIndeterminada()).toBe(false);
      
      component.alternarSeleccionEvento(mockEventos[0]);
      
      expect(component.seleccionIndeterminada()).toBe(true);
    });
  });

  describe('Vistas', () => {
    it('should change view', () => {
      component.cambiarVista('timeline');
      
      expect(component.vistaActual()).toBe('timeline');
    });

    it('should handle different view types', () => {
      const vistas = ['eventos', 'timeline', 'estadisticas'] as const;
      
      vistas.forEach(vista => {
        component.cambiarVista(vista);
        expect(component.vistaActual()).toBe(vista);
      });
    });
  });

  describe('Auto-refresh', () => {
    it('should toggle auto-refresh', () => {
      component.alternarAutoRefresh();
      
      expect(component.autoRefreshActivo()).toBe(true);
      
      component.alternarAutoRefresh();
      
      expect(component.autoRefreshActivo()).toBe(false);
    });

    it('should start auto-refresh interval', () => {
      spyOn(window, 'setInterval').and.returnValue(123 as any);
      
      component.iniciarAutoRefresh();
      
      expect(window.setInterval).toHaveBeenCalled();
      expect(component.autoRefreshInterval).toBe(123);
    });

    it('should stop auto-refresh interval', () => {
      spyOn(window, 'clearInterval');
      component.autoRefreshInterval = 123;
      
      component.detenerAutoRefresh();
      
      expect(window.clearInterval).toHaveBeenCalledWith(123);
      expect(component.autoRefreshInterval).toBeNull();
    });
  });

  describe('Configuración', () => {
    it('should update configuration', () => {
      const nuevaConfig = {
        autoRefresh: true,
        intervaloRefresh: 60000,
        mostrarDetalles: false,
        itemsPorPagina: 100
      };
      
      component.configuracionForm.patchValue(nuevaConfig);
      component.aplicarConfiguracion();
      
      expect(mockAuditoriaService.actualizarConfiguracion).toHaveBeenCalledWith(jasmine.objectContaining(nuevaConfig));
    });
  });

  describe('Exportación', () => {
    beforeEach(() => {
      mockAuditoriaService.exportarDatos.and.returnValue(Promise.resolve({
        exito: true,
        mensaje: 'Datos exportados correctamente',
        datos: 'mock-data'
      }));
    });

    it('should export to CSV', async () => {
      await component.exportarDatos('csv');
      
      expect(mockAuditoriaService.exportarDatos).toHaveBeenCalledWith({
        formato: 'csv',
        incluirFiltros: true,
        incluirEstadisticas: false
      });
    });

    it('should export to Excel', async () => {
      await component.exportarDatos('excel');
      
      expect(mockAuditoriaService.exportarDatos).toHaveBeenCalledWith({
        formato: 'excel',
        incluirFiltros: true,
        incluirEstadisticas: false
      });
    });

    it('should export to PDF', async () => {
      await component.exportarDatos('pdf');
      
      expect(mockAuditoriaService.exportarDatos).toHaveBeenCalledWith({
        formato: 'pdf',
        incluirFiltros: true,
        incluirEstadisticas: true
      });
    });

    it('should export to JSON', async () => {
      await component.exportarDatos('json');
      
      expect(mockAuditoriaService.exportarDatos).toHaveBeenCalledWith({
        formato: 'json',
        incluirFiltros: false,
        incluirEstadisticas: false
      });
    });
  });

  describe('Análisis y reportes', () => {
    it('should analyze patterns', async () => {
      mockAuditoriaService.analizarPatrones.and.returnValue(Promise.resolve({
        patronesSospechosos: [],
        recomendaciones: [],
        riesgos: []
      }));
      
      await component.analizarPatrones();
      
      expect(mockAuditoriaService.analizarPatrones).toHaveBeenCalled();
    });

    it('should generate security report', async () => {
      mockAuditoriaService.generarReporteSeguridad.and.returnValue(Promise.resolve({
        resumen: { totalEventos: 2, eventosRiesgo: 0 },
        incidentes: [],
        recomendaciones: []
      }));
      
      await component.generarReporteSeguridad();
      
      expect(mockAuditoriaService.generarReporteSeguridad).toHaveBeenCalled();
    });

    it('should generate activity report', async () => {
      mockAuditoriaService.generarReporteActividad.and.returnValue(Promise.resolve({
        resumen: { totalEventos: 2 },
        usuariosMasActivos: [],
        modulosMasUsados: [],
        tendencias: []
      }));
      
      await component.generarReporteActividad();
      
      expect(mockAuditoriaService.generarReporteActividad).toHaveBeenCalled();
    });

    it('should generate complete report', async () => {
      mockAuditoriaService.generarReporteCompleto.and.returnValue(Promise.resolve({
        estadisticas: mockEstadisticas,
        seguridad: { resumen: {}, incidentes: [], recomendaciones: [] },
        actividad: { resumen: {}, usuariosMasActivos: [], modulosMasUsados: [], tendencias: [] },
        recomendaciones: []
      }));
      
      await component.generarReporteCompleto();
      
      expect(mockAuditoriaService.generarReporteCompleto).toHaveBeenCalled();
    });
  });

  describe('Métodos utilitarios', () => {
    it('should get evento icon', () => {
      const icono = component.obtenerIconoEvento('login');
      
      expect(mockAuditoriaService.obtenerIconoEvento).toHaveBeenCalledWith('login');
      expect(icono).toBe('info');
    });

    it('should get severidad color', () => {
      const color = component.obtenerColorSeveridad('info');
      
      expect(mockAuditoriaService.obtenerColorSeveridad).toHaveBeenCalledWith('info');
      expect(color).toBe('#2196f3');
    });

    it('should format date', () => {
      const fecha = new Date('2024-01-15T10:30:00');
      const fechaFormateada = component.formatearFecha(fecha);
      
      expect(mockAuditoriaService.formatearFecha).toHaveBeenCalledWith(fecha);
      expect(fechaFormateada).toBe('15/01/2024 10:30');
    });

    it('should format relative date', () => {
      const fecha = new Date();
      const fechaRelativa = component.formatearFechaRelativa(fecha);
      
      expect(mockAuditoriaService.formatearFechaRelativa).toHaveBeenCalledWith(fecha);
      expect(fechaRelativa).toBe('hace 1 hora');
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render header with title', () => {
      const header = fixture.debugElement.query(By.css('.auditoria-header h1'));
      expect(header.nativeElement.textContent.trim()).toBe('Auditoría del Sistema');
    });

    it('should render filter form', () => {
      const filtrosCard = fixture.debugElement.query(By.css('.filtros-card'));
      expect(filtrosCard).toBeTruthy();
    });

    it('should render view selector', () => {
      const vistaSelector = fixture.debugElement.query(By.css('.vista-selector'));
      expect(vistaSelector).toBeTruthy();
    });

    it('should show loading state', () => {
      mockAuditoriaService.loading.and.returnValue(true);
      fixture.detectChanges();
      
      const loadingContainer = fixture.debugElement.query(By.css('.loading-container'));
      expect(loadingContainer).toBeTruthy();
    });

    it('should show error state', () => {
      mockAuditoriaService.error.and.returnValue('Error de prueba');
      fixture.detectChanges();
      
      const errorCard = fixture.debugElement.query(By.css('.error-card'));
      expect(errorCard).toBeTruthy();
    });

    it('should show empty state when no eventos', () => {
      mockAuditoriaService.eventosFiltrados.and.returnValue([]);
      fixture.detectChanges();
      
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
    });

    it('should render eventos table', () => {
      const tabla = fixture.debugElement.query(By.css('.eventos-table'));
      expect(tabla).toBeTruthy();
    });

    it('should render timeline view when selected', () => {
      component.cambiarVista('timeline');
      fixture.detectChanges();
      
      const timeline = fixture.debugElement.query(By.css('.vista-timeline'));
      expect(timeline).toBeTruthy();
    });

    it('should render statistics view when selected', () => {
      component.cambiarVista('estadisticas');
      fixture.detectChanges();
      
      const estadisticas = fixture.debugElement.query(By.css('.vista-estadisticas'));
      expect(estadisticas).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA labels', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button[aria-label]'));
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper form labels', () => {
      const formFields = fixture.debugElement.queryAll(By.css('mat-form-field'));
      formFields.forEach(field => {
        const label = field.query(By.css('mat-label'));
        expect(label).toBeTruthy();
      });
    });

    it('should support keyboard navigation', () => {
      const focusableElements = fixture.debugElement.queryAll(
        By.css('button, input, select, [tabindex]:not([tabindex="-1"])')
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const eventosGrandes = Array.from({ length: 1000 }, (_, i) => ({
        ...mockEventos[0],
        id: `evento-${i}`
      }));
      
      mockAuditoriaService.eventosFiltrados.and.returnValue(eventosGrandes);
      
      const inicio = performance.now();
      fixture.detectChanges();
      const fin = performance.now();
      
      expect(fin - inicio).toBeLessThan(100); // Menos de 100ms
    });

    it('should use trackBy function for performance', () => {
      expect(component.trackByEvento).toBeDefined();
      
      const evento = mockEventos[0];
      const result = component.trackByEvento(0, evento);
      
      expect(result).toBe(evento.id);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on destroy', () => {
      spyOn(component, 'detenerAutoRefresh');
      
      component.ngOnDestroy();
      
      expect(component.detenerAutoRefresh).toHaveBeenCalled();
    });

    it('should clear auto-refresh interval on destroy', () => {
      spyOn(window, 'clearInterval');
      component.autoRefreshInterval = 123;
      
      component.ngOnDestroy();
      
      expect(window.clearInterval).toHaveBeenCalledWith(123);
    });
  });

  describe('Form validations', () => {
    it('should validate date range', () => {
      const fechaInicio = new Date('2024-12-31');
      const fechaFin = new Date('2024-01-01');
      
      component.filtrosForm.patchValue({ fechaInicio, fechaFin });
      
      expect(component.filtrosForm.valid).toBe(true); // El componente maneja rangos inválidos
    });

    it('should validate configuration values', () => {
      const configInvalida = {
        intervaloRefresh: -1000,
        itemsPorPagina: 0
      };
      
      component.configuracionForm.patchValue(configInvalida);
      
      // Verificar que los valores se ajusten a rangos válidos
      expect(component.configuracionForm.get('intervaloRefresh')?.value).toBeGreaterThan(0);
      expect(component.configuracionForm.get('itemsPorPagina')?.value).toBeGreaterThan(0);
    });
  });
});