# 🚀 GeoCartera SaaS · Plataforma Multi-Tenant con Vue.js 3

Plataforma de software y aplicación móvil tipo **SaaS (Software as a Service) Multi-Tenant** diseñada para la gestión automatizada de cartera, cobros puerta a puerta en tiempo real y administración empresarial.

---

## 🌟 Arquitectura SaaS & Módulos Administrables

### 🏢 1. Módulo Maestro SaaS (SuperAdmin Global)
* **Gestión de Empresas (Tenants):** Registro de clientes corporativos, aislamiento lógico de datos, códigos de acceso y control de suscripción activa o suspendida.
* **Catálogo de Planes y Facturación:** Métricas de MRR recurrente, límites por nivel (número de rutas, clientes máximos y tipo de soporte).
* **Parámetros por Empresa:** Radio de geocerca (metros), límites de crédito y gastos sin llave OTP, y tasas de interés predeterminadas configurables individualmente por empresa.

### 🛡️ 2. Módulo de Seguridad y RBAC (Roles y Permisos Granulares)
* **Roles Preconfigurados:** Super Administrador SaaS, Administrador de Empresa, Supervisor Operativo y Cobrador en Calle.
* **Matriz de Permisos Reactiva:** 12 facultades operativas categorizadas en:
  - *Operación Calle:* Cobros y bypass de geocerca.
  - *Ventas:* Registro y aprobación remota de pre-ventas sobre cupo.
  - *Flujo de Caja:* Arqueo, cierre de jornada y pre-gastos.
  - *Rutas y Clientes:* Optimización algorítmica y líneas de crédito.
  - *Seguridad:* Cuentas y auditoría forense.
* **Administración de Personal:** Creación de usuarios, vinculación a rutas y bloqueo instantáneo de cuentas.

### 📱 3. App Móvil para Cobradores (100% Responsive PWA con Vue 3)
* **Modo Offline Activo:** Registro de transacciones sin señal con sincronización automática en segundo plano al recuperar conexión.
* **Geocercas Satelitales (50 metros):** Bloqueo anti-fraude que exige solicitud de **Llave OTP** al administrador si el cobrador está fuera del domicilio del cliente.
* **Optimización de Rutas (Machine Learning / 2-opt):** Reordenamiento automático para minimizar kilómetros de desplazamiento.
* **Control de Efectivo en Calle:** Arqueo en vivo entre base inicial, cobros y gastos.

---

## 💻 Puesta en Marcha Inmediata

No requiere compilación previa. Abre directamente [index.html](file:///c:/Users/viviana/Desktop/GeoCartera/index.html) en tu navegador o levanta un servidor estático:

```bash
# Con Node.js
npx serve .

# O con Python
python -m http.server 8080
```

1. **Accede como SuperAdmin SaaS:** Gestiona empresas, crea un nuevo tenant o ajusta los parámetros de suscripción.
2. **Accede como Administrador de Empresa:** Aprueba llaves remotas, cuadra cajas y configura la matriz de permisos de los roles.
3. **Accede como Cobrador Móvil:** Prueba la vista responsive móvil en DevTools (`F12` -> `Ctrl + Shift + M`), prueba el modo offline y registra abonos con verificación de proximidad GPS.
