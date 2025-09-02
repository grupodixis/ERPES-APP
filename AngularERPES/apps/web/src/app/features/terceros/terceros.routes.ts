import { Routes } from '@angular/router';
import { PersonasComponent } from './personas/personas.component';
import { PersonaDetalleComponent } from './personas/persona-detalle.component';

export const TERCEROS_ROUTES: Routes = [
  { path: '', redirectTo: 'personas', pathMatch: 'full' },
  { path: 'personas', component: PersonasComponent },
  { path: 'personas/:id', component: PersonaDetalleComponent },
  // Placeholder para futuras rutas
  // { path: 'clientes', component: ClientesComponent },
  // { path: 'proveedores', component: ProveedoresComponent },
];
