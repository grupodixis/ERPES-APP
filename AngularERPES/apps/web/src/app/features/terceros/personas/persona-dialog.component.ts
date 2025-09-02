import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Persona, CreatePersonaDto, UpdatePersonaDto } from '../../../domain/terceros.types';
import { PersonasService } from '../../../application/services/personas.service';

export interface PersonaDialogData {
  persona?: Persona;
  isEdit: boolean;
}

@Component({
  selector: 'app-persona-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="persona-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.isEdit ? 'edit' : 'add' }}</mat-icon>
        {{ data.isEdit ? 'Editar' : 'Nueva' }} Persona
      </h2>
    
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Código</mat-label>
              <input matInput formControlName="codigo" placeholder="P0001">
              @if (form.get('codigo')?.hasError('required')) {
                <mat-error>
                  El código es requerido
                </mat-error>
              }
            </mat-form-field>
          </div>
    
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre" placeholder="Juan">
              @if (form.get('nombre')?.hasError('required')) {
                <mat-error>
                  El nombre es requerido
                </mat-error>
              }
            </mat-form-field>
    
            <mat-form-field appearance="outline">
              <mat-label>Apellidos</mat-label>
              <input matInput formControlName="apellidos" placeholder="García López">
              @if (form.get('apellidos')?.hasError('required')) {
                <mat-error>
                  Los apellidos son requeridos
                </mat-error>
              }
            </mat-form-field>
          </div>
    
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>NIF</mat-label>
              <input matInput formControlName="nif" placeholder="12345678A">
              @if (form.get('nif')?.hasError('required')) {
                <mat-error>
                  El NIF es requerido
                </mat-error>
              }
            </mat-form-field>
    
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="juan@email.com">
              @if (form.get('email')?.hasError('email')) {
                <mat-error>
                  Email inválido
                </mat-error>
              }
            </mat-form-field>
          </div>
    
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="telefono" placeholder="+34 600 000 000">
            </mat-form-field>
    
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="tipo">
                @for (tipo of tipos; track tipo) {
                  <mat-option [value]="tipo">
                    {{ tipo | titlecase }}
                  </mat-option>
                }
              </mat-select>
              @if (form.get('tipo')?.hasError('required')) {
                <mat-error>
                  El tipo es requerido
                </mat-error>
              }
            </mat-form-field>
          </div>
    
          <div class="form-row">
            <mat-slide-toggle formControlName="activa" color="primary">
              Persona activa
            </mat-slide-toggle>
          </div>
        </mat-dialog-content>
    
        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            Cancelar
          </button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="16" class="spinner-margin"></mat-spinner>
            }
            {{ data.isEdit ? 'Actualizar' : 'Crear' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
    `,
  styles: [`
    .persona-dialog {
      min-width: 500px;
    }

    h2 mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .spinner-margin {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .persona-dialog {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class PersonaDialogComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  tipos = ['cliente', 'proveedor', 'empleado', 'otro'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PersonaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PersonaDialogData,
    private personasService: PersonasService
  ) {
    this.form = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      nif: ['', [Validators.required]],
      email: ['', [Validators.email]],
      telefono: [''],
      tipo: ['cliente', [Validators.required]],
      activa: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.persona) {
      this.form.patchValue({
        codigo: this.data.persona.codigo,
        nombre: this.data.persona.nombre,
        apellidos: this.data.persona.apellidos,
        nif: this.data.persona.nif,
        email: this.data.persona.email,
        telefono: this.data.persona.telefono,
        tipo: this.data.persona.tipo,
        activa: this.data.persona.activa
      });
    } else {
      // Generar código automático para nuevas personas
      const codigo = this.personasService.generarCodigoSiguiente();
      this.form.patchValue({ codigo });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.loading.set(true);
      try {
        if (this.data.isEdit && this.data.persona) {
          const updates: UpdatePersonaDto = this.form.value;
          await this.personasService.actualizarPersona(this.data.persona.id, updates);
        } else {
          const createData: CreatePersonaDto = this.form.value;
          await this.personasService.crearPersona(createData);
        }
        this.dialogRef.close(true);
      } catch (error: any) {
        console.error('Error al guardar persona:', error);
        // Aquí se podría mostrar un toast de error
      } finally {
        this.loading.set(false);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
