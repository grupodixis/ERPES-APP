import { Routes } from '@angular/router';
import { PlaceholderComponent } from '../../shared/placeholder.component';

export const COMPRAS_ROUTES: Routes = [
  { path: '', component: PlaceholderComponent, data: { title: 'Compras' } },
  { path: 'pedidos', component: PlaceholderComponent, data: { title: 'Pedidos' } },
  { path: 'recepciones', component: PlaceholderComponent, data: { title: 'Recepciones' } },
];
