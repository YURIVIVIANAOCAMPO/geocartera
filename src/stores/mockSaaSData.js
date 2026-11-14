import { U } from '../utils/formatters.js';

export function getInitialSaaSDatabase() {
  const T = U.today();

  const planes = [
    {
      id: 'plan_starter',
      nombre: 'Starter Micro',
      precio: 149.00,
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
      nombre: 'Pro Rotas',
      precio: 349.00,
      intervalo: 'mes',
      maxRutas: 10,
      maxClientes: 1200,
      offline: true,
      gps: true,
      multiusuario: true,
      soporte: '24/7 Prioritário'
    },
    {
      id: 'plan_enterprise',
      nombre: 'Enterprise Escala',
      precio: 790.00,
      intervalo: 'mes',
      maxRutas: 50,
      maxClientes: 10000,
      offline: true,
      gps: true,
      multiusuario: true,
      soporte: 'Gerente de Conta Dedicado'
    }
  ];

  const tenants = [
    {
      id: 'tenant_1',
      codigo: 'FINANCAS_ALFA',
      nombreEmpresa: 'Inversões Alfa & Soluções Financeiras Ltda.',
      nit: '12.345.678/0001-90',
      ciudad: 'São Paulo, Brasil',
      telefono: '+55 (11) 98765-4321',
      email: 'contato@inversoesalfa.com.br',
      planId: 'plan_pro',
      estadoSuscripcion: 'activa',
      renovacionFecha: U.addDays(T, 25),
      configuracion: {
        moneda: 'BRL',
        geocercaMetros: 50,
        interesDefault: 20,
        ventaMaxSinLlave: 3000.00,
        gastoMaxSinLlave: 150.00,
        cupoClienteNuevo: 1500.00,
        cajaInicialDefault: 1000.00
      }
    },
    {
      id: 'tenant_2',
      codigo: 'CREDI_RAPIDO',
      nombreEmpresa: 'CrediPronto Brasil Microcréditos',
      nit: '98.765.432/0001-10',
      ciudad: 'Rio de Janeiro, Brasil',
      telefono: '+55 (21) 97654-3210',
      email: 'gerencia@credipronto.com.br',
      planId: 'plan_starter',
      estadoSuscripcion: 'activa',
      renovacionFecha: U.addDays(T, 14),
      configuracion: {
        moneda: 'BRL',
        geocercaMetros: 60,
        interesDefault: 20,
        ventaMaxSinLlave: 2500.00,
        gastoMaxSinLlave: 120.00,
        cupoClienteNuevo: 1200.00,
        cajaInicialDefault: 800.00
      }
    }
  ];

  // Definición de Roles neutros con claves i18n
  const roles = [
    {
      id: 'super_admin',
      key: 'super_admin',
      tenantId: null,
      permisos: ['saas_tenants_manage', 'saas_plans_manage', 'saas_analytics', 'all']
    },
    {
      id: 'tenant_admin',
      key: 'tenant_admin',
      tenantId: 'tenant_1',
      permisos: [
        'recaudo_cobrar', 'recaudo_geocerca_bypass', 'ventas_crear', 'ventas_aprobar',
        'caja_abrir_cerrar', 'caja_modificar_base', 'gastos_registrar', 'gastos_aprobar',
        'rutas_reordenar', 'clientes_modificar_cupo', 'seguridad_usuarios', 'reportes_auditoria'
      ]
    },
    {
      id: 'supervisor',
      key: 'supervisor',
      tenantId: 'tenant_1',
      permisos: [
        'recaudo_cobrar', 'ventas_crear', 'ventas_aprobar', 'gastos_aprobar',
        'rutas_reordenar', 'clientes_modificar_cupo', 'reportes_auditoria'
      ]
    },
    {
      id: 'cobrador',
      key: 'cobrador',
      tenantId: 'tenant_1',
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
      nombre: 'Carlos Eduardo Silveira',
      email: 'gerencia@inversoesalfa.com.br',
      rolId: 'tenant_admin',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    },
    {
      id: 'usr_cob1',
      tenantId: 'tenant_1',
      nombre: 'Carlos Silva',
      email: 'carlos.silva@inversoesalfa.com.br',
      rolId: 'cobrador',
      cobradorId: 'c1',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    },
    {
      id: 'usr_cob2',
      tenantId: 'tenant_1',
      nombre: 'Ana Beatriz Souza',
      email: 'ana.souza@inversoesalfa.com.br',
      rolId: 'cobrador',
      cobradorId: 'c2',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    },
    {
      id: 'usr_cob3',
      tenantId: 'tenant_1',
      nombre: 'Luiz Fernando Santos',
      email: 'luiz.santos@inversoesalfa.com.br',
      rolId: 'cobrador',
      cobradorId: 'c3',
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    }
  ];

  const cobradores = [
    { id: 'c1', tenantId: 'tenant_1', nombre: 'Carlos Silva', zona: 'Rota Norte (São Paulo)', tel: '(11) 98111-2233', color: '#0284c7', base: { x: 80, y: 80 } },
    { id: 'c2', tenantId: 'tenant_1', nombre: 'Ana Beatriz Souza', zona: 'Rota Centro (São Paulo)', tel: '(11) 98222-3344', color: '#9333ea', base: { x: 330, y: 240 } },
    { id: 'c3', tenantId: 'tenant_1', nombre: 'Luiz Fernando Santos', zona: 'Rota Sul (São Paulo)', tel: '(11) 98333-4455', color: '#ea580c', base: { x: 600, y: 480 } }
  ];

  const clientes = [
    { id: 'cl1', tenantId: 'tenant_1', nombre: 'Maria Fernanda Lopes', doc: '123.456.789-01', tel: '(11) 97111-0001', direccion: 'Av. Paulista, 1500', barrio: 'Bela Vista', x: 95, y: 110, cobradorId: 'c1', orden: 1, cupo: 2000.00 },
    { id: 'cl2', tenantId: 'tenant_1', nombre: 'José Antônio Ribeiro', doc: '234.567.890-12', tel: '(11) 97222-0002', direccion: 'Rua Augusta, 420', barrio: 'Consolação', x: 120, y: 140, cobradorId: 'c1', orden: 2, cupo: 2500.00 },
    { id: 'cl3', tenantId: 'tenant_1', nombre: 'Ana Lúcia Torres', doc: '345.678.901-23', tel: '(11) 97333-0003', direccion: 'Rua da Consolação, 850', barrio: 'Centro', x: 145, y: 175, cobradorId: 'c1', orden: 3, cupo: 1800.00 },
    { id: 'cl4', tenantId: 'tenant_1', nombre: 'Pedro Paulo Castro', doc: '456.789.012-34', tel: '(11) 97444-0004', direccion: 'Rua Oscar Freire, 210', barrio: 'Jardins', x: 180, y: 210, cobradorId: 'c1', orden: 4, cupo: 3000.00 },
    { id: 'cl5', tenantId: 'tenant_1', nombre: 'Luzia Mariana Rocha', doc: '567.890.123-45', tel: '(11) 97555-0005', direccion: 'Av. Brigadeiro Faria Lima, 900', barrio: 'Pinheiros', x: 350, y: 260, cobradorId: 'c2', orden: 1, cupo: 2200.00 },
    { id: 'cl6', tenantId: 'tenant_1', nombre: 'Jorge Dias de Oliveira', doc: '678.901.234-56', tel: '(11) 97666-0006', direccion: 'Rua dos Pinheiros, 340', barrio: 'Pinheiros', x: 380, y: 290, cobradorId: 'c2', orden: 2, cupo: 2000.00 },
    { id: 'cl7', tenantId: 'tenant_1', nombre: 'Sandra Milena Vargas', doc: '789.012.345-67', tel: '(11) 97777-0007', direccion: 'Rua Teodoro Sampaio, 780', barrio: 'Pinheiros', x: 410, y: 320, cobradorId: 'c2', orden: 3, cupo: 1900.00 },
    { id: 'cl8', tenantId: 'tenant_1', nombre: 'Oscar Ivan Moreno', doc: '890.123.456-78', tel: '(11) 97888-0008', direccion: 'Av. Santo Amaro, 1200', barrio: 'Santo Amaro', x: 620, y: 500, cobradorId: 'c3', orden: 1, cupo: 2800.00 },
    { id: 'cl9', tenantId: 'tenant_1', nombre: 'Cláudia Patrícia Rios', doc: '901.234.567-89', tel: '(11) 97999-0009', direccion: 'Rua Verbo Divino, 450', barrio: 'Chácara Santo Antônio', x: 660, y: 520, cobradorId: 'c3', orden: 2, cupo: 1800.00 },
    { id: 'cl10', tenantId: 'tenant_1', nombre: 'Fábio André Meireles', doc: '012.345.678-90', tel: '(11) 97000-0010', direccion: 'Av. Engenheiro Luís Carlos Berrini, 1100', barrio: 'Brooklin', x: 690, y: 550, cobradorId: 'c3', orden: 3, cupo: 2200.00 }
  ];

  const creditos = [
    { id: 'cr1', tenantId: 'tenant_1', clienteId: 'cl1', cobradorId: 'c1', monto: 1200.00, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 60.00, valorTotal: 1440.00, estado: 'activo', fecha: U.addDays(T, -10), netoEntregado: 1200.00 },
    { id: 'cr2', tenantId: 'tenant_1', clienteId: 'cl2', cobradorId: 'c1', monto: 2000.00, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 100.00, valorTotal: 2400.00, estado: 'activo', fecha: U.addDays(T, -8), netoEntregado: 2000.00 },
    { id: 'cr3', tenantId: 'tenant_1', clienteId: 'cl3', cobradorId: 'c1', monto: 1000.00, interes: 20, cuotas: 20, frecuencia: 'diario', valorCuota: 60.00, valorTotal: 1200.00, estado: 'activo', fecha: U.addDays(T, -6), netoEntregado: 1000.00 },
    { id: 'cr4', tenantId: 'tenant_1', clienteId: 'cl4', cobradorId: 'c1', monto: 2500.00, interes: 20, cuotas: 30, frecuencia: 'diario', valorCuota: 100.00, valorTotal: 3000.00, estado: 'activo', fecha: U.addDays(T, -4), netoEntregado: 2500.00 },
    { id: 'cr5', tenantId: 'tenant_1', clienteId: 'cl5', cobradorId: 'c2', monto: 1500.00, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 75.00, valorTotal: 1800.00, estado: 'activo', fecha: U.addDays(T, -12), netoEntregado: 1500.00 },
    { id: 'cr6', tenantId: 'tenant_1', clienteId: 'cl6', cobradorId: 'c2', monto: 1800.00, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 90.00, valorTotal: 2160.00, estado: 'activo', fecha: U.addDays(T, -7), netoEntregado: 1800.00 },
    { id: 'cr7', tenantId: 'tenant_1', clienteId: 'cl7', cobradorId: 'c2', monto: 1200.00, interes: 20, cuotas: 20, frecuencia: 'diario', valorCuota: 72.00, valorTotal: 1440.00, estado: 'activo', fecha: U.addDays(T, -5), netoEntregado: 1200.00 },
    { id: 'cr8', tenantId: 'tenant_1', clienteId: 'cl8', cobradorId: 'c3', monto: 2200.00, interes: 20, cuotas: 30, frecuencia: 'diario', valorCuota: 88.00, valorTotal: 2640.00, estado: 'activo', fecha: U.addDays(T, -9), netoEntregado: 2200.00 },
    { id: 'cr9', tenantId: 'tenant_1', clienteId: 'cl9', cobradorId: 'c3', monto: 1400.00, interes: 20, cuotas: 24, frecuencia: 'diario', valorCuota: 70.00, valorTotal: 1680.00, estado: 'activo', fecha: U.addDays(T, -3), netoEntregado: 1400.00 },
    { id: 'cr10', tenantId: 'tenant_1', clienteId: 'cl10', cobradorId: 'c3', monto: 1600.00, interes: 20, cuotas: 25, frecuencia: 'diario', valorCuota: 76.80, valorTotal: 1920.00, estado: 'activo', fecha: U.addDays(T, -15), netoEntregado: 1600.00 }
  ];

  const pagos = [
    { id: 'p1', tenantId: 'tenant_1', creditoId: 'cr1', clienteId: 'cl1', cobradorId: 'c1', valor: 60.00, metodo: 'dinheiro', fecha: `${T}T09:15:00`, recibo: 1001, sync: true, dist: 12 },
    { id: 'p2', tenantId: 'tenant_1', creditoId: 'cr5', clienteId: 'cl5', cobradorId: 'c2', valor: 75.00, metodo: 'pix', fecha: `${T}T10:05:00`, recibo: 1002, sync: true, dist: 8 },
    { id: 'p3', tenantId: 'tenant_1', creditoId: 'cr8', clienteId: 'cl8', cobradorId: 'c3', valor: 88.00, metodo: 'dinheiro', fecha: `${T}T10:45:00`, recibo: 1003, sync: true, dist: 15 }
  ];

  const noPagos = [];
  const gastos = [
    { id: 'g1', tenantId: 'tenant_1', cobradorId: 'c1', concepto: 'Combustível', detalle: 'Abastecimento da moto', valor: 45.00, fecha: `${T}T08:30:00`, estado: 'aprobado' },
    { id: 'g2', tenantId: 'tenant_1', cobradorId: 'c2', concepto: 'Almoço', detalle: 'Refeição em rota', valor: 35.00, fecha: `${T}T12:45:00`, estado: 'aprobado' }
  ];

  const autorizaciones = [
    {
      id: 'aut_1',
      tenantId: 'tenant_1',
      tipo: 'venta',
      cobradorId: 'c1',
      clienteId: 'cl2',
      valor: 3500.00,
      detalle: 'Pré-venda acima do limite para José Antônio Ribeiro (Valor: R$ 3.500, Limite: R$ 2.500)',
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
      valor: 180.00,
      detalle: 'Manutenção de moto · Troca de relação imprevista',
      estado: 'pendiente',
      fecha: `${T}T11:45:00`,
      llave: null
    }
  ];

  const cajas = [
    { id: 'cj_c1', tenantId: 'tenant_1', cobradorId: 'c1', fecha: T, inicial: 1000.00, retiros: [], cierre: null },
    { id: 'cj_c2', tenantId: 'tenant_1', cobradorId: 'c2', fecha: T, inicial: 800.00, retiros: [], cierre: null },
    { id: 'cj_c3', tenantId: 'tenant_1', cobradorId: 'c3', fecha: T, inicial: 1200.00, retiros: [], cierre: null }
  ];

  const audit = [
    {
      id: 'au_1',
      tenantId: 'tenant_1',
      fecha: `${T}T08:00:00`,
      usuario: 'Carlos Silva',
      rol: 'cobrador',
      accion: 'Abertura de rota',
      detalle: 'Início da Rota Norte com fundo de caixa de R$ 1.000,00'
    },
    {
      id: 'au_2',
      tenantId: 'tenant_1',
      fecha: `${T}T09:15:00`,
      usuario: 'Carlos Silva',
      rol: 'cobrador',
      accion: 'Recebimento registrado',
      detalle: 'Parcela de R$ 60,00 de Maria Fernanda Lopes (Recibo #1001)'
    }
  ];

  return {
    version: '2.0.0-vue-saas-dynamic-i18n',
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
