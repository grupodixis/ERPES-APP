# Personas — Prompt para Cursor (NestJS API)

> **Objetivo:** Implementar Personas aplicando arquitectura hexagonal en NestJS, con TypeORM y Angular Admin.
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
- [*] **Seeds/fixtures** (si aplica).
- [*] **Auditoría**: alta/cambios sensibles.
- [*] **Rendimiento**: índices compuestos/filtrados necesarios.
- [*] **Observabilidad**: logs de dominio y métricas básicas.

---

## 1) Especificidades de Personas
- [*] Fiscal obligatorio **solo** si `EsProvisional=0`.
- [*] Índice único filtrado para `(TipoIdFiscal, IdFiscal)` por empresa.

---

## 2) Endpoints propuestos
- [*] `CRUD /personas`
- [*] `POST /personas/{id}/promover`

---

## 3) Criterios de aceptación (DoD)
- [*] Todas las rutas bajo `/api/v1`.
- [*] Validaciones server-side con mensajes claros.
- [*] Respuestas paginadas (`page`, `pageSize`), orden (`sort`,`order`) y filtros por campos clave.
- [*] Swagger completo y ejemplos de request/response.
- [*] Tests E2E cubren casos 200/201/400/401/403/404/409.
- [*] Migraciones reproducibles (`typeorm migration:run` sin errores).
- [*] RBAC probado con mínimo 2 roles (lectura vs escritura).
- [ ] Angular Admin funcional (lista + form con validaciones).

---

## 4) Guía rápida para Cursor (pasos)
1) [*] Genera migración y entidad ORM.  
2) [*] Implementa servicio con reglas.  
3) [*] Expone controller con filtros.  
4) [*] Añade guards RBAC por método.  
5) [*] Documenta en Swagger.  
6) [*] Crea tests unit + e2e.  
7) [*] Monta vistas Angular y formularios.  
8) [*] Revisa índices y rendimiento.

---

## 5) Campos de la tabla Personas (dbDiagram.md)
- [*] IdPersona (PK)
- [*] IdEmpresa (FK a Empresas)
- [*] Nombre (nvarchar(100))
- [*] Apellido1 (nvarchar(100))
- [*] Apellido2 (nvarchar(100))
- [*] RazonSocial (nvarchar(200))
- [*] FormaJuridica (char(2) - PF/PJ)
- [*] TipoIdFiscal (varchar(5))
- [*] IdFiscal (varchar(20))
- [*] Telefono (nvarchar(30))
- [*] Email (nvarchar(320))
- [*] Web (nvarchar(200))
- [*] Idioma (nvarchar(10))
- [*] NotificarEmail (bit, default: 1)
- [*] EsProvisional (bit, default: 0)
- [*] Estado (nvarchar(50))
- [*] Notas (nvarchar(max))
- [*] CreadoEl (datetime)
- [*] CreadoPor (FK a Usuarios)
- [*] ModificadoEl (datetime)
- [*] ModificadoPor (FK a Usuarios)

---

## 6) Reglas de negocio implementadas
- [*] Validación de CIF/NIF solo si EsProvisional=0
- [*] Índice único por empresa en (TipoIdFiscal, IdFiscal)
- [*] Validación de FormaJuridica (PF/PJ)
- [*] Validación de email opcional pero válido si se proporciona
- [*] Validación de web opcional pero URL válida si se proporciona
- [*] Filtrado por nombre, apellidos, razón social
- [*] Ordenación por campos principales
- [*] Paginación estándar
- [*] RBAC con permisos específicos para personas
- [*] Auditoría de cambios
- [*] Endpoint de promoción de provisional a definitiva
- [*] **Soft Delete**: Borrado lógico con campos EliminadoEl/EliminadoPor

---

## 7) Soft Delete implementado
### Campos agregados:
- [*] EliminadoEl (datetime, nullable) - Fecha de eliminación
- [*] EliminadoPor (int, nullable) - Usuario que realizó la eliminación

### Funcionalidad:
- [*] **Borrado lógico**: Los registros se marcan como eliminados en lugar de borrarse físicamente
- [*] **Filtrado automático**: Todas las consultas excluyen automáticamente registros eliminados
- [*] **Auditoría completa**: Se registra quién y cuándo eliminó cada persona
- [*] **Integridad referencial**: Evita problemas con FKs hacia otras entidades (Clientes, Proveedores, etc.)
- [*] **Recuperación**: Los datos permanecen en la base de datos para posibles recuperaciones

### Implementación técnica:
- [*] **Dominio**: Método `softDelete()` y getter `estaEliminada`
- [*] **Repositorio**: Filtros automáticos en todas las consultas
- [*] **Servicio**: Validación de existencia antes del soft delete
- [*] **Controlador**: Documentación actualizada en Swagger
- [*] **Migración**: Campos agregados con índice para optimización

---

## 8) Tests implementados
- [*] Tests unitarios para DTOs (validaciones)
- [*] Tests unitarios para servicio (reglas de negocio)
- [*] Tests E2E para CRUD completo
- [*] Tests E2E para validaciones de negocio
- [*] Tests E2E para RBAC y permisos
- [*] Tests E2E para endpoint de promoción
- [*] Tests de casos límite y errores

---

## 8) Problemas resueltos
- [*] Validación condicional de CIF/NIF según EsProvisional
- [*] Índices únicos por empresa para evitar duplicados
- [*] Manejo de campos opcionales vs obligatorios
- [*] Validación de FormaJuridica con enum
- [*] Filtrado case-insensitive en SQL Server
- [*] Auditoría automática de cambios
- [*] Endpoint de promoción con validaciones
- [*] Documentación Swagger completa
- [*] Tests de cobertura completa
