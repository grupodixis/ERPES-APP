import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';

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

  // Sidebar properties
  sidenavMode = signal<'side' | 'over'>('side');
  sidenavOpened = signal(true);
  sidenavCollapsed = signal(false);
  
  // Menu expansion states (collapsed by default)
  produccionExpanded = signal(false);
  logisticaExpanded = signal(false);
  comercialExpanded = signal(false);
  administracionExpanded = signal(false);

  // Theme properties
  isDarkTheme = signal(false);
  isDemo = signal(false);
  environment = signal('DEV');

  // Responsive breakpoints
  private readonly MOBILE_BREAKPOINT = 768;
  private readonly TABLET_BREAKPOINT = 1024;

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
      this.sidenavCollapsed.update(collapsed => !collapsed);
    }
  }

  toggleTheme(): void {
    this.isDarkTheme.update(isDark => !isDark);
    this.saveTheme();
    this.applyTheme();
  }

  // Menu expansion toggles
  toggleProduccion(): void {
    this.produccionExpanded.set(!this.produccionExpanded());
  }

  toggleLogistica(): void {
    this.logisticaExpanded.set(!this.logisticaExpanded());
  }

  toggleComercial(): void {
    this.comercialExpanded.set(!this.comercialExpanded());
  }

  toggleAdministracion(): void {
    this.administracionExpanded.set(!this.administracionExpanded());
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
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/seguridad': 'Seguridad',
      '/configuracion': 'Configuración',
      '/terceros': 'Terceros',
      '/productos': 'Productos',
      '/articulos': 'Artículos',
      '/inventario': 'Inventario',
      '/obras': 'Obras',
      '/presupuestos': 'Presupuestos',
      '/planificacion': 'Planificación',
      '/ventas': 'Ventas',
      '/compras': 'Compras',
      '/contabilidad': 'Contabilidad',
      '/rrhh': 'RRHH',
      '/dms': 'DMS',
      '/administracion/documentos': 'Documentos'
    };
    return routeMap[route] || 'ERP ES';
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
}
