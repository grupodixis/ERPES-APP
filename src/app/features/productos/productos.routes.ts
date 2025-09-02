import { Routes } from '@angular/router';
import { ProductosPageComponent } from './productos-page.component';

export const PRODUCTOS_ROUTES: Routes = [
  { path: '', component: ProductosPageComponent, data: { title: 'Categorías (Productos)' } },
];
