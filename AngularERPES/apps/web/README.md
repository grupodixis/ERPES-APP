# ERP Angular - Frontend

Aplicación frontend del ERP construida con **Angular 17+**, **Material Design** y **arquitectura hexagonal**.

## 🚀 Características

- **Angular 17+** con componentes standalone
- **Angular Material** con tema personalizado
- **PWA** (Progressive Web App) habilitada
- **Arquitectura hexagonal** (ports & adapters)
- **Signals** para gestión de estado reactivo
- **Configuración runtime** conmutable (Mock/HTTP)
- **Responsive design** para móvil y desktop
- **ESLint + Prettier** para calidad de código

## 🏗️ Arquitectura

```
src/app/
├── core/           # Infraestructura transversal
├── domain/         # Tipos del dominio (DTOs, value objects)
├── application/    # Casos de uso y stores (Signals)
├── ports/          # Interfaces de repositorios/ApiClient
├── adapters/       # Implementaciones HTTP/Mock
├── shared/         # Componentes UI reutilizables
└── features/       # Módulos por área de negocio
    ├── seguridad/
    ├── configuracion/
    ├── terceros/
    ├── productos/
    ├── inventario/
    ├── obras/
    ├── presupuestos/
    ├── planificacion/
    ├── ventas/
    ├── compras/
    ├── contabilidad/
    ├── rrhh/
    └── dms/
```

## 🛠️ Tecnologías

- **Angular 17+** - Framework principal
- **Angular Material** - Componentes UI
- **RxJS** - Programación reactiva
- **TypeScript** - Tipado estático
- **SCSS** - Estilos con preprocesador
- **Jest** - Testing unitario
- **ESLint + Prettier** - Calidad de código

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

## ⚙️ Configuración

### Entornos

- **Development**: `environment.ts` (demo=true)
- **Production**: `environment.prod.ts` (demo=false)

### Configuración Runtime

El archivo `src/assets/app-config.json` permite cambiar la configuración sin recompilar:

```json
{
  "demo": true,
  "apiBaseUrl": "http://localhost:3000/api",
  "envName": "DEV"
}
```

### API Client

La aplicación usa un **API_CLIENT** conmutable:
- **Mock**: Cuando `demo=true`
- **HTTP**: Cuando `demo=false`

## 🎨 UI/UX

- **Material Design** con tema personalizado
- **Responsive** para todos los dispositivos
- **Animaciones** suaves y profesionales
- **Accesibilidad** con roles ARIA
- **Iconos** Material Symbols

## 🧪 Testing

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests E2E (cuando esté configurado)
npm run e2e
```

## 📱 PWA

La aplicación está configurada como PWA con:
- Service Worker para cache
- Manifest para instalación
- Iconos en múltiples tamaños
- Funcionalidad offline básica

## 🔧 Scripts Disponibles

```bash
npm start          # ng serve
npm run build      # ng build
npm run test       # ng test
npm run lint       # ng lint
npm run format     # prettier --write
```

## 📋 Estado del Proyecto

### ✅ Completado (FE-00)
- [x] Bootstrap del proyecto
- [x] Angular Material configurado
- [x] PWA habilitada
- [x] Arquitectura hexagonal básica
- [x] Configuración de entornos
- [x] API_CLIENT conmutable
- [x] Shell principal con navegación
- [x] Dashboard básico
- [x] Rutas lazy por módulo

### 🚧 Próximos Pasos
- [ ] FE-01: Entornos + Runtime config
- [ ] FE-02: Core HTTP + Auth + Guards
- [ ] FE-03: Shared UI Kit + DataSource
- [ ] FE-04: Mock DB + Handlers
- [ ] FE-10: Módulo Seguridad

## 🌐 Navegación

La aplicación incluye navegación para todas las áreas del ERP:

- **Dashboard** - Vista general
- **Seguridad** - Usuarios, roles, permisos
- **Configuración** - Monedas, tipos cambio, series
- **Terceros** - Personas, clientes, proveedores
- **Productos** - Catálogo, BOM
- **Inventario** - Depósitos, movimientos
- **Obras** - Proyectos, capítulos, partidas
- **Presupuestos** - Versiones, certificaciones
- **Planificación** - Scheduler, recursos
- **Ventas** - Pedidos, facturas, cobros
- **Compras** - Pedidos, recepciones, pagos
- **Contabilidad** - Asientos, informes
- **RRHH** - Operarios, partes, vacaciones
- **DMS** - Documentos, auditoría

## 📄 Licencia

Este proyecto es parte del ERP Angular y sigue las políticas de la organización.
