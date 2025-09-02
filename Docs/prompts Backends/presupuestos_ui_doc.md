# Documento de Sistema para Trae AI — Módulo de Presupuestación

## 📊 Contexto General
Este documento define las reglas, estructura y tareas necesarias para que **Trae AI** (bot de programación tipo Cursor AI) construya el **frontend del módulo de presupuestación** para un ERP de obras. El stack es **Angular + Angular Material**.

El flujo principal es:
```
Presupuestos ➔ Capítulos ➔ Partidas ➔ DesglosePartida (con Artículos, Mano de Obra, Maquinaria)
```

---

## ⚖️ Reglas y Consideraciones

### Entidades implicadas:
- `Presupuestos`: metadatos (cliente, nombre, estado, fecha)
- `Capitulos`: agrupadores jerárquicos (clave arbolada)
- `Partidas`: unidades de coste con dimensiones, unidad, cantidad, precio
- `DesglosePartida`: recursos a imputar (artículos, mano de obra, maquinaria)

### Tipos de recurso (`TipoRecurso`):
- `Articulo`
- `Operario`
- `Maquinaria`

---

## 📍 Pantallas

### 1. Listado de Presupuestos
- Tabla con filtros por cliente, estado y fecha
- Botón de crear nuevo presupuesto
- Acción de clonar o convertir en obra

### 2. Editor de Presupuesto
- Datos generales: cliente, nombre, estado
- Componente tipo `tree` (capítulos y partidas)

### 3. Editor de Partidas
- Panel lateral o modal
- Formulario: código, nombre, unidad, dimensiones, cantidad, precio
- Selector de categoría (`Producto`)

### 4. Editor de Desglose
- Tabla editable tipo Excel: carga rápida de recursos
- Filtros activos por tipo, código o nombre
- Validación de cantidad, unidad y precio
- Totalizador automático

---

## ⚙️ Componente crítico: Desglose Versátil

### Objetivo:
Crear un componente que combine:
- Edición rápida tipo Excel
- Filtros activos
- Selección guiada de artículos, operarios y maquinaria

### Inspiración:
- `MatTable` editable + `MatAutocomplete` + `MatSelect`
- Interacción tipo Google Sheets con listas filtradas

### Requisitos:
- Admite carga manual o desde plantillas
- Validación visual inmediata (errores en rojo)
- Total por fila y total general
- Selector de tipo de recurso con comportamiento condicional
- Soporte para pegado desde Excel (ideal)

---

## 🔄 Flujo de Uso
1. Usuario entra a un presupuesto
2. Selecciona o crea capítulo y partida
3. Abre desglose
4. Agrega renglones con recursos
5. Aplica cantidades y precios
6. Visualiza total automático
7. Guarda y vuelve al árbol

---

## 📅 Lista de Tareas para Trae AI

### 1. Generar componente `PresupuestoEditorComponent`
- Incluye formulario de cabecera
- Componente `CapituloPartidaTree`

### 2. Crear `PartidaEditorComponent`
- Modal/formulario lateral con validaciones

### 3. Crear `DesglosePartidaComponent`
- Tabla editable con filtros
- Comportamiento reactivo según `TipoRecurso`
- Selector de artículo/operario/maquinaria con filtro
- Cálculo automático de totales
- Botón para importar desde Excel o plantilla

### 4. Integrar navegación por rutas y guardar estados

### 5. (Opcional) Generar servicios `desglose.service.ts`, `presupuesto.service.ts`, `partida.service.ts`

---

## 📑 Prompt para Trae AI (componente desglose)

```prompt
Quiero que construyas un componente Angular llamado `DesglosePartidaComponent`.
Debe usar Angular Material y permitir:
- Agregar filas para recursos de tipo Articulo, Operario o Maquinaria
- Filtros activos por nombre, tipo o código
- Selección vía `MatAutocomplete` para cada tipo
- Edición directa de cantidad, unidad y precio
- Cálculo automático de total por fila y total general
- Validación en tiempo real
- Estilo tipo Excel con posibilidad de pegar desde portapapeles
- Opcional: guardar cambios automáticamente
```

---

Este documento está listo para ser interpretado por Trae AI o cualquier programador para construir un módulo de presupuestación potente, versátil y adaptado al flujo de trabajo de obra.

