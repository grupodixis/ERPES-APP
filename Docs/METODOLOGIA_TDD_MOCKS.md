# 🧪 Metodología TDD y Servicios Mock - ERP Angular

## 🎯 Objetivo

Implementar una metodología de desarrollo basada en **Test-Driven Development (TDD)** con **servicios Mock** para acelerar el desarrollo frontend independiente del backend, garantizando calidad y mantenibilidad del código.

---

## 🔄 Ciclo TDD: Red-Green-Refactor

### **🔴 RED Phase: Escribir Test que Falle**
```typescript
// Ejemplo: centro-coste.service.spec.ts
describe('CentroCosteService', () => {
  it('should return hierarchical tree structure', async () => {
    // 🔴 Este test fallará inicialmente
    const result = await service.getJerarquia();
    
    expect(result).toHaveProperty('children');
    expect(result.children.length).toBeGreaterThan(0);
    expect(result.children[0]).toHaveProperty('parentId');
  });
});
```

### **🟢 GREEN Phase: Código Mínimo para Pasar**
```typescript
// centro-coste.service.ts
@Injectable()
export class CentroCosteService {
  async getJerarquia(): Promise<CentroCosteTree> {
    // 🟢 Implementación mínima que pasa el test
    return {
      children: [
        { id: '1', nombre: 'Test', parentId: null }
      ]
    };
  }
}
```

### **🔵 REFACTOR Phase: Mejorar sin Romper Tests**
```typescript
// centro-coste.service.ts (refactorizado)
@Injectable()
export class CentroCosteService {
  constructor(private repository: CentroCosteRepository) {}
  
  async getJerarquia(): Promise<CentroCosteTree> {
    // 🔵 Implementación completa y optimizada
    const centros = await this.repository.findAll();
    return this.buildTree(centros);
  }
  
  private buildTree(centros: CentroCoste[]): CentroCosteTree {
    // Lógica optimizada de construcción del árbol
  }
}
```

---

## 🎭 Servicios Mock: Desarrollo Independiente

### **📋 Principios de los Mocks**

1. **Realismo**: Datos que simulen casos reales
2. **Consistencia**: Comportamiento predecible
3. **Performance**: Simular delays de red reales
4. **Errores**: Incluir casos de fallo (5-10%)
5. **Escalabilidad**: Datos suficientes para testing

### **🏗️ Estructura de Mock Service**

```typescript
// src/app/features/centros-coste/infrastructure/mocks/centros-coste-mock.service.ts
@Injectable()
export class CentrosCosteMockService implements CentroCosteRepository {
  private mockData: CentroCoste[] = CENTROS_COSTE_MOCK_DATA;
  private config = inject(MOCK_CONFIG);
  
  async findAll(): Promise<CentroCoste[]> {
    await this.simulateNetworkDelay();
    
    if (this.shouldSimulateError()) {
      throw new Error('Simulated network error');
    }
    
    return [...this.mockData];
  }
  
  async create(centro: CentroCosteCreate): Promise<CentroCoste> {
    await this.simulateNetworkDelay();
    
    const newCentro: CentroCoste = {
      id: this.generateId(),
      codigo: this.generateCodigo(centro.parentId),
      ...centro,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockData.push(newCentro);
    return newCentro;
  }
  
  async update(id: string, centro: CentroCosteUpdate): Promise<CentroCoste> {
    await this.simulateNetworkDelay();
    
    const index = this.mockData.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Centro with id ${id} not found`);
    }
    
    this.mockData[index] = {
      ...this.mockData[index],
      ...centro,
      updatedAt: new Date()
    };
    
    return this.mockData[index];
  }
  
  async delete(id: string): Promise<void> {
    await this.simulateNetworkDelay();
    
    const index = this.mockData.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Centro with id ${id} not found`);
    }
    
    // Soft delete
    this.mockData[index].deletedAt = new Date();
  }
  
  // 🔧 Métodos de utilidad
  private async simulateNetworkDelay(): Promise<void> {
    const delay = this.randomDelay(this.config.delay.min, this.config.delay.max);
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  
  private shouldSimulateError(): boolean {
    return Math.random() < this.config.errorRate;
  }
  
  private generateId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateCodigo(parentId?: string): string {
    if (!parentId) {
      const maxCode = Math.max(...this.mockData
        .filter(c => !c.parentId)
        .map(c => parseInt(c.codigo.replace('CC', '')))
      );
      return `CC${String(maxCode + 1).padStart(3, '0')}`;
    }
    
    const parent = this.mockData.find(c => c.id === parentId);
    const siblings = this.mockData.filter(c => c.parentId === parentId);
    return `${parent?.codigo}.${String(siblings.length + 1).padStart(3, '0')}`;
  }
  
  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
```

### **📊 Mock Data Realista**

```typescript
// src/app/features/centros-coste/infrastructure/mocks/centros-coste-mock.data.ts
export const CENTROS_COSTE_MOCK_DATA: CentroCoste[] = [
  {
    id: '1',
    codigo: 'CC001',
    nombre: 'Administración',
    descripcion: 'Centro de costes administrativos',
    tipo: TipoCentroCoste.ADMINISTRATIVO,
    activo: true,
    parentId: null,
    empresaId: 'empresa-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    // Datos calculados para testing
    totalCostes: 125000,
    presupuestoAnual: 150000,
    porcentajeEjecucion: 83.33
  },
  {
    id: '2',
    codigo: 'CC001.001',
    nombre: 'Recursos Humanos',
    descripcion: 'Gestión de personal y nóminas',
    tipo: TipoCentroCoste.ADMINISTRATIVO,
    activo: true,
    parentId: '1',
    empresaId: 'empresa-1',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    totalCostes: 45000,
    presupuestoAnual: 50000,
    porcentajeEjecucion: 90.0
  },
  {
    id: '3',
    codigo: 'CC001.002',
    nombre: 'Contabilidad',
    descripcion: 'Gestión contable y fiscal',
    tipo: TipoCentroCoste.ADMINISTRATIVO,
    activo: true,
    parentId: '1',
    empresaId: 'empresa-1',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    totalCostes: 35000,
    presupuestoAnual: 40000,
    porcentajeEjecucion: 87.5
  },
  {
    id: '4',
    codigo: 'CC002',
    nombre: 'Producción',
    descripcion: 'Centro de costes de producción',
    tipo: TipoCentroCoste.PRODUCTIVO,
    activo: true,
    parentId: null,
    empresaId: 'empresa-1',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    totalCostes: 450000,
    presupuestoAnual: 500000,
    porcentajeEjecucion: 90.0
  },
  {
    id: '5',
    codigo: 'CC002.001',
    nombre: 'Obra Civil',
    descripcion: 'Construcción y obra civil',
    tipo: TipoCentroCoste.PRODUCTIVO,
    activo: true,
    parentId: '4',
    empresaId: 'empresa-1',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    totalCostes: 280000,
    presupuestoAnual: 300000,
    porcentajeEjecucion: 93.33
  },
  {
    id: '6',
    codigo: 'CC002.002',
    nombre: 'Instalaciones',
    descripcion: 'Instalaciones eléctricas y fontanería',
    tipo: TipoCentroCoste.PRODUCTIVO,
    activo: true,
    parentId: '4',
    empresaId: 'empresa-1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    totalCostes: 170000,
    presupuestoAnual: 200000,
    porcentajeEjecucion: 85.0
  },
  {
    id: '7',
    codigo: 'CC003',
    nombre: 'Comercial',
    descripcion: 'Área comercial y ventas',
    tipo: TipoCentroCoste.COMERCIAL,
    activo: true,
    parentId: null,
    empresaId: 'empresa-1',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
    totalCostes: 85000,
    presupuestoAnual: 100000,
    porcentajeEjecucion: 85.0
  },
  // Centro inactivo para testing
  {
    id: '8',
    codigo: 'CC004',
    nombre: 'I+D (Inactivo)',
    descripcion: 'Centro de investigación y desarrollo',
    tipo: TipoCentroCoste.ADMINISTRATIVO,
    activo: false,
    parentId: null,
    empresaId: 'empresa-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-22'),
    deletedAt: new Date('2024-01-22'),
    totalCostes: 0,
    presupuestoAnual: 75000,
    porcentajeEjecucion: 0
  }
];

// Datos adicionales para testing de edge cases
export const CENTROS_COSTE_EDGE_CASES = {
  // Centro con nombre muy largo
  nombreLargo: 'Centro de Costes con un Nombre Extremadamente Largo que Podría Causar Problemas de UI y Necesita ser Manejado Correctamente',
  
  // Centro con caracteres especiales
  caracteresEspeciales: 'Centro & Cía. (50% - Participación) [Activo] #2024',
  
  // Centro con código duplicado (para testing de validaciones)
  codigoDuplicado: 'CC001',
  
  // Centro con jerarquía muy profunda (5 niveles)
  jerarquiaProfunda: [
    { nivel: 1, codigo: 'CC100', nombre: 'Nivel 1' },
    { nivel: 2, codigo: 'CC100.001', nombre: 'Nivel 2' },
    { nivel: 3, codigo: 'CC100.001.001', nombre: 'Nivel 3' },
    { nivel: 4, codigo: 'CC100.001.001.001', nombre: 'Nivel 4' },
    { nivel: 5, codigo: 'CC100.001.001.001.001', nombre: 'Nivel 5' }
  ]
};
```

---

## ⚙️ Configuración de Mocks

### **🔧 Mock Configuration**

```typescript
// src/app/core/config/mock.config.ts
export interface MockConfig {
  enabled: boolean;
  delay: {
    min: number;
    max: number;
  };
  errorRate: number;
  logging: boolean;
  persistence: boolean; // Mantener cambios en localStorage
}

export const MOCK_CONFIG: MockConfig = {
  enabled: environment.useMocks,
  delay: {
    min: 300,
    max: 1000
  },
  errorRate: 0.05, // 5% de requests fallan
  logging: !environment.production,
  persistence: true
};

export const MOCK_CONFIG_TOKEN = new InjectionToken<MockConfig>('MOCK_CONFIG');
```

### **🌍 Environment Configuration**

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  useMocks: true,
  mockDelay: 500,
  mockErrorRate: 0.05,
  apiUrl: 'http://localhost:3000/api',
  
  // Configuración específica por módulo
  mockConfig: {
    centrosCostes: {
      enabled: true,
      dataSize: 'large', // small, medium, large
      includeInactive: true
    },
    condicionesPago: {
      enabled: true,
      dataSize: 'medium',
      includeCalculations: true
    }
  }
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  useMocks: false,
  mockDelay: 0,
  mockErrorRate: 0,
  apiUrl: 'https://api.empresa.com',
  
  mockConfig: {
    // Todos los mocks desactivados en producción
  }
};
```

### **🔌 Provider Configuration**

```typescript
// src/app/core/providers/mock.providers.ts
import { environment } from '../../environments/environment';

export const MOCK_PROVIDERS: Provider[] = [
  // Configuración global de mocks
  {
    provide: MOCK_CONFIG_TOKEN,
    useValue: MOCK_CONFIG
  },
  
  // Providers condicionales por módulo
  {
    provide: CentroCosteRepository,
    useClass: environment.useMocks 
      ? CentrosCosteMockService 
      : CentrosCostesHttpService
  },
  {
    provide: CondicionesPagoRepository,
    useClass: environment.useMocks 
      ? CondicionesPagoMockService 
      : CondicionesPagoHttpService
  },
  {
    provide: FormasPagoRepository,
    useClass: environment.useMocks 
      ? FormasPagoMockService 
      : FormasPagoHttpService
  }
  // ... más providers
];

// Función helper para configuración dinámica
export function createMockProvider<T>(
  token: InjectionToken<T>,
  mockService: Type<T>,
  realService: Type<T>
): Provider {
  return {
    provide: token,
    useClass: environment.useMocks ? mockService : realService
  };
}
```

---

## 🧪 Estrategias de Testing con Mocks

### **📝 Test Scenarios**

```typescript
// src/app/features/centros-coste/presentation/components/centros-coste.component.spec.ts
describe('CentroCosteComponent with Mocks', () => {
  let component: CentroCosteComponent;
  let fixture: ComponentFixture<CentroCosteComponent>;
  let mockService: CentrosCosteMockService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CentroCosteComponent],
      providers: [
        {
          provide: CentroCosteRepository,
          useClass: CentrosCosteMockService
        },
        {
          provide: MOCK_CONFIG_TOKEN,
          useValue: { ...MOCK_CONFIG, delay: { min: 0, max: 0 } } // Sin delay en tests
        }
      ]
    });
    
    fixture = TestBed.createComponent(CentroCosteComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(CentroCosteRepository) as CentrosCosteMockService;
  });
  
  describe('Data Loading', () => {
    it('should load hierarchical data on init', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      
      expect(component.centros()).toBeDefined();
      expect(component.centros().length).toBeGreaterThan(0);
      expect(component.loading()).toBeFalse();
    });
    
    it('should handle loading states', () => {
      expect(component.loading()).toBeTrue();
      
      component.ngOnInit();
      expect(component.loading()).toBeTrue();
      
      // Simular finalización de carga
      fixture.detectChanges();
      expect(component.loading()).toBeFalse();
    });
  });
  
  describe('CRUD Operations', () => {
    it('should create new centro', async () => {
      const newCentro: CentroCosteCreate = {
        nombre: 'Nuevo Centro',
        tipo: TipoCentroCoste.ADMINISTRATIVO,
        parentId: null
      };
      
      await component.createCentro(newCentro);
      
      expect(component.centros().some(c => c.nombre === 'Nuevo Centro')).toBeTrue();
    });
    
    it('should update existing centro', async () => {
      const centroId = component.centros()[0].id;
      const updates: CentroCosteUpdate = {
        nombre: 'Centro Actualizado'
      };
      
      await component.updateCentro(centroId, updates);
      
      const updatedCentro = component.centros().find(c => c.id === centroId);
      expect(updatedCentro?.nombre).toBe('Centro Actualizado');
    });
    
    it('should delete centro', async () => {
      const initialCount = component.centros().length;
      const centroId = component.centros()[0].id;
      
      await component.deleteCentro(centroId);
      
      expect(component.centros().length).toBe(initialCount - 1);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Configurar mock para simular error
      spyOn(mockService, 'findAll').and.returnValue(
        Promise.reject(new Error('Network error'))
      );
      
      component.ngOnInit();
      await fixture.whenStable();
      
      expect(component.error()).toBeTruthy();
      expect(component.loading()).toBeFalse();
    });
    
    it('should retry failed operations', async () => {
      let callCount = 0;
      spyOn(mockService, 'findAll').and.callFake(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First attempt fails'));
        }
        return Promise.resolve(CENTROS_COSTE_MOCK_DATA);
      });
      
      component.ngOnInit();
      await fixture.whenStable();
      
      // Primer intento falla
      expect(component.error()).toBeTruthy();
      
      // Retry exitoso
      await component.retry();
      expect(component.error()).toBeFalsy();
      expect(component.centros().length).toBeGreaterThan(0);
    });
  });
  
  describe('UI Interactions', () => {
    it('should filter centros by tipo', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      
      component.filterByTipo(TipoCentroCoste.ADMINISTRATIVO);
      
      const filteredCentros = component.filteredCentros();
      expect(filteredCentros.every(c => c.tipo === TipoCentroCoste.ADMINISTRATIVO)).toBeTrue();
    });
    
    it('should search centros by name', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      
      component.search('Administración');
      
      const searchResults = component.filteredCentros();
      expect(searchResults.some(c => c.nombre.includes('Administración'))).toBeTrue();
    });
    
    it('should handle drag and drop reordering', async () => {
      component.ngOnInit();
      await fixture.whenStable();
      
      const sourceId = component.centros()[1].id;
      const targetId = component.centros()[0].id;
      
      await component.moveCentro(sourceId, targetId);
      
      const movedCentro = component.centros().find(c => c.id === sourceId);
      expect(movedCentro?.parentId).toBe(targetId);
    });
  });
});
```

### **🔄 Integration Tests con Mocks**

```typescript
// src/app/features/centros-coste/centros-coste.integration.spec.ts
describe('CentroCoste Integration Tests', () => {
  let service: CentroCosteService;
  let component: CentroCosteComponent;
  let dialog: MatDialog;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatTreeModule,
        NoopAnimationsModule
      ],
      declarations: [
        CentroCosteComponent,
        CentroCosteDialogComponent
      ],
      providers: [
        {
          provide: CentroCosteRepository,
          useClass: CentrosCosteMockService
        }
      ]
    });
    
    service = TestBed.inject(CentroCosteService);
    dialog = TestBed.inject(MatDialog);
  });
  
  it('should complete full CRUD workflow', async () => {
    // 1. Cargar datos iniciales
    const initialData = await service.getJerarquia();
    expect(initialData.children.length).toBeGreaterThan(0);
    
    // 2. Crear nuevo centro
    const newCentro = await service.create({
      nombre: 'Centro Test',
      tipo: TipoCentroCoste.ADMINISTRATIVO
    });
    expect(newCentro.id).toBeDefined();
    expect(newCentro.codigo).toMatch(/^CC\d{3}$/);
    
    // 3. Actualizar centro
    const updatedCentro = await service.update(newCentro.id, {
      nombre: 'Centro Test Actualizado'
    });
    expect(updatedCentro.nombre).toBe('Centro Test Actualizado');
    
    // 4. Verificar jerarquía actualizada
    const updatedData = await service.getJerarquia();
    const foundCentro = this.findCentroInTree(updatedData, newCentro.id);
    expect(foundCentro?.nombre).toBe('Centro Test Actualizado');
    
    // 5. Eliminar centro
    await service.delete(newCentro.id);
    
    // 6. Verificar eliminación
    const finalData = await service.getJerarquia();
    const deletedCentro = this.findCentroInTree(finalData, newCentro.id);
    expect(deletedCentro).toBeUndefined();
  });
  
  private findCentroInTree(tree: CentroCosteTree, id: string): CentroCoste | undefined {
    // Implementar búsqueda recursiva en el árbol
    // ...
  }
});
```

---

## 🔄 Transición de Mocks a Backend Real

### **📋 Checklist de Transición**

#### **Fase 1: Preparación**
- [ ] Todos los tests con mocks pasando
- [ ] Documentación de APIs mock completa
- [ ] Configuración de environments lista
- [ ] Adapters HTTP implementados

#### **Fase 2: Integración Gradual**
- [ ] Configurar `environment.useMocks = false` por módulo
- [ ] Ejecutar tests con backend real
- [ ] Comparar respuestas mock vs real
- [ ] Ajustar mappers si es necesario

#### **Fase 3: Validación**
- [ ] Tests E2E con backend real
- [ ] Performance testing
- [ ] Error handling con errores reales
- [ ] Validación de datos en producción

### **🔧 Script de Transición**

```typescript
// scripts/transition-to-backend.ts
import { environment } from '../src/environments/environment';

interface TransitionConfig {
  module: string;
  mockEnabled: boolean;
  testsPassing: boolean;
  backendReady: boolean;
}

const TRANSITION_STATUS: TransitionConfig[] = [
  {
    module: 'centros-coste',
    mockEnabled: true,
    testsPassing: true,
    backendReady: false
  },
  {
    module: 'condiciones-pago',
    mockEnabled: true,
    testsPassing: false,
    backendReady: false
  }
  // ... más módulos
];

function checkTransitionReadiness(): void {
  console.log('🔄 Checking transition readiness...');
  
  TRANSITION_STATUS.forEach(config => {
    const ready = config.testsPassing && config.backendReady;
    const status = ready ? '✅' : '❌';
    
    console.log(`${status} ${config.module}:`);
    console.log(`  - Tests passing: ${config.testsPassing ? '✅' : '❌'}`);
    console.log(`  - Backend ready: ${config.backendReady ? '✅' : '❌'}`);
    
    if (ready) {
      console.log(`  🚀 Ready to transition to backend!`);
    }
  });
}

function transitionModule(moduleName: string): void {
  console.log(`🔄 Transitioning ${moduleName} from mocks to backend...`);
  
  // 1. Actualizar configuración
  // 2. Ejecutar tests
  // 3. Validar respuestas
  // 4. Confirmar transición
  
  console.log(`✅ ${moduleName} successfully transitioned!`);
}

// Ejecutar
checkTransitionReadiness();
```

---

## 📊 Métricas y Monitoreo

### **📈 KPIs de Desarrollo TDD**

- **Test Coverage**: >80% en todos los módulos
- **Test Execution Time**: <30s para suite completa
- **Mock Realism**: 95% compatibilidad con backend real
- **Development Speed**: 30% más rápido vs desarrollo tradicional
- **Bug Rate**: <2 bugs por 100 líneas de código

### **🔍 Monitoreo de Mocks**

```typescript
// src/app/core/services/mock-monitor.service.ts
@Injectable()
export class MockMonitorService {
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    averageDelay: 0,
    cacheHits: 0
  };
  
  logRequest(module: string, method: string, duration: number): void {
    this.metrics.requestCount++;
    this.updateAverageDelay(duration);
    
    if (environment.mockConfig?.logging) {
      console.log(`🎭 Mock ${module}.${method} - ${duration}ms`);
    }
  }
  
  logError(module: string, method: string, error: Error): void {
    this.metrics.errorCount++;
    
    console.warn(`🚨 Mock ${module}.${method} error:`, error);
  }
  
  getMetrics(): MockMetrics {
    return { ...this.metrics };
  }
  
  private updateAverageDelay(duration: number): void {
    const total = this.metrics.averageDelay * (this.metrics.requestCount - 1);
    this.metrics.averageDelay = (total + duration) / this.metrics.requestCount;
  }
}
```

---

## 🎯 Beneficios de la Metodología

### **✅ Ventajas del TDD con Mocks**

1. **Desarrollo Independiente**: Frontend no depende del backend
2. **Calidad Garantizada**: Tests definen el comportamiento esperado
3. **Refactoring Seguro**: Tests protegen contra regresiones
4. **Documentación Viva**: Tests documentan el comportamiento
5. **Debugging Rápido**: Errores detectados inmediatamente
6. **Performance Predecible**: Mocks simulan condiciones reales

### **📊 ROI Esperado**

- **Reducción de bugs**: 60-80%
- **Tiempo de desarrollo**: +20% inicial, -40% en mantenimiento
- **Tiempo de testing**: -70% (automatización)
- **Confianza en deploys**: +90%
- **Onboarding nuevos devs**: -50% tiempo

---

**Versión**: 1.0  
**Fecha**: Enero 2025  
**Metodología**: TDD + Mock Services  
**Objetivo**: Desarrollo frontend independiente y de alta calidad