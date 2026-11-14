import { U } from '../utils/formatters.js';

export function getInitialSaaSDatabase() {
  const T = U.today();

  const planes = [
    {
      id: 'plan_starter',
      nombre: 'Starter Micro',
      precio: 99000,
      intervalo: 'mes',
      maxRutas: 3,
      maxClientes: 250,
      offline: true,
      gps: true,
      multiusuario: true,
      soporte: 'WhatsApp Básico'
    },
    {
      id: 'plan_pro',
      nombre: 'Pro Rutas',
      precio: 249000,
      intervalo: 'mes',
      maxRutas: 10,
      maxClientes: 1200,
      offline: true,
      gps: true,
      multiusuario: true,
      soporte: '24/7 Prioritario'
    },
    {
      id: 'plan_enterprise',
      nombre: 'Enterprise Escala',
      precio: 590000,
      intervalo: 'mes',
      maxRutas: 50,
      maxClientes: 10000,
      offline: true,
      gps: true,
      multiusuario: true,
      soporte: 'Gerente de Cuenta Dedicado'
    }
  ];

  const tenants = [
    {
      id: 'tenant_1',
      codigo: 'FINANZAS_ALFA',
      nombreEmpresa: 'Inversiones Alfa & Soluciones S.A.S.',
      nit: '901.458.789-1',
      ciudad: 'Barranquilla, Colombia',
      telefono: '3008899112',
      email: 'contacto@inversionesalfa.co',
      planId: 'plan_pro',
      estadoSuscripcion: 'activa',
      renovacionFecha: U.addDays(T, 25),
      configuracion: {
        moneda: 'COP',
        geocercaMetros: 50,
        interesDefault: 20,
        ventaMaxSinLlave: 1200000,
        gastoMaxSinLlave: 50000,
        cupoClienteNuevo: 600000,
        cajaInicialDefault: 400000
      }
    },
    {
      id: 'tenant_2',
      codigo: 'CREDI_RAPIDO',
      nombreEmpresa: 'CrediPronto del Valle',
      nit: '900.852.147-3',
      ciudad: 'Cali, Colombia',
      telefono: '3157744112',
      email: 'gerencia@credipronto.com',
      planId: 'plan_starter',
      estadoSuscripcion: 'activa',
      renovacionFecha: U.addDays(T, 14),
      configuracion: {
        moneda: 'COP',
        geocercaMetros: 60,
        interesDefault: 20,
        ventaMaxSinLlave: 1000000,
        gastoMaxSinLlave: 40000,
        cupoClienteNuevo: 500000,
        cajaInicialDefault: 300000
      }
    }
  ];

  const roles = [
    {
      id: 'super_admin',
      nombre: 'Super Administrador SaaS',
      tenantId: null,
      desc: 'Control maestro de la plataforma SaaS, tenants, planes, suscripciones y facturación global.',
      permisos: ['saas_tenants_manage', 'saas_plans_manage', 'saas_analytics', 'all']
    },
    {
      id: 'tenant_admin',
      nombre: 'Administrador Empresa',
      tenantId: 'tenant_1',
      desc: 'Control total de la empresa: rutas, arqueo de cajas, llaves de autorización y configuración.',
      permisos: [
        'recaudo_cobrar', 'recaudo_geocerca_bypass', 'ventas_crear', 'ventas_aprobar',
        'caja_abrir_cerrar', 'caja_modificar_base', 'gastos_registrar', 'gastos_aprobar',
        'rutas_reordenar', 'clientes_modificar_cupo', 'seguridad_usuarios', 'reportes_auditoria'
      ]
    },
    {
      id: 'supervisor',
      nombre: 'Supervisor Operativo',
      tenantId: 'tenant_1',
      desc: 'Supervisión en tiempo real de cobradores en calle, aprobación de llaves y auditoría de rutas.',
      permisos: [
        'recaudo_cobrar', 'ventas_crear', 'ventas_aprobar', 'gastos_aprobar',
        'rutas_reordenar', 'clientes_modificar_cupo', 'reportes_auditoria'
      ]
    },
    {
      id: 'cobrador',
      nombre: 'Cobrador / Asesor en Calle',
      tenantId: 'tenant_1',
      desc: 'App móvil con ruta asignada, cobros offline y registro de gastos.',
      permisos: ['recaudo_cobrar', 'ventas_crear', 'caja_abrir_cerrar', 'gastos_registrar']
    }
  ];

  const usuarios = [
    {
      id: 'usr_super',
      tenantId: null,
      nombre: 'Super Admin GeoCartera',
      email: 'master@geocartera.com',
      rolId: 'super_admin',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    },
    {
      id: 'usr_admin_alfa',
      tenantId: 'tenant_1',
      nombre: 'Carlos Mario Vergara',
      email: 'gerencia@inversionesalfa.co',
      rolId: 'tenant_admin',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    },
    {
      id: 'usr_cob1',
      tenantId: 'tenant_1',
      nombre: 'Carlos Pérez',
      email: 'carlos.perez@alfa.co',
      rolId: 'cobrador',
      cobradorId: 'c1',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    },
    {
      id: 'usr_cob2',
      tenantId: 'tenant_1',
      nombre: 'Andrea Gómez',
      email: 'andrea.gomez@alfa.co',
      rolId: 'cobrador',
      cobradorId: 'c2',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    },
    {
      id: 'usr_cob3',
      tenantId: 'tenant_1',
      nombre: 'Luis Martínez',
      email: 'luis.martinez@alfa.co',
      rolId: 'cobrador',
      cobradorId: 'c3',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    }
  ];

  const cobradores = [
    { id: 'c1', tenantId: 'tenant_1', nombre: 'Carlos Pérez', zona: 'Ruta Norte', tel: '3001234567', color: '#0284c7', base: { x: 80, y: 80 } },
    { id: 'c2', tenantId: 'tenant_1', nombre: 'Andrea Gómez', zona: 'Ruta Centro', tel: '3017654321', color: '#9333ea', base: { x: 330, y: 240 } },
    { id: 'c3', tenantId: 'tenant_1', nombre: 'Luis Martínez', zona: 'Ruta Sur', tel: '3029876543', color: '#ea580c', base: { x: 600, y: 480 } }
  ];

  const clientes = [
    { id: 'cl1', tenantId: 'tenant_1', nombre: 'María Fernanda López', doc: '10203040', tel: '3001112233', direccion: 'Calle 45 # 23-10', barrio: 'La Castellana', x: 95, y: 110, cobradorId: 'c1', orden: 1, cupo: 800000 },
    { id: 'cl2', tenantId: 'tenant_1', nombre: 'José Antonio Ruiz', doc: '72154896', tel: '3002223344', direccion: 'Carrera 50 # 30-15', barrio: 'El Prado', x: 120, y: 140, cobradorId: 'c1', orden: 2, cupo: 1000000 },
    { id: 'cl3', tenantId: 'tenant_1', nombre: 'Ana Lucía Torres', doc: '32896541', tel: '3003334455', direccion: 'Calle 52 # 38-40', barrio: 'Santa Fe', x: 145, y: 175, cobradorId: 'c1', orden: 3, cupo: 600000 },
    { id: 'cl4', tenantId: 'tenant_1', nombre: 'Pedro Pablo Castro', doc: '8541236', tel: '3004445566', direccion: 'Carrera 43 # 60-12', barrio: 'Villa Country', x: 180, y: 210, cobradorId: 'c1', orden: 4, cupo: 1200000 },
    { id: 'cl5', tenantId: 'tenant_1', nombre: 'Luz Marina Rojas', doc: '45896321', tel: '3005556677', direccion: 'Calle 34 # 40-20', barrio: 'San Nicolás', x: 350, y: 260, cobradorId: 'c2', orden: 1, cupo: 800000 },
    { id: 'cl6', tenantId: 'tenant_1', nombre: 'Jorge Eliécer Díaz', doc: '9125478', tel: '3006667788', direccion: 'Calle 38 # 42-18', barrio: 'El Centro', x: 380, y: 290, cobradorId: 'c2', orden: 2, cupo: 900000 },
    { id: 'cl7', tenantId: 'tenant_1', nombre: 'Sandra Milena Vargas', doc: '104789632', tel: '3007778899', direccion: 'Carrera 35 # 28-10', barrio: 'Chapinero', x: 410, y: 320, cobradorId: 'c2', orden: 3, cupo: 750000 },
    { id: 'cl8', tenantId: 'tenant_1', nombre: 'Óscar Iván Moreno', doc: '73589621', tel: '3008889900', direccion: 'Calle 70 # 15-30', barrio: 'Las Palmas', x: 620, y: 500, cobradorId: 'c3', orden: 1, cupo: 1000000 },
    { id: 'cl9', tenantId: 'tenant_1', nombre: 'Claudia Patricia Ríos', doc: '22896547', tel: '3009990011', direccion: 'Carrera 18 # 72-14', barrio: 'El Bosque', x: 660, y: 520, cobradorId: 'c3', orden: 2, cupo: 700000 },
    { id: 'cl10', tenantId: 'tenant_1', nombre: 'Fabio Andrés Mejía', doc: '10852369', tel: '3011112233', direccion: 'Calle 76 # 20-50', barrio: 'La Esperanza', x: 690, y: 550, cobradorId: 'c3', orden: 3, cupo: 850000 }
  ];

  const creditos = [
    { id: 'cr1', tenantId: 'tenant_1', clienteId: 'cl1', cobradorId: 'c1', monto: 500000, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 25000, valorTotal: 600000, estado: 'activo', fecha: U.addDays(T, -10), netoEntregado: 500000 },
    { id: 'cr2', tenantId: 'tenant_1', clienteId: 'cl2', cobradorId: 'c1', monto: 800000, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 40000, valorTotal: 960000, estado: 'activo', fecha: U.addDays(T, -8), netoEntregado: 800000 },
    { id: 'cr3', tenantId: 'tenant_1', clienteId: 'cl3', cobradorId: 'c1', monto: 400000, interes: 20, cuotas: 20, frecuencia: 'diario', valorCuota: 24000, valorTotal: 480000, estado: 'activo', fecha: U.addDays(T, -6), netoEntregado: 400000 },
    { id: 'cr4', tenantId: 'tenant_1', clienteId: 'cl4', cobradorId: 'c1', monto: 1000000, interes: 20, cuotas: 30, frecuencia: 'diario', valorCuota: 40000, valorTotal: 1200000, estado: 'activo', fecha: U.addDays(T, -4), netoEntregado: 1000000 },
    { id: 'cr5', tenantId: 'tenant_1', clienteId: 'cl5', cobradorId: 'c2', monto: 600000, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 30000, valorTotal: 720000, estado: 'activo', fecha: U.addDays(T, -12), netoEntregado: 600000 },
    { id: 'cr6', tenantId: 'tenant_1', clienteId: 'cl6', cobradorId: 'c2', monto: 700000, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 35000, valorTotal: 840000, estado: 'activo', fecha: U.addDays(T, -7), netoEntregado: 700000 },
    { id: 'cr7', tenantId: 'tenant_1', clienteId: 'cl7', cobradorId: 'c2', monto: 500000, interes: 20, cuotas: 20, frecuencia: 'diario', valorCuota: 30000, valorTotal: 600000, estado: 'activo', fecha: U.addDays(T, -5), netoEntregado: 500000 },
    { id: 'cr8', tenantId: 'tenant_1', clienteId: 'cl8', cobradorId: 'c3', monto: 900000, interes: 20, cuotas: 30, frecuencia: 'diario', valorCuota: 36000, valorTotal: 1080000, estado: 'activo', fecha: U.addDays(T, -9), netoEntregado: 900000 },
    { id: 'cr9', tenantId: 'tenant_1', clienteId: 'cl9', cobradorId: 'c3', monto: 600000, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 30000, valorTotal: 720000, estado: 'activo', fecha: U.addDays(T, -3), netoEntregado: 600000 },
    { id: 'cr10', tenantId: 'tenant_1', clienteId: 'cl10', cobradorId: 'c3', monto: 750000, interes: 20, cuotas: 25, frecuencia: 'diario', valorCuota: 36000, valorTotal: 900000, estado: 'activo', fecha: U.addDays(T, -15), netoEntregado: 750000 }
  ];

  const pagos = [
    { id: 'p1', tenantId: 'tenant_1', creditoId: 'cr1', clienteId: 'cl1', cobradorId: 'c1', valor: 25000, metodo: 'efectivo', fecha: `${T}T09:15:00`, recibo: 1001, sync: true, dist: 12 },
    { id: 'p2', tenantId: 'tenant_1', creditoId: 'cr5', clienteId: 'cl5', cobradorId: 'c2', valor: 30000, metodo: 'nequi', fecha: `${T}T10:05:00`, recibo: 1002, sync: true, dist: 8 },
    { id: 'p3', tenantId: 'tenant_1', creditoId: 'cr8', clienteId: 'cl8', cobradorId: 'c3', valor: 36000, metodo: 'efectivo', fecha: `${T}T10:45:00`, recibo: 1003, sync: true, dist: 15 }
  ];

  const noPagos = [];
  const gastos = [
    { id: 'g1', tenantId: 'tenant_1', cobradorId: 'c1', concepto: 'Gasolina', detalle: 'Tanqueo moto', valor: 15000, fecha: `${T}T08:30:00`, estado: 'aprobado' },
    { id: 'g2', tenantId: 'tenant_1', cobradorId: 'c2', concepto: 'Almuerzo', detalle: 'Almuerzo en ruta', valor: 14000, fecha: `${T}T12:45:00`, estado: 'aprobado' }
  ];

  const autorizaciones = [
    {
      id: 'aut_1',
      tenantId: 'tenant_1',
      tipo: 'venta',
      cobradorId: 'c1',
      clienteId: 'cl2',
      valor: 1500000,
      detalle: 'Pre-venta sobre cupo para José Antonio Ruiz (Monto: $ 1.500.000, Cupo: $ 1.000.000)',
      estado: 'pendiente',
      fecha: `${T}T11:20:00`,
      llave: null
    },
    {
      id: 'aut_2',
      tenantId: 'tenant_1',
      tipo: 'gasto',
      cobradorId: 'c3',
      clienteId: null,
      valor: 85000,
      detalle: 'Repuestos moto · Cambio de kit de arrastre imprevisto',
      estado: 'pendiente',
      fecha: `${T}T11:45:00`,
      llave: null
    }
  ];

  const cajas = [
    { id: 'cj_c1', tenantId: 'tenant_1', cobradorId: 'c1', fecha: T, inicial: 400000, retiros: [], cierre: null },
    { id: 'cj_c2', tenantId: 'tenant_1', cobradorId: 'c2', fecha: T, inicial: 350000, retiros: [], cierre: null },
    { id: 'cj_c3', tenantId: 'tenant_1', cobradorId: 'c3', fecha: T, inicial: 450000, retiros: [], cierre: null }
  ];

  const audit = [
    {
      id: 'au_1',
      tenantId: 'tenant_1',
      fecha: `${T}T08:00:00`,
      usuario: 'Carlos Pérez',
      rol: 'cobrador',
      accion: 'Inicio de jornada',
      detalle: 'Apertura de ruta Norte con base de $ 400.000'
    },
    {
      id: 'au_2',
      tenantId: 'tenant_1',
      fecha: `${T}T09:15:00`,
      usuario: 'Carlos Pérez',
      rol: 'cobrador',
      accion: 'Cobro registrado',
      detalle: 'Abono de $ 25.000 a María Fernanda López (Recibo #1001)'
    }
  ];

  return {
    version: '2.0.0-vue-saas',
    seedDate: T,
    seqRecibo: 1004,
    planes,
    tenants,
    roles,
    usuarios,
    cobradores,
    clientes,
    creditos,
    pagos,
    noPagos,
    gastos,
    autorizaciones,
    cajas,
    audit
  };
}
