import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ContabilidadService } from '../contabilidad.service';
import { AsientoContable, ApunteContable, EstadoAsiento, TipoAsiento, CuentaContable } from '../contabilidad.types';
import { Observable, startWith, map } from 'rxjs';

@Component({
  selector: 'app-asientos-contables',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatCheckboxModule
  ],
  templateUrl: './asientos-contables.component.html',
  styleUrls: ['./asientos-contables.component.scss']
})
export class AsientosContablesComponent implements OnInit {
  private contabilidadService = inject(ContabilidadService);
  private fb = inject(FormBuilder);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  // ID del ejercicio seleccionado (si viene de la navegación)
  ejercicioId = signal<string | null>(null);

  // Signals para el estado
  asientos = signal<AsientoContable[]>([]);
  cuentas = signal<CuentaContable[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedAsiento = signal<AsientoContable | null>(null);
  editingAsiento = signal<AsientoContable | null>(null);
  showForm = signal(false);

  // Filtros
  numeroFilter = new FormControl('');
  fechaDesdeFilter = new FormControl<Date | null>(null);
  fechaHastaFilter = new FormControl<Date | null>(null);
  tipoFilter = new FormControl<TipoAsiento | ''>('');
  estadoFilter = new FormControl<EstadoAsiento | ''>('');
  conceptoFilter = new FormControl('');
  cuentaFilter = new FormControl('');
  importeDesdeFilter = new FormControl<number | null>(null);
  importeHastaFilter = new FormControl<number | null>(null);

  // Configuración de paginación y ordenamiento
  pageSize = signal(25);
  pageIndex = signal(0);
  totalItems = signal(0);
  sortField = signal<string>('fecha');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Formulario de asiento
  asientoForm: FormGroup;
  filteredCuentas: Observable<CuentaContable[]>;

  // Configuración de la tabla
  displayedColumns = ['numero', 'fecha', 'tipo', 'concepto', 'totalDebe', 'totalHaber', 'estado', 'acciones'];
  displayedApuntesColumns = ['cuenta', 'concepto', 'debe', 'haber', 'acciones'];

  // Computed values
  filteredAsientos = computed(() => {
    let asientos = this.asientos();
    
    const numero = this.numeroFilter.value?.toLowerCase() || '';
    const fechaDesde = this.fechaDesdeFilter.value;
    const fechaHasta = this.fechaHastaFilter.value;
    const tipo = this.tipoFilter.value;
    const estado = this.estadoFilter.value;
    const concepto = this.conceptoFilter.value?.toLowerCase() || '';
    const cuenta = this.cuentaFilter.value?.toLowerCase() || '';
    const importeDesde = this.importeDesdeFilter.value;
    const importeHasta = this.importeHastaFilter.value;

    if (numero) {
      asientos = asientos.filter(a => a.numero.toLowerCase().includes(numero));
    }
    if (fechaDesde) {
      asientos = asientos.filter(a => new Date(a.fecha) >= fechaDesde);
    }
    if (fechaHasta) {
      asientos = asientos.filter(a => new Date(a.fecha) <= fechaHasta);
    }
    if (tipo) {
      asientos = asientos.filter(a => a.tipoAsiento === tipo);
    }
    if (estado) {
      asientos = asientos.filter(a => a.estado === estado);
    }
    if (concepto) {
      asientos = asientos.filter(a => a.concepto.toLowerCase().includes(concepto));
    }
    if (cuenta) {
      asientos = asientos.filter(a => 
        a.apuntes.some(ap => 
          ap.cuenta?.codigo?.toLowerCase().includes(cuenta) || 
          ap.cuenta?.nombre?.toLowerCase().includes(cuenta)
        )
      );
    }
    if (importeDesde !== null) {
      asientos = asientos.filter(a => a.totalDebe >= importeDesde);
    }
    if (importeHasta !== null) {
      asientos = asientos.filter(a => a.totalDebe <= importeHasta);
    }
    
    // Filtrar por ejercicio si está especificado
    const ejercicioIdValue = this.ejercicioId();
    if (ejercicioIdValue) {
      const ejercicioIdNumber = parseInt(ejercicioIdValue, 10);
      asientos = asientos.filter(a => a.ejercicioId === ejercicioIdNumber);
    }

    return asientos;
  });

  paginatedAsientos = computed(() => {
    const filtered = this.filteredAsientos();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  estadisticas = computed(() => {
    const asientos = this.asientos();
    return {
      total: asientos.length,
      borrador: asientos.filter(a => a.estado === EstadoAsiento.BORRADOR).length,
      confirmado: asientos.filter(a => a.estado === EstadoAsiento.CONFIRMADO).length,
      cerrado: asientos.filter(a => a.estado === EstadoAsiento.CONFIRMADO).length,
      totalImporte: asientos.reduce((sum, a) => sum + a.totalDebe, 0),
      porTipo: {
        apertura: asientos.filter(a => a.tipoAsiento === TipoAsiento.APERTURA).length,
      ordinario: asientos.filter(a => a.tipoAsiento === TipoAsiento.ORDINARIO).length,
      regularizacion: asientos.filter(a => a.tipoAsiento === TipoAsiento.REGULARIZACION).length,
      cierre: asientos.filter(a => a.tipoAsiento === TipoAsiento.CIERRE).length
      }
    };
  });

  // Enums para el template
  TipoAsiento = TipoAsiento;
  EstadoAsiento = EstadoAsiento;

  constructor() {
    this.asientoForm = this.fb.group({
      numero: ['', [Validators.required]],
      fecha: [new Date(), [Validators.required]],
      tipo: [TipoAsiento.ORDINARIO, [Validators.required]],
      concepto: ['', [Validators.required, Validators.minLength(5)]],
      observaciones: [''],
      apuntes: this.fb.array([], [Validators.minLength(2)])
    });

    this.filteredCuentas = this.asientoForm.get('apuntes')!.valueChanges.pipe(
      startWith(''),
      map(() => this.cuentas().filter(cuenta => cuenta.activa))
    );
  }

  ngOnInit(): void {
    // Leer el parámetro ejercicioId de la ruta
    const ejercicioIdParam = this.route.snapshot.paramMap.get('ejercicioId');
    if (ejercicioIdParam) {
      this.ejercicioId.set(ejercicioIdParam);
    }
    
    this.setupFilters();
    this.loadAsientos();
    this.loadCuentas();
  }

  private setupFilters(): void {
    // Configurar filtros reactivos
    [this.numeroFilter, this.fechaDesdeFilter, this.fechaHastaFilter,
     this.tipoFilter, this.estadoFilter, this.conceptoFilter,
     this.cuentaFilter, this.importeDesdeFilter, this.importeHastaFilter].forEach((control: any) => {
      control.valueChanges.subscribe(() => {
        this.pageIndex.set(0);
        this.updateTotalItems();
      });
    });
  }

  private updateTotalItems(): void {
    this.totalItems.set(this.filteredAsientos().length);
  }

  async loadAsientos(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      const response = await this.contabilidadService.getAsientos().toPromise();
      this.asientos.set(response?.data || []);
      this.updateTotalItems();
      
    } catch (error) {
      console.error('Error al cargar asientos:', error);
      this.error.set('Error al cargar los asientos contables');
      this.showMessage('Error al cargar los asientos contables', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async loadCuentas(): Promise<void> {
    try {
      const response = await this.contabilidadService.getCuentas().toPromise();
      this.cuentas.set(response?.data || []);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  }

  get apuntesFormArray(): FormArray {
    return this.asientoForm.get('apuntes') as FormArray;
  }

  createApunteFormGroup(): FormGroup {
    return this.fb.group({
      codigoCuenta: ['', [Validators.required]],
      nombreCuenta: ['', [Validators.required]],
      concepto: [''],
      debe: [0, [Validators.min(0)]],
      haber: [0, [Validators.min(0)]]
    }, { validators: this.apunteValidator });
  }

  private apunteValidator(group: FormGroup) {
    const debe = group.get('debe')?.value || 0;
    const haber = group.get('haber')?.value || 0;
    
    if (debe === 0 && haber === 0) {
      return { importeRequerido: true };
    }
    if (debe > 0 && haber > 0) {
      return { ambosImportes: true };
    }
    return null;
  }

  addApunte(): void {
    const apunteGroup = this.createApunteFormGroup();
    this.apuntesFormArray.push(apunteGroup);
  }

  removeApunte(index: number): void {
    if (this.apuntesFormArray.length > 2) {
      this.apuntesFormArray.removeAt(index);
    }
  }

  onCuentaSelected(apunteIndex: number, cuenta: CuentaContable): void {
    const apunteGroup = this.apuntesFormArray.at(apunteIndex) as FormGroup;
    apunteGroup.patchValue({
      codigoCuenta: cuenta.codigo,
      nombreCuenta: cuenta.nombre
    });
  }

  getTotalDebe(): number {
    return this.apuntesFormArray.controls.reduce((total, control) => {
      return total + (control.get('debe')?.value || 0);
    }, 0);
  }

  getTotalHaber(): number {
    return this.apuntesFormArray.controls.reduce((total, control) => {
      return total + (control.get('haber')?.value || 0);
    }, 0);
  }

  isAsientoBalanced(): boolean {
    const totalDebe = this.getTotalDebe();
    const totalHaber = this.getTotalHaber();
    return Math.abs(totalDebe - totalHaber) < 0.01;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.sortField.set(sort.active);
    this.sortDirection.set(sort.direction as 'asc' | 'desc');
  }

  clearFilters(): void {
    this.numeroFilter.setValue('');
    this.fechaDesdeFilter.setValue(null);
    this.fechaHastaFilter.setValue(null);
    this.tipoFilter.setValue('');
    this.estadoFilter.setValue('');
    this.conceptoFilter.setValue('');
    this.cuentaFilter.setValue('');
    this.importeDesdeFilter.setValue(null);
    this.importeHastaFilter.setValue(null);
  }

  showCreateForm(): void {
    this.editingAsiento.set(null);
    this.resetForm();
    this.showForm.set(true);
  }

  showEditForm(asiento: AsientoContable): void {
    if (asiento.estado !== EstadoAsiento.BORRADOR) {
      this.showMessage('Solo se pueden editar asientos en estado borrador', 'warning');
      return;
    }
    
    this.editingAsiento.set(asiento);
    this.loadAsientoToForm(asiento);
    this.showForm.set(true);
  }

  hideForm(): void {
    this.showForm.set(false);
    this.editingAsiento.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.asientoForm.reset({
      numero: '',
      fecha: new Date(),
      tipo: TipoAsiento.ORDINARIO,
      concepto: '',
      observaciones: ''
    });
    
    // Limpiar array de apuntes
    while (this.apuntesFormArray.length > 0) {
      this.apuntesFormArray.removeAt(0);
    }
    
    // Agregar dos apuntes iniciales
    this.addApunte();
    this.addApunte();
  }

  private loadAsientoToForm(asiento: AsientoContable): void {
    this.asientoForm.patchValue({
      numero: asiento.numero,
      fecha: new Date(asiento.fecha),
      tipo: asiento.tipoAsiento,
      concepto: asiento.concepto,
      observaciones: asiento.descripcion || ''
    });

    // Limpiar array de apuntes
    while (this.apuntesFormArray.length > 0) {
      this.apuntesFormArray.removeAt(0);
    }

    // Cargar apuntes
    asiento.apuntes.forEach(apunte => {
      const apunteGroup = this.createApunteFormGroup();
      apunteGroup.patchValue({
        codigoCuenta: apunte.cuenta?.codigo || '',
        nombreCuenta: apunte.cuenta?.nombre || '',
        concepto: apunte.concepto,
        debe: apunte.debe,
        haber: apunte.haber
      });
      this.apuntesFormArray.push(apunteGroup);
    });
  }

  async saveAsiento(): Promise<void> {
    if (!this.asientoForm.valid) {
      this.showMessage('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    if (!this.isAsientoBalanced()) {
      this.showMessage('El asiento debe estar balanceado (Debe = Haber)', 'warning');
      return;
    }

    try {
      this.loading.set(true);
      
      const formValue = this.asientoForm.value;
      const asientoData: Partial<AsientoContable> = {
        numero: formValue.numero,
        fecha: formValue.fecha,
        tipoAsiento: formValue.tipo,
        concepto: formValue.concepto,
        descripcion: formValue.observaciones,
        apuntes: formValue.apuntes.map((apunte: any) => ({
          cuentaId: apunte.cuentaId,
          concepto: apunte.concepto || formValue.concepto,
          debe: apunte.debe || 0,
          haber: apunte.haber || 0,
          orden: apunte.orden || 0
        })),
        totalDebe: this.getTotalDebe(),
        totalHaber: this.getTotalHaber(),
        estado: EstadoAsiento.BORRADOR,
        usuarioCreacion: 'usuario_actual',
        fechaCreacion: new Date()
      };

      if (this.editingAsiento()) {
        await this.contabilidadService.updateAsientoContable(
          this.editingAsiento()!.id, 
          asientoData as AsientoContable
        ).toPromise();
        this.showMessage('Asiento actualizado exitosamente', 'success');
      } else {
        await this.contabilidadService.createAsientoContable(
          asientoData as AsientoContable
        ).toPromise();
        this.showMessage('Asiento creado exitosamente', 'success');
      }
      
      await this.loadAsientos();
      this.hideForm();
      
    } catch (error) {
      console.error('Error al guardar asiento:', error);
      this.showMessage('Error al guardar el asiento', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async confirmAsiento(asiento: AsientoContable): Promise<void> {
    if (asiento.estado !== EstadoAsiento.BORRADOR) {
      this.showMessage('Solo se pueden confirmar asientos en estado borrador', 'warning');
      return;
    }

    if (confirm(`¿Confirmar el asiento ${asiento.numero}? Una vez confirmado no se podrá modificar.`)) {
      try {
        this.loading.set(true);
        
        const asientoActualizado = {
          ...asiento,
          estado: EstadoAsiento.CONFIRMADO,
          fechaModificacion: new Date()
        };
        
        await this.contabilidadService.updateAsientoContable(asiento.id, asientoActualizado).toPromise();
        await this.loadAsientos();
        this.showMessage('Asiento confirmado exitosamente', 'success');
        
      } catch (error) {
        console.error('Error al confirmar asiento:', error);
        this.showMessage('Error al confirmar el asiento', 'error');
      } finally {
        this.loading.set(false);
      }
    }
  }

  async duplicateAsiento(asiento: AsientoContable): Promise<void> {
    try {
      this.loading.set(true);
      
      const nuevoAsiento: Partial<AsientoContable> = {
        ...asiento,
        numero: asiento.numero + '_COPY',
        fecha: new Date(),
        estado: EstadoAsiento.BORRADOR,
        usuarioCreacion: 'usuario_actual',
        fechaCreacion: new Date()
      };
      
      delete nuevoAsiento.id;
      
      await this.contabilidadService.createAsientoContable(nuevoAsiento as AsientoContable).toPromise();
      await this.loadAsientos();
      this.showMessage('Asiento duplicado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error al duplicar asiento:', error);
      this.showMessage('Error al duplicar el asiento', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteAsiento(asiento: AsientoContable): Promise<void> {
    if (asiento.estado === EstadoAsiento.CONFIRMADO) {
      this.showMessage('No se pueden eliminar asientos confirmados', 'warning');
      return;
    }

    if (confirm(`¿Está seguro de eliminar el asiento "${asiento.numero}"?`)) {
      try {
        this.loading.set(true);
        
        await this.contabilidadService.deleteAsientoContable(asiento.id).toPromise();
        await this.loadAsientos();
        this.showMessage('Asiento eliminado exitosamente', 'success');
        
      } catch (error) {
        console.error('Error al eliminar asiento:', error);
        this.showMessage('Error al eliminar el asiento', 'error');
      } finally {
        this.loading.set(false);
      }
    }
  }

  selectAsiento(asiento: AsientoContable): void {
    this.selectedAsiento.set(asiento);
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  getTipoLabel(tipo: TipoAsiento): string {
    const labels = {
      [TipoAsiento.APERTURA]: 'Apertura',
      [TipoAsiento.ORDINARIO]: 'Ordinario',
      [TipoAsiento.REGULARIZACION]: 'Regularización',
      [TipoAsiento.CIERRE]: 'Cierre'
    };
    return labels[tipo] || tipo;
  }

  getEstadoLabel(estado: EstadoAsiento): string {
    const labels = {
      [EstadoAsiento.BORRADOR]: 'Borrador',
      [EstadoAsiento.CONFIRMADO]: 'Confirmado'
    };
    return labels[estado] || estado;
  }

  formatImporte(importe: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(importe);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}