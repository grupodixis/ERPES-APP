import { TestBed } from '@angular/core/testing';
import { AuditoriaService, EventoAuditoria, FiltrosAuditoria, EstadisticasAuditoria, TimelineEvento, ConfiguracionAuditoria, ExportacionAuditoria } from './auditoria.service';
import { LogSeguridad } from '../seguridad.types';

describe('AuditoriaService', () => {
  let service: AuditoriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditoriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Estado inicial', () => {
    it('should initialize with default state', () => {
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
      expect(service.eventos()).toEqual([]);
      expect(service.usuarios()).toEqual([]);
      expect(service.filtros()).toEqual({
        fechaInicio: null,
        fechaFin: null,
        tipo: null,
        severidad: null,
        modulo: null,
        usuarioId: null,
        busqueda: '',
        ip: ''
      });
      expect(service.configuracion()).toEqual({
        autoRefresh: false,
        intervaloRefresh: 30000,
        mostrarDetalles: true,
        exportarFormato: 'csv',
        itemsPorPagina: 50
      });
    });

    it('should have computed signals with initial values', () => {
      expect(service.eventosFiltrados()).toEqual([]);
      expect(service.estadisticas()).toEqual({
        total: 0,
        porTipo: {},
        porSeveridad: {},
        porModulo: {},
        usuariosMasActivos: [],
        eventosPorDia: []
      });
      expect(service.timeline()).toEqual([]);
      expect(service.opcionesTipo()).toEqual([]);
      expect(service.opcionesSeveridad()).toEqual([]);
      expect(service.opcionesModulo()).toEqual([]);
      expect(service.opcionesUsuario()).toEqual([]);
    });
  });

  describe('Carga de datos', () => {
    it('should load eventos successfully', async () => {
      const loadPromise = service.cargarEventos();
      expect(service.loading()).toBe(true);
      
      await loadPromise;
      
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
      expect(service.eventos().length).toBeGreaterThan(0);
    });

    it('should handle error when loading eventos', async () => {
      // Simular error en la carga
      spyOn(service as any, 'generarEventosMock').and.throwError('Network error');
      
      await service.cargarEventos();
      
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Error al cargar eventos de auditoría');
      expect(service.eventos()).toEqual([]);
    });

    it('should load usuarios successfully', async () => {
      await service.cargarUsuarios();
      
      expect(service.usuarios().length).toBeGreaterThan(0);
      const usuario = service.usuarios()[0];
      expect(usuario).toHaveProperty('id');
      expect(usuario).toHaveProperty('nombre');
      expect(usuario).toHaveProperty('email');
    });

    it('should load configuracion successfully', async () => {
      await service.cargarConfiguracion();
      
      const config = service.configuracion();
      expect(config.autoRefresh).toBeDefined();
      expect(config.intervaloRefresh).toBeDefined();
      expect(config.mostrarDetalles).toBeDefined();
      expect(config.exportarFormato).toBeDefined();
      expect(config.itemsPorPagina).toBeDefined();
    });
  });

  describe('Filtros', () => {
    beforeEach(async () => {
      await service.cargarEventos();
    });

    it('should update filtros', () => {
      const nuevosFiltros: Partial<FiltrosAuditoria> = {
        tipo: 'login',
        severidad: 'info',
        busqueda: 'test'
      };
      
      service.actualizarFiltros(nuevosFiltros);
      
      const filtros = service.filtros();
      expect(filtros.tipo).toBe('login');
      expect(filtros.severidad).toBe('info');
      expect(filtros.busqueda).toBe('test');
    });

    it('should filter eventos by tipo', () => {
      service.actualizarFiltros({ tipo: 'login' });
      
      const eventosFiltrados = service.eventosFiltrados();
      eventosFiltrados.forEach(evento => {
        expect(evento.tipo).toBe('login');
      });
    });

    it('should filter eventos by severidad', () => {
      service.actualizarFiltros({ severidad: 'error' });
      
      const eventosFiltrados = service.eventosFiltrados();
      eventosFiltrados.forEach(evento => {
        expect(evento.severidad).toBe('error');
      });
    });

    it('should filter eventos by modulo', () => {
      service.actualizarFiltros({ modulo: 'usuarios' });
      
      const eventosFiltrados = service.eventosFiltrados();
      eventosFiltrados.forEach(evento => {
        expect(evento.modulo).toBe('usuarios');
      });
    });

    it('should filter eventos by usuarioId', () => {
      const primerEvento = service.eventos()[0];
      if (primerEvento.usuarioId) {
        service.actualizarFiltros({ usuarioId: primerEvento.usuarioId });
        
        const eventosFiltrados = service.eventosFiltrados();
        eventosFiltrados.forEach(evento => {
          expect(evento.usuarioId).toBe(primerEvento.usuarioId);
        });
      }
    });

    it('should filter eventos by fecha range', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-12-31');
      
      service.actualizarFiltros({ fechaInicio, fechaFin });
      
      const eventosFiltrados = service.eventosFiltrados();
      eventosFiltrados.forEach(evento => {
        expect(evento.fecha >= fechaInicio).toBe(true);
        expect(evento.fecha <= fechaFin).toBe(true);
      });
    });

    it('should filter eventos by busqueda text', () => {
      const busqueda = 'login';
      service.actualizarFiltros({ busqueda });
      
      const eventosFiltrados = service.eventosFiltrados();
      eventosFiltrados.forEach(evento => {
        const textoCompleto = `${evento.accion} ${evento.descripcion} ${evento.recurso || ''} ${evento.detalles || ''}`;
        expect(textoCompleto.toLowerCase().includes(busqueda.toLowerCase())).toBe(true);
      });
    });

    it('should filter eventos by IP', () => {
      const ip = '192.168.1.1';
      service.actualizarFiltros({ ip });
      
      const eventosFiltrados = service.eventosFiltrados();
      eventosFiltrados.forEach(evento => {
        expect(evento.ip).toBe(ip);
      });
    });

    it('should reset filtros', () => {
      service.actualizarFiltros({ tipo: 'login', severidad: 'error' });
      service.limpiarFiltros();
      
      const filtros = service.filtros();
      expect(filtros.tipo).toBeNull();
      expect(filtros.severidad).toBeNull();
      expect(filtros.busqueda).toBe('');
    });
  });

  describe('Estadísticas', () => {
    beforeEach(async () => {
      await service.cargarEventos();
    });

    it('should calculate estadisticas correctly', () => {
      const estadisticas = service.estadisticas();
      
      expect(estadisticas.total).toBe(service.eventos().length);
      expect(typeof estadisticas.porTipo).toBe('object');
      expect(typeof estadisticas.porSeveridad).toBe('object');
      expect(typeof estadisticas.porModulo).toBe('object');
      expect(Array.isArray(estadisticas.usuariosMasActivos)).toBe(true);
      expect(Array.isArray(estadisticas.eventosPorDia)).toBe(true);
    });

    it('should update estadisticas when eventos change', () => {
      const estadisticasIniciales = service.estadisticas();
      
      service.actualizarFiltros({ tipo: 'login' });
      const estadisticasFiltradas = service.estadisticas();
      
      expect(estadisticasFiltradas.total).toBeLessThanOrEqual(estadisticasIniciales.total);
    });
  });

  describe('Timeline', () => {
    beforeEach(async () => {
      await service.cargarEventos();
    });

    it('should generate timeline correctly', () => {
      const timeline = service.timeline();
      
      expect(Array.isArray(timeline)).toBe(true);
      
      if (timeline.length > 0) {
        const item = timeline[0];
        expect(item).toHaveProperty('fecha');
        expect(item).toHaveProperty('eventos');
        expect(Array.isArray(item.eventos)).toBe(true);
      }
    });

    it('should group eventos by date in timeline', () => {
      const timeline = service.timeline();
      
      timeline.forEach(item => {
        const fechaItem = item.fecha.toDateString();
        item.eventos.forEach(evento => {
          expect(evento.fecha.toDateString()).toBe(fechaItem);
        });
      });
    });

    it('should sort timeline by date descending', () => {
      const timeline = service.timeline();
      
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i-1].fecha >= timeline[i].fecha).toBe(true);
      }
    });
  });

  describe('Opciones únicas', () => {
    beforeEach(async () => {
      await service.cargarEventos();
    });

    it('should provide unique tipo options', () => {
      const opciones = service.opcionesTipo();
      const tiposUnicos = new Set(opciones.map(o => o.value));
      
      expect(opciones.length).toBe(tiposUnicos.size);
      opciones.forEach(opcion => {
        expect(opcion).toHaveProperty('value');
        expect(opcion).toHaveProperty('label');
        expect(opcion).toHaveProperty('count');
      });
    });

    it('should provide unique severidad options', () => {
      const opciones = service.opcionesSeveridad();
      const severidadesUnicas = new Set(opciones.map(o => o.value));
      
      expect(opciones.length).toBe(severidadesUnicas.size);
    });

    it('should provide unique modulo options', () => {
      const opciones = service.opcionesModulo();
      const modulosUnicos = new Set(opciones.map(o => o.value));
      
      expect(opciones.length).toBe(modulosUnicos.size);
    });

    it('should provide unique usuario options', async () => {
      await service.cargarUsuarios();
      const opciones = service.opcionesUsuario();
      const usuariosUnicos = new Set(opciones.map(o => o.value));
      
      expect(opciones.length).toBe(usuariosUnicos.size);
    });
  });

  describe('Configuración', () => {
    it('should update configuracion', () => {
      const nuevaConfig: Partial<ConfiguracionAuditoria> = {
        autoRefresh: true,
        intervaloRefresh: 60000,
        mostrarDetalles: false
      };
      
      service.actualizarConfiguracion(nuevaConfig);
      
      const config = service.configuracion();
      expect(config.autoRefresh).toBe(true);
      expect(config.intervaloRefresh).toBe(60000);
      expect(config.mostrarDetalles).toBe(false);
    });
  });

  describe('Exportación', () => {
    beforeEach(async () => {
      await service.cargarEventos();
    });

    it('should export to CSV', async () => {
      const opciones: ExportacionAuditoria = {
        formato: 'csv',
        incluirFiltros: true,
        incluirEstadisticas: false
      };
      
      const resultado = await service.exportarDatos(opciones);
      
      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toContain('CSV');
      expect(resultado.datos).toBeDefined();
    });

    it('should export to Excel', async () => {
      const opciones: ExportacionAuditoria = {
        formato: 'excel',
        incluirFiltros: false,
        incluirEstadisticas: true
      };
      
      const resultado = await service.exportarDatos(opciones);
      
      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toContain('Excel');
    });

    it('should export to PDF', async () => {
      const opciones: ExportacionAuditoria = {
        formato: 'pdf',
        incluirFiltros: true,
        incluirEstadisticas: true
      };
      
      const resultado = await service.exportarDatos(opciones);
      
      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toContain('PDF');
    });

    it('should export to JSON', async () => {
      const opciones: ExportacionAuditoria = {
        formato: 'json',
        incluirFiltros: false,
        incluirEstadisticas: false
      };
      
      const resultado = await service.exportarDatos(opciones);
      
      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toContain('JSON');
      expect(resultado.datos).toBeDefined();
    });
  });

  describe('Análisis de patrones', () => {
    beforeEach(async () => {
      await service.cargarEventos();
    });

    it('should analyze security patterns', async () => {
      const analisis = await service.analizarPatrones();
      
      expect(analisis).toHaveProperty('patronesSospechosos');
      expect(analisis).toHaveProperty('recomendaciones');
      expect(analisis).toHaveProperty('riesgos');
      expect(Array.isArray(analisis.patronesSospechosos)).toBe(true);
      expect(Array.isArray(analisis.recomendaciones)).toBe(true);
      expect(Array.isArray(analisis.riesgos)).toBe(true);
    });
  });

  describe('Reportes', () => {
    beforeEach(async () => {
      await service.cargarEventos();
    });

    it('should generate security report', async () => {
      const reporte = await service.generarReporteSeguridad();
      
      expect(reporte).toHaveProperty('resumen');
      expect(reporte).toHaveProperty('incidentes');
      expect(reporte).toHaveProperty('recomendaciones');
      expect(reporte.resumen).toHaveProperty('totalEventos');
      expect(reporte.resumen).toHaveProperty('eventosRiesgo');
      expect(Array.isArray(reporte.incidentes)).toBe(true);
      expect(Array.isArray(reporte.recomendaciones)).toBe(true);
    });

    it('should generate activity report', async () => {
      const reporte = await service.generarReporteActividad();
      
      expect(reporte).toHaveProperty('resumen');
      expect(reporte).toHaveProperty('usuariosMasActivos');
      expect(reporte).toHaveProperty('modulosMasUsados');
      expect(reporte).toHaveProperty('tendencias');
      expect(Array.isArray(reporte.usuariosMasActivos)).toBe(true);
      expect(Array.isArray(reporte.modulosMasUsados)).toBe(true);
    });

    it('should generate complete report', async () => {
      const reporte = await service.generarReporteCompleto();
      
      expect(reporte).toHaveProperty('estadisticas');
      expect(reporte).toHaveProperty('seguridad');
      expect(reporte).toHaveProperty('actividad');
      expect(reporte).toHaveProperty('recomendaciones');
    });
  });

  describe('Métodos utilitarios', () => {
    it('should get correct icon for evento type', () => {
      expect(service.obtenerIconoEvento('login')).toBe('login');
      expect(service.obtenerIconoEvento('logout')).toBe('logout');
      expect(service.obtenerIconoEvento('create')).toBe('add');
      expect(service.obtenerIconoEvento('update')).toBe('edit');
      expect(service.obtenerIconoEvento('delete')).toBe('delete');
      expect(service.obtenerIconoEvento('access_denied')).toBe('block');
      expect(service.obtenerIconoEvento('unknown')).toBe('help_outline');
    });

    it('should get correct color for severidad', () => {
      expect(service.obtenerColorSeveridad('info')).toBe('#2196f3');
      expect(service.obtenerColorSeveridad('warning')).toBe('#ff9800');
      expect(service.obtenerColorSeveridad('error')).toBe('#f44336');
      expect(service.obtenerColorSeveridad('critical')).toBe('#d32f2f');
      expect(service.obtenerColorSeveridad('unknown')).toBe('#757575');
    });

    it('should format dates correctly', () => {
      const fecha = new Date('2024-01-15T10:30:00');
      const fechaFormateada = service.formatearFecha(fecha);
      
      expect(fechaFormateada).toContain('15/01/2024');
      expect(fechaFormateada).toContain('10:30');
    });

    it('should format relative dates correctly', () => {
      const ahora = new Date();
      const hace1Hora = new Date(ahora.getTime() - 60 * 60 * 1000);
      const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
      
      expect(service.formatearFechaRelativa(hace1Hora)).toContain('hace');
      expect(service.formatearFechaRelativa(ayer)).toContain('ayer');
    });
  });

  describe('Generación de datos mock', () => {
    it('should generate mock eventos with correct structure', () => {
      const eventos = (service as any).generarEventosMock();
      
      expect(Array.isArray(eventos)).toBe(true);
      expect(eventos.length).toBeGreaterThan(0);
      
      const evento = eventos[0];
      expect(evento).toHaveProperty('id');
      expect(evento).toHaveProperty('fecha');
      expect(evento).toHaveProperty('tipo');
      expect(evento).toHaveProperty('accion');
      expect(evento).toHaveProperty('descripcion');
      expect(evento).toHaveProperty('severidad');
      expect(evento).toHaveProperty('modulo');
      expect(evento).toHaveProperty('ip');
      expect(evento).toHaveProperty('userAgent');
    });

    it('should generate mock usuarios with correct structure', () => {
      const usuarios = (service as any).generarUsuariosMock();
      
      expect(Array.isArray(usuarios)).toBe(true);
      expect(usuarios.length).toBeGreaterThan(0);
      
      const usuario = usuarios[0];
      expect(usuario).toHaveProperty('id');
      expect(usuario).toHaveProperty('nombre');
      expect(usuario).toHaveProperty('email');
    });
  });

  describe('Validaciones', () => {
    it('should validate filtros correctly', () => {
      const filtrosValidos: FiltrosAuditoria = {
        fechaInicio: new Date('2024-01-01'),
        fechaFin: new Date('2024-12-31'),
        tipo: 'login',
        severidad: 'info',
        modulo: 'usuarios',
        usuarioId: '1',
        busqueda: 'test',
        ip: '192.168.1.1'
      };
      
      expect(() => service.actualizarFiltros(filtrosValidos)).not.toThrow();
    });

    it('should handle invalid date ranges', () => {
      const filtrosInvalidos = {
        fechaInicio: new Date('2024-12-31'),
        fechaFin: new Date('2024-01-01')
      };
      
      service.actualizarFiltros(filtrosInvalidos);
      const eventosFiltrados = service.eventosFiltrados();
      
      // Debería manejar el rango de fechas inválido sin errores
      expect(Array.isArray(eventosFiltrados)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      // Simular un dataset grande
      const eventosGrandes = Array.from({ length: 10000 }, (_, i) => ({
        id: `evento-${i}`,
        fecha: new Date(),
        tipo: 'login' as const,
        accion: 'user.login',
        descripcion: `Evento ${i}`,
        severidad: 'info' as const,
        modulo: 'usuarios',
        usuarioId: `user-${i % 100}`,
        ip: '192.168.1.1',
        userAgent: 'Test Agent'
      }));
      
      service['_eventos'].set(eventosGrandes);
      
      const inicio = performance.now();
      const eventosFiltrados = service.eventosFiltrados();
      const fin = performance.now();
      
      expect(eventosFiltrados.length).toBe(10000);
      expect(fin - inicio).toBeLessThan(100); // Menos de 100ms
    });

    it('should compute estadisticas efficiently with large datasets', async () => {
      const eventosGrandes = Array.from({ length: 5000 }, (_, i) => ({
        id: `evento-${i}`,
        fecha: new Date(),
        tipo: 'login' as const,
        accion: 'user.login',
        descripcion: `Evento ${i}`,
        severidad: 'info' as const,
        modulo: 'usuarios',
        usuarioId: `user-${i % 50}`,
        ip: '192.168.1.1',
        userAgent: 'Test Agent'
      }));
      
      service['_eventos'].set(eventosGrandes);
      
      const inicio = performance.now();
      const estadisticas = service.estadisticas();
      const fin = performance.now();
      
      expect(estadisticas.total).toBe(5000);
      expect(fin - inicio).toBeLessThan(50); // Menos de 50ms
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', () => {
      service.limpiarFiltros();
      
      expect(service.filtros()).toEqual({
        fechaInicio: null,
        fechaFin: null,
        tipo: null,
        severidad: null,
        modulo: null,
        usuarioId: null,
        busqueda: '',
        ip: ''
      });
    });
  });
});