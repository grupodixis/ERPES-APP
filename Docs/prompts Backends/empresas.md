# Módulo Empresas - Implementación TDD Outside-in

## Resumen
Implementación del módulo Empresas siguiendo arquitectura hexagonal y TDD outside-in, empezando por tests E2E y luego implementando la funcionalidad mínima para que pasen.

## Estado Actual
- [x] **Tests E2E iniciales creados** - Cobertura completa de endpoints (POST/GET/GET:id/PATCH/DELETE) con casos 200/201/400/401/403/404/409
- [x] **Implementación del módulo completada** - Arquitectura hexagonal con dominio, aplicación, infraestructura y presentación
- [x] **Permisos de 'empresas' añadidos al seeding del sistema** - RBAC configurado correctamente
- [x] **Estructura de entidad corregida** - Alineada con InitialSchema y DBML
- [x] **DTOs y mapper actualizados** - Validaciones y transformaciones correctas
- [x] **Autenticación JWT funcionando** - Guards y estrategias configuradas
- [x] **Problema de ordenación resuelto** - Filtrado y ordenación por nombre implementados
- [x] **Servicio corregido eliminando llamadas a métodos inexistentes** - Lógica de negocio simplificada
- [x] **14 de 16 tests E2E pasando** - Casi todos los casos cubiertos
- [x] **Problemas de CIF duplicado resueltos** - Validación de unicidad funcionando
- [x] **Tests unitarios del DTO creados y pasando (16/16)** - Validaciones de class-validator verificadas
- [x] **ValidationPipe configurado correctamente en tests E2E** - Mensajes de error personalizados
- [x] **Tests unitarios del servicio corregidos y pasando** - Mocks y aserciones actualizadas
- [x] **Tests E2E de Empresas funcionando al 100%** - Todos los endpoints probados
- [x] **Tests E2E de RBAC corregidos y pasando** - Permisos y roles funcionando
- [x] **Todos los tests E2E pasando (93/93)** - Cobertura completa del sistema
- [x] **Validación de CIF/NIF implementada** - Decorador personalizado para validar CIF de empresas y NIF de autónomos
- [x] **Campos adicionales añadidos a la tabla Empresas** - Email, Telefono, Web según DBML
- [x] **Migración creada y ejecutada** - Base de datos actualizada con nuevos campos
- [x] **Tests unitarios del decorador CIF/NIF pasando (16/16)** - Validación robusta implementada
- [x] **Tests unitarios del DTO recreados y pasando (16/16)** - Validaciones completas de CreateEmpresaDto
- [x] **Documentación Swagger mejorada** - Descripciones detalladas, ejemplos múltiples, validaciones documentadas
- [x] **Scripts de despliegue para producción** - Migraciones, seeds y validación de configuración

## Problemas Resueltos
- ✅ **Filtrado case-insensitive** - Implementado con LOWER() en consultas SQL
- ✅ **Validación de CIF/NIF** - Decorador personalizado con validación de formato y dígito de control
- ✅ **Campos adicionales** - Email, Telefono, Web añadidos a entidad, DTOs y base de datos
- ✅ **Migración de base de datos** - Índices manejados correctamente durante cambios de esquema
- ✅ **Tests E2E completos** - Todos los endpoints funcionando correctamente

## Próximos Pasos
- [x] **Documentación Swagger completa y actualizada** - Incluir nuevos campos en la documentación
- [x] **Migraciones y seeds para entornos de producción** - Preparar despliegue

## Estructura del Módulo
```
src/modules/empresas/
├── domain/
│   ├── empresa.entity.ts              # Entidad de dominio
│   └── empresa.repository.interface.ts # Contrato del repositorio
├── application/
│   └── empresas.service.ts            # Lógica de aplicación
├── infrastructure/
│   ├── entities/
│   │   └── empresa.entity.ts          # Entidad TypeORM
│   ├── repositories/
│   │   └── empresa.typeorm.repo.ts    # Implementación del repositorio
│   └── mappers/
│       └── empresa.mapper.ts          # Mapeo entre capas
└── presentation/
    ├── controllers/
    │   └── empresa.controller.ts      # Controlador REST
    └── dto/
        ├── create-empresa.dto.ts      # DTO de creación
        ├── update-empresa.dto.ts      # DTO de actualización
        ├── query-empresa.dto.ts       # DTO de consulta
        └── empresa-response.dto.ts    # DTO de respuesta
```

## Endpoints Implementados
- `POST /api/v1/empresas` - Crear empresa
- `GET /api/v1/empresas` - Listar empresas con paginación y filtros
- `GET /api/v1/empresas/:id` - Obtener empresa por ID
- `PATCH /api/v1/empresas/:id` - Actualizar empresa
- `PATCH /api/v1/empresas/:id/activar` - Activar empresa
- `PATCH /api/v1/empresas/:id/desactivar` - Desactivar empresa
- `DELETE /api/v1/empresas/:id` - Eliminar empresa

## Validaciones Implementadas
- ✅ **CIF/NIF válido** - Formato español (CIF: A1234567B, NIF: 12345678Z)
- ✅ **Campos obligatorios** - Nombre, CIF, ID Moneda Base
- ✅ **Campos opcionales** - Email (formato válido), Teléfono, Web
- ✅ **Longitudes máximas** - Nombre (200), Email (320), Teléfono (30), Web (200)
- ✅ **Unicidad de CIF** - Validación a nivel de base de datos
- ✅ **Relación con Moneda** - ID de moneda base válido

## Tests Implementados
- ✅ **Tests E2E (16/16)** - Cobertura completa de endpoints
- ✅ **Tests unitarios DTOs (16/16)** - Validaciones de class-validator (recreados)
- ✅ **Tests unitarios servicio** - Lógica de negocio
- ✅ **Tests decorador CIF/NIF (16/16)** - Validación personalizada

## Notas Técnicas
- **Arquitectura**: Hexagonal con separación clara de responsabilidades
- **ORM**: TypeORM con entidades y repositorios
- **Validación**: class-validator con decoradores personalizados
- **Autenticación**: JWT con guards de seguridad
- **RBAC**: Control de acceso basado en roles y permisos
- **Base de datos**: SQL Server con migraciones automáticas
