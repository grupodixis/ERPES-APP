import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule
],
  template: `
    <div class="placeholder">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>construction</mat-icon>
            {{ title }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Esta sección está en desarrollo.</p>
          <p>Próximamente disponible.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .placeholder {
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    mat-card {
      max-width: 400px;
      text-align: center;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    mat-icon {
      color: #ff9800;
    }
  `]
})
export class PlaceholderComponent implements OnInit {
  title = 'En desarrollo';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['title']) {
        this.title = data['title'];
      }
    });
  }
}
