# TODO - Frontend ERP Angular

## ✅ Completadas

### Core & Infraestructura
- [x] **FE-00**: Bootstrap WPA + Material + Animations
- [x] **FE-01**: Entornos + Config runtime (`demo`)
- [x] **FE-02**: Core HTTP + Auth + Tenant + Guards (con Signals)
- [x] **FE-03**: Shared UI Kit + DataSource reactiva (Signals)
- [x] **FE-04**: Driver MOCK/HTTP + Mock DB semilla

### Seguridad
- [x] **FE-10**: Seguridad — Usuarios (lista/detalle/roles)

### Configuración
- [x] **FE-11**: Configuración — Monedas/Tipos Cambio
  - [x] Servicios base: Monedas y TiposCambio (API_CLIENT)
  - [x] Pantalla Monedas: DataTable con edición inline y validación ISO único
  - [x] Pantalla Tipos de Cambio: DataTable por moneda con edición inline
  - [x] **Diálogos de creación/edición**: Monedas y Tipos de Cambio
  - [x] **Diálogo de importación CSV**: Drag&drop, preview, validaciones
  - [x] Handlers MOCK para Config (empresas, monedas, tipos-cambio)

## 🚧 En Progreso

### Configuración (Continuación)
- [ ] **Series Documentales**: DataTable + preview formato (chips)
- [ ] **UMs**: DataTable + MatTree (base/derivadas)
- [ ] **Tipos IVA**: DataTable con validación 0–100
- [ ] **Centros de Coste**: Árbol (MatTree) + CdkDragDrop
- [ ] **Rutas y navegación** de Configuración en el menú

## 📋 Pendientes

### Terceros
- [ ] **FE-12**: Terceros — Personas (lista/detalle)

### Productos & Catálogos
- [ ] **FE-13**: Productos (con BOM y UMs)

### Inventario
- [ ] **FE-14**: Inventario (Depósitos, Ubicaciones, Disponibilidad, Movimientos)

### Obras / Proyectos
- [ ] **FE-15**: Obras + Capítulos + Partidas

### Presupuestos & Certificaciones
- [ ] **FE-16**: Presupuestos con versiones y comparador

### Planificación
- [ ] **FE-17**: Planificación (Scheduler — DayPilot)

### Ventas & Cobros
- [ ] **FE-18**: Ventas (Pedidos→Albaranes→Facturas + Vencimientos y Cobros)

### Compras & Pagos
- [ ] **FE-19**: Compras end-to-end (pedido→recepción→factura)

### Contabilidad
- [ ] **FE-20**: Contabilidad (Plan contable + asientos + informes)

### RRHH
- [ ] **FE-21**: RRHH (Operarios, contratos, partes, vacaciones)

### DMS + Auditoría + KPIs
- [ ] **FE-22**: DMS + Auditoría + Dashboards

### Quality
- [ ] **FE-23**: Performance, Accesibilidad y Testing UI

### Servicios
- [ ] **FE-24**: Servicios (contrato estable)

## 🎯 Próximos Pasos

1. **Completar Configuración**: Implementar Series Documentales, UMs, Tipos IVA y Centros de Coste
2. **Navegación**: Añadir rutas de configuración al menú principal
3. **Continuar con Terceros**: Implementar gestión de Personas

## 📝 Notas

- **Arquitectura**: Hexagonal con Signals y OnPush
- **UI**: Angular Material + Animations
- **Mock**: Datos conmutables con `demo=true`
- **Testing**: TDD pendiente de implementar
