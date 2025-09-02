import { Routes } from '@angular/router';
import { PlaceholderComponent } from '../../shared/placeholder.component';

export const CONTABILIDAD_ROUTES: Routes = [
  { path: '', component: PlaceholderComponent, data: { title: 'Contabilidad' } },
  { path: 'asientos', component: PlaceholderComponent, data: { title: 'Asientos' } },
  { path: 'informes', component: PlaceholderComponent, data: { title: 'Informes' } },
];
