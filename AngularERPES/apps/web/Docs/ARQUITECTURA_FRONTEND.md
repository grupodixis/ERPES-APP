# 🏗️ Arquitectura y Estándares Técnicos - ERP Angular Frontend

## 📐 Arquitectura General

### Patrón Arquitectónico: Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Components  │  │   Guards    │  │  Directives │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Services   │  │   Stores    │  │ Use Cases   │        │
│  │ (Signals)   │  │ (Signals)   │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Types    │  │ Interfaces  │  │ Value Objs  │        │
│  │    DTOs     │  │   (Ports)   │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │HTTP Adapter │  │Mock Adapter │  │ Local Store │        │
│  │             │  │             │  │   Adapter   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Carpetas Detallada

```
src/app/
├── core/                    # 🔧 Infraestructura transversal
│   ├── guards/              # Guards de autenticación y permisos
│   ├── interceptors/        # HTTP interceptors
│   ├── services/            # Servicios core (auth, config, etc.)
│   ├── stores/              # Stores globales (auth, theme, etc.)
│   └── types/               # Tipos core del sistema
│
├── domain/                  # 🎯 Capa de dominio
│   ├── auth.types.ts        # Tipos de autenticación
│   ├── common.types.ts      # Tipos comunes
│   ├── configuracion.types.ts
│   ├── terceros.types.ts
│   ├── productos.types.ts
│   ├── obras.types.ts
│   └── [modulo].types.ts    # Un archivo por módulo
│
├── ports/                   # 🔌 Interfaces (contratos)
│   ├── api-client.token.ts  # Token de inyección
│   ├── repositories/        # Interfaces de repositorios
│   └── services/            # Interfaces de servicios
│
├── adapters/                # 🔄 Implementaciones
│   ├── http/               # Adaptador HTTP real
│   ├── mock/               # Adaptador Mock para desarrollo
│   └── local-storage/      # Adaptador para almacenamiento local
│
├── application/             # 📋 Capa de aplicación
│   ├── services/           # Servicios de aplicación
│   │   ├── usuarios.service.ts
│   │   ├── empresas.service.ts
│   │   └── [modulo].service.ts
│   └── stores/             # Stores específicos (opcional)
│
├── shared/                  # 🧩 Componentes compartidos
│   ├── components/         # Componentes UI reutilizables
│   │   ├── data-table.component.ts
│   │   ├── form-field.component.ts
│   │   ├── skeleton-loader.component.ts
│   │   └── empty-state.component.ts
│   ├── directives/         # Directivas personalizadas
│   ├── pipes/              # Pipes personalizados
│   └── services/           # Servicios compartidos
│
└── features/               # 🎪 Módulos de negocio
    ├── seguridad/          # ✅ Implementado
    │   ├── usuarios/
    │   │   ├── usuarios.component.ts
    │   │   ├── usuario-dialog.component.ts
    │   │   └── usuarios.store.ts
    │   └── seguridad.routes.ts
    │
    ├── configuracion/       # 🟡 Parcial
    │   ├── empresas/        # ✅ Implementado
    │   ├── monedas/         # ✅ Implementado
    │   ├── tipos-cambio/    # ✅ Implementado
    │   ├── centros-coste/   # ❌ Pendiente
    │   ├── formas-pago/     # ❌ Pendiente
    │   └── configuracion.routes.ts
    │
    └── [otros-modulos]/     # Estructura similar
```

## 🎨 Estándares de Componentes

### Estructura Base de Componente

```typescript
// ejemplo.component.ts
import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
// Material imports
import { MatButtonModule } from '@angular/material/button';
// Domain imports
import { ExampleType } from '../../domain/example.types';
// Service imports
import { ExampleService } from '../../application/services/example.service';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    // ... otros imports
  ],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent implements OnInit {
  // Inyección de dependencias
  private readonly exampleService = inject(ExampleService);
  
  // Signals para estado reactivo
  readonly items = signal<ExampleType[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  
  // Computed signals
  readonly hasItems = computed(() => this.items().length > 0);
  
  ngOnInit(): void {
    this.loadItems();
  }
  
  private async loadItems(): Promise<void> {
    this.loading.set(true);
    try {
      const items = await this.exampleService.getAll();
      this.items.set(items);
    } catch (error) {
      this.error.set('Error loading items');
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Convenciones de Naming

```typescript
// ✅ CORRECTO
// Componentes: PascalCase + Component
UsuariosComponent
UsuarioDialogComponent
UsuarioDetalleComponent

// Servicios: PascalCase + Service
UsuariosService
AuthService

// Stores: PascalCase + Store
UsuariosStore
AuthStore

// Types: PascalCase
Usuario
CreateUsuarioDto
UpdateUsuarioDto
UsuarioFilters

// Signals: camelCase
const usuarios = signal<Usuario[]>([]);
const isLoading = signal(false);
const selectedUser = signal<Usuario | null>(null);

// Computed: camelCase + descriptivo
const hasUsers = computed(() => usuarios().length > 0);
const activeUsers = computed(() => usuarios().filter(u => u.activo));
```

## 🔧 Estándares de Servicios

### Estructura Base de Servicio

```typescript
// usuarios.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, UsuarioFilters } from '../../domain/auth.types';
import { DataSourceService } from '../../shared/services/data-source.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly apiClient = inject(API_CLIENT);
  private readonly dataSource = inject(DataSourceService);
  
  // Estado reactivo con signals
  private readonly _usuarios = signal<Usuario[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  
  // Readonly signals para componentes
  readonly usuarios = this._usuarios.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed signals
  readonly activeUsers = computed(() => 
    this._usuarios().filter(u => u.activo)
  );
  
  async getAll(filters?: UsuarioFilters): Promise<Usuario[]> {
    this._loading.set(true);
    this._error.set(null);
    
    try {
      const usuarios = await this.apiClient.get<Usuario[]>('/usuarios', { params: filters });
      this._usuarios.set(usuarios);
      return usuarios;
    } catch (error) {
      const errorMsg = 'Error al cargar usuarios';
      this._error.set(errorMsg);
      throw new Error(errorMsg);
    } finally {
      this._loading.set(false);
    }
  }
  
  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const usuario = await this.apiClient.post<Usuario>('/usuarios', dto);
    this._usuarios.update(users => [...users, usuario]);
    return usuario;
  }
  
  async update(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.apiClient.put<Usuario>(`/usuarios/${id}`, dto);
    this._usuarios.update(users => 
      users.map(u => u.id === id ? usuario : u)
    );
    return usuario;
  }
  
  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/usuarios/${id}`);
    this._usuarios.update(users => users.filter(u => u.id !== id));
  }
}
```

## 🎯 Patrones de UI Estándar

### 1. Componente de Listado (DataTable)

```typescript
// Estructura estándar para listados
@Component({
  template: `
    <div class="page-container">
      <!-- Header con título y acciones -->
      <div class="page-header">
        <h1>{{ title }}</h1>
        <div class="actions">
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Nuevo
          </button>
        </div>
      </div>
      
      <!-- Filtros -->
      <mat-card class="filters-card">
        <form [formGroup]="filtersForm">
          <!-- Campos de filtro -->
        </form>
      </mat-card>
      
      <!-- Tabla de datos -->
      <app-data-table
        [columns]="columns"
        [data]="items()"
        [loading]="loading()"
        [actions]="tableActions"
        (actionClick)="onActionClick($event)"
        (sortChange)="onSortChange($event)"
        (pageChange)="onPageChange($event)">
      </app-data-table>
    </div>
  `
})
export class ListadoComponent {
  // Configuración de columnas
  readonly columns: TableColumn[] = [
    { key: 'codigo', label: 'Código', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'activo', label: 'Estado', type: 'boolean' }
  ];
  
  // Acciones de tabla
  readonly tableActions: TableAction[] = [
    { key: 'edit', label: 'Editar', icon: 'edit' },
    { key: 'delete', label: 'Eliminar', icon: 'delete', color: 'warn' }
  ];
}
```

### 2. Componente de Formulario (Dialog)

```typescript
// Estructura estándar para formularios
@Component({
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Crear' }} {{ entityName }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form">
        <!-- Campos del formulario -->
        <mat-form-field>
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">
            El nombre es requerido
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="form.invalid || saving()" 
              (click)="onSave()">
        {{ saving() ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class FormDialogComponent {
  readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    // ... otros campos
  });
  
  readonly saving = signal(false);
  
  get isEdit(): boolean {
    return !!this.data?.id;
  }
}
```

## 🎨 Estándares de Material Design

### Tema Personalizado

```scss
// styles/theme.scss
@use '@angular/material' as mat;

// Definir paleta de colores
$primary-palette: mat.define-palette(mat.$blue-palette, 600);
$accent-palette: mat.define-palette(mat.$orange-palette, 500);
$warn-palette: mat.define-palette(mat.$red-palette, 500);

// Crear tema
$theme: mat.define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
    warn: $warn-palette,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

// Aplicar tema
@include mat.all-component-themes($theme);

// Variables CSS personalizadas
:root {
  --primary-color: #1976d2;
  --accent-color: #ff9800;
  --warn-color: #f44336;
  --success-color: #4caf50;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --border-radius: 8px;
  --elevation-1: 0 2px 4px rgba(0,0,0,0.1);
  --elevation-2: 0 4px 8px rgba(0,0,0,0.15);
}
```

### Clases CSS Utilitarias

```scss
// styles/utilities.scss

// Layout
.page-container {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.filters-card {
  margin-bottom: var(--spacing-md);
  
  .mat-mdc-card-content {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }
}

// Spacing
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }

.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }

// Flexbox
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }

// Estados
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.error {
  color: var(--warn-color);
}

.success {
  color: var(--success-color);
}
```

## 🔒 Estándares de Seguridad

### Guards

```typescript
// auth.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  
  canActivate(): boolean {
    if (this.authStore.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}

// permission.guard.ts
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  private readonly authStore = inject(AuthStore);
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermissions = route.data['permissions'] as string[];
    return this.authStore.hasPermissions(requiredPermissions);
  }
}
```

### Directiva de Permisos

```typescript
// has-permission.directive.ts
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  @Input() hasPermission!: string | string[];
  
  private readonly authStore = inject(AuthStore);
  private readonly elementRef = inject(ElementRef);
  
  ngOnInit(): void {
    const permissions = Array.isArray(this.hasPermission) 
      ? this.hasPermission 
      : [this.hasPermission];
      
    if (!this.authStore.hasPermissions(permissions)) {
      this.elementRef.nativeElement.style.display = 'none';
    }
  }
}
```

## 📊 Estándares de Testing y TDD

### **Metodología TDD (Test-Driven Development)**

#### **Ciclo Red-Green-Refactor**
1. **🔴 RED**: Escribir test que falle
2. **🟢 GREEN**: Escribir código mínimo para pasar el test
3. **🔵 REFACTOR**: Mejorar el código manteniendo tests verdes

#### **Orden de Implementación TDD**
```typescript
// 1. Test del Service (con Mock)
// 2. Implementación del Service
// 3. Test del Component
// 4. Implementación del Component
// 5. Test de Integración
// 6. Refactoring
```

### **Servicios Mock para Desarrollo**

#### **Mock Service Pattern**
```typescript
// src/app/features/[modulo]/infrastructure/mocks/[modulo]-mock.service.ts
@Injectable()
export class [Modulo]MockService implements [Modulo]Repository {
  private mockData: [Modulo][] = [
    // Datos de prueba realistas
  ];

  async findAll(): Promise<[Modulo][]> {
    // Simular delay de red
    await this.delay(500);
    return [...this.mockData];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### **Configuración de Mocks**
```typescript
// src/app/core/config/mock.config.ts
export const MOCK_CONFIG = {
  enabled: environment.useMocks,
  delay: {
    min: 300,
    max: 1000
  },
  errorRate: 0.1 // 10% de requests fallan
};
```

### **Estructura de Tests**
```
src/
├── app/
│   └── features/[modulo]/
│       ├── application/
│       │   └── services/
│       │       ├── [modulo].service.ts
│       │       └── [modulo].service.spec.ts
│       ├── infrastructure/
│       │   ├── mocks/
│       │   │   ├── [modulo]-mock.service.ts
│       │   │   └── [modulo]-mock.data.ts
│       │   └── adapters/
│       │       ├── [modulo].adapter.ts
│       │       └── [modulo].adapter.spec.ts
│       └── presentation/
│           └── components/
│               ├── [modulo].component.ts
│               ├── [modulo].component.spec.ts
│               └── [modulo].component.integration.spec.ts
```

### **Testing Guidelines con TDD**

#### **Unit Tests (TDD)**
```typescript
// Ejemplo: centro-coste.service.spec.ts
describe('CentroCosteService', () => {
  let service: CentroCosteService;
  let mockRepository: jasmine.SpyObj<CentroCosteRepository>;

  beforeEach(() => {
    // 🔴 RED: Setup test que falla
    const spy = jasmine.createSpyObj('CentroCosteRepository', ['findAll']);
    
    TestBed.configureTestingModule({
      providers: [
        CentroCosteService,
        { provide: CentroCosteRepository, useValue: spy }
      ]
    });
    
    service = TestBed.inject(CentroCosteService);
    mockRepository = TestBed.inject(CentroCosteRepository) as jasmine.SpyObj<CentroCosteRepository>;
  });

  it('should return hierarchical tree structure', async () => {
    // 🔴 RED: Test que define el comportamiento esperado
    const mockData = [/* mock data */];
    mockRepository.findAll.and.returnValue(Promise.resolve(mockData));
    
    const result = await service.getJerarquia();
    
    expect(result).toHaveProperty('children');
    expect(result.children.length).toBeGreaterThan(0);
  });
});
```

#### **Component Tests (TDD)**
```typescript
// Ejemplo: centro-coste.component.spec.ts
describe('CentroCosteComponent', () => {
  let component: CentroCosteComponent;
  let fixture: ComponentFixture<CentroCosteComponent>;
  let mockService: jasmine.SpyObj<CentroCosteService>;

  beforeEach(() => {
    // 🔴 RED: Setup con mock service
    const spy = jasmine.createSpyObj('CentroCosteService', ['getJerarquia']);
    
    TestBed.configureTestingModule({
      declarations: [CentroCosteComponent],
      providers: [
        { provide: CentroCosteService, useValue: spy }
      ]
    });
    
    fixture = TestBed.createComponent(CentroCosteComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(CentroCosteService) as jasmine.SpyObj<CentroCosteService>;
  });

  it('should display tree structure on init', async () => {
    // 🔴 RED: Test del comportamiento UI
    const mockTree = { /* mock tree data */ };
    mockService.getJerarquia.and.returnValue(Promise.resolve(mockTree));
    
    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();
    
    const treeElement = fixture.debugElement.query(By.css('mat-tree'));
    expect(treeElement).toBeTruthy();
  });
});
```

#### **Mock Data Management**
```typescript
// src/app/features/centros-coste/infrastructure/mocks/centro-coste-mock.data.ts
export const CENTROS_COSTE_MOCK_DATA: CentroCoste[] = [
  {
    id: '1',
    codigo: 'CC001',
    nombre: 'Administración',
    tipo: TipoCentroCoste.ADMINISTRATIVO,
    activo: true,
    parentId: null,
    children: [
      {
        id: '2',
        codigo: 'CC001.001',
        nombre: 'Recursos Humanos',
        tipo: TipoCentroCoste.ADMINISTRATIVO,
        activo: true,
        parentId: '1'
      }
    ]
  }
];
```

#### **Integration Tests**
- Tests E2E con Cypress
- Tests de flujos completos con mocks
- Validación de navegación
- Tests de performance con datos mock

#### **Performance Tests**
- Lighthouse CI en pipeline
- Bundle size monitoring
- Memory leak detection
- Mock service performance testing

### **Configuración de Mocks en Desarrollo**

#### **Environment Configuration**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  useMocks: true, // 🔧 Activar mocks en desarrollo
  mockDelay: 500,
  apiUrl: 'http://localhost:3000/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  useMocks: false, // 🔧 Desactivar mocks en producción
  mockDelay: 0,
  apiUrl: 'https://api.empresa.com'
};
```

#### **Provider Configuration**
```typescript
// src/app/core/providers/mock.providers.ts
export const MOCK_PROVIDERS = [
  {
    provide: CentroCosteRepository,
    useClass: environment.useMocks ? CentroCostesMockService : CentrosCostesService
  },
  {
    provide: CondicionesPagoRepository,
    useClass: environment.useMocks ? CondicionesPagoMockService : CondicionesPagoService
  }
  // ... más providers
];
```

## 📋 Checklist de Implementación

### Para cada nuevo módulo:

- [ ] **Domain Types** creados en `domain/[modulo].types.ts`
- [ ] **Service** implementado en `application/services/[modulo].service.ts`
- [ ] **Componente de listado** con DataTable
- [ ] **Componente de formulario** (Dialog)
- [ ] **Rutas lazy-loaded** configuradas
- [ ] **Permisos RBAC** implementados
- [ ] **Tests unitarios** con > 80% cobertura
- [ ] **Responsive design** validado
- [ ] **Documentación** actualizada
- [ ] **Code review** completado

---

**Versión**: 1.0  
**Fecha**: Enero 2025  
**Mantenido por**: Equipo Frontend