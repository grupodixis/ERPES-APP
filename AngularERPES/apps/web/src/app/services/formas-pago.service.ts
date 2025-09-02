import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import {
  FormaPago,
  CreateFormaPagoDto,
  UpdateFormaPagoDto,
  FormaPagoFilters
} from '../domain/configuracion.types';

@Injectable({
  providedIn: 'root'
})
export class FormasPagoService {
  private formasPago = signal<FormaPago[]>([
    {
      id: 1,
      codigo: 'EFECTIVO',
      nombre: 'Efectivo',
      descripcion: 'Pago en efectivo',
      tipo: 'efectivo',
      requiereCuenta: false,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      codigo: 'TRANSFERENCIA',
      nombre: 'Transferencia Bancaria',
      descripcion: 'Pago mediante transferencia bancaria',
      tipo: 'transferencia',
      requiereCuenta: true,
      diasVencimiento: 3,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 3,
      codigo: 'CHEQUE',
      nombre: 'Cheque',
      descripcion: 'Pago con cheque bancario',
      tipo: 'cheque',
      requiereCuenta: true,
      diasVencimiento: 7,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 4,
      codigo: 'TARJETA',
      nombre: 'Tarjeta de Crédito/Débito',
      descripcion: 'Pago con tarjeta bancaria',
      tipo: 'tarjeta',
      requiereCuenta: false,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 5,
      codigo: 'PAGARE',
      nombre: 'Pagaré',
      descripcion: 'Pago mediante pagaré',
      tipo: 'pagare',
      requiereCuenta: false,
      diasVencimiento: 30,
      activa: false,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]);

  /**
   * Carga las formas de pago aplicando filtros opcionales
   */
  cargarFormasPago(filtros: FormaPagoFilters = {}): Observable<FormaPago[]> {
    const formasPagoFiltradas = this.aplicarFiltros(this.formasPago(), filtros);
    return of(formasPagoFiltradas).pipe(delay(300));
  }

  /**
   * Obtiene una forma de pago por ID
   */
  obtenerFormaPago(id: number): Observable<FormaPago> {
    const formaPago = this.formasPago().find(fp => fp.id === id);
    if (!formaPago) {
      return throwError(() => new Error(`Forma de pago con ID ${id} no encontrada`));
    }
    return of(formaPago).pipe(delay(200));
  }

  /**
   * Crea una nueva forma de pago
   */
  crearFormaPago(dto: CreateFormaPagoDto): Observable<FormaPago> {
    // Validar código único
    const codigoExiste = this.formasPago().some(fp => 
      fp.codigo.toLowerCase() === dto.codigo.toLowerCase() && fp.empresaId === dto.empresaId
    );
    
    if (codigoExiste) {
      return throwError(() => new Error(`Ya existe una forma de pago con el código '${dto.codigo}'`));
    }

    const nuevaFormaPago: FormaPago = {
      id: Math.max(...this.formasPago().map(fp => fp.id)) + 1,
      codigo: dto.codigo.toUpperCase(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      tipo: dto.tipo,
      requiereCuenta: dto.requiereCuenta ?? false,
      diasVencimiento: dto.diasVencimiento,
      activa: true,
      empresaId: dto.empresaId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.formasPago.update(formas => [...formas, nuevaFormaPago]);
    return of(nuevaFormaPago).pipe(delay(400));
  }

  /**
   * Actualiza una forma de pago existente
   */
  actualizarFormaPago(id: number, dto: UpdateFormaPagoDto): Observable<FormaPago> {
    const index = this.formasPago().findIndex(fp => fp.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Forma de pago con ID ${id} no encontrada`));
    }

    const formaPagoActualizada: FormaPago = {
      ...this.formasPago()[index],
      ...dto,
      updatedAt: new Date()
    };

    this.formasPago.update(formas => {
      const nuevasFormas = [...formas];
      nuevasFormas[index] = formaPagoActualizada;
      return nuevasFormas;
    });

    return of(formaPagoActualizada).pipe(delay(400));
  }

  /**
   * Elimina una forma de pago
   */
  eliminarFormaPago(id: number): Observable<void> {
    const index = this.formasPago().findIndex(fp => fp.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Forma de pago con ID ${id} no encontrada`));
    }

    this.formasPago.update(formas => formas.filter(fp => fp.id !== id));
    return of(void 0).pipe(delay(300));
  }

  /**
   * Aplica filtros a la lista de formas de pago
   */
  private aplicarFiltros(formasPago: FormaPago[], filtros: FormaPagoFilters): FormaPago[] {
    let resultado = [...formasPago];

    // Filtro por búsqueda (código, nombre, descripción)
    if (filtros.search) {
      const searchLower = filtros.search.toLowerCase();
      resultado = resultado.filter(fp => 
        fp.codigo.toLowerCase().includes(searchLower) ||
        fp.nombre.toLowerCase().includes(searchLower) ||
        (fp.descripcion && fp.descripcion.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por tipo
    if (filtros.tipo) {
      resultado = resultado.filter(fp => fp.tipo === filtros.tipo);
    }

    // Filtro por requiere cuenta
    if (filtros.requiereCuenta !== undefined) {
      resultado = resultado.filter(fp => fp.requiereCuenta === filtros.requiereCuenta);
    }

    // Filtro por estado activo
    if (filtros.activa !== undefined) {
      resultado = resultado.filter(fp => fp.activa === filtros.activa);
    }

    // Filtro por empresa
    if (filtros.empresaId) {
      resultado = resultado.filter(fp => fp.empresaId === filtros.empresaId);
    }

    return resultado;
  }

  /**
   * Obtiene los tipos de forma de pago disponibles
   */
  obtenerTiposFormaPago(): Observable<Array<{value: string, label: string}>> {
    const tipos = [
      { value: 'efectivo', label: 'Efectivo' },
      { value: 'transferencia', label: 'Transferencia Bancaria' },
      { value: 'cheque', label: 'Cheque' },
      { value: 'tarjeta', label: 'Tarjeta' },
      { value: 'pagare', label: 'Pagaré' },
      { value: 'confirming', label: 'Confirming' },
      { value: 'otro', label: 'Otro' }
    ];
    return of(tipos).pipe(delay(100));
  }

  /**
   * Valida si una forma de pago puede ser eliminada
   */
  puedeEliminar(id: number): Observable<boolean> {
    // En un sistema real, verificaría si la forma de pago está siendo utilizada
    // en facturas, pedidos, etc.
    return of(true).pipe(delay(200));
  }
}