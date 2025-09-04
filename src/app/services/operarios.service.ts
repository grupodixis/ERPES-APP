import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Operario,
  OperarioCreateDto,
  OperarioUpdateDto,
  OperarioFilter,
  CategoriaOperario,
  ContratoLaboral,
  ContratoLaboralCreateDto,
  SolicitudVacaciones,
  SolicitudVacacionesCreateDto,
  MarcaReloj,
  MarcaRelojCreateDto,
  EstadoContrato,
  EstadoSolicitudVacaciones,
  TipoContrato,
  TipoJornada
} from '../domain/rrhh.types';

@Injectable({
  providedIn: 'root'
})
export class OperariosService {
  private operarios: Operario[] = [
    {
      idOperario: 1,
      idEmpresa: 1,
      idPersona: 101,
      idCategoriaOperario: 1,
      fechaAlta: '2024-01-15',
      nss: '281234567890',
      fechaNacimiento: '1985-03-20',
      grupoCotizacion: '01',
      centroTrabajo: 'Oficina Central',
      ibanNomina: 'ES9121000418450200051332',
      emailCorporativo: 'juan.perez@empresa.com',
      telefonoEmpresa: '+34 600 123 456',
      costeHoraBase: 25.50,
      activo: true
    },
    {
      idOperario: 2,
      idEmpresa: 1,
      idPersona: 102,
      idCategoriaOperario: 2,
      fechaAlta: '2024-02-01',
      nss: '281234567891',
      fechaNacimiento: '1990-07-15',
      grupoCotizacion: '02',
      centroTrabajo: 'Almacén',
      ibanNomina: 'ES9121000418450200051333',
      emailCorporativo: 'maria.garcia@empresa.com',
      telefonoEmpresa: '+34 600 123 457',
      costeHoraBase: 22.00,
      activo: true
    },
    {
      idOperario: 3,
      idEmpresa: 1,
      idPersona: 103,
      idCategoriaOperario: 3,
      fechaAlta: '2024-01-10',
      nss: '281234567892',
      fechaNacimiento: '1988-11-30',
      grupoCotizacion: '01',
      centroTrabajo: 'Taller',
      ibanNomina: 'ES9121000418450200051334',
      emailCorporativo: 'carlos.lopez@empresa.com',
      telefonoEmpresa: '+34 600 123 458',
      costeHoraBase: 28.75,
      activo: true
    }
  ];

  private categorias: CategoriaOperario[] = [
    {
      idCategoriaOperario: 1,
      idEmpresa: 1,
      codigo: 'ADM',
      nombre: 'Administrativo',
      costeHoraBase: 25.00,
      activa: true
    },
    {
      idCategoriaOperario: 2,
      idEmpresa: 1,
      codigo: 'ALM',
      nombre: 'Almacenero',
      costeHoraBase: 22.00,
      activa: true
    },
    {
      idCategoriaOperario: 3,
      idEmpresa: 1,
      codigo: 'TEC',
      nombre: 'Técnico Especialista',
      costeHoraBase: 28.00,
      activa: true
    },
    {
      idCategoriaOperario: 4,
      idEmpresa: 1,
      codigo: 'OPE',
      nombre: 'Operario',
      costeHoraBase: 20.00,
      activa: true
    }
  ];

  private contratos: ContratoLaboral[] = [
    {
      idContrato: 1,
      idContratoLaboral: 1,
      idEmpresa: 1,
      idOperario: 1,
      fechaInicio: '2024-01-15',
      tipoContrato: TipoContrato.INDEFINIDO,
      categoriaProfesional: 'Administrativo',
      grupoCotizacion: '01',
      salarioBase: 2500.00,
      tipoJornadaHorasSemanal: 40,
      jornada: TipoJornada.COMPLETA,
      estado: EstadoContrato.ACTIVO,
      observaciones: 'Contrato inicial'
    },
    {
      idContrato: 2,
      idContratoLaboral: 2,
      idEmpresa: 1,
      idOperario: 2,
      fechaInicio: '2024-02-01',
      tipoContrato: TipoContrato.TEMPORAL,
      categoriaProfesional: 'Almacenero',
      grupoCotizacion: '02',
      salarioBase: 2200.00,
      tipoJornadaHorasSemanal: 40,
      jornada: TipoJornada.COMPLETA,
      estado: EstadoContrato.ACTIVO,
      observaciones: 'Contrato temporal 6 meses'
    }
  ];

  private solicitudesVacaciones: SolicitudVacaciones[] = [
    {
      idSolicitud: 1,
      idOperario: 1,
      fechaInicio: '2024-07-15',
      fechaFin: '2024-07-29',
      fechaSolicitud: '2024-06-15',
      estado: EstadoSolicitudVacaciones.APROBADA,
      observaciones: 'Vacaciones de verano'
    },
    {
      idSolicitud: 2,
      idOperario: 2,
      fechaInicio: '2024-08-01',
      fechaFin: '2024-08-15',
      fechaSolicitud: '2024-07-01',
      estado: EstadoSolicitudVacaciones.PENDIENTE,
      observaciones: 'Vacaciones familiares'
    }
  ];

  private marcasReloj: MarcaReloj[] = [
    {
      idMarca: 1,
      idOperario: 1,
      fecha: '2024-01-15',
      hora: '08:00:00',
      tipoMarca: 'Entrada',
      metodo: 'App',
      valida: true,
      observaciones: ''
    },
    {
      idMarca: 2,
      idOperario: 1,
      fecha: '2024-01-15',
      hora: '17:00:00',
      tipoMarca: 'Salida',
      metodo: 'App',
      valida: true,
      observaciones: ''
    }
  ];

  // Operarios
  getOperarios(filters?: OperarioFilter): Observable<Operario[]> {
    let filteredOperarios = [...this.operarios];

    if (filters) {
      if (filters.activo !== undefined) {
        filteredOperarios = filteredOperarios.filter(op => op.activo === filters.activo);
      }
      if (filters.categoria) {
        filteredOperarios = filteredOperarios.filter(op => op.idCategoriaOperario === filters.categoria);
      }
      if (filters.fechaAltaDesde) {
        filteredOperarios = filteredOperarios.filter(op => op.fechaAlta >= filters.fechaAltaDesde!);
      }
      if (filters.fechaAltaHasta) {
        filteredOperarios = filteredOperarios.filter(op => op.fechaAlta <= filters.fechaAltaHasta!);
      }
    }

    return of(filteredOperarios).pipe(delay(300));
  }

  getOperarioById(id: number): Observable<Operario | null> {
    const operario = this.operarios.find(op => op.idOperario === id);
    return of(operario || null).pipe(delay(200));
  }

  createOperario(dto: OperarioCreateDto): Observable<Operario> {
    const newId = Math.max(...this.operarios.map(op => op.idOperario)) + 1;
    const newOperario: Operario = {
      idOperario: newId,
      idEmpresa: 1, // Empresa actual
      ...dto,
      activo: true
    };

    this.operarios.push(newOperario);
    return of(newOperario).pipe(delay(500));
  }

  updateOperario(dto: OperarioUpdateDto): Observable<Operario> {
    const index = this.operarios.findIndex(op => op.idOperario === dto.idOperario);
    if (index === -1) {
      return throwError(() => new Error('Operario no encontrado'));
    }

    this.operarios[index] = { ...this.operarios[index], ...dto };
    return of(this.operarios[index]).pipe(delay(500));
  }

  deleteOperario(id: number): Observable<boolean> {
    const index = this.operarios.findIndex(op => op.idOperario === id);
    if (index === -1) {
      return throwError(() => new Error('Operario no encontrado'));
    }

    // Marcar como inactivo en lugar de eliminar
    this.operarios[index].activo = false;
    return of(true).pipe(delay(300));
  }

  // Categorías
  getCategorias(): Observable<CategoriaOperario[]> {
    return of(this.categorias.filter(cat => cat.activa)).pipe(delay(200));
  }

  updateCategoria(categoria: CategoriaOperario): Observable<CategoriaOperario> {
    const index = this.categorias.findIndex(c => c.idCategoriaOperario === categoria.idCategoriaOperario);
    if (index !== -1) {
      this.categorias[index] = categoria;
    }
    return of(categoria).pipe(delay(500));
  }

  createCategoria(categoria: Partial<CategoriaOperario>): Observable<CategoriaOperario> {
    const newId = Math.max(...this.categorias.map(c => c.idCategoriaOperario)) + 1;
    const newCategoria: CategoriaOperario = {
      idCategoriaOperario: newId,
      idEmpresa: 1,
      codigo: categoria.codigo || '',
      nombre: categoria.nombre || '',
      costeHoraBase: categoria.costeHoraBase || 0,
      activa: categoria.activa !== false
    };
    this.categorias.push(newCategoria);
    return of(newCategoria).pipe(delay(500));
  }

  deleteCategoria(id: number): Observable<boolean> {
    const index = this.categorias.findIndex(c => c.idCategoriaOperario === id);
    if (index !== -1) {
      this.categorias[index].activa = false;
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  // Contratos
  getAllContratos(): Observable<ContratoLaboral[]> {
    return of(this.contratos).pipe(delay(200));
  }

  getContratosByOperario(idOperario: number): Observable<ContratoLaboral[]> {
    const contratos = this.contratos.filter(c => c.idOperario === idOperario);
    return of(contratos).pipe(delay(200));
  }

  createContrato(dto: ContratoLaboralCreateDto): Observable<ContratoLaboral> {
    const newId = Math.max(...this.contratos.map(c => c.idContratoLaboral)) + 1;
    const newContrato: ContratoLaboral = {
      idContrato: newId,
      idContratoLaboral: newId,
      idEmpresa: 1,
      ...dto,
      estado: EstadoContrato.ACTIVO
    };

    this.contratos.push(newContrato);
    return of(newContrato).pipe(delay(500));
  }

  // Vacaciones
  getSolicitudesVacaciones(idOperario?: number): Observable<SolicitudVacaciones[]> {
    let solicitudes = [...this.solicitudesVacaciones];
    if (idOperario) {
      solicitudes = solicitudes.filter(s => s.idOperario === idOperario);
    }
    return of(solicitudes).pipe(delay(200));
  }

  createSolicitudVacaciones(dto: SolicitudVacacionesCreateDto): Observable<SolicitudVacaciones> {
    const newId = Math.max(...this.solicitudesVacaciones.map(s => s.idSolicitud)) + 1;
    const newSolicitud: SolicitudVacaciones = {
      idSolicitud: newId,
      ...dto,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      estado: EstadoSolicitudVacaciones.PENDIENTE
    };

    this.solicitudesVacaciones.push(newSolicitud);
    return of(newSolicitud).pipe(delay(500));
  }

  aprobarSolicitudVacaciones(idSolicitud: number): Observable<boolean> {
    const solicitud = this.solicitudesVacaciones.find(s => s.idSolicitud === idSolicitud);
    if (!solicitud) {
      return throwError(() => new Error('Solicitud no encontrada'));
    }

    solicitud.estado = EstadoSolicitudVacaciones.APROBADA;
    return of(true).pipe(delay(300));
  }

  rechazarSolicitudVacaciones(idSolicitud: number): Observable<boolean> {
    const solicitud = this.solicitudesVacaciones.find(s => s.idSolicitud === idSolicitud);
    if (!solicitud) {
      return throwError(() => new Error('Solicitud no encontrada'));
    }

    solicitud.estado = EstadoSolicitudVacaciones.RECHAZADA;
    return of(true).pipe(delay(300));
  }

  // Marcas de reloj
  getMarcasReloj(idOperario?: number, fechaDesde?: string, fechaHasta?: string): Observable<MarcaReloj[]> {
    let marcas = [...this.marcasReloj];
    
    if (idOperario) {
      marcas = marcas.filter(m => m.idOperario === idOperario);
    }
    if (fechaDesde) {
      marcas = marcas.filter(m => m.fecha >= fechaDesde);
    }
    if (fechaHasta) {
      marcas = marcas.filter(m => m.fecha <= fechaHasta);
    }

    return of(marcas).pipe(delay(200));
  }

  createMarcaReloj(dto: MarcaRelojCreateDto): Observable<MarcaReloj> {
    const newId = Math.max(...this.marcasReloj.map(m => m.idMarca)) + 1;
    const newMarca: MarcaReloj = {
      idMarca: newId,
      ...dto,
      valida: true
    };

    this.marcasReloj.push(newMarca);
    return of(newMarca).pipe(delay(500));
  }

  // Estadísticas
  getEstadisticasOperarios(): Observable<any> {
    const totalOperarios = this.operarios.length;
    const operariosActivos = this.operarios.filter(op => op.activo).length;
    const contratosActivos = this.contratos.filter(c => c.estado === EstadoContrato.ACTIVO).length;
    const solicitudesPendientes = this.solicitudesVacaciones.filter(s => s.estado === EstadoSolicitudVacaciones.PENDIENTE).length;

    return of({
      totalOperarios,
      operariosActivos,
      contratosActivos,
      solicitudesPendientes,
      porcentajeActivos: (operariosActivos / totalOperarios) * 100
    }).pipe(delay(300));
  }

  // Métodos para cursos de formación
  getCursosFormacion(): Observable<any[]> {
    // Implementación mock para obtener cursos de formación
    const mockCursos = [
      {
        id: 1,
        nombre: 'Prevención de Riesgos Laborales',
        descripcion: 'Curso básico de PRL',
        fechaInicio: '2024-02-01',
        fechaFin: '2024-02-15',
        estado: 'ACTIVO'
      },
      {
        id: 2,
        nombre: 'Manejo de Maquinaria',
        descripcion: 'Curso de operación segura de maquinaria',
        fechaInicio: '2024-03-01',
        fechaFin: '2024-03-20',
        estado: 'PLANIFICADO'
      }
    ];
    return of(mockCursos).pipe(delay(300));
  }

  createCursoFormacion(curso: any): Observable<any> {
    // Implementación mock para crear curso de formación
    const nuevoCurso = {
      id: Math.floor(Math.random() * 1000),
      ...curso,
      fechaCreacion: new Date().toISOString()
    };
    return of(nuevoCurso).pipe(delay(500));
  }

  updateCursoFormacion(curso: any): Observable<any> {
    // Implementación mock para actualizar curso de formación
    const cursoActualizado = {
      ...curso,
      fechaActualizacion: new Date().toISOString()
    };
    return of(cursoActualizado).pipe(delay(500));
  }

  deleteCursoFormacion(id: number): Observable<boolean> {
    // Implementación mock para eliminar curso de formación
    return of(true).pipe(delay(300));
  }

  getInscripcionesCursos(): Observable<any[]> {
    // Implementación mock para obtener inscripciones a cursos
    const mockInscripciones = [
      {
        id: 1,
        idOperario: 1,
        idCurso: 1,
        fechaInscripcion: '2024-01-15',
        estado: 'INSCRITO'
      }
    ];
    return of(mockInscripciones).pipe(delay(300));
  }

  createInscripcionCurso(inscripcion: any): Observable<any> {
    // Implementación mock para crear inscripción a curso
    const nuevaInscripcion = {
      id: Math.floor(Math.random() * 1000),
      ...inscripcion,
      fechaInscripcion: new Date().toISOString()
    };
    return of(nuevaInscripcion).pipe(delay(500));
  }

  updateInscripcionCurso(inscripcion: any): Observable<any> {
    // Implementación mock para actualizar inscripción a curso
    const inscripcionActualizada = {
      ...inscripcion,
      fechaActualizacion: new Date().toISOString()
    };
    return of(inscripcionActualizada).pipe(delay(500));
  }

  deleteInscripcionCurso(id: number): Observable<boolean> {
    // Implementación mock para eliminar inscripción a curso
    return of(true).pipe(delay(300));
  }
}