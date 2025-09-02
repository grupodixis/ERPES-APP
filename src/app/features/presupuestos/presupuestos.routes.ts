import { Routes } from '@angular/router';
import { PresupuestosListComponent } from './presupuestos-list.component';
import { PresupuestoEditorComponent } from './components/presupuesto-editor/presupuesto-editor.component';
import { PartidasEditorComponent } from './components/partidas-editor/partidas-editor.component';

export const PRESUPUESTOS_ROUTES: Routes = [
  { 
    path: '', 
    component: PresupuestosListComponent,
    title: 'Presupuestos'
  },
  { 
    path: 'nuevo', 
    component: PresupuestoEditorComponent,
    title: 'Nuevo Presupuesto'
  },
  { 
    path: ':id/editar', 
    component: PresupuestoEditorComponent,
    title: 'Editar Presupuesto'
  },
  {
    path: ':id',
    redirectTo: ':id/editar',
    pathMatch: 'full'
  },
  { 
    path: ':id/capitulos/:capituloId/partidas', 
    component: PartidasEditorComponent,
    title: 'Editar Partidas del Capítulo'
  }
];
