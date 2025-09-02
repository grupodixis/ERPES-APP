import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['success-snackbar'],
    });
  }

  showError(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['error-snackbar'],
    });
  }

  showWarning(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['warning-snackbar'],
    });
  }

  showInfo(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['info-snackbar'],
    });
  }

  showWithAction(
    message: string,
    action: string,
    config?: MatSnackBarConfig
  ): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      ...config,
    });
  }
}
