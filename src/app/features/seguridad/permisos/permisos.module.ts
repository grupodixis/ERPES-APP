import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

// Routing
import { PermisosRoutingModule } from './permisos-routing.module';

// Components
import { PermisosComponent } from './presentation/components/permisos.component';
import { PermisoDialogComponent } from './presentation/components/permiso-dialog.component';

// Services
import { PermisoService } from './application/services/permiso.service';
import { PermisoRepository } from './domain/repositories/permiso.repository';
import { PermisoHttpAdapter } from './infrastructure/adapters/permiso-http.adapter';

@NgModule({
  declarations: [
    // Los componentes son standalone, no se declaran aquí
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PermisosRoutingModule,
    
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule
  ],
  providers: [
    PermisoService,
    {
      provide: PermisoRepository,
      useClass: PermisoHttpAdapter
    }
  ],
  exports: [
    // Los componentes standalone se exportan desde sus propios archivos
  ]
})
export class PermisosModule { }