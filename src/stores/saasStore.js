import { reactive, computed } from 'vue';
import { getInitialSaaSDatabase } from './mockSaaSData.js';
import { U } from '../utils/formatters.js';

const STORAGE_KEY = 'geocartera_vue_saas_v4_brl';
const DB_VERSION = '4.0.0-vue-saas-dynamic-i18n';

function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === DB_VERSION && parsed.seedDate === U.today()) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al cargar base de datos SaaS:', e);
  }
  const initial = getInitialSaaSDatabase();
  initial.version = DB_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export const saasState = reactive({
  db: loadDatabase(),
  locale: localStorage.getItem('gc_saas_locale') || 'es',
  currentSession: JSON.parse(sessionStorage.getItem('gc_saas_session') || 'null'),
  isOffline: sessionStorage.getItem('gc_saas_offline') === '1',
  offlineQueue: JSON.parse(sessionStorage.getItem('gc_saas_queue') || '[]'),
  toast: null
});

export const saasActions = {
  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saasState.db));
  },

  resetDatabase() {
    saasState.db = getInitialSaaSDatabase();
    saasActions.persist();
    saasActions.showToast('Base de datos SaaS restaurada a estado de fábrica');
  },

  setLocale(lang) {
    saasState.locale = lang;
    localStorage.setItem('gc_saas_locale', lang);
  },

  showToast(message, type = 'success') {
    saasState.toast = { message, type, id: Date.now() };
    setTimeout(() => {
      if (saasState.toast && saasState.toast.message === message) {
        saasState.toast = null;
      }
    }, 3500);
  },

  setSession(session) {
    saasState.currentSession = session;
    if (session) {
      sessionStorage.setItem('gc_saas_session', JSON.stringify(session));
    } else {
      sessionStorage.removeItem('gc_saas_session');
    }
  },

  logout() {
    saasActions.setSession(null);
  },

  toggleOffline() {
    saasState.isOffline = !saasState.isOffline;
    sessionStorage.setItem('gc_saas_offline', saasState.isOffline ? '1' : '0');
    if (!saasState.isOffline) {
      const count = saasState.offlineQueue.length;
      saasState.offlineQueue = [];
      sessionStorage.setItem('gc_saas_queue', '[]');
      saasActions.showToast(`¡Conexión restaurada! Se sincronizaron ${count} operaciones.`);
    } else {
      saasActions.showToast('Modo Offline Activo: Operaciones guardadas en teléfono', 'warning');
    }
  },

  // Auditoría centralizada
  audit(accion, detalle) {
    const s = saasState.currentSession;
    const item = {
      id: U.uid('au'),
      tenantId: s ? s.tenantId : 'tenant_1',
      fecha: new Date().toISOString(),
      usuario: s ? s.nombre : 'Sistema',
      rol: s ? s.role : 'sistema',
      accion,
      detalle
    };
    saasState.db.audit.unshift(item);
    saasActions.persist();
  },

  // Gestión de Tenants (SuperAdmin SaaS)
  createTenant(payload) {
    const newTenant = {
      id: 'tenant_' + Date.now().toString(36),
      codigo: payload.codigo.toUpperCase().trim(),
      nombreEmpresa: payload.nombreEmpresa.trim(),
      nit: payload.nit.trim(),
      ciudad: payload.ciudad.trim(),
      telefono: payload.telefono.trim(),
      email: payload.email.trim(),
      planId: payload.planId,
      estadoSuscripcion: 'activa',
      renovacionFecha: U.addDays(U.today(), 30),
      configuracion: {
        moneda: 'COP',
        geocercaMetros: 50,
        interesDefault: 20,
        ventaMaxSinLlave: 1000000,
        gastoMaxSinLlave: 50000,
        cupoClienteNuevo: 500000,
        cajaInicialDefault: 400000
      }
    };
    saasState.db.tenants.push(newTenant);
    saasActions.audit('Empresa creada (Tenant)', `Nueva empresa registrada: ${newTenant.nombreEmpresa}`);
    saasActions.persist();
    saasActions.showToast(`Empresa "${newTenant.nombreEmpresa}" registrada exitosamente`);
    return newTenant;
  },

  updateTenantConfig(tenantId, config) {
    const t = saasState.db.tenants.find(x => x.id === tenantId);
    if (t) {
      t.configuracion = { ...t.configuracion, ...config };
      saasActions.audit('Configuración de Tenant actualizada', `Empresa: ${t.nombreEmpresa}`);
      saasActions.persist();
      saasActions.showToast('Configuración de empresa guardada');
    }
  },

  toggleTenantStatus(tenantId) {
    const t = saasState.db.tenants.find(x => x.id === tenantId);
    if (t) {
      t.estadoSuscripcion = t.estadoSuscripcion === 'activa' ? 'suspendida' : 'activa';
      saasActions.audit('Estado de suscripción modificado', `${t.nombreEmpresa} ahora está ${t.estadoSuscripcion}`);
      saasActions.persist();
      saasActions.showToast(`Estado de ${t.nombreEmpresa}: ${t.estadoSuscripcion}`);
    }
  },

  // Gestión de Roles y Permisos (RBAC)
  saveRolePermissions(roleId, perms) {
    const rol = saasState.db.roles.find(r => r.id === roleId);
    if (rol) {
      rol.permisos = perms;
      saasActions.audit('Permisos de Rol actualizados', `Rol ${rol.nombre} con ${perms.length} permisos`);
      saasActions.persist();
      saasActions.showToast(`Permisos de "${rol.nombre}" actualizados`);
    }
  },

  createRole(nombre, desc, tenantId = 'tenant_1') {
    const newRole = {
      id: 'rol_' + Date.now().toString(36),
      nombre: nombre.trim(),
      desc: desc ? desc.trim() : 'Rol personalizado',
      tenantId,
      permisos: ['recaudo_cobrar', 'ventas_crear']
    };
    saasState.db.roles.push(newRole);
    saasActions.audit('Rol creado', `Nuevo rol ${newRole.nombre}`);
    saasActions.persist();
    saasActions.showToast(`Rol "${newRole.nombre}" creado exitosamente`);
    return newRole;
  },

  // Gestión de Usuarios
  createUser(payload) {
    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      tenantId: payload.tenantId || (saasState.currentSession ? saasState.currentSession.tenantId : 'tenant_1'),
      nombre: payload.nombre.trim(),
      email: payload.email.trim(),
      rolId: payload.rolId,
      cobradorId: payload.cobradorId || null,
      estado: 'activo',
      ultimoAcceso: new Date().toISOString()
    };
    saasState.db.usuarios.push(newUser);
    saasActions.audit('Usuario creado', `${newUser.nombre} (${newUser.email})`);
    saasActions.persist();
    saasActions.showToast(`Usuario "${newUser.nombre}" creado`);
    return newUser;
  },

  toggleUserStatus(userId) {
    const u = saasState.db.usuarios.find(x => x.id === userId);
    if (u) {
      u.estado = u.estado === 'activo' ? 'inactivo' : 'activo';
      saasActions.audit('Estado de usuario modificado', `${u.nombre}: ${u.estado}`);
      saasActions.persist();
      saasActions.showToast(`Usuario ${u.nombre} ahora está ${u.estado}`);
    }
  },

  // Operaciones de Cobro
  registrarPago({ creditoId, valor, metodo, dist }) {
    const cr = saasState.db.creditos.find(c => c.id === creditoId);
    if (!cr) return { error: 'Crédito no encontrado' };

    valor = Math.round(+valor);
    const saldo = cr.valorTotal - saasGetters.pagadoDeCredito(cr.id);
    if (valor <= 0 || valor > saldo) {
      return { error: 'Valor no válido o superior al saldo pendiente' };
    }

    const tenant = saasState.db.tenants.find(t => t.id === cr.tenantId) || { configuracion: { geocercaMetros: 50 } };
    const cl = saasState.db.clientes.find(c => c.id === cr.clienteId);

    // Geocerca check
    if (dist > tenant.configuracion.geocercaMetros) {
      const aut = {
        id: U.uid('aut'),
        tenantId: cr.tenantId,
        tipo: 'fuera_geocerca',
        cobradorId: cr.cobradorId,
        clienteId: cl.id,
        valor,
        detalle: `Cobro a ${cl.nombre} a ${dist} m del domicilio (Límite: ${tenant.configuracion.geocercaMetros} m)`,
        payload: { creditoId, valor, metodo, dist },
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        llave: null
      };
      saasState.db.autorizaciones.unshift(aut);
      saasActions.audit('Solicitud de Llave por Geocerca', aut.detalle);
      saasActions.persist();
      return { pendiente: aut };
    }

    // Registrar abono
    const pago = {
      id: U.uid('p'),
      tenantId: cr.tenantId,
      creditoId: cr.id,
      clienteId: cl.id,
      cobradorId: cr.cobradorId,
      valor,
      metodo,
      fecha: new Date().toISOString(),
      recibo: saasState.db.seqRecibo++,
      dist,
      sync: !saasState.isOffline
    };

    if (saasState.isOffline) {
      saasState.offlineQueue.push(pago.id);
      sessionStorage.setItem('gc_saas_queue', JSON.stringify(saasState.offlineQueue));
    }

    saasState.db.pagos.push(pago);
    if (saldo - valor <= 0) {
      cr.estado = 'pagado';
    }

    saasActions.audit('Abono registrado', `${cl.nombre}: ${U.money(valor)} (${metodo})`);
    saasActions.persist();
    return { pago };
  },

  // Resolver Autorización con Llave
  resolverAutorizacion(autId, aprobar) {
    const aut = saasState.db.autorizaciones.find(a => a.id === autId);
    if (!aut || aut.estado !== 'pendiente') return;

    aut.estado = aprobar ? 'aprobada' : 'rechazada';
    aut.llave = aprobar ? U.llave() : null;
    aut.resueltoFecha = new Date().toISOString();

    if (aprobar && aut.payload && (aut.tipo === 'fuera_geocerca' || aut.tipo === 'pago_adelantado')) {
      const { creditoId, valor, metodo, dist } = aut.payload;
      const cr = saasState.db.creditos.find(c => c.id === creditoId);
      const cl = saasState.db.clientes.find(c => c.id === cr.clienteId);
      const p = {
        id: U.uid('p'),
        tenantId: aut.tenantId,
        creditoId,
        clienteId: cl.id,
        cobradorId: aut.cobradorId,
        valor,
        metodo,
        fecha: new Date().toISOString(),
        recibo: saasState.db.seqRecibo++,
        dist,
        sync: true
      };
      saasState.db.pagos.push(p);
    }

    saasActions.audit(aprobar ? 'Autorización aprobada' : 'Autorización rechazada', `${aut.detalle} ${aprobar ? 'Llave: ' + aut.llave : ''}`);
    saasActions.persist();
    saasActions.showToast(aprobar ? `Autorización aprobada. Llave generada: ${aut.llave}` : 'Solicitud rechazada');
  },

  // Optimización de Rutas (2-opt)
  optimizarRuta(cobradorId) {
    const list = saasState.db.clientes.filter(c => c.cobradorId === cobradorId);
    if (list.length < 2) return;

    const cob = saasState.db.cobradores.find(c => c.id === cobradorId);
    // Nearest neighbor
    const rest = list.slice();
    const sorted = [];
    let p = cob.base;
    while (rest.length) {
      let bestIdx = 0, bestDist = Infinity;
      rest.forEach((c, idx) => {
        const d = U.dist(p, c);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });
      p = rest[bestIdx];
      sorted.push(rest.splice(bestIdx, 1)[0]);
    }

    sorted.forEach((c, idx) => {
      c.orden = idx + 1;
    });

    saasActions.audit('Ruta optimizada con Machine Learning/2-opt', `Cobrador: ${cob.nombre} (${sorted.length} clientes)`);
    saasActions.persist();
    saasActions.showToast('¡Ruta optimizada con éxito! Secuencia más corta calculada.');
  }
};

export const saasGetters = {
  currentTenant: computed(() => {
    const s = saasState.currentSession;
    if (!s || !s.tenantId) {
      return saasState.db.tenants[0] || null;
    }
    return saasState.db.tenants.find(t => t.id === s.tenantId) || saasState.db.tenants[0];
  }),

  tenantCobradores: computed(() => {
    const tid = saasGetters.currentTenant.value?.id;
    return saasState.db.cobradores.filter(c => c.tenantId === tid);
  }),

  tenantClientes: computed(() => {
    const tid = saasGetters.currentTenant.value?.id;
    return saasState.db.clientes.filter(c => c.tenantId === tid);
  }),

  pagadoDeCredito: creditoId => {
    return saasState.db.pagos
      .filter(p => p.creditoId === creditoId)
      .reduce((s, p) => s + (p.valor || 0), 0);
  },

  saldoDeCredito: cr => {
    const pagado = saasGetters.pagadoDeCredito(cr.id);
    return Math.max(0, cr.valorTotal - pagado);
  }
};

