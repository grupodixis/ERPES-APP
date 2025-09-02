import { Routes } from '@angular/router';
import { PlaceholderComponent } from '../../shared/placeholder.component';

export const INVENTARIO_ROUTES: Routes = [
  { path: '', component: PlaceholderComponent, data: { title: 'Inventario' } },
  { path: 'depositos', component: PlaceholderComponent, data: { title: 'Depósitos' } },
  { path: 'movimientos', component: PlaceholderComponent, data: { title: 'Movimientos' } },
];
