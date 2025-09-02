# Monedas — Prompt para Cursor (NestJS API)

> **Objetivo:** Implementar Monedas aplicando arquitectura hexagonal en NestJS, con TypeORM y Angular Admin.
> **Formato de checklist:** `[ ] pendiente` · `[*] hecho`

---

## 0) Plantilla estándar (aplicar tal cual)
- [ ] **Migración DB** (TypeORM): tabla, PK/FK, índices, defaults, `CHECK`/`UNIQUE`.
- [ ] **Entidad ORM** + **Repositorio (puerto/adaptador)**.
- [ ] **DTOs** `create/update/query` con `class-validator`.
- [ ] **Servicio de aplicación** (hexagonal) con reglas de negocio.
- [ ] **Controller/Endpoints** CRUD + filtros/paginación + ordenación.
- [ ] **RBAC**: permisos mínimos (listar/ver/crear/editar/borrar) y guards.
- [ ] **Swagger**: schemas y ejemplos.
- [ ] **Tests unit** (servicio, reglas) y **tests e2e** (200/201/400/401/403/404/409).
- [ ] **Seeds/fixtures** (si aplica).
- [ ] **Auditoría**: alta/cambios sensibles.
- [ ] **UI Admin (Angular)**: lista, crear/editar, ver detalle, borrar.
- [ ] **Rendimiento**: índices compuestos/filtrados necesarios.
- [ ] **Observabilidad**: logs de dominio y métricas básicas.

---

## 1) Especificidades de Monedas
- [ ] `CodigoISO UNIQUE`.
- [ ] Campo `Decimales` (por defecto 2).

---

## 2) Endpoints propuestos
- `GET/POST /monedas`
- `GET/PATCH/DELETE /monedas/{id}`

---

## 3) Criterios de aceptación (DoD)
- [ ] Todas las rutas bajo `/api/v1`.
- [ ] Validaciones server-side con mensajes claros.
- [ ] Respuestas paginadas (`page`, `pageSize`), orden (`sort`,`order`) y filtros por campos clave.
- [ ] Swagger completo y ejemplos de request/response.
- [ ] Tests E2E cubren casos 200/201/400/401/403/404/409.
- [ ] Migraciones reproducibles (`typeorm migration:run` sin errores).
- [ ] RBAC probado con mínimo 2 roles (lectura vs escritura).
- [ ] Angular Admin funcional (lista + form con validaciones).

---

## 4) Guía rápida para Cursor (pasos)
1) Genera migración y entidad ORM.  
2) Implementa servicio con reglas.  
3) Expone controller con filtros.  
4) Añade guards RBAC por método.  
5) Documenta en Swagger.  
6) Crea tests unit + e2e.  
7) Monta vistas Angular y formularios.  
8) Revisa índices y rendimiento.
