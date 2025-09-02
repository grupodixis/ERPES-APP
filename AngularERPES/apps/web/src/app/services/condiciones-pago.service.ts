import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  CondicionPago,
  CreateCondicionPagoDto,
  UpdateCondicionPagoDto,
  CondicionPagoFilters,
  SimulacionVencimiento,
  SimularVencimientoDto
} from '../domain/configuracion.types';

@Injectable({
  providedIn: 'root'
})
export class CondicionesPagoService {
  private condicionesPago = signal<CondicionPago[]>([
    {
      id: 1,
      codigo: 'CONTADO',
      nombre: 'Contado',
      descripcion: 'Pago al contado',
      tipo: 'contado',
      diasVencimiento: 0,
      finMes: false,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      codigo: '30D',
      nombre: '30 días',
      descripcion: 'Pago a 30 días',
      tipo: 'credito',
      diasVencimiento: 30,
      finMes: false,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 3,
      codigo: '60D',
      nombre: '60 días',
      descripcion: 'Pago a 60 días',
      tipo: 'credito',
      diasVencimiento: 60,
      finMes: false,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 4,
      codigo: 'FM30',
      nombre: 'Fin de mes + 30',
      descripcion: 'Fin de mes más 30 días',
      tipo: 'credito',
      diasVencimiento: 30,
      finMes: true,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 5,
      codigo: 'PP15',
      nombre: 'Pronto Pago 15 días',
      descripcion: 'Pago a 30 días con 2% descuento si se paga en 15 días',
      tipo: 'credito',
      diasVencimiento: 30,
      finMes: false,
      descuentoProntoPago: 2,
      diasDescuento: 15,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 6,
      codigo: 'INACTIVA',
      nombre: 'Condición Inactiva',
      descripcion: 'Condición de pago inactiva para pruebas',
      tipo: 'credito',
      diasVencimiento: 45,
      finMes: false,
      activa: false,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]);

  private nextId = 7;

  cargarCondicionesPago(filtros: CondicionPagoFilters = {}): Observable<CondicionPago[]> {
    return of(this.condicionesPago()).pipe(
      map(condiciones => this.aplicarFiltros(condiciones, filtros)),
      delay(300) // Simular latencia de red
    );
  }

  obtenerCondicionPago(id: number): Observable<CondicionPago> {
    const condicion = this.condicionesPago().find(c => c.id === id);
    if (!condicion) {
      return throwError(() => new Error(`Condición de pago con ID ${id} no encontrada`));
    }
    return of(condicion).pipe(delay(200));
  }

  crearCondicionPago(dto: CreateCondicionPagoDto): Observable<CondicionPago> {
    // Validar código único
    const codigoExiste = this.condicionesPago().some(c => 
      c.codigo.toLowerCase() === dto.codigo.toLowerCase() && c.empresaId === dto.empresaId
    );
    
    if (codigoExiste) {
      return throwError(() => new Error(`Ya existe una condición de pago con el código '${dto.codigo}'`));
    }

    const nuevaCondicion: CondicionPago = {
      id: this.nextId++,
      ...dto,
      finMes: dto.finMes || false,
      activa: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.condicionesPago.update(condiciones => [...condiciones, nuevaCondicion]);
    return of(nuevaCondicion).pipe(delay(300));
  }

  actualizarCondicionPago(id: number, dto: UpdateCondicionPagoDto): Observable<CondicionPago> {
    const condiciones = this.condicionesPago();
    const index = condiciones.findIndex(c => c.id === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Condición de pago con ID ${id} no encontrada`));
    }

    const condicionActualizada: CondicionPago = {
      ...condiciones[index],
      ...dto,
      updatedAt: new Date()
    };

    const nuevasCondiciones = [...condiciones];
    nuevasCondiciones[index] = condicionActualizada;
    
    this.condicionesPago.set(nuevasCondiciones);
    return of(condicionActualizada).pipe(delay(300));
  }

  eliminarCondicionPago(id: number): Observable<void> {
    const condiciones = this.condicionesPago();
    const existe = condiciones.some(c => c.id === id);
    
    if (!existe) {
      return throwError(() => new Error(`Condición de pago con ID ${id} no encontrada`));
    }

    this.condicionesPago.update(condiciones => condiciones.filter(c => c.id !== id));
    return of(void 0).pipe(delay(200));
  }

  simularVencimiento(id: number, dto: SimularVencimientoDto): Observable<SimulacionVencimiento> {
    const condicion = this.condicionesPago().find(c => c.id === id);
    
    if (!condicion) {
      return throwError(() => new Error(`Condición de pago con ID ${id} no encontrada`));
    }

    const fechaVencimiento = this.calcularFechaVencimiento(condicion, dto.fechaFactura);
    const hoy = new Date();
    const diasHastaVencimiento = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    let aplicaDescuento = false;
    let importeConDescuento: number | undefined;

    if (condicion.descuentoProntoPago && condicion.diasDescuento) {
      const fechaLimiteDescuento = new Date(dto.fechaFactura);
      fechaLimiteDescuento.setDate(fechaLimiteDescuento.getDate() + condicion.diasDescuento);
      
      if (hoy <= fechaLimiteDescuento) {
        aplicaDescuento = true;
        importeConDescuento = dto.importe * (1 - condicion.descuentoProntoPago / 100);
      }
    }

    const simulacion: SimulacionVencimiento = {
      fechaVencimiento,
      importe: dto.importe,
      importeConDescuento,
      diasHastaVencimiento,
      aplicaDescuento
    };

    return of(simulacion).pipe(delay(200));
  }

  private aplicarFiltros(condiciones: CondicionPago[], filtros: CondicionPagoFilters): CondicionPago[] {
    return condiciones.filter(condicion => {
      if (filtros.activa !== undefined && condicion.activa !== filtros.activa) {
        return false;
      }
      
      if (filtros.tipo && condicion.tipo !== filtros.tipo) {
        return false;
      }
      
      if (filtros.empresaId && condicion.empresaId !== filtros.empresaId) {
        return false;
      }
      
      if (filtros.search) {
        const searchLower = filtros.search.toLowerCase();
        return (
          condicion.codigo.toLowerCase().includes(searchLower) ||
          condicion.nombre.toLowerCase().includes(searchLower) ||
          (condicion.descripcion && condicion.descripcion.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }

  private calcularFechaVencimiento(condicion: CondicionPago, fechaFactura: Date): Date {
    const fecha = new Date(fechaFactura);
    
    if (condicion.finMes) {
      // Ir al último día del mes
      fecha.setMonth(fecha.getMonth() + 1, 0);
    }
    
    // Agregar días de vencimiento
    fecha.setDate(fecha.getDate() + condicion.diasVencimiento);
    
    // Si hay día fijo, ajustar
    if (condicion.diaFijo) {
      fecha.setDate(condicion.diaFijo);
    }
    
    return fecha;
  }
}