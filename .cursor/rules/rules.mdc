Aquí tienes la **lista de reglas para Cursor** (corta, precisa y accionable). Úsala tal cual en el proyecto.

---

# Reglas para Cursor

## 0) Principios

1. **TDD siempre**: escribe tests que fallen → implementa → refactoriza.
2. **Arquitectura hexagonal** en back y front: dominio/puertos/casos de uso/adaptadores.
3. **Idempotencia** en seeds/migraciones/scripts. Nada hardcodeado.
4. **Determinismo** en mocks/fixtures (faker.seed).
5. **No asumas**: valida con tipos/DTOs/guards y tests.

## 1) Gestión de prompts y foco

6. Trabaja **por áreas** y **por ramas**: una rama por prompt (`feature/pXX-*`).
7. No avances de área hasta cumplir **DoD** (tests, lint, build).
8. Mantén un **documento de prompts** y márcalos como “done” con commit.

## 2) Entornos

9. Entornos: **dev**, **test**, **staging (pre-prod)**, **prod**.
10. Config por `.env` y **runtime** (`app-config.json` en front).
11. Docker: contenedores separados para **dev** y **test** (DB y app).
12. Nunca mezcles credenciales ni bases entre entornos.

## 3) Seguridad y Multi-tenant

13. **Hash** Argon2id + **salt** + **pepper** desde `.env`.
14. Orden global de guards en API: **JWT → Tenant → RBAC**.
15. Usa `@Public()` solo cuando proceda. Requiere `@Resource('...')` en cada controlador.
16. **RBAC estricto**: 401 tokens inválidos, 403 sin permisos, 409 solo para conflictos reales.
17. Propaga `x-empresa-id` en todas las peticiones; filtra **siempre** por empresa en repos.

## 4) Datos y DB

18. TypeORM entidades alineadas con el **DB diagram** dado.
19. **FKs en tablas puente** con `ON DELETE CASCADE` (hijo de la relación) y `RESTRICT` donde evitemos huérfanos.
20. **Migraciones idempotentes** (elimina FK previa si existe antes de crear).
21. Índices/unique según el diagrama; valida en servicio y en base.
22. Seeds mínimas y **seguras** (no rompen producción/test persistente).

## 5) API (NestJS)

23. **Hexagonal**: módulos de dominio, puertos repos, adaptadores TypeORM/HTTP.
24. **DTOs + class-validator** en todos los endpoints; pipes estrictas.
25. Versionado `/api/v1`. Swagger activo (pero **no público** en prod).
26. **Tests** unit + e2e por cada endpoint (POST/GET/PATCH/DELETE).
27. Logs estructurados (contexto, correlación, usuario/empresa).

## 6) Frontend (Angular)

28. Angular 17+, **standalone + Signals + OnPush**.
29. Material + **animations** + Material Icons; tema claro/oscuro y densidad.
30. **API\_CLIENT** conmutable: `demo=true` ⇒ **MockApiClient**, sino **HttpApiClient**.
31. **DayPilot Lite** para Planificación (scheduler + backlog drag\&drop).
32. Directiva `*hasPermission` para ocultar acciones sin permiso.
33. UI accesible (roles ARIA, focus, contraste) y **virtual scroll** en listados grandes.

## 7) Mocks y datos demo

34. `mock-db` con seed determinista; handlers por recurso (401/403/409/422 simulados).
35. Panel “Desarrollador”: reset mock, latencia simulada, banner **DEMO** visible.
36. Contratos front↔back **idénticos** (mapper DTO↔VM en adaptadores).

## 8) Testing

37. **Backend**: Jest unit + e2e (supertest). **Nunca** uses token admin para tests de viewer/editor.
38. **Suite externa**: cliente por usuario (viewer/editor/admin), tokens aislados, limpieza LIFO y reportes (JUnit/MD).
39. **Frontend**: Jest unit/component + Playwright E2E (smoke por área) en `demo=true`.
40. Espera **403** con payloads **válidos** (evita 400 de pipes).

## 9) Git & Calidad

41. GitFlow simplificado: `main` (estable), `develop` (integración), `feature/*`, `release/*`, `hotfix/*`.
42. **Conventional Commits** (+ CHANGELOG). PRs con checklist: tests, a11y, screenshots.
43. **CI**: lint → unit → build → e2e smoke → artefacto.
44. Merge por **PR** con revisiones obligatorias; no pushes directos a `main`.

## 10) Backups & Setup

45. Script de **backup** de código (repo espejo) y DB (dump) programado.
46. **Setup inicial**: endpoint que crea empresa/moneda/roles/permisos y **usuario admin**.
47. Iniciador idempotente; repetir no rompe.

## 11) Observabilidad y errores

48. Errores con **códigos** (`USER_DISABLED`, `RBAC_FORBIDDEN`, `PlanificacionSolapada`, etc.).
49. Métricas básicas (tiempos de respuesta, errores 4xx/5xx por ruta).
50. Trazas mínimas para auditar acciones críticas (seguridad, pagos, asientos).

---

### Regla de oro

> **No cambies de área** hasta que: tests pasen (incluida suite externa), lint OK, build OK, y la documentación del prompt se marque **DoD cumplido**.
