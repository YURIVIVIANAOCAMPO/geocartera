# 🚀 GeoCartera · Plataforma de Gestión de Cartera, Cobranza y Rutas en Tiempo Real

> **Demo 100% Funcional y Responsive para Dispositivos Móviles y Escritorio**  
> Inspirado y diseñado para superar soluciones como TryController, adaptado a microcréditos, cobros puerta a puerta ("rutas"), préstamos diarios/semanales y venta a plazos en América Latina.

---

## 🌟 Características Principales

### 📱 1. Aplicación Móvil para Cobradores (PWA 100% Responsive)
* **Modo Offline Absoluto (Modo Avión):** Registra abonos, no pagos y gastos sin señal. Se almacenan en la memoria del teléfono y se sincronizan automáticamente al recuperar conexión.
* **Geocercas GPS (Límite 50m):** Verificación satelital de proximidad al domicilio del cliente para evitar fraudes en cobros y visitas falsas.
* **Optimización de Rutas (Algoritmo 2-opt / Vecino más cercano):** Ordena automáticamente los clientes para reducir los kilómetros y el tiempo de viaje del cobrador.
* **Ventas y Pre-ventas:** Registro de créditos con cálculo automático de cuotas según frecuencia (diaria, semanal, quincenal, mensual). Si supera el cupo, genera solicitud remota de llave.
* **Gestión de Cajas en Calle:** Monitoreo en vivo de saldo inicial, cobros en efectivo, cobros electrónicos, préstamos desembolsados, gastos y arqueo final.
* **Recibo Digital e Impresión:** Generación instantánea de comprobante con botón para envío directo por WhatsApp y opción de impresión térmica Bluetooth.

### 💻 2. Plataforma Web para Administradores
* **Dashboard Financiero:** Métricas en vivo de recaudo del día, cartera activa, préstamos colocados, morosidad y flujo de dinero.
* **Módulo de Autorizaciones y Llaves (Códigos OTP de 6 dígitos):** Aprobación remota inmediata de pre-ventas sobre cupo, pagos adelantados, pre-gastos o cobros fuera de geocerca.
* **Monitoreo Satelital GPS en Tiempo Real:** Mapa interactivo con la ubicación actual de cada cobrador, trazado de rutas recorridas y estado de visitas de clientes.
* **Reordenamiento Manual y Asignación de Rutas:** Subir y bajar clientes en la secuencia de cobro.
* **Arqueo y Cierre de Cajas:** Auditoría de discrepancias (sobrantes/faltantes) al final de la jornada.

### 👥 3. Módulo de Gestión de Usuarios, Roles y Permisos (RBAC)
* **Roles Preconfigurados:** Administrador General, Supervisor de Zona, Cobrador / Asesor en Campo y Auditor Financiero.
* **Matriz Granular de Permisos:** Configuración detallada de facultades por categoría (Operación, Ventas, Caja, Rutas, Clientes y Seguridad).
* **Control de Acceso y Estado:** Posibilidad de vincular usuarios a rutas específicas o mantenerlos en oficina, además de bloqueo y activación inmediata de cuentas.

### 🔍 4. Portal PayView para Clientes
* **Autoservicio y Transparencia:** Los clientes consultan su estado de cuenta, historial de abonos y cuotas pendientes simplemente ingresando su número de documento de identidad.
* **Canal Directo de Contacto:** Botón de asistencia directa por WhatsApp con su cobrador asignado.

---

## 🏗️ Arquitectura Técnica de Producción (Recomendada)

```
                              ┌────────────────────────────────────────┐
                              │            Cloudflare CDN              │
                              │        (DDoS / SSL / Cache)            │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │    Load Balancer (AWS ALB / GCP)       │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                        ┌────────────────────────────────────────────────────┐
                        │      Kubernetes Cluster (EKS / GKE) Auto-scaling   │
                        │   API Gateway (NestJS / Golang microservicios)     │
                        └─────────┬───────────────────────────────┬──────────┘
                                  │                               │
            ┌─────────────────────┴────────────┐    ┌─────────────┴─────────────┐
            ▼                                  ▼    ▼                           ▼
┌────────────────────────┐         ┌────────────────────────┐         ┌──────────────────┐
│  PostgreSQL (Escritura)│ ◀--Repl-│  PostgreSQL (Lectura)  │         │   Redis Cluster  │
│  Particionado / Cifrado│         │  Reportes y Auditoría  │         │  (Sesiones/Llaves)
└────────────────────────┘         └────────────────────────┘         └──────────────────┘
            │                                                                   │
            ▼                                                                   ▼
┌────────────────────────┐                                            ┌──────────────────┐
│ Amazon S3 / Cloudflare │                                            │ WhatsApp Twilio  │
│ Fotos fachadas/recibos │                                            │ Mensajería auto  │
└────────────────────────┘                                            └──────────────────┘
```

1. **Backend:** Node.js (NestJS) o Go (Golang) para alta concurrencia en horas pico (cierre de 4:00 PM - 7:00 PM).
2. **Base de Datos:** PostgreSQL con replicación primaria/réplica y almacenamiento cifrado en reposo (AES-256).
3. **Caché en Tiempo Real:** Redis para validación instantánea de llaves OTP y sesiones activas.
4. **App Móvil Híbrida/Nativa:** Flutter o React Native con base SQLite / WatermelonDB cifrada localmente para soporte offline.

---

## ⚡ Cómo Ejecutar la Demo Localmente

Esta demo es completamente autónoma (Vanilla JS + HTML5 + CSS moderno). No requiere instalar dependencias pesadas:

1. Simplemente abre `index.html` en tu navegador web favorito (Chrome, Edge, Safari, Firefox).
2. Para probarlo como servidor local (por ejemplo con Node.js):
   ```bash
   npx serve .
   ```
   o con Python:
   ```bash
   python -m http.server 8080
   ```
3. **Para probar la vista móvil:**
   - Abre las herramientas de desarrollador (`F12`).
   - Activa el modo de emulación de dispositivos móviles (`Ctrl + Shift + M`).
   - Selecciona un modelo como iPhone 14, Pixel 7 o Samsung Galaxy.

---

## 🧪 Pruebas Rápidas Sugeridas en la Demo

1. **Prueba de Modo Offline:**
   - Ingresa como cobrador (ej. **Carlos Pérez**).
   - Haz clic en el botón superior **Online** para activar el **Modo Offline**.
   - Registra un cobro a un cliente. Verás que se guarda localmente.
   - Vuelve a hacer clic para reconectar: la app sincronizará los abonos automáticamente.
2. **Prueba de Geocerca (GPS):**
   - Haz clic sobre un cliente en la ruta. El sistema simulará una distancia GPS.
   - Si la distancia es mayor a 50 metros, se bloqueará el cobro directo y generará una **solicitud de autorización al Administrador**.
3. **Prueba de Llaves y Autorizaciones:**
   - Cierra sesión y entra como **Administrador General**.
   - Ve a **Llaves y Autorizaciones** y aprueba la solicitud. Se generará un código de llave numérico de 6 dígitos.
4. **Prueba de RBAC (Usuarios y Permisos):**
   - Ve a **Usuarios y Roles**.
   - Haz clic en **Configurar Permisos** de cualquier rol o crea un nuevo colaborador asignándolo a una ruta.
5. **Prueba de PayView:**
   - Accede a **Portal PayView** e ingresa la cédula de un cliente (ej. `10203040`) para ver su extracto digital.
