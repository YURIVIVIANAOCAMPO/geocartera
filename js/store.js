/* GeoCartera · capa de datos (simula backend + base local offline) */
(function (GC) {
  const U = GC.U, KEY = 'geocartera_demo_v1';
  const S = (GC.S = { KEY });
  const COLS = ['pagos', 'noPagos', 'creditos', 'gastos', 'autorizaciones', 'clientes', 'audit'];
  let st = null, ver = 0, cache = null, cacheKey = '';

  const sum = (a, f = x => x.valor) => a.reduce((s, x) => s + (f(x) || 0), 0);
  S.sum = sum;

  /* ---------- Persistencia ---------- */
  function persist() { ver++; localStorage.setItem(KEY, JSON.stringify(st)); }
  S.save = persist;
  S.load = function () {
    try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) { st = null; }
    // Los datos de demo se regeneran cada día para que las fechas siempre tengan sentido
    if (!st || st.version !== 1 || st.seedDate !== U.today()) { st = GC.seed(); sessionStorage.removeItem('gc_queue'); persist(); }
    return st;
  };
  S.reset = function () { st = GC.seed(); sessionStorage.removeItem('gc_queue'); persist(); };
  S.reload = function () { try { const n = JSON.parse(localStorage.getItem(KEY)); if (n) { st = n; ver++; } } catch (e) { /* noop */ } };
  S.raw = () => st;

  /* ---------- Sesión (por pestaña) ---------- */
  S.session = () => { try { return JSON.parse(sessionStorage.getItem('gc_session')); } catch (e) { return null; } };
  S.setSession = s => { s ? sessionStorage.setItem('gc_session', JSON.stringify(s)) : sessionStorage.removeItem('gc_session'); ver++; };
  S.isOffline = () => sessionStorage.getItem('gc_offline') === '1';
  S.setOffline = v => sessionStorage.setItem('gc_offline', v ? '1' : '0');
  S.queue = () => { try { return JSON.parse(sessionStorage.getItem('gc_queue') || '[]'); } catch (e) { return []; } };
  S.userName = () => {
    const s = S.session();
    if (!s) return 'Sistema';
    if (s.role === 'admin') return 'Admin General';
    if (s.role === 'cobrador') return (st.cobradores.find(c => c.id === s.id) || {}).nombre || 'Cobrador';
    if (s.role === 'cliente') return (st.clientes.find(c => c.id === s.id) || {}).nombre || 'Cliente';
    return 'Sistema';
  };

  /* Vista de datos: el cobrador ve su base local completa; admin y clientes solo ven lo sincronizado en la "nube" */
  S.db = function () {
    const s = S.session(), role = s ? s.role : 'none', key = ver + '|' + role;
    if (cache && cacheKey === key) return cache;
    if (role === 'cobrador') cache = st;
    else { const v = Object.assign({}, st); COLS.forEach(c => { v[c] = st[c].filter(x => x.sync !== false); }); cache = v; }
    cacheKey = key;
    return cache;
  };

  function track(rec, enqueue = true) {
    if (S.isOffline()) {
      rec.sync = false;
      if (enqueue) { const q = S.queue(); q.push(rec.id); sessionStorage.setItem('gc_queue', JSON.stringify(q)); }
    } else rec.sync = true;
    return rec;
  }
  function audit(accion, detalle) {
    st.audit.unshift(track({ id: U.uid('au'), fecha: new Date().toISOString(), usuario: S.userName(), rol: (S.session() || {}).role || 'sistema', accion, detalle }, false));
    if (st.audit.length > 600) st.audit.length = 600;
  }
  S.audit = (a, d) => { audit(a, d); persist(); };
  S.sync = function () {
    const n = S.queue().length;
    COLS.forEach(c => st[c].forEach(x => { if (x.sync === false) x.sync = true; }));
    sessionStorage.setItem('gc_queue', '[]');
    if (n) audit('Sincronización', `${n} operación(es) sincronizadas desde el dispositivo móvil`);
    persist();
    return n;
  };

  /* ---------- Consultas ---------- */
  S.cobrador = id => st.cobradores.find(c => c.id === id);
  S.cliente = id => S.db().clientes.find(c => c.id === id) || st.clientes.find(c => c.id === id);
  S.creditoActivo = clId => S.db().creditos.find(c => c.clienteId === clId && c.estado === 'activo');
  S.ultimoCredito = clId => S.db().creditos.filter(c => c.clienteId === clId && c.estado !== 'rechazado' && c.estado !== 'pendiente').sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  S.pagosDe = crId => S.db().pagos.filter(p => p.creditoId === crId);
  S.pagado = cr => sum(S.pagosDe(cr.id));
  S.saldo = cr => Math.max(0, cr.valorTotal - S.pagado(cr));
  S.cuotasPagadas = cr => Math.min(cr.cuotas, Math.floor(S.pagado(cr) / cr.valorCuota));
  const saldoRaw = cr => Math.max(0, cr.valorTotal - sum(st.pagos.filter(p => p.creditoId === cr.id)));

  S.diasAtraso = function (cr) {
    if (cr.estado !== 'activo') return 0;
    const per = GC.FREQ[cr.frecuencia].dias, days = U.daysBetween(cr.fecha, U.today());
    if (days <= 0) return 0;
    const vencidas = Math.min(cr.cuotas, Math.floor((days - 1) / per)); // la cuota de hoy aún no es atraso
    const deficit = vencidas * cr.valorCuota - S.pagado(cr);
    return deficit <= 0 ? 0 : Math.ceil(deficit / cr.valorCuota) * per;
  };
  S.debeHoy = function (cr) {
    if (cr.estado !== 'activo') return false;
    const T = U.today(), per = GC.FREQ[cr.frecuencia].dias, days = U.daysBetween(cr.fecha, T);
    if (days <= 0) return false;
    const esperado = Math.min(cr.cuotas, Math.floor(days / per)) * cr.valorCuota;
    const previo = sum(S.pagosDe(cr.id).filter(p => U.dayOf(p.fecha) < T));
    return previo < esperado;
  };
  S.proximaCuota = function (cr) {
    const per = GC.FREQ[cr.frecuencia].dias, k = S.cuotasPagadas(cr) + 1;
    if (k > cr.cuotas) return null;
    return { fecha: U.addDays(cr.fecha, k * per), valor: Math.min(cr.valorCuota, S.saldo(cr)), numero: k };
  };
  S.saldoDespuesDe = function (p) {
    const cr = S.db().creditos.find(c => c.id === p.creditoId) || st.creditos.find(c => c.id === p.creditoId);
    const pagado = sum(S.db().pagos.filter(x => x.creditoId === p.creditoId && x.fecha <= p.fecha));
    return Math.max(0, cr.valorTotal - pagado);
  };

  S.estadoHoy = function (clId) {
    const d = S.db(), T = U.today();
    if (d.pagos.some(p => p.clienteId === clId && p.metodo !== 'renovacion' && U.dayOf(p.fecha) === T)) return 'pagado';
    if (d.noPagos.some(n => n.clienteId === clId && U.dayOf(n.fecha) === T)) return 'nopago';
    if (d.autorizaciones.some(a => a.clienteId === clId && a.estado === 'pendiente' && (a.tipo === 'fuera_geocerca' || a.tipo === 'pago_adelantado'))) return 'espera';
    return 'pendiente';
  };

  S.ruta = function (cid, modo = 'hoy') {
    const d = S.db(), items = [];
    d.clientes.filter(c => c.cobradorId === cid).forEach(cl => {
      const estado = S.estadoHoy(cl.id);
      let cr = d.creditos.find(c => c.clienteId === cl.id && c.estado === 'activo');
      if (!cr) {
        if (estado !== 'pagado') return;
        cr = S.ultimoCredito(cl.id);
        if (!cr) return;
      }
      const debe = S.debeHoy(cr);
      if (modo === 'hoy' && !debe && estado === 'pendiente') return;
      items.push({ cl, cr, estado, debe, saldo: S.saldo(cr), atraso: S.diasAtraso(cr) });
    });
    return items.sort((a, b) => a.cl.orden - b.cl.orden);
  };
  S.cobradoHoy = cid => { const T = U.today(); return sum(S.db().pagos.filter(p => p.cobradorId === cid && p.metodo !== 'renovacion' && U.dayOf(p.fecha) === T)); };
  S.metaHoy = cid => sum(S.ruta(cid, 'hoy'), i => i.cr.valorCuota);
  S.visitasHoy = function (cid) {
    const d = S.db(), T = U.today();
    const ev = [];
    d.pagos.forEach(p => { if (p.cobradorId === cid && p.metodo !== 'renovacion' && U.dayOf(p.fecha) === T) ev.push({ tipo: 'pago', clienteId: p.clienteId, fecha: p.fecha, valor: p.valor }); });
    d.noPagos.forEach(n => { if (n.cobradorId === cid && U.dayOf(n.fecha) === T) ev.push({ tipo: 'nopago', clienteId: n.clienteId, fecha: n.fecha, motivo: n.motivo }); });
    return ev.sort((a, b) => a.fecha.localeCompare(b.fecha));
  };
  S.posicion = function (cid) {
    const v = S.visitasHoy(cid), cob = S.cobrador(cid);
    if (!v.length) return cob.base;
    const cl = S.cliente(v[v.length - 1].clienteId);
    return { x: cl.x + 10, y: cl.y - 10 };
  };
  S.trail = cid => [S.cobrador(cid).base].concat(S.visitasHoy(cid).map(v => { const c = S.cliente(v.clienteId); return { x: c.x, y: c.y }; }));

  S.caja = function (cid, T = U.today()) {
    const d = S.db();
    const caja = d.cajas.find(c => c.cobradorId === cid && c.fecha === T) || { inicial: 0, retiros: [], cierre: null };
    const ph = d.pagos.filter(p => p.cobradorId === cid && U.dayOf(p.fecha) === T);
    const efectivo = sum(ph.filter(p => p.metodo === 'efectivo'));
    const electronico = sum(ph.filter(p => p.metodo !== 'efectivo' && p.metodo !== 'renovacion'));
    const ventasL = d.creditos.filter(c => c.cobradorId === cid && c.fechaDesembolso === T && ['activo', 'pagado', 'renovado'].includes(c.estado));
    const ventas = sum(ventasL, c => c.netoEntregado);
    const gastosL = d.gastos.filter(g => g.cobradorId === cid && U.dayOf(g.fecha) === T);
    const gastos = sum(gastosL.filter(g => g.estado === 'aprobado'));
    const retiros = sum(caja.retiros || []);
    return { caja, inicial: caja.inicial, efectivo, electronico, ventas, ventasL, gastos, gastosL, retiros,
      nEfectivo: ph.filter(p => p.metodo === 'efectivo').length, esperado: caja.inicial + efectivo - ventas - gastos - retiros };
  };

  S.distRuta = function (cid, list) {
    let p = S.cobrador(cid).base, dd = 0;
    list.forEach(c => { dd += U.dist(p, c); p = c; });
    return dd * GC.METROS_POR_UNIDAD / 1000;
  };

  /* ---------- Comandos ---------- */
  function solicitar(tipo, { clienteId = null, valor = 0, detalle, payload = null, refId = null }) {
    const s = S.session();
    const a = track({ id: U.uid('a'), tipo, cobradorId: s && s.role === 'cobrador' ? s.id : null, clienteId, valor, detalle, payload, refId,
      estado: 'pendiente', fecha: new Date().toISOString(), llave: null });
    st.autorizaciones.unshift(a);
    audit('Solicitud de autorización', `${GC.TIPOS_AUT[tipo]}: ${detalle}`);
    return a;
  }

  function aplicarPago({ creditoId, valor, metodo, dist }) {
    const cr = st.creditos.find(c => c.id === creditoId), cl = st.clientes.find(c => c.id === cr.clienteId);
    const antes = saldoRaw(cr);
    const p = track({ id: U.uid('p'), creditoId, clienteId: cr.clienteId, cobradorId: cr.cobradorId, valor, metodo,
      fecha: new Date().toISOString(), dist: dist ?? null, recibo: st.seqRecibo++ });
    st.pagos.push(p);
    if (antes - valor <= 0) cr.estado = 'pagado';
    audit('Registro de abono', `${cl.nombre}: ${U.money(valor)} (${GC.METODOS[metodo]})${antes - valor <= 0 ? ' · crédito cancelado' : ''}`);
    return p;
  }

  S.registrarPago = function ({ creditoId, valor, metodo, dist }) {
    const cr = st.creditos.find(c => c.id === creditoId);
    if (!cr) return { error: 'Crédito no encontrado' };
    valor = Math.round(+valor);
    if (!(valor > 0)) return { error: 'Ingresa un valor válido' };
    const saldo = saldoRaw(cr), cfg = st.config, cl = st.clientes.find(c => c.id === cr.clienteId);
    if (valor > saldo) return { error: `El valor supera el saldo pendiente (${U.money(saldo)})` };
    const payload = { creditoId, valor, metodo, dist };
    if (dist > cfg.geocercaMetros) {
      const a = solicitar('fuera_geocerca', { clienteId: cl.id, valor, payload, detalle: `Cobro a ${cl.nombre} a ${dist} m del domicilio (límite ${cfg.geocercaMetros} m)` });
      persist();
      return { pendiente: a };
    }
    if (valor > cfg.cuotasAdelantoMax * cr.valorCuota) {
      const a = solicitar('pago_adelantado', { clienteId: cl.id, valor, payload, detalle: `Pago adelantado de ${cl.nombre} por ${U.money(valor)} (${Math.round(valor / cr.valorCuota)} cuotas)` });
      persist();
      return { pendiente: a };
    }
    const p = aplicarPago(payload);
    persist();
    return { pago: p };
  };

  S.registrarNoPago = function ({ clienteId, motivo, nota, dist }) {
    const cl = st.clientes.find(c => c.id === clienteId);
    if (dist > st.config.geocercaMetros) return { error: `Para reportar "no pago" debes estar a menos de ${st.config.geocercaMetros} m del domicilio` };
    st.noPagos.push(track({ id: U.uid('np'), clienteId, cobradorId: cl.cobradorId, motivo, nota, dist, fecha: new Date().toISOString() }));
    audit('Cliente no pagó', `${cl.nombre}: ${motivo}${nota ? ' · ' + nota : ''} (GPS ${dist} m)`);
    persist();
    return { ok: true };
  };

  function activarCredito(cr) {
    cr.estado = 'activo';
    cr.fecha = U.today();
    cr.fechaDesembolso = U.today();
    cr.creadoAt = new Date().toISOString();
    if (cr.creditoAnterior) {
      const prev = st.creditos.find(c => c.id === cr.creditoAnterior);
      if (prev && prev.estado === 'activo') {
        const sp = saldoRaw(prev);
        if (sp > 0) st.pagos.push(track({ id: U.uid('p'), creditoId: prev.id, clienteId: prev.clienteId, cobradorId: prev.cobradorId, valor: sp, metodo: 'renovacion', fecha: new Date().toISOString(), dist: null }, false));
        prev.estado = 'renovado';
        cr.netoEntregado = cr.monto - sp;
      }
    }
    const cl = st.clientes.find(c => c.id === cr.clienteId);
    audit('Venta registrada', `${cr.tipo === 'nuevo' ? 'Cliente nuevo' : 'Renovación'} · ${cl.nombre}: ${U.money(cr.monto)} a ${cr.cuotas} cuotas (${GC.FREQ[cr.frecuencia].label.toLowerCase()}), entrega ${U.money(cr.netoEntregado)}`);
  }

  S.crearVenta = function (f) {
    const s = S.session(), cfg = st.config;
    let cl, nuevo = false;
    if (f.tipo === 'nuevo') {
      if (!f.nombre || !f.doc) return { error: 'Nombre y documento son obligatorios' };
      if (st.clientes.some(c => c.doc === String(f.doc).trim())) return { error: 'Ya existe un cliente con ese documento' };
      const propios = st.clientes.filter(c => c.cobradorId === s.id);
      const ref = propios[Math.floor(Math.random() * propios.length)] || S.cobrador(s.id).base;
      cl = track({ id: U.uid('cl'), nombre: f.nombre.trim(), doc: String(f.doc).trim(), tel: (f.tel || '').trim(), direccion: (f.direccion || 'Sin dirección').trim(),
        barrio: (f.barrio || '—').trim(), x: Math.round(Math.min(980, Math.max(20, ref.x + (Math.random() * 80 - 40)))), y: Math.round(Math.min(580, Math.max(20, ref.y + (Math.random() * 60 - 30)))),
        cobradorId: s.id, orden: propios.length + 1, cupo: cfg.cupoClienteNuevo, creado: U.today(), perfil: 0.9 });
      st.clientes.push(cl);
      nuevo = true;
    } else {
      cl = st.clientes.find(c => c.id === f.clienteId);
      if (!cl) return { error: 'Selecciona un cliente' };
      if (st.creditos.some(c => c.clienteId === cl.id && c.estado === 'pendiente')) return { error: 'Este cliente ya tiene una pre-venta esperando aprobación' };
    }
    const monto = Math.round(+f.monto), interes = +f.interes, cuotas = parseInt(f.cuotas, 10);
    if (!(monto >= 50000)) return { error: 'El monto mínimo es $ 50.000' };
    if (!(cuotas > 0)) return { error: 'Número de cuotas inválido' };
    const { cuota } = GC.calcCredito(monto, interes, cuotas);
    const previo = st.creditos.find(c => c.clienteId === cl.id && c.estado === 'activo');
    const saldoPrevio = previo ? saldoRaw(previo) : 0;
    if (saldoPrevio >= monto) return { error: `El monto debe superar el saldo pendiente (${U.money(saldoPrevio)})` };
    const cr = track({ id: U.uid('cr'), clienteId: cl.id, cobradorId: cl.cobradorId, monto, interes, cuotas, frecuencia: f.frecuencia, valorCuota: cuota, valorTotal: cuota * cuotas,
      fecha: U.today(), fechaDesembolso: null, tipo: nuevo ? 'nuevo' : 'renovacion', estado: 'pendiente', netoEntregado: monto - saldoPrevio, creditoAnterior: previo ? previo.id : null, creadoAt: new Date().toISOString() });
    st.creditos.push(cr);
    if (monto > cl.cupo || monto > cfg.ventaMaxSinLlave) {
      const a = solicitar('venta', { clienteId: cl.id, valor: monto, refId: cr.id, detalle: `${nuevo ? 'Venta a cliente nuevo' : 'Renovación'} ${cl.nombre}: ${U.money(monto)} a ${cuotas} cuotas (cupo ${U.money(cl.cupo)})` });
      persist();
      return { pendiente: a, credito: cr };
    }
    activarCredito(cr);
    persist();
    return { credito: cr };
  };

  S.registrarGasto = function ({ concepto, detalle, valor }) {
    const s = S.session();
    valor = Math.round(+valor);
    if (!(valor > 0)) return { error: 'Ingresa un valor válido' };
    const req = valor > st.config.gastoMaxSinLlave;
    const g = track({ id: U.uid('g'), cobradorId: s.id, concepto, detalle, valor, fecha: new Date().toISOString(), estado: req ? 'pendiente' : 'aprobado' });
    st.gastos.push(g);
    if (req) {
      const a = solicitar('gasto', { valor, refId: g.id, detalle: `${concepto}${detalle ? ' · ' + detalle : ''}` });
      persist();
      return { pendiente: a };
    }
    audit('Gasto registrado', `${concepto}${detalle ? ' · ' + detalle : ''}: ${U.money(valor)}`);
    persist();
    return { gasto: g };
  };

  S.solicitarAmpliacion = function (clienteId, cupo, motivo) {
    const cl = st.clientes.find(c => c.id === clienteId);
    const a = solicitar('ampliacion_cupo', { clienteId, valor: cupo, payload: { clienteId, cupo }, detalle: `Ampliar cupo de ${cl.nombre} de ${U.money(cl.cupo)} a ${U.money(cupo)}${motivo ? ' · ' + motivo : ''}` });
    persist();
    return a;
  };

  S.resolver = function (id, aprobar, nota = '') {
    const a = st.autorizaciones.find(x => x.id === id);
    if (!a || a.estado !== 'pendiente') return null;
    a.estado = aprobar ? 'aprobada' : 'rechazada';
    a.llave = aprobar ? U.llave() : null;
    a.resueltoPor = S.userName();
    a.resueltoFecha = new Date().toISOString();
    a.nota = nota;
    if (a.tipo === 'venta') {
      const cr = st.creditos.find(c => c.id === a.refId);
      if (cr) { if (aprobar) activarCredito(cr); else cr.estado = 'rechazado'; }
    } else if (a.tipo === 'gasto') {
      const g = st.gastos.find(x => x.id === a.refId);
      if (g) g.estado = aprobar ? 'aprobado' : 'rechazado';
    } else if ((a.tipo === 'fuera_geocerca' || a.tipo === 'pago_adelantado') && aprobar && a.payload) {
      const cr = st.creditos.find(c => c.id === a.payload.creditoId);
      if (cr && a.payload.valor <= saldoRaw(cr)) a.pagoId = aplicarPago(a.payload).id;
    } else if (a.tipo === 'ampliacion_cupo' && aprobar && a.payload) {
      const cl = st.clientes.find(c => c.id === a.payload.clienteId);
      if (cl) cl.cupo = a.payload.cupo;
    }
    audit(aprobar ? 'Autorización aprobada' : 'Autorización rechazada', `${GC.TIPOS_AUT[a.tipo]} · ${a.detalle}${aprobar ? ' · Llave ' + a.llave : ''}${nota ? ' · ' + nota : ''}`);
    persist();
    return a;
  };

  S.setCupo = function (clienteId, cupo) {
    const cl = st.clientes.find(c => c.id === clienteId);
    audit('Cupo modificado', `${cl.nombre}: ${U.money(cl.cupo)} → ${U.money(cupo)}`);
    cl.cupo = cupo;
    persist();
  };

  S.mover = function (clId, dir) {
    const cl = st.clientes.find(c => c.id === clId);
    const list = st.clientes.filter(c => c.cobradorId === cl.cobradorId).sort((a, b) => a.orden - b.orden);
    const i = list.indexOf(cl), j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    list.forEach((c, k) => { c.orden = k + 1; });
    audit('Ruta reordenada', `${cl.nombre} pasa a la posición ${j + 1} en la ruta de ${S.cobrador(cl.cobradorId).nombre}`);
    persist();
  };

  S.optimizar = function (cid) {
    const list = st.clientes.filter(c => c.cobradorId === cid).sort((a, b) => a.orden - b.orden);
    const antes = S.distRuta(cid, list);
    // 1) Vecino más cercano desde la base del cobrador
    const rest = list.slice(), out = [];
    let p = S.cobrador(cid).base;
    while (rest.length) {
      let bi = 0, bd = Infinity;
      rest.forEach((c, i) => { const d = U.dist(p, c); if (d < bd) { bd = d; bi = i; } });
      p = rest[bi];
      out.push(rest.splice(bi, 1)[0]);
    }
    // 2) Mejora 2-opt
    let improved = true, guard = 0;
    while (improved && guard++ < 50) {
      improved = false;
      for (let i = 0; i < out.length - 1; i++) for (let k = i + 1; k < out.length; k++) {
        const cand = out.slice(0, i).concat(out.slice(i, k + 1).reverse(), out.slice(k + 1));
        if (S.distRuta(cid, cand) + 1e-9 < S.distRuta(cid, out)) { out.splice(0, out.length, ...cand); improved = true; }
      }
    }
    out.forEach((c, k) => { c.orden = k + 1; });
    const despues = S.distRuta(cid, out);
    audit('Ruta optimizada', `${S.cobrador(cid).nombre}: ${antes.toFixed(1)} km → ${despues.toFixed(1)} km`);
    persist();
    return { antes, despues };
  };

  S.cerrarCaja = function (cid, contado) {
    const c = st.cajas.find(x => x.cobradorId === cid && x.fecha === U.today());
    const info = S.caja(cid);
    contado = Math.round(+contado);
    c.cierre = { contado, esperado: info.esperado, diferencia: contado - info.esperado, hora: new Date().toISOString() };
    audit('Cierre de caja', `${S.cobrador(cid).nombre}: esperado ${U.money(info.esperado)}, contado ${U.money(contado)}, diferencia ${U.money(c.cierre.diferencia)}`);
    persist();
    return c.cierre;
  };
  S.reabrirCaja = function (cid) {
    const c = st.cajas.find(x => x.cobradorId === cid && x.fecha === U.today());
    if (c) { c.cierre = null; audit('Caja reabierta', S.cobrador(cid).nombre); persist(); }
  };
  S.retiro = function (cid, valor, nota) {
    const c = st.cajas.find(x => x.cobradorId === cid && x.fecha === U.today());
    c.retiros.push({ id: U.uid('rt'), valor: Math.round(valor), nota, fecha: new Date().toISOString() });
    audit('Entrega / retiro de caja', `${S.cobrador(cid).nombre}: ${U.money(valor)}${nota ? ' · ' + nota : ''}`);
    persist();
  };
  S.setInicial = function (cid, valor) {
    const c = st.cajas.find(x => x.cobradorId === cid && x.fecha === U.today());
    audit('Base de caja modificada', `${S.cobrador(cid).nombre}: ${U.money(c.inicial)} → ${U.money(valor)}`);
    c.inicial = Math.round(valor);
    persist();
  };
  S.setConfig = function (d) {
    Object.keys(st.config).forEach(k => { if (d[k] !== undefined && d[k] !== '') st.config[k] = Number(d[k]); });
    audit('Configuración actualizada', Object.entries(st.config).map(([k, v]) => `${k}=${v}`).join(', '));
    persist();
  };
})(window.GC);

