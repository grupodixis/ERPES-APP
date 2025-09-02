import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard.component';
import { LoginComponent } from './features/auth/login.component';
import { DemoSharedKitComponent } from './features/demo-shared-kit/demo-shared-kit.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'demo-shared-kit', 
    component: DemoSharedKitComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'perfil', 
    component: PerfilComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'seguridad', 
    loadChildren: () => import('./features/seguridad/seguridad.routes').then(m => m.SEGURIDAD_ROUTES),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: ['usuarios:read'] }
  },
  { 
    path: 'configuracion', 
    loadChildren: () => import('./features/configuracion/configuracion.routes').then(m => m.CONFIGURACION_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'terceros', 
    loadChildren: () => import('./features/terceros/terceros.routes').then(m => m.TERCEROS_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'productos', 
    loadChildren: () => import('./features/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'articulos', 
    loadChildren: () => import('./features/articulos/articulos.routes').then(m => m.ARTICULOS_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'inventario', 
    loadChildren: () => import('./features/inventario/inventario.routes').then(m => m.INVENTARIO_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'obras', 
    loadChildren: () => import('./features/obras/obras.routes').then(m => m.obrasRoutes),
    canActivate: [AuthGuard]
  },
  { 
    path: 'presupuestos', 
    loadChildren: () => import('./features/presupuestos/presupuestos.routes').then(m => m.PRESUPUESTOS_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'planificacion', 
    loadChildren: () => import('./features/planificacion/planificacion.routes').then(m => m.PLANIFICACION_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'ventas', 
    loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.VENTAS_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'compras', 
    loadChildren: () => import('./features/compras/compras.routes').then(m => m.COMPRAS_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'contabilidad', 
    loadChildren: () => import('./features/contabilidad/contabilidad.routes').then(m => m.CONTABILIDAD_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'rrhh', 
    loadChildren: () => import('./features/rrhh/rrhh.routes').then(m => m.RRHH_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'dms', 
    loadChildren: () => import('./features/dms/dms.routes').then(m => m.DMS_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'administracion/documentos', 
    loadChildren: () => import('./features/documentos/documentos.routes').then(m => m.DOCUMENTOS_ROUTES),
    canActivate: [AuthGuard]
  },
];
