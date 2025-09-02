import { Routes } from '@angular/router';
import { ArticulosPageComponent } from './articulos-page.component';

export const ARTICULOS_ROUTES: Routes = [
  {
    path: '',
    component: ArticulosPageComponent
  }
  // Futuras rutas para sub-módulos:
  // {
  //   path: 'entradas',
  //   loadComponent: () => import('./entradas/entradas-page.component').then(m => m.EntradasPageComponent)
  // },
  // {
  //   path: 'disponibilidad',
  //   loadComponent: () => import('./disponibilidad/disponibilidad.component').then(m => m.DisponibilidadComponent)
  // },
  // {
  //   path: 'picking',
  //   loadComponent: () => import('./picking/picking-albaran.component').then(m => m.PickingAlbaranComponent)
  // },
  // {
  //   path: 'movimientos',
  //   loadComponent: () => import('./movimientos/movimientos-page.component').then(m => m.MovimientosPageComponent)
  // },
  // {
  //   path: 'lotes',
  //   loadComponent: () => import('./lotes/lotes-page.component').then(m => m.LotesPageComponent)
  // },
  // {
  //   path: 'series',
  //   loadComponent: () => import('./series/series-page.component').then(m => m.SeriesPageComponent)
  // },
  // {
  //   path: 'trazabilidad',
  //   loadComponent: () => import('./trazabilidad/trazabilidad.component').then(m => m.TrazabilidadComponent)
  // },
  // {
  //   path: 'traspasos',
  //   loadComponent: () => import('./traspasos/traspaso-wizard.component').then(m => m.TraspasoWizardComponent)
  // },
  // {
  //   path: 'ajustes',
  //   loadComponent: () => import('./ajustes/ajuste-dialog.component').then(m => m.AjusteDialogComponent)
  // }
];
