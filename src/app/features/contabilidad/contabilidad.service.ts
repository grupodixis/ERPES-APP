import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  EjercicioContable,
  CuentaContable,
  AsientoContable,
  ApunteContable,
  Balance,
  PerdidasyGanancias,
  FiltrosContabilidad,
  EstadisticasContabilidad,
  ConfiguracionContabilidad,
  ContabilidadResponse,
  ContabilidadListResponse,
  ContabilidadQueryParams,
  ExportacionContable,
  ValidacionAsiento,
  AuditoriaContable,
  EstadoEjercicio,
  TipoCuenta,
  NaturalezaCuenta,
  TipoAsiento,
  EstadoAsiento
} from './contabilidad.types';

@Injectable({
  providedIn: 'root'
})
export class ContabilidadService {
  private readonly apiUrl = `${environment.apiUrl}/contabilidad`;
  
  // Estados reactivos
  private ejercicioActivoSubject = new BehaviorSubject<EjercicioContable | null>(null);
  private configuracionSubject = new BehaviorSubject<ConfiguracionContabilidad | null>(null);
  
  public ejercicioActivo$ = this.ejercicioActivoSubject.asObservable();
  public configuracion$ = this.configuracionSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarConfiguracionInicial();
  }

  // ==================== EJERCICIOS CONTABLES ====================
  
  getEjercicios(params?: ContabilidadQueryParams): Observable<ContabilidadListResponse<EjercicioContable>> {
    if (environment.production) {
      let httpParams = new HttpParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            httpParams = httpParams.set(key, String(value));
          }
        });
      }
      return this.http.get<ContabilidadListResponse<EjercicioContable>>(`${this.apiUrl}/ejercicios`, { params: httpParams });
    }
    
    return of(this.getMockEjercicios(params));
  }

  getEjercicio(id: number): Observable<ContabilidadResponse<EjercicioContable>> {
    if (environment.production) {
      return this.http.get<ContabilidadResponse<EjercicioContable>>(`${this.apiUrl}/ejercicios/${id}`);
    }
    
    const ejercicios = this.getMockEjercicios().data;
    const ejercicio = ejercicios.find(e => e.id === id);
    
    if (ejercicio) {
      return of({ data: ejercicio, success: true });
    }
    
    return throwError(() => new Error('Ejercicio no encontrado'));
  }

  createEjercicio(ejercicio: Partial<EjercicioContable>): Observable<ContabilidadResponse<EjercicioContable>> {
    if (environment.production) {
      return this.http.post<ContabilidadResponse<EjercicioContable>>(`${this.apiUrl}/ejercicios`, ejercicio);
    }
    
    const nuevoEjercicio: EjercicioContable = {
      id: Date.now(),
      codigo: ejercicio.codigo || '',
      nombre: ejercicio.nombre || '',
      fechaInicio: ejercicio.fechaInicio || new Date(),
      fechaFin: ejercicio.fechaFin || new Date(),
      estado: ejercicio.estado || EstadoEjercicio.ABIERTO,
      activo: ejercicio.activo ?? true,
      cerrado: ejercicio.cerrado ?? false,
      observaciones: ejercicio.observaciones,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of({ data: nuevoEjercicio, success: true, message: 'Ejercicio creado exitosamente' });
  }

  updateEjercicio(id: number, ejercicio: Partial<EjercicioContable>): Observable<ContabilidadResponse<EjercicioContable>> {
    if (environment.production) {
      return this.http.put<ContabilidadResponse<EjercicioContable>>(`${this.apiUrl}/ejercicios/${id}`, ejercicio);
    }
    
    const ejercicioActualizado: EjercicioContable = {
      id,
      codigo: ejercicio.codigo || '',
      nombre: ejercicio.nombre || '',
      fechaInicio: ejercicio.fechaInicio || new Date(),
      fechaFin: ejercicio.fechaFin || new Date(),
      estado: ejercicio.estado || EstadoEjercicio.ABIERTO,
      activo: ejercicio.activo ?? true,
      cerrado: ejercicio.cerrado ?? false,
      observaciones: ejercicio.observaciones,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of({ data: ejercicioActualizado, success: true, message: 'Ejercicio actualizado exitosamente' });
  }

  deleteEjercicio(id: number): Observable<ContabilidadResponse<void>> {
    if (environment.production) {
      return this.http.delete<ContabilidadResponse<void>>(`${this.apiUrl}/ejercicios/${id}`);
    }
    
    return of({ data: undefined, success: true, message: 'Ejercicio eliminado exitosamente' });
  }

  setEjercicioActivo(ejercicio: EjercicioContable): void {
    this.ejercicioActivoSubject.next(ejercicio);
  }

  // ==================== CUENTAS CONTABLES ====================
  
  getCuentas(params?: ContabilidadQueryParams): Observable<ContabilidadListResponse<CuentaContable>> {
    if (environment.production) {
      let httpParams = new HttpParams();
      if (params) {
        Object.keys(params).forEach(key => {
          const value = params[key as keyof ContabilidadQueryParams];
          if (value !== undefined && value !== null) {
            httpParams = httpParams.set(key, value.toString());
          }
        });
      }
      return this.http.get<ContabilidadListResponse<CuentaContable>>(`${this.apiUrl}/cuentas`, { params: httpParams });
    }
    
    return of(this.getMockCuentas(params));
  }

  getCuenta(id: number): Observable<ContabilidadResponse<CuentaContable>> {
    if (environment.production) {
      return this.http.get<ContabilidadResponse<CuentaContable>>(`${this.apiUrl}/cuentas/${id}`);
    }
    
    const cuentas = this.getMockCuentas().data;
    const cuenta = cuentas.find(c => c.id === id);
    
    if (cuenta) {
      return of({ data: cuenta, success: true });
    }
    
    return throwError(() => new Error('Cuenta no encontrada'));
  }

  createCuenta(cuenta: Partial<CuentaContable>): Observable<ContabilidadResponse<CuentaContable>> {
    if (environment.production) {
      return this.http.post<ContabilidadResponse<CuentaContable>>(`${this.apiUrl}/cuentas`, cuenta);
    }
    
    const nuevaCuenta: CuentaContable = {
      id: Date.now(),
      codigo: cuenta.codigo || '',
      nombre: cuenta.nombre || '',
      descripcion: cuenta.descripcion,
      tipoCuenta: cuenta.tipoCuenta || TipoCuenta.ACTIVO,
      naturaleza: cuenta.naturaleza || NaturalezaCuenta.DEUDORA,
      nivel: cuenta.nivel || 1,
      cuentaPadreId: cuenta.cuentaPadreId,
      activa: cuenta.activa ?? true,
      auxiliar: cuenta.auxiliar ?? false,
      imputable: cuenta.imputable ?? true,
      saldoDeudor: cuenta.saldoDeudor || 0,
      saldoAcreedor: cuenta.saldoAcreedor || 0,
      saldoActual: cuenta.saldoActual || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of({ data: nuevaCuenta, success: true, message: 'Cuenta creada exitosamente' });
  }

  updateCuenta(id: number, cuenta: Partial<CuentaContable>): Observable<ContabilidadResponse<CuentaContable>> {
    if (environment.production) {
      return this.http.put<ContabilidadResponse<CuentaContable>>(`${this.apiUrl}/cuentas/${id}`, cuenta);
    }
    
    const cuentaActualizada: CuentaContable = {
      id,
      codigo: cuenta.codigo || '',
      nombre: cuenta.nombre || '',
      descripcion: cuenta.descripcion,
      tipoCuenta: cuenta.tipoCuenta || TipoCuenta.ACTIVO,
      naturaleza: cuenta.naturaleza || NaturalezaCuenta.DEUDORA,
      nivel: cuenta.nivel || 1,
      cuentaPadreId: cuenta.cuentaPadreId,
      activa: cuenta.activa ?? true,
      auxiliar: cuenta.auxiliar ?? false,
      imputable: cuenta.imputable ?? true,
      saldoDeudor: cuenta.saldoDeudor || 0,
      saldoAcreedor: cuenta.saldoAcreedor || 0,
      saldoActual: cuenta.saldoActual || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of({ data: cuentaActualizada, success: true, message: 'Cuenta actualizada exitosamente' });
  }

  deleteCuenta(id: number): Observable<ContabilidadResponse<void>> {
    if (environment.production) {
      return this.http.delete<ContabilidadResponse<void>>(`${this.apiUrl}/cuentas/${id}`);
    }
    
    return of({ data: undefined, success: true, message: 'Cuenta eliminada exitosamente' });
  }

  // Alias methods for compatibility
  getCuentasContables(params?: ContabilidadQueryParams): Observable<ContabilidadListResponse<CuentaContable>> {
    return this.getCuentas(params);
  }

  createCuentaContable(cuenta: Partial<CuentaContable>): Observable<ContabilidadResponse<CuentaContable>> {
    return this.createCuenta(cuenta);
  }

  updateCuentaContable(id: number, cuenta: Partial<CuentaContable>): Observable<ContabilidadResponse<CuentaContable>> {
    return this.updateCuenta(id, cuenta);
  }

  deleteCuentaContable(id: number): Observable<ContabilidadResponse<void>> {
    return this.deleteCuenta(id);
  }

  getPlanContable(): Observable<ContabilidadListResponse<CuentaContable>> {
    return this.getCuentas().pipe(
      map(response => ({
        ...response,
        data: this.organizarPlanContable(response.data)
      }))
    );
  }

  // Alias methods for AsientoContable compatibility
  createAsientoContable(asiento: Partial<AsientoContable>): Observable<ContabilidadResponse<AsientoContable>> {
    return this.createAsiento(asiento);
  }

  updateAsientoContable(id: number, asiento: Partial<AsientoContable>): Observable<ContabilidadResponse<AsientoContable>> {
    return this.updateAsiento(id, asiento);
  }

  deleteAsientoContable(id: number): Observable<ContabilidadResponse<void>> {
    return this.deleteAsiento(id);
  }

  // ==================== ASIENTOS CONTABLES ====================
  
  getAsientos(params?: ContabilidadQueryParams): Observable<ContabilidadListResponse<AsientoContable>> {
    if (environment.production) {
      let httpParams = new HttpParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            httpParams = httpParams.set(key, String(value));
          }
        });
      }
      return this.http.get<ContabilidadListResponse<AsientoContable>>(`${this.apiUrl}/asientos`, { params: httpParams });
    }
    
    return of(this.getMockAsientos(params));
  }

  getAsiento(id: number): Observable<ContabilidadResponse<AsientoContable>> {
    if (environment.production) {
      return this.http.get<ContabilidadResponse<AsientoContable>>(`${this.apiUrl}/asientos/${id}`);
    }
    
    const asientos = this.getMockAsientos().data;
    const asiento = asientos.find(a => a.id === id);
    
    if (asiento) {
      return of({ data: asiento, success: true });
    }
    
    return throwError(() => new Error('Asiento no encontrado'));
  }

  createAsiento(asiento: Partial<AsientoContable>): Observable<ContabilidadResponse<AsientoContable>> {
    return this.validarAsiento(asiento).pipe(
      switchMap(validacion => {
        if (!validacion.valido) {
          return throwError(() => new Error(`Asiento inválido: ${validacion.errores.join(', ')}`));
        }
        
        if (environment.production) {
          return this.http.post<ContabilidadResponse<AsientoContable>>(`${this.apiUrl}/asientos`, asiento);
        }
        
        const nuevoAsiento: AsientoContable = {
          id: Date.now(),
          numero: asiento.numero || this.generarNumeroAsiento(),
          fecha: asiento.fecha || new Date(),
          concepto: asiento.concepto || '',
          descripcion: asiento.descripcion,
          ejercicioId: asiento.ejercicioId || 1,
          tipoAsiento: asiento.tipoAsiento || TipoAsiento.ORDINARIO,
          estado: asiento.estado || EstadoAsiento.BORRADOR,
          totalDebe: asiento.totalDebe || 0,
          totalHaber: asiento.totalHaber || 0,
          diferencia: (asiento.totalDebe || 0) - (asiento.totalHaber || 0),
          cuadrado: (asiento.totalDebe || 0) === (asiento.totalHaber || 0),
          apuntes: asiento.apuntes || [],
          documentoReferencia: asiento.documentoReferencia,
          usuarioCreacion: 'usuario_actual',
          fechaCreacion: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return of({ data: nuevoAsiento, success: true, message: 'Asiento creado exitosamente' });
      })
    );
  }

  updateAsiento(id: number, asiento: Partial<AsientoContable>): Observable<ContabilidadResponse<AsientoContable>> {
    return this.validarAsiento(asiento).pipe(
      switchMap(validacion => {
        if (!validacion.valido) {
          return throwError(() => new Error(`Asiento inválido: ${validacion.errores.join(', ')}`));
        }
        
        if (environment.production) {
          return this.http.put<ContabilidadResponse<AsientoContable>>(`${this.apiUrl}/asientos/${id}`, asiento);
        }
        
        const asientoActualizado: AsientoContable = {
          id,
          numero: asiento.numero || '',
          fecha: asiento.fecha || new Date(),
          concepto: asiento.concepto || '',
          descripcion: asiento.descripcion,
          ejercicioId: asiento.ejercicioId || 1,
          tipoAsiento: asiento.tipoAsiento || TipoAsiento.ORDINARIO,
          estado: asiento.estado || EstadoAsiento.BORRADOR,
          totalDebe: asiento.totalDebe || 0,
          totalHaber: asiento.totalHaber || 0,
          diferencia: (asiento.totalDebe || 0) - (asiento.totalHaber || 0),
          cuadrado: (asiento.totalDebe || 0) === (asiento.totalHaber || 0),
          apuntes: asiento.apuntes || [],
          documentoReferencia: asiento.documentoReferencia,
          usuarioCreacion: 'usuario_actual',
          fechaCreacion: new Date(),
          usuarioModificacion: 'usuario_actual',
          fechaModificacion: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return of({ data: asientoActualizado, success: true, message: 'Asiento actualizado exitosamente' });
      })
    );
  }

  deleteAsiento(id: number): Observable<ContabilidadResponse<void>> {
    if (environment.production) {
      return this.http.delete<ContabilidadResponse<void>>(`${this.apiUrl}/asientos/${id}`);
    }
    
    return of({ data: undefined, success: true, message: 'Asiento eliminado exitosamente' });
  }

  validarAsiento(asiento: Partial<AsientoContable>): Observable<ValidacionAsiento> {
    const errores: string[] = [];
    const advertencias: string[] = [];
    
    if (!asiento.concepto || asiento.concepto.trim() === '') {
      errores.push('El concepto es obligatorio');
    }
    
    if (!asiento.apuntes || asiento.apuntes.length < 2) {
      errores.push('Un asiento debe tener al menos 2 apuntes');
    }
    
    const totalDebe = asiento.apuntes?.reduce((sum, apunte) => sum + (apunte.debe || 0), 0) || 0;
    const totalHaber = asiento.apuntes?.reduce((sum, apunte) => sum + (apunte.haber || 0), 0) || 0;
    const diferencia = totalDebe - totalHaber;
    
    if (Math.abs(diferencia) > 0.01) {
      errores.push(`El asiento no está cuadrado. Diferencia: ${diferencia.toFixed(2)}`);
    }
    
    if (asiento.apuntes) {
      asiento.apuntes.forEach((apunte, index) => {
        if (!apunte.concepto || apunte.concepto.trim() === '') {
          errores.push(`El apunte ${index + 1} debe tener concepto`);
        }
        
        if (!apunte.cuentaId) {
          errores.push(`El apunte ${index + 1} debe tener una cuenta asignada`);
        }
        
        if ((apunte.debe || 0) === 0 && (apunte.haber || 0) === 0) {
          errores.push(`El apunte ${index + 1} debe tener importe en debe o haber`);
        }
        
        if ((apunte.debe || 0) > 0 && (apunte.haber || 0) > 0) {
          advertencias.push(`El apunte ${index + 1} tiene importe en debe y haber`);
        }
      });
    }
    
    return of({
      valido: errores.length === 0,
      errores,
      advertencias,
      diferencia
    });
  }

  // ==================== INFORMES ====================
  
  getBalance(ejercicioId: number, fechaHasta?: Date): Observable<ContabilidadResponse<Balance>> {
    if (environment.production) {
      const params = fechaHasta ? { fechaHasta: fechaHasta.toISOString() } : {};
      return this.http.get<ContabilidadResponse<Balance>>(`${this.apiUrl}/informes/balance/${ejercicioId}`, { params });
    }
    
    return of(this.getMockBalance(ejercicioId));
  }

  getPerdidasyGanancias(ejercicioId: number, fechaHasta?: Date): Observable<ContabilidadResponse<PerdidasyGanancias>> {
    if (environment.production) {
      const params = fechaHasta ? { fechaHasta: fechaHasta.toISOString() } : {};
      return this.http.get<ContabilidadResponse<PerdidasyGanancias>>(`${this.apiUrl}/informes/pyg/${ejercicioId}`, { params });
    }
    
    return of(this.getMockPerdidasyGanancias(ejercicioId));
  }

  // ==================== ESTADÍSTICAS ====================
  
  getEstadisticas(filtros?: FiltrosContabilidad): Observable<ContabilidadResponse<EstadisticasContabilidad>> {
    if (environment.production) {
      return this.http.post<ContabilidadResponse<EstadisticasContabilidad>>(`${this.apiUrl}/estadisticas`, filtros);
    }
    
    return of(this.getMockEstadisticas());
  }

  // ==================== CONFIGURACIÓN ====================
  
  getConfiguracion(): Observable<ContabilidadResponse<ConfiguracionContabilidad>> {
    if (environment.production) {
      return this.http.get<ContabilidadResponse<ConfiguracionContabilidad>>(`${this.apiUrl}/configuracion`);
    }
    
    return of(this.getMockConfiguracion());
  }

  updateConfiguracion(config: Partial<ConfiguracionContabilidad>): Observable<ContabilidadResponse<ConfiguracionContabilidad>> {
    if (environment.production) {
      return this.http.put<ContabilidadResponse<ConfiguracionContabilidad>>(`${this.apiUrl}/configuracion`, config);
    }
    
    const configuracionActualizada: ConfiguracionContabilidad = {
      ejercicioActivo: config.ejercicioActivo,
      digitosCuenta: config.digitosCuenta || 4,
      separadorCuenta: config.separadorCuenta || '.',
      formatoAsiento: config.formatoAsiento || 'A-{YYYY}-{NNNN}',
      validacionAutomatica: config.validacionAutomatica ?? true,
      copiaSeguridad: config.copiaSeguridad ?? true
    };
    
    this.configuracionSubject.next(configuracionActualizada);
    
    return of({ data: configuracionActualizada, success: true, message: 'Configuración actualizada' });
  }

  // ==================== EXPORTACIÓN ====================
  
  exportarDatos(exportacion: ExportacionContable): Observable<Blob> {
    if (environment.production) {
      return this.http.post(`${this.apiUrl}/exportar`, exportacion, { responseType: 'blob' });
    }
    
    // Mock de exportación
    const contenido = `Exportación ${exportacion.tipo} - Ejercicio ${exportacion.ejercicioId}`;
    const blob = new Blob([contenido], { type: 'text/plain' });
    return of(blob);
  }

  // ==================== MÉTODOS PRIVADOS ====================
  
  private cargarConfiguracionInicial(): void {
    this.getConfiguracion().subscribe({
      next: (response) => {
        this.configuracionSubject.next(response.data);
        if (response.data.ejercicioActivo) {
          this.getEjercicio(response.data.ejercicioActivo).subscribe({
            next: (ejercicioResponse) => {
              this.ejercicioActivoSubject.next(ejercicioResponse.data);
            }
          });
        }
      }
    });
  }

  private generarNumeroAsiento(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const numero = Math.floor(Math.random() * 9999) + 1;
    return `A-${año}-${numero.toString().padStart(4, '0')}`;
  }

  private organizarPlanContable(cuentas: CuentaContable[]): CuentaContable[] {
    const cuentasOrganizadas = [...cuentas];
    
    // Organizar por código
    cuentasOrganizadas.sort((a, b) => a.codigo.localeCompare(b.codigo));
    
    // Establecer relaciones padre-hijo
    cuentasOrganizadas.forEach(cuenta => {
      if (cuenta.cuentaPadreId) {
        const padre = cuentasOrganizadas.find(c => c.id === cuenta.cuentaPadreId);
        if (padre) {
          cuenta.cuentaPadre = padre;
          if (!padre.subcuentas) {
            padre.subcuentas = [];
          }
          padre.subcuentas.push(cuenta);
        }
      }
    });
    
    return cuentasOrganizadas;
  }

  // ==================== DATOS MOCK ====================
  
  private getMockEjercicios(params?: ContabilidadQueryParams): ContabilidadListResponse<EjercicioContable> {
    const ejercicios: EjercicioContable[] = [
      {
        id: 1,
        codigo: '2024',
        nombre: 'Ejercicio 2024',
        fechaInicio: new Date('2024-01-01'),
        fechaFin: new Date('2024-12-31'),
        estado: EstadoEjercicio.ABIERTO,
        activo: true,
        cerrado: false,
        observaciones: 'Ejercicio contable actual',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        codigo: '2023',
        nombre: 'Ejercicio 2023',
        fechaInicio: new Date('2023-01-01'),
        fechaFin: new Date('2023-12-31'),
        estado: EstadoEjercicio.CERRADO,
        activo: false,
        cerrado: true,
        observaciones: 'Ejercicio cerrado',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-15')
      }
    ];
    
    return {
      data: ejercicios,
      total: ejercicios.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      success: true
    };
  }

  private getMockCuentas(params?: ContabilidadQueryParams): ContabilidadListResponse<CuentaContable> {
    const cuentas: CuentaContable[] = [
      {
        id: 1,
        codigo: '100',
        nombre: 'ACTIVO',
        descripcion: 'Grupo de cuentas de activo',
        tipoCuenta: TipoCuenta.ACTIVO,
        naturaleza: NaturalezaCuenta.DEUDORA,
        nivel: 1,
        activa: true,
        auxiliar: false,
        imputable: false,
        saldoDeudor: 0,
        saldoAcreedor: 0,
        saldoActual: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        codigo: '101',
        nombre: 'Caja',
        descripcion: 'Efectivo en caja',
        tipoCuenta: TipoCuenta.ACTIVO,
        naturaleza: NaturalezaCuenta.DEUDORA,
        nivel: 2,
        cuentaPadreId: 1,
        activa: true,
        auxiliar: false,
        imputable: true,
        saldoDeudor: 5000,
        saldoAcreedor: 0,
        saldoActual: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        codigo: '200',
        nombre: 'PASIVO',
        descripcion: 'Grupo de cuentas de pasivo',
        tipoCuenta: TipoCuenta.PASIVO,
        naturaleza: NaturalezaCuenta.ACREEDORA,
        nivel: 1,
        activa: true,
        auxiliar: false,
        imputable: false,
        saldoDeudor: 0,
        saldoAcreedor: 0,
        saldoActual: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    return {
      data: cuentas,
      total: cuentas.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      success: true
    };
  }

  private getMockAsientos(params?: ContabilidadQueryParams): ContabilidadListResponse<AsientoContable> {
    const asientos: AsientoContable[] = [
      {
        id: 1,
        numero: 'A-2024-0001',
        fecha: new Date('2024-01-15'),
        concepto: 'Asiento de apertura',
        descripcion: 'Apertura del ejercicio contable 2024',
        ejercicioId: 1,
        tipoAsiento: TipoAsiento.APERTURA,
        estado: EstadoAsiento.CONFIRMADO,
        totalDebe: 10000,
        totalHaber: 10000,
        diferencia: 0,
        cuadrado: true,
        apuntes: [],
        usuarioCreacion: 'admin',
        fechaCreacion: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];
    
    return {
      data: asientos,
      total: asientos.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      success: true
    };
  }

  private getMockBalance(ejercicioId: number): ContabilidadResponse<Balance> {
    const balance: Balance = {
      ejercicioId,
      fechaGeneracion: new Date(),
      activo: {
        nombre: 'ACTIVO',
        cuentas: [],
        total: 50000
      },
      pasivo: {
        nombre: 'PASIVO',
        cuentas: [],
        total: 30000
      },
      patrimonio: {
        nombre: 'PATRIMONIO',
        cuentas: [],
        total: 20000
      },
      totalActivo: 50000,
      totalPasivo: 30000,
      totalPatrimonio: 20000,
      cuadrado: true
    };
    
    return { data: balance, success: true };
  }

  private getMockPerdidasyGanancias(ejercicioId: number): ContabilidadResponse<PerdidasyGanancias> {
    const pyg: PerdidasyGanancias = {
      ejercicioId,
      fechaGeneracion: new Date(),
      ingresos: {
        nombre: 'INGRESOS',
        cuentas: [],
        total: 75000
      },
      gastos: {
        nombre: 'GASTOS',
        cuentas: [],
        total: 60000
      },
      totalIngresos: 75000,
      totalGastos: 60000,
      resultado: 15000,
      tipoResultado: 'BENEFICIO'
    };
    
    return { data: pyg, success: true };
  }

  private getMockEstadisticas(): ContabilidadResponse<EstadisticasContabilidad> {
    const estadisticas: EstadisticasContabilidad = {
      totalAsientos: 150,
      totalApuntes: 450,
      totalDebe: 500000,
      totalHaber: 500000,
      asientosPorMes: [
        { mes: 'Enero', cantidad: 25 },
        { mes: 'Febrero', cantidad: 30 },
        { mes: 'Marzo', cantidad: 28 }
      ],
      cuentasMasUsadas: [
        { cuenta: 'Caja', usos: 45 },
        { cuenta: 'Bancos', usos: 38 },
        { cuenta: 'Clientes', usos: 32 }
      ],
      diferenciasDetectadas: 2
    };
    
    return { data: estadisticas, success: true };
  }

  private getMockConfiguracion(): ContabilidadResponse<ConfiguracionContabilidad> {
    const configuracion: ConfiguracionContabilidad = {
      ejercicioActivo: 1,
      digitosCuenta: 4,
      separadorCuenta: '.',
      formatoAsiento: 'A-{YYYY}-{NNNN}',
      validacionAutomatica: true,
      copiaSeguridad: true
    };
    
    return { data: configuracion, success: true };
  }
}