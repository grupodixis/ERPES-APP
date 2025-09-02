import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { EmpresasService } from '../../../application/services/empresas.service';
import { ToastService } from '../../../core/services/toast.service';
import { Empresa } from '../../../domain/auth.types';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
],
  template: `
    <div class="empresas-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>business</mat-icon>
            Empresas
          </mat-card-title>
          <mat-card-subtitle>Gestión de empresas</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="stats">
            <mat-chip color="primary" selected>
              Total: {{ empresasService.empresas().length }}
            </mat-chip>
            <mat-chip color="accent" selected>
              Activas: {{ empresasService.empresasActivas().length }}
            </mat-chip>
          </div>

          <mat-divider></mat-divider>

          <div class="empresas-list">
            @for (empresa of empresasService.empresas(); track empresa.id) {
              <div class="empresa-item">
                <div class="empresa-info">
                  <div class="empresa-nombre">
                    <mat-icon>apartment</mat-icon>
                    {{ empresa.nombre }}
                  </div>
                  <div class="empresa-detalles">
                    <span class="empresa-cif">{{ empresa.cif ?? 'CIF N/D' }}</span>
                    <span class="empresa-id">ID: {{ empresa.id }}</span>
                  </div>
                </div>

                <mat-slide-toggle
                  [checked]="empresa.activa"
                  color="primary"
                  (change)="onToggleActiva(empresa, $event.checked)">
                  Activa
                </mat-slide-toggle>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .empresas-container { padding: 20px; }
    mat-card-header { margin-bottom: 12px; }
    .stats { display: flex; gap: 8px; margin: 8px 0 16px; flex-wrap: wrap; }
    .empresas-list { display: flex; flex-direction: column; gap: 12px; }
    .empresa-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; }
    .empresa-info { display: flex; flex-direction: column; gap: 6px; }
    .empresa-nombre { display: flex; align-items: center; gap: 8px; font-weight: 600; }
    .empresa-detalles { display: flex; gap: 12px; color: #666; font-size: 12px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpresasComponent implements OnInit {
  constructor(
    public empresasService: EmpresasService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.empresasService.cargarEmpresas();
    } catch {
      this.toastService.showError('Error al cargar empresas');
    }
  }

  async onToggleActiva(empresa: Empresa, activa: boolean): Promise<void> {
    const previa = empresa.activa;
    // Optimistic UI: clonar array para forzar render
    const snapshot = this.empresasService.empresas();
    empresa.activa = activa;
    const cloned = snapshot.map(e => e.id === empresa.id ? { ...e, activa } : e);
    (this.empresasService as any)._empresas?.set?.(cloned);

    try {
      await this.empresasService.actualizarEmpresa(empresa.id, { activa });
      this.toastService.showSuccess(`Empresa ${activa ? 'activada' : 'desactivada'}`);
    } catch (e: any) {
      // Revertir
      empresa.activa = previa;
      const reverted = snapshot.map(e => e.id === empresa.id ? { ...e, activa: previa } : e);
      (this.empresasService as any)._empresas?.set?.(reverted);
      this.toastService.showError('No se pudo actualizar el estado');
    }
  }
}
