import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogData, ConfirmDialogResult } from '../../domain/common.types';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header" [class]="data.type || 'info'">
        <mat-icon class="header-icon">
          {{ getIcon() }}
        </mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content>
        <p class="dialog-message">{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button mat-raised-button 
                [color]="getButtonColor()"
                (click)="onConfirm()">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 16px 0 16px;
    }

    .dialog-header.info {
      color: #1976d2;
    }

    .dialog-header.warning {
      color: #ff9800;
    }

    .dialog-header.error {
      color: #f44336;
    }

    .header-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    mat-dialog-content {
      padding: 16px;
    }

    .dialog-message {
      margin: 0;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.87);
    }

    mat-dialog-actions {
      padding: 16px;
    }

    @media (max-width: 480px) {
      .confirm-dialog {
        min-width: 300px;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent, ConfirmDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warn';
      case 'error':
        return 'warn';
      default:
        return 'primary';
    }
  }

  onConfirm(): void {
    const result: ConfirmDialogResult = { confirmed: true };
    this.dialogRef.close(result);
  }

  onCancel(): void {
    const result: ConfirmDialogResult = { confirmed: false };
    this.dialogRef.close(result);
  }
}
