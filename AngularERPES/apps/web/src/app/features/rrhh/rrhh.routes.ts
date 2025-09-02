import { Routes } from '@angular/router';
import { PlaceholderComponent } from '../../shared/placeholder.component';

export const RRHH_ROUTES: Routes = [
  { path: '', component: PlaceholderComponent, data: { title: 'RRHH' } },
  { path: 'operarios', component: PlaceholderComponent, data: { title: 'Operarios' } },
  { path: 'partes', component: PlaceholderComponent, data: { title: 'Partes' } },
];
