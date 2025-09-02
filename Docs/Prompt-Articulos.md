Sí, te explicas perfecto. “**Artículos**” = catálogo de **recursos de stock** (material/herramienta/EPI…), con **trazabilidad por lotes/series**, **unidades convertibles** y **consumo** desde líneas de **entradas/albaranes**. Aquí tienes el **prompt para Angular** (modular, detallado, con mocks `demo=true`) para implementar esa área.

---

## Rama

`feature/p30-articulos-inventario-ui`

## Contexto (no cambiar)

* **Artículos/TipoArticulo** = inventario/stock (no confundir con **Productos = categoría de Partidas**).
* Trazabilidad por **Lotes** y **Series**, con **FechaCaducidad** cuando aplique.
* Unidades: **UM stock base** (en TipoArticulo) + conversión compra/venta.
* Ledger: **MovimientosStock** (Entrada/Salida/Traspaso/Ajuste) con enlace a documento origen (Entradas/Albaranes/…).
* Certificados/documentos asociados a **lote** y/o **artículo**.

---

## Objetivo de UI (Angular 20 + Material + Signals)

Construir pantallas para:

1. **Catálogo de Artículos** (tipo, UM, stock mínimo, notificaciones).
2. **Entradas/Recepciones** (alta de líneas con lote/serie/caducidad, ubicación y UM conversión).
3. **Disponibilidad** (por depósito/ubicación/lote).
4. **Picking/Consumo para Albaranes** (reserva/consumo por FEFO/FIFO y manual).
5. **Movimientos (ledger)** con filtros.
6. **Lotes/Series** (detalle, documentos/certificados).
7. **Trazabilidad** (rastro desde entrada hasta salida).
8. **Ajustes/Traspasos** (wizard controlado, auditado).

---

## Servicios y contratos (vía `API_CLIENT`, mock/http conmutable por `demo=true`)

Crear **repos/ports** front (interfaces), adaptadores DTO↔VM y servicios:

* `ArticulosService`

  * `list({ q, tipo, activo })`, `get(id)`, `create/update/delete` (según permisos).
  * Devuelve UM base, UM venta default, factor por defecto, stockMin, notificaciones.
* `LotesService`

  * `list({ articuloId?, depositoId?, estado?, caducaAntesDe? })`, `get(id)`, `attachDocs(loteId, docs…)`.
* `SeriesService`

  * `list({ articuloId?, estado? })`, `get(id)`.
* `EntradasService`

  * `list`, `create`, `addLinea({ articuloId, umCompra, cantidadCompra, factorCompraAVenta, lote?, serie?, caducidad?, ubicacion })`.
* `DisponibilidadService`

  * `resumen({ articuloId?, depositoId?, ubicacionId?, loteId? })` ⇒ cantidades por UM stock.
* `MovimientosService`

  * `list({ articuloId?, deposito?, ubicacion?, lote?, tipo?, rangoFecha? })`.
* `PickingService`

  * `sugerirConsumo({ articuloId, requerido, estrategia: 'FEFO'|'FIFO'|'MANUAL', depositoId? })`
  * `reservar({ albaranLineaId, selecciones: [{ loteId/serieId, cantidadStock }] })`
  * `confirmarConsumo({ albaranLineaId })` (genera salidas en ledger).
* `TraspasosService`

  * `traspasar({ articuloId, desde:{deposito,ubicacion}, hacia:{deposito,ubicacion}, cantidadStock, loteId?, serieId? })`.
* `AjustesService`

  * `ajustar({ articuloId, deposito, ubicacion, cantidadDeltaStock, motivo, loteId?, serieId? })`.
* `DocumentosService`

  * Subida/gestión de **certificados** asociados a **lote** y **artículo**.

> **Nota**: si el backend aún no expone endpoints de documentos por lote/artículo, mockéalos ahora y en back añadiremos tablas puente (`DocumentosLote`, `DocumentosTipoArticulo`) más adelante.

---

## Componentes (standalone, OnPush, Material + animations)

### 1) Catálogo de Artículos

* `ArticulosPageComponent`

  * Toolbar: buscador, filtros (tipo, activo), botón **Nuevo**.
  * `MatTable` (Código, Nombre, Tipo, UM stock, StockMin, Notif, Acciones).
  * `MatDialog` alta/edición (UM base, UM venta default, factor, IVA, stockMin, notificaciones).
  * Chips de estado/alerta stock bajo.
* **Signals**: `articulos[]`, `query`, `loading`, `vm = computed(...)`.

### 2) Entradas/Recepciones

* `EntradasPageComponent`

  * Lista de entradas con filtros (fecha, proveedor, estado).
  * Botón **Nueva Entrada** → wizard (`MatStepper`): Cabecera → Líneas → Revisión → Confirmar.
  * Línea: selector de **Artículo** (EntitySelector), **UM compra**, **cantidad compra**, **factorCompraAVenta**, **precio**, **depósito/ubicación**, **lote/serie**, **caducidad**, **docs**.
* Validaciones: factor > 0, cantidades ≥ 0, caducidad coherente si el artículo caduca.

### 3) Disponibilidad

* `DisponibilidadComponent`

  * Tabla pivot: Artículo × Depósito (columna total), filtros por ubicaciones/lotes, export CSV.
  * Resumen por UM stock (conversiones internas al mostrar).

### 4) Picking/Consumo (Albaranes)

* `PickingAlbaranComponent`

  * Cabecera de Albarán + líneas pendientes.
  * Para una línea: `Sugerir` (FEFO/FIFO) ⇒ muestra propuesta por **lotes** con cantidades → `Reservar`.
  * **Manual**: selector de lotes/series disponibles con cantidades; validar suma = requerido.
  * Acciones: `Confirmar Consumo` (genera salidas), `Liberar Reservas`.
  * Badges: `Reservado`, `Consumido parcial/total`.
* **Signals**: `lineaSeleccionada`, `sugerencias[]`, `reservas[]`.

### 5) Movimientos (Ledger)

* `MovimientosPageComponent`

  * Filtros: rango fecha, tipo (Entrada/Salida/Traspaso/Ajuste), Artículo, Depósito/Ubicación, Lote/Serie, Origen.
  * `MatTable` con columnas: Fecha, Tipo, Cantidad (UM stock), Lote/Serie, Depósito/Ubicaciones, Origen/Doc, Coste.
  * Link a detalle de lote/serie y documento origen.

### 6) Lotes/Series + Certificados

* `LotesPageComponent` / `SeriesPageComponent`

  * Lista con filtros (estado, caduca antes de, artículo).
  * Detalle (drawer o dialog): ficha lote/serie, ubicaciones, entradas asociadas, salidas, **documentos/certificados** (upload drag\&drop), estado (Activo/Bloqueado/Agotado).
* **Docs**: sube PDF/imagen, metadatos, vincular/desvincular.

### 7) Trazabilidad

* `TrazabilidadComponent`

  * Vista tipo timeline/árbol: **Entrada → Movimientos → Albarán** por **lote/serie**.
  * Filtros por rango de fechas y artículo.
  * Botón export (CSV/PDF simple).

### 8) Traspasos y Ajustes

* `TraspasoWizard` / `AjusteDialog`

  * Formularios con validaciones y confirmación.
  * Notas/motivo obligatorio para ajustes; audit.

---

## Reglas UX y negocio en UI

* **Estrategia por defecto**: **FEFO** si hay caducidad, si no **FIFO**. Vista permite **manual**.
* Conversiones: mostrar cantidades en **UM stock**, aceptar input en UM compra/venta y convertir (mostrar tooltip con fórmula).
* **Bloqueos**: Lote `Bloqueado` no se sugiere; mover/ajustar pide confirmación.
* **RBAC UI**: ocultar acciones sin permisos (`*hasPermission`).
* **Toasts**: exponer 401/403/409/422 con mensajes claros.
* **A11y**: focus-trap en diálogos, labels ARIA, atajos básicos.

---

## Mock (`demo=true`)

* Generar artículos realistas (acero, tornillería, perfiles, pintura…).
* Crear **entradas** con **lotes** y caducidades (para FEFO) y **series** en artículos que lo requieran.
* Mockear `sugerirConsumo` (FEFO/FIFO) usando datos de disponibilidad + ordenación por caducidad/fecha.
* Simular ledger: cada **Reserva/Consumo** crea **MovimientosStock** adecuados.
* Adjuntar un par de **certificados** fake a lotes.

---

## Tests (front)

* **Unit**: stores (signals) de picking (cálculo de reservas), conversiones UM, validadores.
* **E2E (Playwright)**:

  1. Crear **Entrada** con lote y caducidad → disponibilidad sube.
  2. **Picking** de albarán por **FEFO** → reservar y confirmar → disponibilidad baja, ledger refleja salidas.
  3. **Traspaso** entre ubicaciones → ledger registra traspaso.
  4. Subir **certificado** a lote → visible en detalle.
* **DoD**: unit + e2e verdes, build OK.

---

## API/Permisos esperados (para alinear con backend)

* `articulos:GET|POST|PATCH|DELETE`
* `lotes:GET|PATCH` (attach docs, bloquear/desbloquear)
* `series:GET|PATCH`
* `entradas:GET|POST` + `lineas-entrada:POST`
* `disponibilidad:GET`
* `movimientos:GET`
* `picking:POST /sugerencias`, `POST /reservas`, `POST /consumos`
* `traspasos:POST`, `ajustes:POST`
* `documentos:POST /lotes/:id`, `GET /lotes/:id`, idem para artículos

> Si falta algún endpoint, **usa MOCK** y deja TODOs claros para back.

---

## Definition of Done (UI)

* Catálogo, Entradas, Disponibilidad, Picking, Movimientos, Lotes/Series, Trazabilidad y Traspasos/Ajustes **operativos en `demo=true`**.
* Conversiones de UM y **FEFO/FIFO** funcionando en mock.
* Adjuntar/ver **certificados** en Lote/Serie.
* RBAC UI y a11y básicos.
* Tests verdes.

---

¿Quieres que lo parta en **sub-prompts** (p. ej., `ART-FE-01 Catálogo`, `ART-FE-02 Entradas`, `ART-FE-03 Picking…`) para ir ejecutándolos paso a paso en Cursor?
