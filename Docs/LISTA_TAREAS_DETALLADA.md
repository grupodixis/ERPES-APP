# 📋 Lista Detallada de Tareas y Subtareas - ERP Angular Frontend

## 🎯 Metodología de Trabajo

### 📐 Estándar por Módulo
Cada módulo sigue el patrón hexagonal establecido:

```
📁 features/[modulo]/
├── 📁 application/
│   ├── services/[modulo].service.ts
│   └── models/[modulo].model.ts
├── 📁 infrastructure/
│   └── adapters/[modulo].adapter.ts
├── 📁 presentation/
│   ├── components/
│   │   ├── [modulo].component.ts
│   │   ├── [modulo]-dialog.component.ts
│   │   └── [modulo]-detail.component.ts
│   └── [modulo].routes.ts
└── 📁 domain/
    ├── entities/[modulo].entity.ts
    └── repositories/[modulo].repository.ts
```

### 🔄 Flujo de Desarrollo TDD
1. **Backend Ready** ✅ (Ya implementado)
2. **🔴 RED: Tests Mock Service** (Definir comportamiento esperado)
3. **🟢 GREEN: Mock Service** (Datos de prueba + Simulación delays)
4. **🔴 RED: Tests Domain Models** (Validaciones + Transformaciones)
5. **🟢 GREEN: Domain Models** (Entities + DTOs + Mappers)
6. **🔴 RED: Tests Components** (Comportamiento UI esperado)
7. **🟢 GREEN: Components** (Lista + Dialog + Detail)
8. **🔵 REFACTOR: Optimization** (Performance + UX)
9. **Integration Tests** (E2E con Mocks)
10. **🔄 Backend Integration** (Reemplazar Mocks por HTTP)
11. **Documentation** (Storybook + README)

---

# 🚀 FASE 1: CONFIGURACIÓN BASE (3-4 semanas)

## 1️⃣ CENTROS DE COSTE (1 semana)

### 📋 Subtareas:

#### **1.1 TDD: Tests + Mock Service** (1 día)
- [ ] **1.1.1** 🔴 **RED**: Crear `centros-coste.service.spec.ts`
  - Test: `should return hierarchical tree structure`
  - Test: `should create centro with auto-generated code`
  - Test: `should move centro to new parent`
  - Test: `should validate business rules`

- [ ] **1.1.2** 🟢 **GREEN**: Crear `centros-coste-mock.service.ts`
  - Mock data realista con jerarquía
  - Simulación de delays (300-800ms)
  - Simulación de errores (5% rate)
  - Implementar todos los métodos del repository

- [ ] **1.1.3** 🟢 **GREEN**: Crear `centros-coste.service.ts`
  - Implementación mínima para pasar tests
  - Método `getJerarquia()` para árbol
  - Método `moverCentro(id, parentId)` para reorganizar
  - Validaciones de negocio

- [ ] **1.1.4** Crear `centros-coste.model.ts`
  - Interface `CentroCoste`
  - Interface `CentroCosteCreate/Update`
  - Enum `TipoCentroCoste`
  - Type `CentroCosteTree`
  - Mappers para transformación de datos

#### **1.2 Domain Layer** (0.5 días)
- [ ] **1.2.1** Crear `centro-coste.entity.ts`
- [ ] **1.2.2** Crear `centro-coste.repository.ts`
- [ ] **1.2.3** Crear `centros-coste.adapter.ts`

#### **1.3 TDD: List Component** (1.5 días)
- [ ] **1.3.1** 🔴 **RED**: Crear `centros-coste.component.spec.ts`
  - Test: `should display tree structure on init`
  - Test: `should filter by tipo and estado`
  - Test: `should handle drag and drop reorganization`
  - Test: `should show context menu on right click`
  - Test: `should emit events for CRUD operations`

- [ ] **1.3.2** 🟢 **GREEN**: Crear `centros-coste.component.ts`
  - Implementación mínima para pasar tests
  - Mat-Tree para jerarquía
  - Drag & Drop para reorganizar
  - Filtros por tipo y estado
  - Acciones: Crear, Editar, Eliminar, Mover

- [ ] **1.3.3** 🟢 **GREEN**: Crear `centros-coste.component.html`
  - Material Tree con expansión
  - Toolbar con filtros
  - Context menu por nodo
  - Indicadores visuales (activo/inactivo)

- [ ] **1.3.4** 🔵 **REFACTOR**: Crear `centros-coste.component.scss`
  - Estilos para árbol jerárquico
  - Animaciones drag & drop
  - Responsive design
  - Optimización UX

#### **1.4 TDD: Dialog Component** (1 día)
- [ ] **1.4.1** 🔴 **RED**: Crear `centro-coste-dialog.component.spec.ts`
  - Test: `should validate required fields`
  - Test: `should generate automatic code preview`
  - Test: `should filter parent centro options`
  - Test: `should emit save event with valid data`
  - Test: `should handle form errors gracefully`

- [ ] **1.4.2** 🟢 **GREEN**: Crear `centro-coste-dialog.component.ts`
  - Formulario reactivo con validaciones
  - Selector de centro padre
  - Preview de código automático
  - Manejo de estados (loading, error, success)

- [ ] **1.4.3** 🟢 **GREEN**: Crear `centro-coste-dialog.component.html`
  - Mat-Dialog con stepper
  - Campos: código, nombre, tipo, centro padre
  - Validaciones en tiempo real
  - Estados de loading y error

#### **1.5 Routes & Integration** (0.5 días)
- [ ] **1.5.1** Configurar rutas en `configuracion.routes.ts`
- [ ] **1.5.2** Agregar al menú principal
- [ ] **1.5.3** Configurar permisos y guards

#### **1.6 Integration & E2E Testing** (0.5 días)
- [ ] **1.6.1** 🧪 **Integration Tests**: `centros-coste.integration.spec.ts`
  - Test: Flujo completo crear → editar → eliminar
  - Test: Drag & drop con persistencia
  - Test: Filtros + búsqueda + paginación
  - Test: Manejo de errores de red

- [ ] **1.6.2** 🧪 **E2E Tests**: `centros-coste.e2e.spec.ts`
  - Scenario: Usuario crea jerarquía de centros
  - Scenario: Usuario reorganiza árbol con drag & drop
  - Scenario: Usuario filtra y busca centros
  - Performance: Carga inicial < 2s

- [ ] **1.6.3** 🔄 **Mock to Backend**: Preparar transición
  - Configurar environment.useMocks = false
  - Validar que todos los tests siguen pasando
  - Documentar diferencias entre mock y backend real

---

## 2️⃣ CONDICIONES DE PAGO (4 días)

### 📋 Subtareas:

#### **2.1 Service Layer** (0.5 días)
- [ ] **2.1.1** Crear `condiciones-pago.service.ts`
  - CRUD básico + cálculo de vencimientos
  - Método `calcularVencimientos(condicion, fecha, importe)`
  - Validaciones de días y porcentajes

- [ ] **2.1.2** Crear `condiciones-pago.model.ts`
  - Interface con líneas de vencimiento
  - Calculadora de fechas

#### **2.2 Components** (2.5 días)
- [ ] **2.2.1** Lista con preview de cálculos
- [ ] **2.2.2** Dialog con tabla editable de vencimientos
- [ ] **2.2.3** Calculadora visual de fechas

#### **2.3 Integration & Testing** (1 día)
- [ ] **2.3.1** Routes y permisos
- [ ] **2.3.2** Tests unitarios y E2E

---

## 3️⃣ FORMAS DE PAGO (1 semana)

### 📋 Subtareas:

#### **3.1 Service Layer** (1 día)
- [ ] **3.1.1** Crear `formas-pago.service.ts`
  - CRUD + configuración SEPA
  - Validaciones IBAN/BIC
  - Integración con mandatos SEPA

#### **3.2 Components** (3 días)
- [ ] **3.2.1** Lista con indicadores SEPA
- [ ] **3.2.2** Dialog con configuración bancaria
- [ ] **3.2.3** Validador IBAN en tiempo real
- [ ] **3.2.4** Configuración mandatos SEPA

#### **3.3 Integration & Testing** (1 día)
- [ ] **3.3.1** Routes y permisos
- [ ] **3.3.2** Tests con mocks de validación IBAN

---

## 4️⃣ UNIDADES DE MEDIDA (3 días)

### 📋 Subtareas:

#### **4.1 Service Layer** (0.5 días)
- [ ] **4.1.1** Crear `unidades-medida.service.ts`
  - CRUD + tabla de conversiones
  - Calculadora de equivalencias

#### **4.2 Components** (2 días)
- [ ] **4.2.1** Lista con calculadora integrada
- [ ] **4.2.2** Dialog con tabla de conversiones
- [ ] **4.2.3** Widget calculadora de unidades

#### **4.3 Integration & Testing** (0.5 días)
- [ ] **4.3.1** Routes y tests

---

## 5️⃣ TIPOS DE IVA (4 días)

### 📋 Subtareas:

#### **5.1 Service Layer** (1 día)
- [ ] **5.1.1** Crear `tipos-iva.service.ts`
  - CRUD + cálculos fiscales
  - Configuración por país
  - Validaciones de porcentajes

#### **5.2 Components** (2.5 días)
- [ ] **5.2.1** Lista con calculadora fiscal
- [ ] **5.2.2** Dialog con configuración por país
- [ ] **5.2.3** Preview de cálculos en tiempo real

#### **5.3 Integration & Testing** (0.5 días)
- [ ] **5.3.1** Routes y tests

---

# 🔒 FASE 2: SEGURIDAD COMPLETA (2 semanas)

## 6️⃣ PERMISOS (1 semana)

### 📋 Subtareas:

#### **6.1 Service Layer** (1 día)
- [ ] **6.1.1** Crear `permisos.service.ts`
  - CRUD + jerarquía de permisos
  - Método `getPermisosModulo(modulo)`
  - Cache de permisos del usuario

- [ ] **6.1.2** Crear `permisos.model.ts`
  - Interface `Permiso` con jerarquía
  - Enum `TipoPermiso` (READ, WRITE, DELETE, ADMIN)
  - Type `PermisoTree`

#### **6.2 Components** (3 días)
- [ ] **6.2.1** Lista jerárquica por módulos
  - Mat-Tree agrupado por módulo
  - Filtros por tipo y estado
  - Búsqueda inteligente

- [ ] **6.2.2** Dialog de creación/edición
  - Selector de módulo padre
  - Configuración de acciones
  - Preview de código automático

- [ ] **6.2.3** Componente matriz permisos
  - Vista tabular módulo x acción
  - Edición inline
  - Export/Import CSV

#### **6.3 Integration & Testing** (1 día)
- [ ] **6.3.1** Integración con guards existentes
- [ ] **6.3.2** Tests de autorización

---

## 7️⃣ ROLES-PERMISOS (1 semana)

### 📋 Subtareas:

#### **7.1 Service Layer** (1 día)
- [ ] **7.1.1** Crear `roles-permisos.service.ts`
  - Asignación masiva de permisos
  - Templates de roles predefinidos
  - Comparación entre roles

#### **7.2 Components** (3 días)
- [ ] **7.2.1** Matriz roles x permisos
  - Tabla editable con checkboxes
  - Filtros y agrupaciones
  - Drag & drop para copiar permisos

- [ ] **7.2.2** Asistente de configuración
  - Wizard para nuevos roles
  - Templates predefinidos
  - Preview de permisos

- [ ] **7.2.3** Comparador de roles
  - Vista diff entre roles
  - Sugerencias de optimización

#### **7.3 Integration & Testing** (1 día)
- [ ] **7.3.1** Integración con sistema de roles
- [ ] **7.3.2** Tests de asignación masiva

---

## 8️⃣ USUARIOS-ROLES (3 días)

### 📋 Subtareas:

#### **8.1 Enhancement Usuarios** (2 días)
- [ ] **8.1.1** Agregar multi-select de roles en usuario-dialog
- [ ] **8.1.2** Vista de permisos efectivos por usuario
- [ ] **8.1.3** Historial de cambios de roles

#### **8.2 Testing** (1 día)
- [ ] **8.2.1** Tests de asignación múltiple
- [ ] **8.2.2** Tests de permisos efectivos

---

# 👥 FASE 3: TERCEROS COMPLETOS (3-4 semanas)

## 9️⃣ CLIENTES (1.5 semanas)

### 📋 Subtareas:

#### **9.1 Service Layer** (1 día)
- [ ] **9.1.1** Crear `clientes.service.ts`
  - CRUD + vinculación con personas
  - Generación códigos automáticos
  - Búsqueda inteligente por CIF/nombre
  - Estadísticas de facturación

- [ ] **9.1.2** Crear `clientes.model.ts`
  - Interface `Cliente` extendiendo `Persona`
  - Configuración de códigos automáticos
  - Estadísticas comerciales

#### **9.2 Components** (4 días)
- [ ] **9.2.1** Lista de clientes
  - Tabla con datos de persona + comerciales
  - Filtros avanzados (facturación, zona, etc.)
  - Indicadores visuales (activo, moroso, etc.)
  - Export a Excel/PDF

- [ ] **9.2.2** Dialog cliente
  - Selector de persona existente o crear nueva
  - Configuración comercial (descuentos, condiciones)
  - Preview de código automático
  - Validaciones de negocio

- [ ] **9.2.3** Detalle cliente
  - Dashboard con KPIs
  - Historial de facturación
  - Documentos asociados
  - Timeline de actividad

- [ ] **9.2.4** Selector cliente reutilizable
  - Autocomplete con búsqueda
  - Creación rápida inline
  - Favoritos del usuario

#### **9.3 Integration & Testing** (2 días)
- [ ] **9.3.1** Integración con módulo personas
- [ ] **9.3.2** Tests de vinculación
- [ ] **9.3.3** Tests de códigos automáticos

---

## 🔟 PROVEEDORES (2 semanas)

### 📋 Subtareas:

#### **10.1 Service Layer** (1.5 días)
- [ ] **10.1.1** Crear `proveedores.service.ts`
  - CRUD + sistema de evaluación
  - Workflow de homologación
  - Gestión de documentación
  - Alertas de vencimientos

- [ ] **10.1.2** Crear `proveedores.model.ts`
  - Interface con sistema de scoring
  - Estados de homologación
  - Documentos requeridos

#### **10.2 Components** (5 días)
- [ ] **10.2.1** Lista proveedores
  - Estados de homologación
  - Sistema de scoring visual
  - Alertas de documentación

- [ ] **10.2.2** Dialog proveedor
  - Wizard de homologación
  - Upload de documentos
  - Sistema de evaluación

- [ ] **10.2.3** Dashboard evaluación
  - Métricas de rendimiento
  - Comparativas
  - Recomendaciones

- [ ] **10.2.4** Workflow homologación
  - Estados y transiciones
  - Notificaciones automáticas
  - Historial de cambios

#### **10.3 Integration & Testing** (2.5 días)
- [ ] **10.3.1** Integración con sistema de documentos
- [ ] **10.3.2** Tests de workflow
- [ ] **10.3.3** Tests de evaluación

---

# 🏗️ FASE 4: OBRAS Y CONSTRUCCIÓN (6-7 semanas)

## 1️⃣1️⃣ OBRAS (2 semanas)

### 📋 Subtareas:

#### **11.1 Service Layer** (2 días)
- [ ] **11.1.1** Crear `obras.service.ts`
  - CRUD + gestión de estados
  - Dashboard de KPIs
  - Timeline de hitos
  - Gestión de documentos

- [ ] **11.1.2** Crear `obras.model.ts`
  - Estados de obra (planificación, ejecución, etc.)
  - KPIs y métricas
  - Configuración de alertas

#### **11.2 Components** (6 días)
- [ ] **11.2.1** Lista obras
  - Cards con estado visual
  - Filtros por estado, cliente, fecha
  - KPIs resumidos
  - Mapa de ubicaciones

- [ ] **11.2.2** Dialog obra
  - Wizard de creación
  - Configuración de hitos
  - Upload de planos/documentos
  - Asignación de equipo

- [ ] **11.2.3** Dashboard obra
  - KPIs en tiempo real
  - Gráficos de progreso
  - Timeline interactivo
  - Alertas y notificaciones

- [ ] **11.2.4** Detalle obra
  - Tabs: General, Capítulos, Equipo, Documentos
  - Historial de cambios
  - Chat/comentarios
  - Galería de fotos

#### **11.3 Integration & Testing** (2 días)
- [ ] **11.3.1** Integración con clientes
- [ ] **11.3.2** Tests de estados y transiciones
- [ ] **11.3.3** Tests de KPIs

---

## 1️⃣2️⃣ CAPÍTULOS (1 semana)

### 📋 Subtareas:

#### **12.1 Service Layer** (1 día)
- [ ] **12.1.1** Crear `capitulos.service.ts`
  - CRUD + jerarquía por obra
  - Cálculos de totales
  - Reorganización drag & drop

#### **12.2 Components** (3 días)
- [ ] **12.2.1** Árbol jerárquico de capítulos
- [ ] **12.2.2** Dialog con calculadora de importes
- [ ] **12.2.3** Vista resumen por obra

#### **12.3 Integration & Testing** (1 día)
- [ ] **12.3.1** Integración con obras
- [ ] **12.3.2** Tests de jerarquía

---

## 1️⃣3️⃣ PARTIDAS (1.5 semanas)

### 📋 Subtareas:

#### **13.1 Service Layer** (1.5 días)
- [ ] **13.1.1** Crear `partidas.service.ts`
  - CRUD + mediciones
  - Cálculos automáticos
  - Vinculación con productos
  - Precios y actualizaciones

#### **13.2 Components** (4 días)
- [ ] **13.2.1** Lista con calculadora integrada
- [ ] **13.2.2** Dialog con mediciones complejas
- [ ] **13.2.3** Importador desde base de precios
- [ ] **13.2.4** Comparador de precios

#### **13.3 Integration & Testing** (1.5 días)
- [ ] **13.3.1** Integración con capítulos y productos
- [ ] **13.3.2** Tests de cálculos

---

## 1️⃣4️⃣ OPERARIOS (1 semana)

### 📋 Subtareas:

#### **14.1 Service Layer** (1 día)
- [ ] **14.1.1** Crear `operarios.service.ts`
  - CRUD + disponibilidad
  - Gestión de skills/categorías
  - Historial de trabajos

#### **14.2 Components** (3 días)
- [ ] **14.2.1** Lista con filtros por skill
- [ ] **14.2.2** Calendario de disponibilidad
- [ ] **14.2.3** Perfil detallado con historial

#### **14.3 Integration & Testing** (1 día)
- [ ] **14.3.1** Tests de disponibilidad

---

## 1️⃣5️⃣ ÓRDENES DE TRABAJO (2 semanas)

### 📋 Subtareas:

#### **15.1 Service Layer** (2 días)
- [ ] **15.1.1** Crear `ordenes-trabajo.service.ts`
  - CRUD + asignaciones
  - Estados y workflow
  - Notificaciones automáticas
  - Seguimiento en tiempo real

#### **15.2 Components** (6 días)
- [ ] **15.2.1** Kanban board de órdenes
- [ ] **15.2.2** Timeline de planificación
- [ ] **15.2.3** Dialog de asignación con drag & drop
- [ ] **15.2.4** Dashboard de seguimiento
- [ ] **15.2.5** App móvil para operarios (PWA)

#### **15.3 Integration & Testing** (2 días)
- [ ] **15.3.1** Integración completa
- [ ] **15.3.2** Tests de workflow
- [ ] **15.3.3** Tests PWA

---

# 💼 FASE 5: COMERCIAL Y AVANZADO (4-5 semanas)

## 1️⃣6️⃣ LÍNEAS PRESUPUESTO (1 semana)

### 📋 Subtareas:

#### **16.1 Service Layer** (1 día)
- [ ] **16.1.1** Crear `lineas-presupuesto.service.ts`
  - CRUD + cálculos automáticos
  - Vinculación con partidas/productos
  - Totalizadores y descuentos

#### **16.2 Components** (3 días)
- [ ] **16.2.1** Tabla editable inline
- [ ] **16.2.2** Calculadora de totales
- [ ] **16.2.3** Importador desde obras

#### **16.3 Integration & Testing** (1 día)
- [ ] **16.3.1** Tests de cálculos

---

## 1️⃣7️⃣ FACTURAS (2 semanas)

### 📋 Subtareas:

#### **17.1 Service Layer** (2 días)
- [ ] **17.1.1** Crear `facturas.service.ts`
  - CRUD + generación PDF
  - Envío por email
  - Estados y seguimiento
  - Integración contable

#### **17.2 Components** (6 días)
- [ ] **17.2.1** Editor de facturas
- [ ] **17.2.2** Preview PDF en tiempo real
- [ ] **17.2.3** Gestor de envíos
- [ ] **17.2.4** Dashboard de facturación

#### **17.3 Integration & Testing** (2 días)
- [ ] **17.3.1** Tests de generación PDF
- [ ] **17.3.2** Tests de envío email

---

## 1️⃣8️⃣ DESGLOSE PRODUCTO (1 semana)

### 📋 Subtareas:

#### **18.1 Service Layer** (1 día)
- [ ] **18.1.1** Crear `desglose-producto.service.ts`
  - BOM (Bill of Materials)
  - Cálculos de costes
  - Explosión de materiales

#### **18.2 Components** (3 días)
- [ ] **18.2.1** Árbol de componentes
- [ ] **18.2.2** Calculadora de costes
- [ ] **18.2.3** Importador/Exportador BOM

#### **18.3 Integration & Testing** (1 día)
- [ ] **18.3.1** Tests de BOM

---

## 1️⃣9️⃣ DESCUENTOS (1 semana)

### 📋 Subtareas:

#### **19.1 Service Layer** (1 día)
- [ ] **19.1.1** Crear `descuentos.service.ts`
  - Tipos de descuento
  - Reglas de aplicación
  - Validaciones

#### **19.2 Components** (3 días)
- [ ] **19.2.1** Configurador de reglas
- [ ] **19.2.2** Simulador de descuentos
- [ ] **19.2.3** Aplicador automático

#### **19.3 Integration & Testing** (1 día)
- [ ] **19.3.1** Tests de reglas

---

# 📊 RESUMEN EJECUTIVO

## 🎯 Totales por Fase

| Fase | Módulos | Semanas | Componentes | Servicios | Tests |
|------|---------|---------|-------------|-----------|-------|
| **Fase 1** | 5 | 3-4 | 15 | 5 | 15 |
| **Fase 2** | 3 | 2 | 9 | 3 | 9 |
| **Fase 3** | 2 | 3-4 | 8 | 2 | 8 |
| **Fase 4** | 5 | 6-7 | 20 | 5 | 20 |
| **Fase 5** | 4 | 4-5 | 16 | 4 | 16 |
| **TOTAL** | **19** | **18-22** | **68** | **19** | **68** |

## 📈 Métricas de Desarrollo

- **Líneas de código estimadas**: ~45,000 líneas
- **Componentes Angular**: 68 componentes
- **Servicios HTTP**: 19 servicios
- **Tests unitarios**: 68 suites
- **Tests E2E**: 19 flujos
- **Páginas de documentación**: 38 páginas

## 🚀 Criterios de Aceptación

### ✅ Definición de "Terminado" por Módulo:
1. **Service implementado** con todos los endpoints
2. **Componentes funcionales** (Lista + Dialog + Detail)
3. **Tests pasando** (>80% cobertura)
4. **Documentación actualizada** (README + Storybook)
5. **Integración completa** con módulos dependientes
6. **Validación UX** con usuario final
7. **Performance optimizada** (<3s carga inicial)
8. **Responsive design** (Mobile + Tablet + Desktop)

### 🎨 Estándares de Calidad:
- **ESLint**: 0 errores, <5 warnings
- **Prettier**: Código formateado
- **Lighthouse**: >90 Performance, >95 Accessibility
- **Bundle size**: <500KB por módulo lazy
- **Memory leaks**: 0 detectados
- **Security**: 0 vulnerabilidades críticas

---

**Versión**: 1.0  
**Fecha**: Enero 2025  
**Estimación total**: 18-22 semanas  
**Equipo recomendado**: 2-3 desarrolladores frontend