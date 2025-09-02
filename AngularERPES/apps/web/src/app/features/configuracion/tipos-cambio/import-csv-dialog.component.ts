import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoCambioCsvRow } from '../../../domain/configuracion.types';

@Component({
  selector: 'app-import-csv-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    ReactiveFormsModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="import-csv-dialog">
      <h2 mat-dialog-title>
        <mat-icon>upload</mat-icon>
        Importar Tipos de Cambio desde CSV
      </h2>

      <mat-dialog-content>
        <!-- Instrucciones -->
        <div class="instructions">
          <h3>Formato del archivo CSV:</h3>
          <p>El archivo debe contener las siguientes columnas:</p>
          <ul>
            <li><strong>monedaOrigen</strong>: Código ISO de la moneda origen (ej: EUR)</li>
            <li><strong>monedaDestino</strong>: Código ISO de la moneda destino (ej: USD)</li>
            <li><strong>fecha</strong>: Fecha en formato YYYY-MM-DD</li>
            <li><strong>cambio</strong>: Tipo de cambio (ej: 1.2500)</li>
            <li><strong>fuente</strong>: (opcional) manual, banco_central, api</li>
          </ul>
          
          <div class="example">
            <strong>Ejemplo:</strong>
            <pre>monedaOrigen,monedaDestino,fecha,cambio,fuente
EUR,USD,2024-01-15,1.0850,banco_central
USD,EUR,2024-01-15,0.9217,api
GBP,EUR,2024-01-15,1.1650,manual</pre>
          </div>
        </div>

        <!-- Upload Area -->
        <div class="upload-area" 
             (dragover)="onDragOver($event)" 
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             [class.dragover]="isDragOver()"
             [class.has-file]="selectedFile()">
          
          @if (!selectedFile()) {
            <div class="upload-content">
              <mat-icon>cloud_upload</mat-icon>
              <p>Arrastra aquí tu archivo CSV o <button mat-button color="primary" (click)="fileInput.click()">selecciona un archivo</button></p>
              <input #fileInput type="file" 
                     accept=".csv" 
                     (change)="onFileSelected($event)"
                     style="display: none;">
            </div>
          } @else {
            <div class="file-info">
              <mat-icon>description</mat-icon>
              <div class="file-details">
                <p class="filename">{{ selectedFile()?.name }}</p>
                <p class="filesize">{{ formatFileSize(selectedFile()?.size || 0) }}</p>
              </div>
              <button mat-icon-button color="warn" (click)="removeFile()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        </div>

        <!-- Preview Table -->
        @if (csvData().length > 0) {
          <div class="preview-section">
            <h3>Vista previa ({{ csvData().length }} registros)</h3>
            
            @if (processing()) {
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            }

            <div class="table-container">
              <table mat-table [dataSource]="csvData()" class="preview-table">
                <!-- Moneda Origen -->
                <ng-container matColumnDef="monedaOrigen">
                  <th mat-header-cell *matHeaderCellDef>Moneda Origen</th>
                  <td mat-cell *matCellDef="let row">
                    <span [class.invalid]="!isValidCurrency(row.monedaOrigen)">
                      {{ row.monedaOrigen }}
                    </span>
                  </td>
                </ng-container>

                <!-- Moneda Destino -->
                <ng-container matColumnDef="monedaDestino">
                  <th mat-header-cell *matHeaderCellDef>Moneda Destino</th>
                  <td mat-cell *matCellDef="let row">
                    <span [class.invalid]="!isValidCurrency(row.monedaDestino)">
                      {{ row.monedaDestino }}
                    </span>
                  </td>
                </ng-container>

                <!-- Fecha -->
                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let row">
                    <span [class.invalid]="!isValidDate(row.fecha)">
                      {{ row.fecha }}
                    </span>
                  </td>
                </ng-container>

                <!-- Cambio -->
                <ng-container matColumnDef="cambio">
                  <th mat-header-cell *matHeaderCellDef>Tipo de Cambio</th>
                  <td mat-cell *matCellDef="let row">
                    <span [class.invalid]="!isValidNumber(row.cambio)">
                      {{ row.cambio }}
                    </span>
                  </td>
                </ng-container>

                <!-- Fuente -->
                <ng-container matColumnDef="fuente">
                  <th mat-header-cell *matHeaderCellDef>Fuente</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip [color]="getFuenteColor(row.fuente)" selected>
                      {{ row.fuente || 'manual' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Estado -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let row">
                    @if (isRowValid(row)) {
                      <mat-chip color="primary" selected>Válido</mat-chip>
                    } @else {
                      <mat-chip color="warn" selected>Error</mat-chip>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            <!-- Resumen -->
            <div class="summary">
              <p><strong>Resumen:</strong></p>
              <ul>
                <li>Total de registros: {{ csvData().length }}</li>
                <li>Registros válidos: {{ validRows() }}</li>
                <li>Registros con errores: {{ invalidRows() }}</li>
              </ul>
            </div>
          </div>
        }

        <!-- Errores -->
        @if (errors().length > 0) {
          <div class="errors">
            <h3>Errores encontrados:</h3>
            <ul>
              @for (error of errors(); track error) {
                <li>{{ error }}</li>
              }
            </ul>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onImport()"
                [disabled]="csvData().length === 0 || invalidRows() > 0 || importing()">
          @if (importing()) {
            <mat-spinner diameter="16"></mat-spinner>
          }
          Importar ({{ validRows() }} registros)
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .import-csv-dialog {
      min-width: 800px;
      max-width: 1000px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .instructions {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .instructions h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }

    .instructions ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .example {
      margin-top: 12px;
    }

    .example pre {
      background: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }

    .upload-area.dragover {
      border-color: #1976d2;
      background-color: #f0f8ff;
    }

    .upload-area.has-file {
      border-color: #4caf50;
      background-color: #f1f8e9;
    }

    .upload-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
      margin-bottom: 16px;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-details {
      flex: 1;
      text-align: left;
    }

    .filename {
      font-weight: bold;
      margin: 0;
    }

    .filesize {
      color: #666;
      margin: 0;
      font-size: 12px;
    }

    .preview-section {
      margin-top: 20px;
    }

    .preview-section h3 {
      margin: 0 0 12px 0;
    }

    .table-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .preview-table {
      width: 100%;
    }

    .invalid {
      color: #f44336;
      font-weight: bold;
    }

    .summary {
      margin-top: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .summary ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .errors {
      margin-top: 16px;
      padding: 12px;
      background: #ffebee;
      border-radius: 4px;
      border-left: 4px solid #f44336;
    }

    .errors h3 {
      margin: 0 0 8px 0;
      color: #f44336;
    }

    .errors ul {
      margin: 0;
      padding-left: 20px;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }

    mat-dialog-actions button {
      min-width: 120px;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class ImportCsvDialogComponent {
  private dialogRef = inject(MatDialogRef<ImportCsvDialogComponent>);

  selectedFile = signal<File | null>(null);
  csvData = signal<TipoCambioCsvRow[]>([]);
  errors = signal<string[]>([]);
  isDragOver = signal(false);
  processing = signal(false);
  importing = signal(false);

  displayedColumns = ['monedaOrigen', 'monedaDestino', 'fecha', 'cambio', 'fuente', 'estado'];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.processFile(target.files[0]);
    }
  }

  private async processFile(file: File): Promise<void> {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.errors.update(errors => [...errors, 'El archivo debe ser un CSV']);
      return;
    }

    this.selectedFile.set(file);
    this.processing.set(true);
    this.errors.set([]);

    try {
      const text = await file.text();
      const rows = this.parseCsv(text);
      this.csvData.set(rows);
    } catch (error) {
      this.errors.update(errors => [...errors, 'Error al leer el archivo CSV']);
    } finally {
      this.processing.set(false);
    }
  }

  private parseCsv(csvText: string): TipoCambioCsvRow[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      this.errors.update(errors => [...errors, 'El archivo CSV debe tener al menos una línea de encabezado y una línea de datos']);
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['monedaorigen', 'monedadestino', 'fecha', 'cambio'];
    
    // Validar headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      this.errors.update(errors => [...errors, `Faltan columnas requeridas: ${missingHeaders.join(', ')}`]);
      return [];
    }

    const rows: TipoCambioCsvRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 4) continue;

      const row: TipoCambioCsvRow = {
        monedaOrigen: values[headers.indexOf('monedaorigen')] || '',
        monedaDestino: values[headers.indexOf('monedadestino')] || '',
        fecha: values[headers.indexOf('fecha')] || '',
        cambio: values[headers.indexOf('cambio')] || '',
        fuente: values[headers.indexOf('fuente')] || 'manual'
      };

      rows.push(row);
    }

    return rows;
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.csvData.set([]);
    this.errors.set([]);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isValidCurrency(code: string): boolean {
    return /^[A-Z]{3}$/.test(code);
  }

  isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  isValidNumber(numStr: string): boolean {
    const num = parseFloat(numStr);
    return !isNaN(num) && num > 0;
  }

  isRowValid(row: TipoCambioCsvRow): boolean {
    return this.isValidCurrency(row.monedaOrigen) &&
           this.isValidCurrency(row.monedaDestino) &&
           this.isValidDate(row.fecha) &&
           this.isValidNumber(row.cambio);
  }

  validRows(): number {
    return this.csvData().filter(row => this.isRowValid(row)).length;
  }

  invalidRows(): number {
    return this.csvData().length - this.validRows();
  }

  getFuenteColor(fuente: string): string {
    switch (fuente) {
      case 'banco_central': return 'primary';
      case 'api': return 'accent';
      case 'manual': return 'warn';
      default: return 'primary';
    }
  }

  async onImport(): Promise<void> {
    if (this.validRows() === 0) return;

    this.importing.set(true);

    try {
      const validData = this.csvData().filter(row => this.isRowValid(row));
      this.dialogRef.close(validData);
    } catch (error) {
      this.errors.update(errors => [...errors, 'Error al procesar la importación']);
    } finally {
      this.importing.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
