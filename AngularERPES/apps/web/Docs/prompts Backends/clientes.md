# Clientes — Prompt para Cursor (NestJS API)

> **Objetivo:** Implementar Clientes aplicando arquitectura hexagonal en NestJS, con TypeORM y Angular Admin.
> **Formato de checklist:** `[ ] pendiente` · `[*] hecho`

---

## 0) Plantilla estándar (aplicar tal cual)
- [x] **Migración DB** (TypeORM): tabla, PK/FK, índices, defaults, `CHECK`/`UNIQUE`.
- [x] **Entidad ORM** + **Repositorio (puerto/adaptador)**.
- [x] **DTOs** `create/update/query` con `class-validator`.
- [x] **Servicio de aplicación** (hexagonal) con reglas de negocio.
- [x] **Controller/Endpoints** CRUD + filtros/paginación + ordenación.
- [x] **RBAC**: permisos mínimos (listar/ver/crear/editar/borrar) y guards.
- [x] **Swagger**: schemas y ejemplos.
- [x] **Tests unit** (servicio, reglas) y **tests e2e** (200/201/400/401/403/404/409).
- [x] **Seeds/fixtures** (si aplica).
- [x] **Auditoría**: alta/cambios sensibles.
- [ ] **UI Admin (Angular)**: lista, crear/editar, ver detalle, borrar.
- [x] **Rendimiento**: índices compuestos/filtrados necesarios.
- [x] **Observabilidad**: logs de dominio y métricas básicas.

---

## 1) Especificidades de Clientes
- [x] Bloquear facturación si Persona es provisional.

---

## 2) Endpoints propuestos
- [x] `CRUD /clientes`
- [x] `GET /clientes/{id}/resumen`

---

## 3) Criterios de aceptación (DoD)
- [x] Todas las rutas bajo `/api/v1`.
- [x] Validaciones server-side con mensajes claros.
- [x] Respuestas paginadas (`page`, `pageSize`), orden (`sort`,`order`) y filtros por campos clave.
- [x] Swagger completo y ejemplos de request/response.
- [x] Tests E2E cubren casos 200/201/400/401/403/404/409.
- [x] Migraciones reproducibles (`typeorm migration:run` sin errores).
- [x] RBAC probado con mínimo 2 roles (lectura vs escritura).
- [ ] Angular Admin funcional (lista + form con validaciones).

---

## 4) Guía rápida para Cursor (pasos)
1) [x] Genera migración y entidad ORM.  
2) [x] Implementa servicio con reglas.  
3) [x] Expone controller con filtros.  
4) [x] Añade guards RBAC por método.  
5) [x] Documenta en Swagger.  
6) [x] Crea tests unit + e2e.  
7) [ ] Monta vistas Angular y formularios.  
8) [x] Revisa índices y rendimiento.

---

## 5) Implementación completada ✅

### **🏗️ Arquitectura Hexagonal:**
- [x] **Dominio**: `Cliente` entity con métodos de negocio
- [x] **Aplicación**: `ClientesService` con lógica de creación/linking de personas
- [x] **Infraestructura**: `ClienteTypeOrmRepo` con TypeORM
- [x] **Presentación**: `ClientesController` con DTOs y validaciones

### **🔐 Seguridad y RBAC:**
- [x] **Permisos**: `clientes:GET/POST/PATCH/DELETE`
- [x] **Guards**: JWT + Tenant + RBAC aplicados
- [x] **Multiempresa**: Filtrado automático por `IdEmpresa`

### **📊 Funcionalidades:**
- [x] **Creación inteligente**: Nueva persona o linking por ID/datos fiscales
- [x] **Códigos automáticos**: `CLT-{IdPersona}` generado automáticamente
- [x] **Validaciones**: DTOs con `class-validator` y reglas de negocio
- [x] **Filtros**: Búsqueda por nombre, apellidos, razón social, código
- [x] **Paginación**: Estándar con `page/limit/sort/order`

### **🧪 Tests:**
- [x] **Unit**: Servicio con mocks de repositorios
- [x] **E2E**: CRUD completo + casos de error + RBAC
- [x] **Cobertura**: 200/201/400/401/403/404/409

### **📚 Documentación:**
- [x] **Swagger**: Schemas, ejemplos y respuestas tipadas
- [x] **Endpoints**: Todos documentados con `@ApiOperation` y `@ApiResponse`
