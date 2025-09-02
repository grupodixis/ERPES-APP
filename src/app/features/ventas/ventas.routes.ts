import { Routes } from '@angular/router';
import { PlaceholderComponent } from '../../shared/placeholder.component';

export const VENTAS_ROUTES: Routes = [
  { path: '', component: PlaceholderComponent, data: { title: 'Ventas' } },
  { path: 'pedidos', component: PlaceholderComponent, data: { title: 'Pedidos' } },
  { path: 'facturas', component: PlaceholderComponent, data: { title: 'Facturas' } },
];
