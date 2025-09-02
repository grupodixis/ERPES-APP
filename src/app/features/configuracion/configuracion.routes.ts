import { Routes } from '@angular/router';
import { EmpresasComponent } from './empresas/empresas.component';
import { MonedasComponent } from './monedas/monedas.component';
import { TiposCambioComponent } from './tipos-cambio/tipos-cambio.component';
import { SeriesDocumentalesComponent } from './series-documentales/series-documentales.component';
import { CentrosCostelComponent } from './centros-coste/centros-coste.component';

export const CONFIGURACION_ROUTES: Routes = [
  { path: '', redirectTo: 'empresas', pathMatch: 'full' },
  { path: 'empresas', component: EmpresasComponent },
  { path: 'monedas', component: MonedasComponent },
  { path: 'tipos-cambio', component: TiposCambioComponent },
  { path: 'series-documentales', component: SeriesDocumentalesComponent },
  { path: 'centros-coste', component: CentrosCostelComponent },
  // Placeholder restantes
  // { path: 'ums', component: PlaceholderComponent, data: { title: 'Unidades de Medida' } },
  // { path: 'tipos-iva', component: PlaceholderComponent, data: { title: 'Tipos de IVA' } },
];
