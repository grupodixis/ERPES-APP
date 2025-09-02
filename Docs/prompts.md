¡Perfecto! Aquí tienes el **documento de prompts** para construir el **frontend Angular (WPA)** con **Angular Material + Animations + Icons**, **Signals**, diseño **profesional y moderno**, y **servicios con datos MOCK conmutables** mediante `demo=true`.
Úsalo **paso a paso** en Cursor (un prompt por vez). He incluido mejoras de UX, rendimiento y a11y, y detallo **componentes UI por área**.

---

# Convenciones generales (aplican a todos los prompts)

* **Angular 17+**, **standalone components**, **ChangeDetectionStrategy.OnPush**.
* **Angular Material** + **icons** (`MatIcon`), **animations** (Angular Animations).
* **Theming**: claro/oscuro + densidad ajustable (comfortable/compact).
* **Signals** para estado (stores por feature) y **interceptores** para HTTP.
* **Branching**: `feature/pXX-nombre-corto`. Commits con **Conventional Commits**.
* **Rutas lazy** por área. **Guard UI** con directiva `*hasPermission`.
* **Mock conmutable**: `environment.demo === true` ⇒ `MockApiClient`; si `false` ⇒ `HttpApiClient`.
  (Opcional runtime: `/assets/app-config.json` con `{"demo":true}` leído por `APP_INITIALIZER`.)

---

## FE-00 · Bootstrap del proyecto (WPA + Material + Animations)

**Objetivo**: Crear esqueleto WPA con Material, icons y animations.
**Prompt:**

```
Rama: feature/p00-bootstrap

Objetivo: Scaffold Angular WPA con Material, icons y animations.

Tareas:
1) Crear app (standalone, SCSS) y habilitar PWA: 
   - ng new apps/web --standalone --routing --style=scss
   - ng add @angular/pwa
   - ng add @angular/material (custom theme claro/oscuro)
2) Añadir Angular Animations global (provideAnimations).
3) Configurar tipografía, paleta y densidad (theming SCSS).
4) ESLint + Prettier, strict true.
5) App shell mínimo: MatSidenav + MatToolbar + MatIcon + MatMenu.
6) Banner de entorno (chip “DEV/TEST/STG/PROD”) y chip “DEMO” cuando demo=true.

DoD:
- Arranca la app, PWA registrada, Material aplicado, toolbar con iconos y chip de entorno/DEMO visible.
```

---

## FE-01 · Entornos + Config runtime (`demo`)

**Objetivo**: Alternar MOCK/HTTP con `demo=true`.
**Prompt:**

```
Rama: feature/p01-env-config

Objetivo: Controlar demo/mock por entorno y runtime.

Tareas:
1) environments: dev/test/staging/prod con { apiBaseUrl, demo:boolean, envName }.
2) APP_INITIALIZER: cargar /assets/app-config.json (si existe) y sobreescribir demo/apiBaseUrl.
3) InjectionToken API_CLIENT:
   - if (demo) => MockApiClient
   - else => HttpApiClient(baseUrl)
4) Añadir botón “Recargar config” (menú Desarrollador) que relea app-config.json (opt).

DoD:
- Cambiar demo en environment o app-config.json conmuta MOCK/HTTP sin tocar componentes.
```

---

## FE-02 · Core HTTP + Auth + Tenant + Guards (con Signals)

**Objetivo**: Infra de red, autenticación y permisos UI.
**Prompt:**

```
Rama: feature/p02-core-auth

Objetivo: Interceptores + AuthStore + directiva permisos.

Tareas:
1) Interceptor api.interceptor.ts: añade Authorization y x-empresa-id; gestiona 401/403, toasts de error.
2) AuthStore (signals): user, token, empresaId, isLoggedIn (computed); login/logout/refresh.
3) TenantService: seleccionar empresa activa.
4) Directiva *hasPermission (signals) para ocultar acciones sin permiso.
5) Guards: AuthGuard (rutas privadas), PermissionGuard (si deseas por ruta).
6) Animaciones: transición de rutas (fade/slide) con Angular Animations.

DoD:
- Login mock (temporal), toolbar muestra usuario y empresa activa; botones mutantes se ocultan según permisos.
```

---

## FE-03 · Shared UI Kit + DataSource reactiva (Signals)

**Objetivo**: Componentes reutilizables y tabla estándar.
**Prompt:**

```
Rama: feature/p03-shared-kit

Objetivo: Shared components con Material y signals.

Tareas:
1) DataTable: MatTable + MatSort + MatPaginator + selección + acciones por fila (MatMenu).
2) EntitySelectorDialog: buscador + tabla para elegir entidades.
3) ConfirmDialog + ToastService (MatSnackBar).
4) DataSource con signals: items, total, page, limit, sort, filters, loading, error.
5) Skeleton loaders y Empty states con iconos.

DoD:
- Tabla genérica con filtros, sort y paginación funcionando en mock.
```

---

## FE-04 · Driver MOCK/HTTP + Mock DB semilla

**Objetivo**: Capa de datos conmutable + seed.
**Prompt:**

```
Rama: feature/p04-data-mock

Objetivo: API_CLIENT dual + mock-db.

Tareas:
1) API_CLIENT interface: get/post/patch/delete.
2) HttpApiClient: wrap HttpClient (baseUrl + headers).
3) MockApiClient: router por recurso -> handlers en memoria.
4) mock-db.ts: empresas, usuarios, roles, permisos, … con faker; seed determinista (faker.seed).
5) Handlers seguridad (usuarios/roles/permisos) con reglas: 
   - unicidades, replace roles, 403/409 simulados.
6) Panel “Desarrollador”: reset mock-db, latencia simulada.

DoD:
- CRUD de seguridad funcionan en MOCK; latencia simulada visible (banner).
```

---

# Áreas del sistema (UI + servicios + prompts por módulo)

> En cada área: detallo **componentes UI** y un **prompt** por pantalla principal. Repite patrón CRUD con DataTable, diálogos y toasts.

---

## Seguridad (Login, Perfil, Usuarios, Roles, Permisos, Auditoría)

**Componentes UI**:

* Login/Recuperación: `MatCard`, `MatFormField`, `MatInput`, `MatButton`, `MatIcon`, animations (fade in).
* Perfil: `MatTabs` (Datos, Seguridad, Tokens).
* Usuarios: DataTable + filtros + `MatDialog` (alta/edición), chips de roles.
* Roles: DataTable + detalle con asignación de permisos (checklist en `MatDialog`).
* Permisos: `MatTree` por recurso + `MatSlideToggle`.
* Auditoría: `MatList`/`MatExpansionPanel` (timeline) + filtros.

**Prompt (usuarios)**:

```
Rama: feature/p10-seg-usuarios

Objetivo: Pantalla Usuarios (lista/detalle) con Material+signals.

Tareas:
1) Lista: MatTable + filtros (texto, estado, rol), sort, paginator, botones ver/editar/borrar (icon buttons).
2) Alta/Edición: MatDialog con formulario reactivo, validaciones y hints; animaciones de apertura.
3) Asignación de roles: botón “Roles” -> MatDialog con checklist, guarda con replace.
4) Servicios: UsuariosService vía API_CLIENT mock/http.

DoD:
- Crear/editar/borrar usuario en MOCK; roles replace OK; toasts y transitions suaves.
```

---

## Configuración Empresa (Empresas, Monedas, Tipos Cambio, Series, UMs, Tipos IVA, Centros Coste)

**Componentes UI**:

* Empresas: `MatCard` (ficha), `MatSlideToggle` (activa).
* Monedas/TiposCambio: DataTable con edición inline.
* SeriesDocumentales: DataTable + preview formato (chips).
* UMs: DataTable + `MatTree` (base/derivadas).
* Tipos IVA: DataTable valida 0–100.
* Centros Coste: `MatTree` + `CdkDragDrop`.

**Prompt (monedas/tipos cambio)**:

```
Rama: feature/p11-config-monedas

Objetivo: Monedas + Tipos Cambio con edición inline.

Tareas:
1) Monedas: lista CRUD con validación (Código ISO único).
2) Tipos Cambio: lista por moneda y fecha, edición inline (enter/escape), import CSV (MatDialog + input file).
3) Servicios MOCK y HTTP, mapeo DTO.

DoD:
- Crear/editar cambio, ver histórico, import CSV básico.
```

---

## Terceros (Personas, Clientes, Proveedores)

**Componentes UI**:

* Personas: DataTable + dedupe toggle, detalle con tabs (direcciones `MatTable`, cuentas `MatTable`).
* Clientes/Proveedores: ficha con KPIs (cards), condiciones de pago (`MatSelect`), contactos.

**Prompt (personas)**:

```
Rama: feature/p12-terceros-personas

Objetivo: Personas lista/detalle.

Tareas:
1) Lista con dedupe (toggle) y filtros; export CSV.
2) Detalle en MatTabs: contacto, direcciones, cuentas bancarias (tablas CRUD).
3) Mock handlers coherentes (unicidad fiscal por empresa).

DoD:
- Alta/edición persona + direcciones/cuentas; dedupe sinaliza posibles duplicados.
```

---

## Productos & Catálogos

**Componentes UI**:

* Productos: DataTable + chips (Compuesto/Lote/Serie), tabs (UM/IVA/BOM).
* Tipo de artículo: DataTable con stock mínimo y notificaciones.
* Selector de producto (EntitySelectorDialog).

**Prompt (productos)**:

```
Rama: feature/p13-productos

Objetivo: Productos con BOM y UMs.

Tareas:
1) Lista con filtros (tipo, flags), ver detalle con tabs (UM venta, IVA, BOM).
2) BOM simple (tabla de componentes con cantidades y costes).
3) Mock: generar productos realistas, BOM aleatoria.

DoD:
- CRUD producto/BOM; validaciones numéricas; señales de costo estimado.
```

---

## Inventario (Depósitos, Ubicaciones, Disponibilidad, Movimientos)

**Componentes UI**:

* Depósitos/Ubicaciones: `MatTree` + drag\&drop, `MatCard` grid.
* Disponibilidad: tabla pivot (producto × depósito), filtros.
* Movimientos: ledger con filtros; wizard traspaso/ajuste (`MatStepper`).

**Prompt (inventario)**:

```
Rama: feature/p14-inventario

Objetivo: Depósitos/Ubicaciones + Disponibilidad + Movimientos.

Tareas:
1) Árbol de ubicaciones con CdkDragDrop.
2) Disponibilidad por producto/depósito (tabla agregada).
3) Wizard de traspaso con validaciones.
4) Mock ledger + cálculos de stock derivados.

DoD:
- Traspaso ajusta existencias; disponibilidad se actualiza; toasts y loader.
```

---

## Obras / Proyectos (Obras, Capítulos, Partidas, OT, Escandallos)

**Componentes UI**:

* Obras: vista Kanban (`CdkDragDrop`) + lista.
* Detalle obra: `MatTabs` (Capítulos `MatTree`, Partidas `MatTable` con fórmula preview, Documentos, Timeline).
* OT: lista/detalle, aprobar (`MatDialog`).
* Escandallos: cabecera + líneas (`MatTable`).

**Prompt (obras)**:

```
Rama: feature/p15-obras

Objetivo: Obras + Capítulos + Partidas.

Tareas:
1) Kanban por estado (drag entre columnas).
2) Detalle con árbol de Capítulos y tabla de Partidas (UM, fórmula, precio).
3) Mock coherente con códigos OB-0001.xx.yy.

DoD:
- Crear capítulo/partida, mover estados en Kanban; validaciones de unicidad por obra.
```

---

## Presupuestos & Certificaciones

**Componentes UI**:

* Presupuestos: lista + versiones (`MatList` con badges), comparador (tabla).
* Versiones de partidas: tabla con `MatSlideToggle` (Incluida).
* Certificaciones: ficha, retenciones (`MatTable`), vínculo a albaranes.

**Prompt (presupuestos)**:

```
Rama: feature/p16-presupuestos

Objetivo: Presupuestos con versiones y comparador.

Tareas:
1) CRUD presupuestos y versiones; comparador de versiones (tabla dual).
2) Mock de versiones y estados; certificaciones linkeables.

DoD:
- Crear versión, comparar dos versiones; estado por chips.
```

---

## Planificación (Scheduler) — **DayPilot Lite (gratis)**

**Componentes UI**:

* Toolbar: `MatDateRangePicker`, `MatButtonToggleGroup` (Operarios/Obras), filtros `MatSelect`, leyenda `MatChips`.
* Sidebar: Backlog (`MatList` + `CdkDrag`).
* Lienzo: `<daypilot-scheduler>` (drag, drop, resize, click).
* Diálogos: `MatDialog` (editar evento), `MatSnackBar` (errores, undo).

**Prompt (scheduler)**:

```
Rama: feature/p17-planificacion

Objetivo: Scheduler (DayPilot) con drag&drop y reglas de solape.

Tareas:
1) Integrar DayPilot Lite; adapter resources/events.
2) Backlog: drag externo; drop crea evento.
3) eventMove/eventResize: PATCH; 409 (solape) ⇒ revert + toast; 422 (capacidad) ⇒ toast.
4) Dialog edición (recurso, fechas, notas); delete.
5) Signals store: vista, rango, filtros, recursos[], eventos[].

DoD:
- Crear/mover/redimensionar/reasignar; conflictos 409 funcionales; viewer sin acciones mutantes.
```

---

## Ventas & Cobros

**Componentes UI**:

* Pedidos: lista/detalle; reservas (badge).
* Albaranes: generación desde pedido (wizard).
* Facturas: detalle + visor PDF, post/unpost (`MatSlideToggle`).
* Vencimientos: pipeline (`MatChips`), Cobros: aplicaciones (`MatTable`), Remesas (wizard).

**Prompt (ventas)**:

```
Rama: feature/p18-ventas

Objetivo: Pedidos→Albaranes→Facturas + Vencimientos y Cobros.

Tareas:
1) Flujo manual: pedido→albarán→factura (wizard).
2) Vencimientos: listado por estado; aplicar cobros (tabla).
3) Remesas: asistente para generar fichero (mock).

DoD:
- Generar factura desde pedido; marcar vencimiento como cobrado (mock).
```

---

## Compras & Pagos

**Componentes UI**:

* Presupuestos proveedor: comparador de ofertas.
* Pedidos: estados con chips; aprobación (dialog).
* Recepciones: wizard con incidencias.
* Entradas: líneas con ubicación.
* Facturas compra y Pagos: aplicaciones.

**Prompt (compras)**:

```
Rama: feature/p19-compras

Objetivo: Compras end-to-end (pedido→recepción→factura).

Tareas:
1) Comparador de ofertas por proveedor.
2) Recepción (wizard) con lotes/series mock.
3) Factura compra y pagos (aplicaciones).
4) Mock coherente con ledger de stock.

DoD:
- Recepción actualiza stock mock; registrar pago aplicado a vencimiento compra.
```

---

## Contabilidad

**Componentes UI**:

* Ejercicios: lista/detalle, cierre (`MatDialog`).
* Plan contable: `MatTree` con creación inline.
* Asientos: lista/detalle, post/unpost; split (`MatDialog`).
* Informes: selector de periodo `MatDatepicker`, tabla y export.

**Prompt (contabilidad)**:

```
Rama: feature/p20-contabilidad

Objetivo: Plan contable + asientos + informes.

Tareas:
1) Árbol de cuentas, CRUD inline.
2) Asientos con post/unpost y split de líneas.
3) Informes (sumas/saldos) con export CSV.

DoD:
- Crear asiento manual; ver informe y exportar.
```

---

## RRHH

**Componentes UI**:

* Operarios: lista/detalle (coste).
* Contratos: tabla + alertas (badges).
* Calendario laboral: month view.
* Partes diarios: validar/aprobar.
* Vacaciones: flujo de aprobación.
* Fichajes: mapa (mini) + lista.

**Prompt (rrhh)**:

```
Rama: feature/p21-rrhh

Objetivo: Operarios, contratos, partes, vacaciones.

Tareas:
1) CRUD operarios y contratos (alertas vencimiento).
2) Partes diarios (validar/aprobar).
3) Vacaciones (solicitud/estado) y calendario.

DoD:
- Aprobar parte; crear solicitud de vacaciones; notificaciones visuales.
```

---

## DMS (Documentos), Auditoría y Reportes/KPIs

**Componentes UI**:

* DMS: drag\&drop upload, versionado (`MatList`), vínculos (chips).
* Auditoría: timeline filtrable.
* Reportes/KPIs: cards (`MatCard`) + mini charts (defer import), export.

**Prompt (dms + auditoría + kpi)**:

```
Rama: feature/p22-dms-aud-kpi

Objetivo: DMS + Auditoría + Dashboards.

Tareas:
1) DMS: subir documento, versionado, vincular a entidades.
2) Auditoría: timeline por entidad/usuario/fecha.
3) KPIs: dashboard por área con cards y mini gráficas (lazy).

DoD:
- Subir y versionar un documento mock; ver auditoría de una obra; dashboard básico.
```

---

## Performance, Accesibilidad y Testing UI

**Prompt:**

```
Rama: feature/p23-quality

Objetivo: Rendimiento, a11y y testing.

Tareas:
1) OnPush + trackBy + cdk-virtual-scroll en listados grandes.
2) Accesibilidad: roles ARIA, focus trap en diálogos, contraste, teclas (⌘K búsqueda).
3) E2E (Cypress/Playwright) smoke por área (en mock).
4) Lighthouse: ≥90 Performance y Accessibility.

DoD:
- Pipelines de pruebas verdes; informe Lighthouse ≥90.
```

---

# Notas de diseño (añadidas como mejoras)

* **Animations**:

  * Transiciones de ruta (fade/slide).
  * Animación de filas en tablas (enter/leave).
  * Ripple sutil en botones (`matRipple`).
* **Icons**: Material Symbols (Outline) + color semántico (success/warn/info).
* **Toasts** con “Deshacer” para borrados suaves.
* **Command Palette (⌘K)**: buscador global en `MatDialog`.
* **Feature Flags**: vía `environment.features = {...}` para activar trozos de UI.
* **Error boundary**: página 404/500 con CTA volver.

---

## Servicios (contrato y conmutación MOCK/HTTP)

**Prompt:**

```
Rama: feature/p24-services-contract

Objetivo: Contratos de servicios coherentes + conmutación demo.

Tareas:
1) API_CLIENT: 
   interface { get<T>(url, opts?), post<T>(url, body, opts?), patch<T>(...), delete<T>(...) }.
2) HttpApiClient: baseUrl + headers (Authorization, x-empresa-id).
3) MockApiClient: router → handlers; latencia simulada y 401/403/409.
4) En cada servicio de área (UsuariosService, RolesService, ...):
   - Exponer métodos list/create/update/delete/extra.
   - No conocer si es MOCK o HTTP (solo usa API_CLIENT).
5) Toggle: environment.demo = true/false (o app-config.json) decide driver.

DoD:
- Cambiar demo conmuta toda la app sin tocar componentes ni stores.
```

---

¿Quieres que te empaquete esto en un **markdown** para pegarlo tal cual en tu repo (README-Frontend.md) o en un **Canvas** para ir iterando visualmente?
