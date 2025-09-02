import { Routes } from '@angular/router';
import { PlanificacionComponent } from './planificacion.component';

export const PLANIFICACION_ROUTES: Routes = [
  { path: '', component: PlanificacionComponent, data: { title: 'Planificación' } },
];
