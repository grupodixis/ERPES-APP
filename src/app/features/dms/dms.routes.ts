import { Routes } from '@angular/router';
import { PlaceholderComponent } from '../../shared/placeholder.component';

export const DMS_ROUTES: Routes = [
  { path: '', component: PlaceholderComponent, data: { title: 'DMS' } },
  { path: 'documentos', component: PlaceholderComponent, data: { title: 'Documentos' } },
  { path: 'auditoria', component: PlaceholderComponent, data: { title: 'Auditoría' } },
];
