import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal, computed, effect, Injector } from '@angular/core';

import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { AuthStore } from './core/stores/auth.store';
import { HasPermissionDirective } from './shared/directives/has-permission.directive';
import { AppConfigService } from './core/app-config.service';
import { TenantService } from './core/services/tenant.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatExpansionModule,
    HasPermissionDirective
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  protected authStore = inject(AuthStore);
  private configService = inject(AppConfigService);
  private tenantService = inject(TenantService);
  private toastService = inject(ToastService);
  private injector = inject(Injector);

  // Sidebar properties
  sidenavMode = signal<'side' | 'over'>('side');
  sidenavOpened = signal(true);
  sidenavCollapsed = signal(false);
  
  // Computed signal to check if any menu is expanded
  hasExpandedMenu = computed(() => {
    const expanded = this.menuExpanded();
    return Object.values(expanded).some(isExpanded => isExpanded);
  });
  
  // Menu expansion states
  menuExpanded = signal({
    produccion: false,
    maestros: false,
    compras: false,
    ventas: false,
    finanzas: false,
    logistica: false,
    contabilidad: false,
    configuracion: false,
    calidad: false,
    rrhh: false
  });

  // Theme properties
  isDarkTheme = signal(false);
  isDemo = signal(false);
  environment = signal('DEV');

  // Responsive breakpoints
  private readonly MOBILE_BREAKPOINT = 768;
  private readonly TABLET_BREAKPOINT = 1024;

  constructor() {
    // Effect to keep sidenav open when any menu is expanded
    effect(() => {
      if (this.hasExpandedMenu() && this.sidenavMode() === 'side') {
        this.sidenavCollapsed.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadTheme();
    this.isDemo.set(this.configService.isDemo);
    this.environment.set(this.configService.envName);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    
    if (width < this.MOBILE_BREAKPOINT) {
      this.sidenavMode.set('over');
      this.sidenavOpened.set(false);
      this.sidenavCollapsed.set(false);
    } else {
      this.sidenavMode.set('side');
      this.sidenavOpened.set(true);
      this.sidenavCollapsed.set(false);
    }
  }

  toggleSidenav(): void {
    if (this.sidenavMode() === 'over') {
      this.sidenavOpened.update(opened => !opened);
    } else {
      this.sidenavCollapsed.update(collapsed => {
        const newCollapsed = !collapsed;
        
        // Si se está colapsando el sidebar, cerrar todos los menús
        if (newCollapsed) {
          this.menuExpanded.set({
            produccion: false,
            maestros: false,
            compras: false,
            ventas: false,
            finanzas: false,
            logistica: false,
            contabilidad: false,
            configuracion: false,
            calidad: false,
            rrhh: false
          });
        }
        
        return newCollapsed;
      });
    }
  }

  toggleTheme(): void {
    this.isDarkTheme.update(isDark => !isDark);
    this.saveTheme();
    this.applyTheme();
  }

  // Menu expansion toggles
  toggleMenu(menuKey: keyof ReturnType<typeof this.menuExpanded>): void {
    this.menuExpanded.update(current => {
      const isCurrentlyOpen = (current as any)[menuKey];
      
      // Si el menú está abierto y se hace clic para cerrarlo, cerrar todos los menús
      if (isCurrentlyOpen) {
        return {
          produccion: false,
          maestros: false,
          compras: false,
          ventas: false,
          finanzas: false,
          logistica: false,
          contabilidad: false,
          configuracion: false,
          calidad: false,
          rrhh: false,
          cobros: false,
          pagos: false
        };
      }
      
      // Si el menú está cerrado, cerrar todos los demás y abrir solo este
      const newState = {
        produccion: false,
        maestros: false,
        compras: false,
        ventas: false,
        finanzas: false,
        logistica: false,
        contabilidad: false,
        configuracion: false,
        calidad: false,
        rrhh: false,
        cobros: false,
        pagos: false
      };
      (newState as any)[menuKey] = true;
      return newState;
    });
  }

  toggleProduccion(): void {
    this.toggleMenu('produccion');
  }

  toggleMaestros(): void {
    this.toggleMenu('maestros');
  }

  toggleCompras(): void {
    this.toggleMenu('compras');
  }

  toggleVentas(): void {
    this.toggleMenu('ventas');
  }

  toggleFinanzas(): void {
    this.toggleMenu('finanzas');
  }

  toggleLogistica(): void {
    this.toggleMenu('logistica');
  }

  toggleContabilidad(): void {
    this.toggleMenu('contabilidad');
  }

  toggleConfiguracion(): void {
    this.toggleMenu('configuracion');
  }

  toggleCalidad(): void {
    this.toggleMenu('calidad');
  }

  toggleRrhh(): void {
    this.toggleMenu('rrhh');
  }



  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkTheme.set(savedTheme === 'dark');
    } else {
      // Auto-detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkTheme.set(prefersDark);
    }
    this.applyTheme();
  }

  private saveTheme(): void {
    const theme = this.isDarkTheme() ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  }

  private applyTheme(): void {
    const body = document.body;
    if (this.isDarkTheme()) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  getCurrentPageTitle(): string {
    const route = this.router.url;
    const titleMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/profile': 'Perfil',
      // Producción
      '/obras': 'Obras',
      '/capitulos': 'Capítulos',
      '/partidas': 'Partidas',
      '/trabajos-realizar': 'Trabajos a Realizar',
      '/escandallo': 'Escandallo',
      '/partes-diarios': 'Partes Diarios',
      '/planificacion-operarios': 'Planificación Operarios',
      '/planificacion': 'Planificación',
      // Maestros
      '/clientes': 'Clientes',
      '/proveedores': 'Proveedores',
      '/operarios': 'Operarios',
      '/series-documentales': 'Series Documentales',
      '/unidades-medida': 'Unidades Medida',
      '/formas-pago': 'Formas Pago',
      '/condiciones-pago': 'Condiciones Pago',
      '/tipos-iva': 'Tipos IVA',
      '/descuentos': 'Descuentos',
      '/maquinaria': 'Maquinaria',
      '/terceros': 'Terceros',
      // Compras
      '/presupuestos-proveedor': 'Presupuestos Proveedor',
      '/pedidos-proveedores': 'Pedidos Proveedores',
      '/entradas': 'Entradas',
      '/facturas-compra': 'Facturas Compra',
      '/compras': 'Compras',
      // Ventas
      '/presupuestos': 'Presupuestos',
      '/pedidos-cliente': 'Pedidos Cliente',
      '/albaranes': 'Albaranes',
      '/facturas': 'Facturas',
      '/certificaciones': 'Certificaciones',
      '/ventas': 'Ventas',
      // Finanzas
      '/cuentas-contables': 'Cuentas Contables',
      '/asientos-contables': 'Asientos Contables',
      '/vencimientos': 'Vencimientos',
      '/remesas': 'Remesas',
      // Logística
      '/articulos': 'Artículos',
      '/depositos': 'Depósitos',
      '/ubicaciones': 'Ubicaciones',
      '/movimientos-stock': 'Movimientos Stock',
      '/inventarios': 'Inventarios',
      '/movimientos-internos': 'Movimientos Internos',
      '/inventario': 'Inventario',
      // Contabilidad
      '/ejercicios-contables': 'Ejercicios Contables',
      '/auditoria': 'Auditoría',
      '/contabilidad': 'Contabilidad',
      // Configuración
      '/monedas': 'Monedas',
      '/tipos-cambio': 'Tipos Cambio',
      '/centros-coste': 'Centros Coste',
      '/roles': 'Roles',
      '/permisos': 'Permisos',
      '/configuracion': 'Configuración',
      '/seguridad': 'Seguridad',
      // Calidad
      '/controles-calidad': 'Controles Calidad',
      '/inspecciones': 'Inspecciones',
      '/no-conformidades': 'No Conformidades',
      // RRHH
      '/categorias-operario': 'Categorías Operario',
      '/contratos-laborales': 'Contratos Laborales',
      '/solicitudes-vacaciones': 'Solicitudes Vacaciones',
      '/bajas-medicas': 'Bajas Médicas',
      '/cursos-formacion': 'Cursos Formación',
      '/marcas-reloj': 'Marcas Reloj',
      '/rrhh': 'RRHH',
      // DMS
      '/dms': 'DMS',
      '/administracion/documentos': 'Documentos',
      // Productos
      '/productos': 'Productos'
    };
    
    return titleMap[route] || 'ERPES';
  }

  getEnvironmentColor(): 'primary' | 'accent' | 'warn' {
    const env = this.environment();
    switch (env) {
      case 'PROD': return 'warn';
      case 'STG': return 'accent';
      case 'TEST': return 'primary';
      default: return 'primary';
    }
  }

  getEnvironmentIcon(): string {
    const env = this.environment();
    switch (env) {
      case 'PROD': return 'production_quantity_limits';
      case 'STG': return 'staging';
      case 'TEST': return 'science';
      default: return 'developer_mode';
    }
  }

  logout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
    this.toastService.showSuccess('Sesión cerrada correctamente');
  }

  // Método para manejar la navegación y auto-colapso del sidebar
  onMenuItemClick(): void {
    // En modo móvil (over), cerrar completamente el sidenav
    if (this.sidenavMode() === 'over') {
      this.sidenavOpened.set(false);
    } else {
      // En modo desktop (side), colapsar el sidebar
      this.sidenavCollapsed.set(true);
      
      // Cerrar todos los menús expandidos
      this.menuExpanded.set({
        produccion: false,
        maestros: false,
        compras: false,
        ventas: false,
        finanzas: false,
        logistica: false,
        contabilidad: false,
        configuracion: false,
        calidad: false,
        rrhh: false
      });
    }
  }
}
