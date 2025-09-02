# Frontend ERP — Angular WPA · Arquitectura Hexagonal · Signals · TDD

**Stack:** Angular 17+ (standalone, Signals, OnPush) · Angular Material + Animations + Icons · PWA · Jest + Playwright · CI/CD · Mock/HTTP conmutable (`demo=true`).

**Objetivo:** Guía y prompts para construir el **frontend** del ERP (WPA Angular) con **arquitectura hexagonal**, **pruebas TDD**, y **servicios con datos Mock** conmutables por entorno.

---

## 1) Alcance y metas
- UI moderna y consistente (Material + theming claro/oscuro, densidad compact/comfortable, animaciones sutiles).
- Seguridad UI con **RBAC** (directiva `*hasPermission`).
- **Hexagonal** en el front: dominio y casos de uso desacoplados de la infraestructura (HTTP/Mock, storage, scheduler).
- **TDD**: escribir tests antes del código productivo, DoD con cobertura y E2E smoke por área.
- Mock conmutable por **`demo=true`** (runtime via `assets/app-config.json` o build envs).

---

## 2) Arquitectura hexagonal (front)
**Capas:**
- **Domain (core):** tipos/entidades (DTOs, value objects), políticas de negocio puras.
- **Application (use-cases):** Stores/servicios de casos de uso (Signals), orquestación, validaciones, mapeos.
- **Ports:** interfaces para acceso a datos (ApiClient, repositorios por agregado: UsuariosRepo, RolesRepo, …).
- **Adapters:** `HttpApiClient`, `MockApiClient`, storage (session/local), adapters de UI (scheduler provider), mapper DTO↔ViewModel.
- **Infrastructure (cross):** interceptores HTTP, guards, directivas, utilidades (i18n, a11y, error mapping).
- **Composition Root:** `app.config.ts`/providers por entorno, `APP_INITIALIZER` para config runtime.

**Principios:** dependencia **hacia adentro** (use-cases dependen de puertos; adaptadores implementan puertos), inversión de dependencias, side-effects en adapters.

---

## 3) Estructura de carpetas
```
apps/web/src/app/
  core/                  # infra transversal (interceptors, auth, tenant, ui store)
  domain/                # tipos del dominio (DTOs, value objects)
  application/           # casos de uso/stores por feature (signals)
  ports/                 # interfaces de repositorios/ApiClient
  adapters/              # http-api.client, mock-api.client, scheduler provider
  shared/                # ui-kit, forms, utils, directives
  features/
    seguridad/
    configuracion/
    terceros/
    productos/
    inventario/
    obras/
    presupuestos/
    planificacion/
    ventas/
    compras/
    contabilidad/
    rrhh/
    dms-aud-kpi/
```

---

## 4) Convenciones
- Angular standalone + **Signals**; **OnPush** siempre.
- Material + Material Icons; **animations**: route transitions, dialogs, table rows.
- Lint estricto (ESLint) + Prettier.
- Directiva `*hasPermission` y **guards** (AuthGuard/PermissionGuard).
- Errores normalizados (`{ code, message, details? }`), toasts consistentes.
- i18n `es-ES` (pipes num/fecha/moneda) y accesibilidad (roles ARIA, focus management).

---

## 5) Configuración de entornos y `demo=true`
- `environments`: `{ apiBaseUrl, demo:boolean, envName }`.
- **Runtime**: `assets/app-config.json` (sobrescribe `demo`/`apiBaseUrl`) via `APP_INITIALIZER`.
- `.env` de despliegue inyecta variables para generar/servir ese JSON (Docker/CI).
- Provider `API_CLIENT` elige **Mock** si `demo=true`, si no **HTTP**.

---

## 6) TDD y Definition of Done
**TDD:** para cada prompt: 1) escribir tests (unit/component) que fallan, 2) implementar mínimo, 3) refactor.

**DoD (por historia):**
- Unit tests ≥ 80% en el feature tocado.
- E2E smoke (Playwright/Cypress) pasando para el flujo principal.
- Lint + build OK; a11y básica sin errores críticos.
- Logs limpios, sin `any` innecesarios.

---

## 7) Testing
- **Unit**: Jest + TestBed para componentes/servicios; stores de Signals con `fakeAsync/tick`.
- **Component**: Harness de Material donde aplique.
- **E2E**: Playwright (headless) por área clave (login, usuarios, scheduler, ventas, inventario).
- **Reportes**: cobertura, junit XML, Lighthouse (perf/a11y ≥ 90).

---

## 8) CI/CD (resumen)
- Jobs: lint → unit → build → e2e smoke (demo=true) → artefacto.
- Caché de npm y angular builders; preview estático para QA.

---

## 9) Prompts secuenciales (para Cursor)
> Ejecuta **uno por vez**. Cada prompt incluye **Objetivo/Tasks/DoD/TDD**.

### FE-00 · Bootstrap WPA + Material + Animations
**Objetivo:** Scaffold WPA con Material, icons, animations.
**Tasks:** `ng new` standalone; `ng add @angular/pwa`/`@angular/material`; theming claro/oscuro; app shell con `MatSidenav`/`MatToolbar`/`MatIcon` y chip de entorno.
**TDD:** test de render del shell + toggle tema.
**DoD:** app arranca, PWA registrada, theming activo.

### FE-01 · Entornos + Runtime config (`demo`)
**Objetivo:** Conmutar Mock/HTTP por `demo=true`.
**Tasks:** environments + `APP_INITIALIZER` para `app-config.json`; provider `API_CLIENT`.
**TDD:** test del provider (demo→Mock, prod→HTTP).
**DoD:** chip “DEMO” visible cuando demo.

### FE-02 · Core HTTP + Auth + Tenant + *hasPermission
**Objetivo:** Autenticación y permisos UI.
**Tasks:** interceptor; `AuthStore` (Signals) + `TenantService`; directiva `*hasPermission`.
**TDD:** unit de directiva y interceptor (añade cabeceras, maneja 401/403).
**DoD:** login mock y ocultación de botones sin permiso.

### FE-03 · Shared UI Kit + DataSource reactiva
**Objetivo:** Tabla/diálogos/Toasts reutilizables.
**Tasks:** DataTable (MatTable+sort+paginator+menu acciones); Dialogs; ToastService; DataSource con Signals.
**TDD:** harness de tabla, tests de DataSource (paginación/orden).
**DoD:** tabla demo funcionando con mock.

### FE-04 · API_CLIENT + Mock DB semilla
**Objetivo:** Mock/HTTP intercambiables.
**Tasks:** interfaces; `HttpApiClient` y `MockApiClient` (router → handlers); `mock-db` con faker (seed determinista); panel “Desarrollador” (reset, latencia).
**TDD:** tests de handlers (409/403/401 simulados).
**DoD:** seguridad mock completa.

### FE-10 · Seguridad — Usuarios
**Objetivo:** Lista/detalle/roles.
**Tasks:** tabla + filtros; dialog alta/edición; asignar roles (replace); servicios.
**UI:** MatTable, MatDialog, MatChips, icon buttons.
**TDD:** crear/editar/borrar; denegaciones por permiso.
**DoD:** CRUD mock operativo.

### FE-11 · Configuración — Monedas/Tipos Cambio
**Objetivo:** Catálogos base.
**Tasks:** CRUD Monedas; TiposCambio con edición inline e import CSV.
**UI:** MatTable inline edit, MatDialog import.
**TDD:** validaciones (ISO único, rango fechas).
**DoD:** histórico visible y editable.

### FE-12 · Terceros — Personas
**Objetivo:** Personas con direcciones/cuentas.
**Tasks:** lista con dedupe; detalle tabs; tablas hijas.
**UI:** MatTabs, MatTable, chips, icons.
**TDD:** unicidad fiscal por empresa.
**DoD:** alta/edición + subtablas OK.

### FE-13 · Productos
**Objetivo:** Productos con BOM.
**Tasks:** lista filtros; tabs detalle (UM/IVA/BOM); validaciones numéricas.
**UI:** MatChips, MatExpansion, MatTable.
**TDD:** factor de conversión > 0; BOM sumas.
**DoD:** CRUD y BOM listos.

### FE-14 · Inventario
**Objetivo:** Depósitos/Ubicaciones + Disponibilidad + Movimientos.
**Tasks:** árbol ubicaciones (CdkDragDrop); tabla disponibilidad; wizard traspaso.
**UI:** MatTree, MatStepper, MatTable.
**TDD:** ledger actualiza existencias; límites ≥0.
**DoD:** traspaso refleja stock mock.

### FE-15 · Obras
**Objetivo:** Obras + Capítulos + Partidas.
**Tasks:** Kanban por estado; detalle con árbol capítulos y tabla partidas (fórmula preview).
**UI:** CdkDragDrop, MatTree, MatTable.
**TDD:** unicidad códigos por obra.
**DoD:** mover estados y CRUD básicos.

### FE-16 · Presupuestos
**Objetivo:** Presupuestos + versiones + comparador.
**Tasks:** CRUD, versiones, comparador.
**UI:** MatList, tablas comparativas.
**TDD:** bloqueo edición versión cerrada.
**DoD:** comparar dos versiones.

### FE-17 · Planificación (Scheduler — DayPilot)
**Objetivo:** Asignar OT/trabajos por operario/obra.
**Tasks:** integrar DayPilot; backlog drag externo; eventMove/Resize → PATCH; 409 revierte; dialog edición; Signals store `plan`.
**UI:** MatDateRangePicker, MatButtonToggleGroup, MatSelect, MatChips, MatList + CdkDrag, `<daypilot-scheduler>`.
**TDD:** E2E crear/mover/revertir solape; viewer sin acciones.
**DoD:** D&D completo y conflictos manejados.

### FE-18 · Ventas
**Objetivo:** Pedidos→Albaranes→Facturas + Vencimientos/Cobros.
**Tasks:** wizard generación; visor PDF; pipeline vencimientos y cobros.
**UI:** MatStepper, MatChips, MatTable.
**TDD:** transición de estados válida.
**DoD:** flujo manual completo (mock).

### FE-19 · Compras
**Objetivo:** Presupuesto proveedor→Pedido→Recepción→Factura.
**Tasks:** comparador; wizard recepción con lotes/series; pagos.
**UI:** Tablas, Stepper, Dialogs.
**TDD:** recepción actualiza ledger.
**DoD:** flujo mock coherente.

### FE-20 · Contabilidad
**Objetivo:** Plan contable + asientos + informes.
**Tasks:** árbol cuentas CRUD; asientos post/unpost; reportes export.
**UI:** MatTree, MatTable, CSV export.
**TDD:** balance cuadrado; validación débito/haber.
**DoD:** asiento manual y reporte.

### FE-21 · RRHH
**Objetivo:** Operarios, contratos, partes, vacaciones.
**Tasks:** alertas vencimiento; aprobar partes; calendario laboral.
**UI:** MatCard, MatChips, Calendar simple.
**TDD:** reglas de aprobación.
**DoD:** flujos básicos operativos.

### FE-22 · DMS + Auditoría + KPIs
**Objetivo:** Documentos, timeline, dashboards.
**Tasks:** upload drag&drop; versionado; timeline; cards KPI (lazy charts).
**UI:** MatList, MatProgress, MatCard.
**TDD:** vinculación documento-entidad.
**DoD:** subir y versionar mock; ver auditoría.

### FE-23 · Quality (Perf + A11y + E2E)
**Objetivo:** Pulido final.
**Tasks:** virtual scroll; ARIA roles; command palette (⌘K); E2E smoke global; Lighthouse ≥90.
**TDD:** pruebas de accesibilidad básicas.
**DoD:** métricas alcanzadas.

### FE-24 · Servicios (contrato estable)
**Objetivo:** Consolidar puertos/adaptadores.
**Tasks:** contratos por agregado (UsuariosRepo, …); mappers DTO↔VM; errores tipados.
**TDD:** tests de mapeo y manejo de errores (401/403/409/422).
**DoD:** servicios limpios y cubiertos.

---

## 10) Componentes UI por área (resumen rápido)
- **Layout:** `MatSidenav`, `MatToolbar`, `MatMenu`, `MatIcon`, breadcrumbs, buscador global (⌘K), chips de entorno/DEMO.
- **Listas:** `MatTable` + sort/paginator, filtros (form field), estado vacío, skeletons.
- **Detalles:** `MatTabs`, `MatCard`, chips de estado, botones con `matTooltip`.
- **Diálogos:** `MatDialog` (formularios, confirm, import/export), focus-trap, ARIA labels.
- **Notificaciones:** `MatSnackBar` (undo en borrado), `MatProgressBar` para loaders globales.
- **Planificación:** DayPilot Scheduler + backlog (CdkDrag), leyenda (MatChips).

---

## 11) Integración con backend
- Cabeceras: `Authorization: Bearer …`, `x-empresa-id`.
- Códigos: 401 (auth), 403 (RBAC), 409 (conflicto), 422 (validación), 404.
- Contratos DTO alineados (Usuarios, Roles, Permisos, …). Mapper en adapters.
- Paginación estándar `{ items, total, page, limit }`.

---

## 12) Mock data y handlers
- `mock-db` seed: empresa demo, roles (Admin/Editor/Viewer), permisos por recurso, 25 usuarios, catálogos, productos, obras, eventos de planificación.
- Handlers devuelven 401/403/409/422 según reglas; latencia simulada; panel reset.

---

## 13) A11y, i18n, rendimiento
- ARIA roles, focus visible, contrastes, navegación teclado.
- i18n es-ES (pipes) y futuras traducciones.
- Performance: Signals + OnPush + `trackBy` + `cdk-virtual-scroll` + lazy imports.

---

## 14) Git branching y calidad
- Ramas: `feature/pXX-*`, `release/*`, `hotfix/*`.
- PRs con checklist: tests, a11y, screenshots, DoD.
- Conventional Commits + CHANGELOG.

---

## 15) Snippets base (puertos/adaptadores)
**ApiClient (puerto):**
```ts
export interface ApiClient {
  get<T>(url: string, opts?: any): Promise<T>;
  post<T>(url: string, body: any, opts?: any): Promise<T>;
  patch<T>(url: string, body: any, opts?: any): Promise<T>;
  delete<T>(url: string, opts?: any): Promise<T>;
}
```
**Provider (composition root):**
```ts
providers: [{
  provide: API_CLIENT,
  useFactory: (http: HttpClient, cfg: AppConfig) => cfg.demo
    ? new MockApiClient(cfg)
    : new HttpApiClient(http, cfg.apiBaseUrl),
  deps: [HttpClient, APP_CONFIG]
}]
```

---

## 16) Scheduler (DayPilot) — prompts resumidos
- Integración, adapter resources/events, backlog drag externo, handlers eventMove/Resize con revert en 409, dialog edición, filtros y leyenda; E2E de creación/movimiento/solape; RBAC UI en botones mutantes.

---

### Fin del documento
> Usa estos prompts uno a uno en Cursor; mantén TDD y hexagonal en cada paso. Este README se puede versionar como `README-Frontend.md` en el repo y actualizar por releases.

