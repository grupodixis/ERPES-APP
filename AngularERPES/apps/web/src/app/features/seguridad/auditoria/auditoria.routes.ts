import { Routes } from '@angular/router';
import { AuditoriaComponent } from './auditoria.component';

export const AUDITORIA_ROUTES: Routes = [
  {
    path: '',
    component: AuditoriaComponent,
    title: 'Auditoría del Sistema',
    data: {
      breadcrumb: 'Auditoría',
      permissions: ['auditoria.leer']
    }
  }
];