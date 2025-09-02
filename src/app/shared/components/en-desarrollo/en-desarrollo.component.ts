import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-en-desarrollo',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="en-desarrollo-container">
      <mat-card class="desarrollo-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="desarrollo-icon">construction</mat-icon>
          <mat-card-title>{{ titulo }}</mat-card-title>
          <mat-card-subtitle>Página en desarrollo</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="desarrollo-content">
            <mat-icon class="large-icon">build_circle</mat-icon>
            <h2>Esta funcionalidad está en desarrollo</h2>
            <p>Estamos trabajando para traerte esta característica pronto.</p>
            <p class="feature-name">Módulo: <strong>{{ titulo }}</strong></p>
          </div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .en-desarrollo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 2rem;
    }
    
    .desarrollo-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    
    .desarrollo-icon {
      background-color: #ff9800;
      color: white;
    }
    
    .desarrollo-content {
      padding: 2rem 0;
    }
    
    .large-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ff9800;
      margin-bottom: 1rem;
    }
    
    .feature-name {
      margin-top: 1.5rem;
      font-size: 1.1rem;
    }
    
    h2 {
      color: #333;
      margin: 1rem 0;
    }
    
    p {
      color: #666;
      line-height: 1.5;
    }
  `]
})
export class EnDesarrolloComponent {
  @Input() titulo: string = 'Funcionalidad';
  
  goBack(): void {
    window.history.back();
  }
}