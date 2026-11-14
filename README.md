# 🚀 GeoCartera SaaS · Plataforma Multi-Tenant con Vue.js 3 y Tailwind CSS

Plataforma de software y aplicación móvil tipo **SaaS (Software as a Service) Multi-Tenant** construida íntegramente sobre el framework moderno **Vue.js 3**, **Vite** y **Tailwind CSS**.

---

## 🏗️ Arquitectura 100% Framework (Vue 3 + Vite)

El proyecto ha eliminado las librerías sueltas de JavaScript y CSS estático tradicional. Toda la lógica, vistas y componentes se gestionan como módulos Single File Components (`.vue`):

```text
GeoCartera/
├── index.html                    # Entrada SPA
├── vite.config.js                # Configuración de compilación Vite + Vue 3 + Tailwind
├── package.json                  # Dependencias del framework (Vue 3, Vite, Tailwind CSS)
└── src/
    ├── main.js                   # Montaje de la aplicación Vue
    ├── style.css                 # Importación Tailwind CSS
    ├── App.vue                   # Layout central SaaS y enrutador reactivo
    ├── components/
    │   └── BaseIcon.vue          # Componente SVG vectorial
    ├── stores/
    │   ├── saasStore.js          # Store reactivo SaaS (Tenants, RBAC, Cajas, Offline)
    │   └── mockSaaSData.js       # Base de datos inicial Multi-Tenant
    ├── utils/
    │   └── formatters.js         # Utilidades de moneda, fechas, distancias y CSV
    └── views/
        ├── LoginSelectorView.vue     # Selector de rol para demostración
        ├── TenantsManagementView.vue # Módulo SuperAdmin (Gestión de Empresas)
        ├── DashboardTenantView.vue   # Panel de control de empresa y llaves OTP
        ├── UsersRolesView.vue        # Matriz de permisos RBAC y usuarios
        └── MobileCollectorView.vue   # App móvil para cobradores (100% Responsive)
```

---

## ⚡ Comandos de Ejecución

Para iniciar el servidor de desarrollo del framework:

```bash
npm run dev
```

Para generar la compilación de producción optimizada:

```bash
npm run build
```

---

## 🌟 Módulos Incluidos

1. **Gestión de Empresas (Tenants):** Registro corporativo, código tenant, aislamiento de datos, planes SaaS y facturación MRR.
2. **Seguridad y RBAC:** Matriz granular de permisos en 12 facultades operativas y administración de usuarios.
3. **App Móvil de Campo (PWA Responsive):** Modo offline automático, verificación GPS con límite de 50 metros y optimización de rutas (2-opt).
4. **Flujo de Efectivo:** Arqueo de cajas, cierres de jornada y generación de llaves numéricas OTP.
