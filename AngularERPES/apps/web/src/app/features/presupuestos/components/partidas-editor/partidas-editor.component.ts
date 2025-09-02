import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { PresupuestosService } from '../../services/presupuestos.service';
import { Partida, CreatePartidaDto, UpdatePartidaDto, Presupuesto, PartidaFilters, CapituloFilters, Capitulo } from '../../../../domain/presupuestos.types';

@Component({
  selector: 'app-partidas-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './partidas-editor.component.html',
  styleUrls: ['./partidas-editor.component.scss']
})
export class PartidasEditorComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly presupuestosService = inject(PresupuestosService);
  private readonly snackBar = inject(MatSnackBar);

  readonly partidas = signal<Partida[]>([]);
  readonly presupuesto = signal<Presupuesto | null>(null);
  readonly loading = computed(() => this.presupuestosService.loading());
  readonly error = computed(() => this.presupuestosService.error());

  presupuestoId!: number;
  capituloId!: number;
  capituloNombre = signal<string>('');
  editingPartida: Partida | null = null;
  partidaForm!: FormGroup;

  displayedColumns: string[] = ['codigo', 'nombre', 'unidades', 'precioUnitario', 'totalConIva', 'acciones'];

  ngOnInit(): void {
    this.initializeForm();
    this.loadRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.partidaForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(500)]],
      unidades: [1, [Validators.required, Validators.min(0)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private loadRouteParams(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.presupuestoId = +params['id'];
      this.capituloId = +params['capituloId'];
      this.loadPresupuesto();
      this.loadPartidas();
      this.loadCapituloInfo();
    });
  }

  private loadPresupuesto(): void {
    this.presupuestosService.getPresupuesto(this.presupuestoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (presupuesto) => {
          this.presupuesto.set(presupuesto);
        },
        error: (error) => {
          console.error('Error cargando presupuesto:', error);
        }
      });
  }

  private loadPartidas(): void {
    this.presupuestosService.getPartidas({ capituloId: this.capituloId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (partidas: Partida[]) => {
          this.partidas.set(partidas);
        },
        error: (error: any) => {
          console.error('Error cargando partidas:', error);
          this.showError('Error al cargar las partidas');
        }
      });
  }

  private loadCapituloInfo(): void {
    this.presupuestosService.getCapitulos({ presupuestoId: this.presupuestoId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (capitulos: Capitulo[]) => {
          const capitulo = capitulos.find(c => c.id === this.capituloId);
          if (capitulo) {
            this.capituloNombre.set(capitulo.nombre);
          }
        },
        error: (error: any) => {
          console.error('Error cargando capítulo:', error);
        }
      });
  }

  onAddPartida(): void {
    this.editingPartida = null;
    this.partidaForm.reset({
      codigo: '',
      nombre: '',
      unidades: 1,
      precioUnitario: 0
    });
  }

  onEditPartida(partida: Partida): void {
    this.editingPartida = partida;
    this.partidaForm.patchValue({
      codigo: partida.codigo,
      nombre: partida.nombre,
      unidades: partida.unidades,
      precioUnitario: partida.precioUnitario
    });
  }

  onSavePartida(): void {
    if (this.partidaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.partidaForm.value;

    if (this.editingPartida) {
      // Actualizar partida existente
      const updateDto: UpdatePartidaDto = {
        nombre: formValue.nombre,
        cantidad: formValue.unidades,
        precio: formValue.precioUnitario
      };

      this.presupuestosService.updatePartida(this.editingPartida.id, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Partida actualizada correctamente');
            this.loadPartidas();
            this.cancelEdit();
          },
          error: (error) => {
            console.error('Error actualizando partida:', error);
            this.showError('Error al actualizar la partida');
          }
        });
    } else {
      // Crear nueva partida
      const createDto: CreatePartidaDto = {
        presupuestoId: this.presupuestoId,
        capituloId: this.capituloId,
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        cantidad: formValue.unidades,
        precio: formValue.precioUnitario,
        unidadMedidaId: 1 // Valor por defecto, debería obtenerse del formulario
      };

      this.presupuestosService.createPartida(createDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Partida creada correctamente');
            this.loadPartidas();
            this.cancelEdit();
          },
          error: (error) => {
            console.error('Error creando partida:', error);
            this.showError('Error al crear la partida');
          }
        });
    }
  }

  onDeletePartida(partida: Partida): void {
    if (confirm(`¿Está seguro de que desea eliminar la partida "${partida.nombre}"?`)) {
      this.presupuestosService.deletePartida(partida.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Partida eliminada correctamente');
            this.loadPartidas();
          },
          error: (error) => {
            console.error('Error eliminando partida:', error);
            this.showError('Error al eliminar la partida');
          }
        });
    }
  }

  cancelEdit(): void {
    this.editingPartida = null;
    this.partidaForm.reset();
  }

  onBack(): void {
    this.router.navigate(['/presupuestos', this.presupuestoId, 'edit']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.partidaForm.controls).forEach(key => {
      this.partidaForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}