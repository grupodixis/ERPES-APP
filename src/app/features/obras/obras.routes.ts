import { Routes } from '@angular/router';
import { ObrasListComponent } from './obras-list.component';
import { ObraDetailComponent } from './obra-detail.component';
import { PlaceholderComponent } from '../../shared/placeholder.component';

export const obrasRoutes: Routes = [
  {
    path: '',
    component: ObrasListComponent,
    data: { title: 'Obras' }
  },
  {
    path: 'nueva',
    component: PlaceholderComponent,
    data: { title: 'Nueva Obra' }
  },
  {
    path: ':id',
    component: ObraDetailComponent,
    data: { title: 'Detalle de Obra' }
  },
  {
    path: ':id/editar',
    component: PlaceholderComponent,
    data: { title: 'Editar Obra' }
  },
  {
    path: ':id/capitulos',
    component: PlaceholderComponent,
    data: { title: 'Capítulos de Obra' }
  }
];
