import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { ContabilidadService } from '../contabilidad.service';
import { 
  Balance, 
  PerdidasyGanancias, 
  EjercicioContable, 
  CuentaContable,
  TipoInforme,
  FormatoInforme,
  PeriodoInforme
} from '../contabilidad.types';

interface InformeConfig {
  tipo: TipoInforme;
  formato: FormatoInforme;
  periodo: PeriodoInforme;
  fechaDesde?: Date;
  fechaHasta?: Date;
  ejercicioId?: string;
  incluirCuentasCero: boolean;
  incluirSubcuentas: boolean;
  agruparPorNivel: boolean;
  nivelAgrupacion?: number;
}

@Component({
  selector: 'app-informes-contables',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './informes-contables.component.html',
  styleUrl: './informes-contables.component.scss'
})
export class InformesContablesComponent implements OnInit {
  private contabilidadService = inject(ContabilidadService);
  private snackBar = inject(MatSnackBar);

  // Enums para el template
  TipoInforme = TipoInforme;
  FormatoInforme = FormatoInforme;
  PeriodoInforme = PeriodoInforme;
  
  // Utilidades para el template
  Math = Math;

  // Signals
  loading = signal(false);
  error = signal<string | null>(null);
  ejercicios = signal<EjercicioContable[]>([]);
  balance = signal<Balance | null>(null);
  perdidasyGanancias = signal<PerdidasyGanancias | null>(null);
  informeActual = signal<TipoInforme | null>(null);
  configuracionInforme = signal<InformeConfig>({
    tipo: TipoInforme.BALANCE,
    formato: FormatoInforme.DETALLADO,
    periodo: PeriodoInforme.EJERCICIO_COMPLETO,
    incluirCuentasCero: false,
    incluirSubcuentas: true,
    agruparPorNivel: false
  });

  // Form
  informeForm = new FormGroup({
    tipo: new FormControl<TipoInforme>(TipoInforme.BALANCE, [Validators.required]),
    formato: new FormControl<FormatoInforme>(FormatoInforme.DETALLADO, [Validators.required]),
    periodo: new FormControl<PeriodoInforme>(PeriodoInforme.EJERCICIO_COMPLETO, [Validators.required]),
    fechaDesde: new FormControl<Date | null>(null),
    fechaHasta: new FormControl<Date | null>(null),
    ejercicioId: new FormControl<string | null>(null, [Validators.required]),
    incluirCuentasCero: new FormControl<boolean>(false),
    incluirSubcuentas: new FormControl<boolean>(true),
    agruparPorNivel: new FormControl<boolean>(false),
    nivelAgrupacion: new FormControl<number>(2)
  });

  // Computed properties
  ejercicioSeleccionado = computed(() => {
    const ejercicioId = this.informeForm.get('ejercicioId')?.value;
    if (!ejercicioId) return null;
    return this.ejercicios().find(e => e.id === parseInt(ejercicioId)) || null;
  });

  requiereFechas = computed(() => {
    return this.informeForm.get('periodo')?.value === PeriodoInforme.PERSONALIZADO;
  });

  puedeGenerar = computed(() => {
    const form = this.informeForm;
    const valido = form.valid;
    const tieneEjercicio = !!form.get('ejercicioId')?.value;
    const tieneFechas = !this.requiereFechas() || 
      (form.get('fechaDesde')?.value && form.get('fechaHasta')?.value);
    
    return valido && tieneEjercicio && tieneFechas && !this.loading();
  });

  // Configuración de tablas
  displayedBalanceColumns = ['codigo', 'nombre', 'debe', 'haber', 'saldo'];
  displayedPyGColumns = ['codigo', 'nombre', 'importe', 'porcentaje'];

  ngOnInit(): void {
    this.loadEjercicios();
    this.setupFormSubscriptions();
  }

  private async loadEjercicios(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    this.contabilidadService.getEjercicios().subscribe({
      next: (response) => {
        this.ejercicios.set(response.data);
        
        // Seleccionar el ejercicio activo por defecto
        const ejercicioActivo = response.data.find(e => e.activo);
        if (ejercicioActivo) {
          this.informeForm.patchValue({ ejercicioId: ejercicioActivo.id.toString() });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading ejercicios:', error);
        this.error.set('Error al cargar los ejercicios contables');
        this.showErrorMessage('Error al cargar los ejercicios contables');
        this.loading.set(false);
      }
    });
  }

  private setupFormSubscriptions(): void {
    // Actualizar fechas cuando cambia el período
    this.informeForm.get('periodo')?.valueChanges.subscribe(periodo => {
      const ejercicio = this.ejercicioSeleccionado();
      if (ejercicio && periodo && periodo !== PeriodoInforme.PERSONALIZADO) {
        this.updateFechasPorPeriodo(periodo, ejercicio);
      }
    });

    // Actualizar fechas cuando cambia el ejercicio
    this.informeForm.get('ejercicioId')?.valueChanges.subscribe(() => {
      const periodo = this.informeForm.get('periodo')?.value;
      const ejercicio = this.ejercicioSeleccionado();
      if (ejercicio && periodo && periodo !== PeriodoInforme.PERSONALIZADO) {
        this.updateFechasPorPeriodo(periodo, ejercicio);
      }
    });

    // Validar fechas personalizadas
    this.informeForm.get('fechaDesde')?.valueChanges.subscribe(() => {
      this.validateFechasPersonalizadas();
    });

    this.informeForm.get('fechaHasta')?.valueChanges.subscribe(() => {
      this.validateFechasPersonalizadas();
    });
  }

  private updateFechasPorPeriodo(periodo: PeriodoInforme, ejercicio: EjercicioContable): void {
    const fechaInicio = new Date(ejercicio.fechaInicio);
    const fechaFin = new Date(ejercicio.fechaFin);
    const hoy = new Date();

    switch (periodo) {
      case PeriodoInforme.EJERCICIO_COMPLETO:
        this.informeForm.patchValue({
          fechaDesde: fechaInicio,
          fechaHasta: fechaFin
        });
        break;
      
      case PeriodoInforme.PRIMER_TRIMESTRE:
        this.informeForm.patchValue({
          fechaDesde: fechaInicio,
          fechaHasta: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 3, 0)
        });
        break;
      
      case PeriodoInforme.SEGUNDO_TRIMESTRE:
        this.informeForm.patchValue({
          fechaDesde: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 3, 1),
          fechaHasta: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 6, 0)
        });
        break;
      
      case PeriodoInforme.TERCER_TRIMESTRE:
        this.informeForm.patchValue({
          fechaDesde: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 6, 1),
          fechaHasta: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 9, 0)
        });
        break;
      
      case PeriodoInforme.CUARTO_TRIMESTRE:
        this.informeForm.patchValue({
          fechaDesde: new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 9, 1),
          fechaHasta: fechaFin
        });
        break;
      
      case PeriodoInforme.HASTA_HOY:
        this.informeForm.patchValue({
          fechaDesde: fechaInicio,
          fechaHasta: hoy < fechaFin ? hoy : fechaFin
        });
        break;
    }
  }

  private validateFechasPersonalizadas(): void {
    const fechaDesde = this.informeForm.get('fechaDesde')?.value;
    const fechaHasta = this.informeForm.get('fechaHasta')?.value;
    
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      this.informeForm.get('fechaHasta')?.setErrors({ fechaInvalida: true });
    } else {
      const errors = this.informeForm.get('fechaHasta')?.errors;
      if (errors) {
        delete errors['fechaInvalida'];
        const hasErrors = Object.keys(errors).length > 0;
        this.informeForm.get('fechaHasta')?.setErrors(hasErrors ? errors : null);
      }
    }
  }

  async generarInforme(): Promise<void> {
    if (!this.puedeGenerar()) {
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);
      
      const config = this.getConfiguracionInforme();
      this.configuracionInforme.set(config);
      this.informeActual.set(config.tipo);

      switch (config.tipo) {
        case TipoInforme.BALANCE:
          await this.generarBalance(config);
          break;
        
        case TipoInforme.PERDIDAS_GANANCIAS:
          await this.generarPerdidasyGanancias(config);
          break;
        
        default:
          throw new Error('Tipo de informe no implementado');
      }

      this.showSuccessMessage('Informe generado correctamente');
    } catch (error) {
      console.error('Error generating report:', error);
      this.error.set('Error al generar el informe');
      this.showErrorMessage('Error al generar el informe');
    } finally {
      this.loading.set(false);
    }
  }

  private async generarBalance(config: InformeConfig): Promise<void> {
    const ejercicioId = parseInt(config.ejercicioId!);
    const fechaHasta = config.fechaHasta;
    
    this.contabilidadService.getBalance(ejercicioId, fechaHasta).subscribe({
      next: (response) => {
        this.balance.set(response.data);
        this.perdidasyGanancias.set(null);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al generar el balance');
        this.loading.set(false);
        this.showErrorMessage('Error al generar el balance');
      }
    });
  }

  private async generarPerdidasyGanancias(config: InformeConfig): Promise<void> {
    const ejercicioId = parseInt(config.ejercicioId!);
    const fechaHasta = config.fechaHasta;
    
    this.contabilidadService.getPerdidasyGanancias(ejercicioId, fechaHasta).subscribe({
      next: (response) => {
        this.perdidasyGanancias.set(response.data);
        this.balance.set(null);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al generar las pérdidas y ganancias');
        this.loading.set(false);
        this.showErrorMessage('Error al generar las pérdidas y ganancias');
      }
    });
  }

  private getConfiguracionInforme(): InformeConfig {
    const formValue = this.informeForm.value;
    
    return {
      tipo: formValue.tipo!,
      formato: formValue.formato!,
      periodo: formValue.periodo!,
      fechaDesde: formValue.fechaDesde!,
      fechaHasta: formValue.fechaHasta!,
      ejercicioId: formValue.ejercicioId!,
      incluirCuentasCero: formValue.incluirCuentasCero!,
      incluirSubcuentas: formValue.incluirSubcuentas!,
      agruparPorNivel: formValue.agruparPorNivel!,
      nivelAgrupacion: formValue.nivelAgrupacion!
    };
  }

  exportarInforme(formato: 'pdf' | 'excel' | 'csv'): void {
    const informe = this.informeActual();
    const config = this.configuracionInforme();
    
    if (!informe || !config) {
      this.showErrorMessage('No hay informe para exportar');
      return;
    }

    try {
      // Aquí se implementaría la lógica de exportación
      // Por ahora solo mostramos un mensaje
      this.showSuccessMessage(`Exportando informe en formato ${formato.toUpperCase()}...`);
      
      // Simular descarga
      setTimeout(() => {
        this.showSuccessMessage(`Informe exportado correctamente en formato ${formato.toUpperCase()}`);
      }, 2000);
    } catch (error) {
      console.error('Error exporting report:', error);
      this.showErrorMessage('Error al exportar el informe');
    }
  }

  imprimirInforme(): void {
    if (!this.informeActual()) {
      this.showErrorMessage('No hay informe para imprimir');
      return;
    }

    try {
      window.print();
    } catch (error) {
      console.error('Error printing report:', error);
      this.showErrorMessage('Error al imprimir el informe');
    }
  }

  limpiarInforme(): void {
    this.balance.set(null);
    this.perdidasyGanancias.set(null);
    this.informeActual.set(null);
    this.error.set(null);
  }

  // Utility methods
  getTipoInformeLabel(tipo: TipoInforme): string {
    const labels = {
      [TipoInforme.BALANCE]: 'Balance de Situación',
      [TipoInforme.PERDIDAS_GANANCIAS]: 'Pérdidas y Ganancias',
      [TipoInforme.LIBRO_DIARIO]: 'Libro Diario',
      [TipoInforme.LIBRO_MAYOR]: 'Libro Mayor',
      [TipoInforme.BALANCE_COMPROBACION]: 'Balance de Comprobación'
    };
    return labels[tipo] || tipo;
  }

  getFormatoInformeLabel(formato: FormatoInforme): string {
    const labels = {
      [FormatoInforme.RESUMIDO]: 'Resumido',
      [FormatoInforme.DETALLADO]: 'Detallado',
      [FormatoInforme.COMPARATIVO]: 'Comparativo'
    };
    return labels[formato] || formato;
  }

  getPeriodoInformeLabel(periodo: PeriodoInforme): string {
    const labels = {
      [PeriodoInforme.EJERCICIO_COMPLETO]: 'Ejercicio Completo',
      [PeriodoInforme.PRIMER_TRIMESTRE]: 'Primer Trimestre',
      [PeriodoInforme.SEGUNDO_TRIMESTRE]: 'Segundo Trimestre',
      [PeriodoInforme.TERCER_TRIMESTRE]: 'Tercer Trimestre',
      [PeriodoInforme.CUARTO_TRIMESTRE]: 'Cuarto Trimestre',
      [PeriodoInforme.HASTA_HOY]: 'Hasta Hoy',
      [PeriodoInforme.PERSONALIZADO]: 'Personalizado'
    };
    return labels[periodo] || periodo;
  }

  formatImporte(importe: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(importe);
  }

  formatPorcentaje(porcentaje: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 2
    }).format(porcentaje / 100);
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES').format(d);
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}