import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard.component';
import { LoginComponent } from './features/auth/login.component';
import { DemoSharedKitComponent } from './features/demo-shared-kit/demo-shared-kit.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';

// Importar componentes de páginas en desarrollo
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { OperariosComponent } from './pages/operarios/operarios.component';
import { SeriesDocumentalesComponent } from './pages/series-documentales/series-documentales.component';
import { UnidadesMedidaComponent } from './pages/unidades-medida/unidades-medida.component';
import { FormasPagoComponent } from './pages/formas-pago/formas-pago.component';
import { CondicionesPagoComponent } from './pages/condiciones-pago/condiciones-pago.component';
import { TiposIvaComponent } from './pages/tipos-iva/tipos-iva.component';
import { DescuentosComponent } from './pages/descuentos/descuentos.component';
import { MaquinariaComponent } from './pages/maquinaria/maquinaria.component';
import { CapitulosComponent } from './pages/capitulos/capitulos.component';
import { PartidasComponent } from './pages/partidas/partidas.component';
import { TrabajosARealizarComponent } from './pages/trabajos-a-realizar/trabajos-a-realizar.component';
import { EscandalloComponent } from './pages/escandallo/escandallo.component';
import { PartesDiariosComponent } from './pages/partes-diarios/partes-diarios.component';
import { PresupuestosProveedorComponent } from './pages/presupuestos-proveedor/presupuestos-proveedor.component';
import { PedidosProveedoresComponent } from './pages/pedidos-proveedores/pedidos-proveedores.component';
import { EntradasComponent } from './pages/entradas/entradas.component';
import { FacturasCompraComponent } from './pages/facturas-compra/facturas-compra.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { PedidosClienteComponent } from './pages/pedidos-cliente/pedidos-cliente.component';
import { AlbaranesComponent } from './pages/albaranes/albaranes.component';
import { CobrosComponent } from './pages/cobros/cobros.component';
import { CertificacionesComponent } from './pages/certificaciones/certificaciones.component';
import { AsientosContablesComponent } from './pages/asientos-contables/asientos-contables.component';
import { VencimientosComponent } from './pages/vencimientos/vencimientos.component';
import { RemesasComponent } from './pages/remesas/remesas.component';
import { DepositosComponent } from './pages/depositos/depositos.component';
import { UbicacionesComponent } from './pages/ubicaciones/ubicaciones.component';
import { MovimientosStockComponent } from './pages/movimientos-stock/movimientos-stock.component';
import { MovimientosInternosComponent } from './pages/movimientos-internos/movimientos-internos.component';
import { EjerciciosContablesComponent } from './pages/ejercicios-contables/ejercicios-contables.component';
import { AuditoriaComponent } from './pages/auditoria/auditoria.component';
import { MonedasComponent } from './pages/monedas/monedas.component';
import { TiposCambioComponent } from './pages/tipos-cambio/tipos-cambio.component';
import { CentrosCosteComponent } from './pages/centros-coste/centros-coste.component';
import { RolesComponent } from './pages/roles/roles.component';
import { PermisosComponent } from './pages/permisos/permisos.component';
import { ControlesCalidadComponent } from './pages/controles-calidad/controles-calidad.component';
import { InspeccionesComponent } from './pages/inspecciones/inspecciones.component';
import { NoConformidadesComponent } from './pages/no-conformidades/no-conformidades.component';
import { CategoriasOperarioComponent } from './pages/categorias-operario/categorias-operario.component';
import { ContratosLaboralesComponent } from './pages/contratos-laborales/contratos-laborales.component';
import { SolicitudesVacacionesComponent } from './pages/solicitudes-vacaciones/solicitudes-vacaciones.component';
import { BajasMedicasComponent } from './pages/bajas-medicas/bajas-medicas.component';
import { CursosFormacionComponent } from './pages/cursos-formacion/cursos-formacion.component';
import { MarcasRelojComponent } from './pages/marcas-reloj/marcas-reloj.component';
import { CuentasContablesComponent } from './pages/cuentas-contables/cuentas-contables.component';

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
  // Rutas de páginas en desarrollo - Maestros
  { path: 'proveedores', component: ProveedoresComponent, canActivate: [AuthGuard] },
  { path: 'operarios', component: OperariosComponent, canActivate: [AuthGuard] },
  { path: 'series-documentales', component: SeriesDocumentalesComponent, canActivate: [AuthGuard] },
  { path: 'unidades-medida', component: UnidadesMedidaComponent, canActivate: [AuthGuard] },
  { path: 'formas-pago', component: FormasPagoComponent, canActivate: [AuthGuard] },
  { path: 'condiciones-pago', component: CondicionesPagoComponent, canActivate: [AuthGuard] },
  { path: 'tipos-iva', component: TiposIvaComponent, canActivate: [AuthGuard] },
  { path: 'descuentos', component: DescuentosComponent, canActivate: [AuthGuard] },
  { path: 'maquinaria', component: MaquinariaComponent, canActivate: [AuthGuard] },
  { path: 'capitulos', component: CapitulosComponent, canActivate: [AuthGuard] },
  { path: 'partidas', component: PartidasComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - Producción
  { path: 'trabajos-a-realizar', component: TrabajosARealizarComponent, canActivate: [AuthGuard] },
  { path: 'escandallo', component: EscandalloComponent, canActivate: [AuthGuard] },
  { path: 'partes-diarios', component: PartesDiariosComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - Compras
  { path: 'presupuestos-proveedor', component: PresupuestosProveedorComponent, canActivate: [AuthGuard] },
  { path: 'pedidos-proveedores', component: PedidosProveedoresComponent, canActivate: [AuthGuard] },
  { path: 'entradas', component: EntradasComponent, canActivate: [AuthGuard] },
  { path: 'facturas-compra', component: FacturasCompraComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - Ventas
  { path: 'pedidos-cliente', component: PedidosClienteComponent, canActivate: [AuthGuard] },
  { path: 'albaranes', component: AlbaranesComponent, canActivate: [AuthGuard] },
  { path: 'certificaciones', component: CertificacionesComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - Finanzas
  { path: 'cobros', component: CobrosComponent, canActivate: [AuthGuard] },
  { path: 'pagos', component: PagosComponent, canActivate: [AuthGuard] },
  { path: 'vencimientos', component: VencimientosComponent, canActivate: [AuthGuard] },
  { path: 'remesas', component: RemesasComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - Logística
  { path: 'depositos', component: DepositosComponent, canActivate: [AuthGuard] },
  { path: 'ubicaciones', component: UbicacionesComponent, canActivate: [AuthGuard] },
  { path: 'movimientos-stock', component: MovimientosStockComponent, canActivate: [AuthGuard] },
  { path: 'movimientos-internos', component: MovimientosInternosComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - Contabilidad
  { path: 'cuentas-contables', component: CuentasContablesComponent, canActivate: [AuthGuard] },
  { path: 'asientos-contables', component: AsientosContablesComponent, canActivate: [AuthGuard] },
  { path: 'ejercicios-contables', component: EjerciciosContablesComponent, canActivate: [AuthGuard] },
  { path: 'auditoria', component: AuditoriaComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - Configuración
  { path: 'monedas', component: MonedasComponent, canActivate: [AuthGuard] },
  { path: 'tipos-cambio', component: TiposCambioComponent, canActivate: [AuthGuard] },
  { path: 'centros-coste', component: CentrosCosteComponent, canActivate: [AuthGuard] },
  { path: 'roles', component: RolesComponent, canActivate: [AuthGuard] },
  { path: 'permisos', component: PermisosComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - Calidad
  { path: 'controles-calidad', component: ControlesCalidadComponent, canActivate: [AuthGuard] },
  { path: 'inspecciones', component: InspeccionesComponent, canActivate: [AuthGuard] },
  { path: 'no-conformidades', component: NoConformidadesComponent, canActivate: [AuthGuard] },
  // Rutas de páginas en desarrollo - RRHH
  { path: 'categorias-operario', component: CategoriasOperarioComponent, canActivate: [AuthGuard] },
  { path: 'contratos-laborales', component: ContratosLaboralesComponent, canActivate: [AuthGuard] },
  { path: 'solicitudes-vacaciones', component: SolicitudesVacacionesComponent, canActivate: [AuthGuard] },
  { path: 'bajas-medicas', component: BajasMedicasComponent, canActivate: [AuthGuard] },
  { path: 'cursos-formacion', component: CursosFormacionComponent, canActivate: [AuthGuard] },
  { path: 'marcas-reloj', component: MarcasRelojComponent, canActivate: [AuthGuard] }
];
