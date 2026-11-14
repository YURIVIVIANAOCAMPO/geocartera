/* GeoCartera · componentes de interfaz */
(function (GC) {
  const U = GC.U;
  const UI = (GC.UI = {});

  const P = {
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M16 7l3 3M14 9l2 2"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0"/><circle cx="12" cy="19.5" r="1"/>',
    wifioff: '<path d="M2 2l20 20M8.5 16a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 5-2.7M19 12.5a10 10 0 0 0-2.4-1.8M2 9a15 15 0 0 1 4.2-2.6M22 9a15 15 0 0 0-11-3.9"/><circle cx="12" cy="19.5" r="1"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    msg: '<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/>',
    receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  };
  UI.icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  GC.logo = () => `<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#0f766e"/><path d="M16 6.5a7.2 7.2 0 0 0-7.2 7.2c0 5.4 7.2 11.8 7.2 11.8s7.2-6.4 7.2-11.8A7.2 7.2 0 0 0 16 6.5z" fill="#fff"/><text x="16" y="17.2" text-anchor="middle" font-size="9" font-weight="800" fill="#0f766e" font-family="Arial,sans-serif">$</text></svg>`;
  GC.wa = (tel, text) => `https://wa.me/57${String(tel || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  GC.simGPS = pDentro => (Math.random() < pDentro ? 4 + Math.floor(Math.random() * 42) : 60 + Math.floor(Math.random() * 240));

  /* ---------- Modal / hoja inferior ---------- */
  const modalRoot = () => document.getElementById('modal-root');
  UI.modal = (html, opts = {}) => {
    const root = modalRoot();
    const already = !!root.firstChild;
    root.innerHTML = `<div class="modal-backdrop ${already ? 'open' : ''}" data-action="close-modal-bg"><div class="modal ${opts.wide ? 'modal-wide' : ''} ${opts.small ? 'modal-small' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
    document.body.classList.add('no-scroll');
    if (!already) requestAnimationFrame(() => root.firstChild && root.firstChild.classList.add('open'));
  };
  UI.closeModal = () => {
    modalRoot().innerHTML = '';
    document.body.classList.remove('no-scroll');
    if (GC.pendingRender) { GC.pendingRender = false; GC.render(); }
  };
  UI.isModalOpen = () => !!modalRoot().firstChild;
  UI.modalHeader = (title, sub = '') => `<div class="modal-head"><div><h3>${title}</h3>${sub ? `<p class="muted small">${sub}</p>` : ''}</div><button class="icon-btn" data-action="close-modal" aria-label="Cerrar">${UI.icon('x')}</button></div>`;
  UI.confirm = (title, msg, ok, cb, danger) => {
    GC._confirm = cb;
    UI.modal(`${UI.modalHeader(title)}<div class="modal-body"><p>${msg}</p><div class="actions-row end"><button class="btn btn-ghost" data-action="close-modal">Cancelar</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm-ok">${ok}</button></div></div>`, { small: true });
  };

  UI.toast = (msg, type = 'ok') => {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = msg;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3800);
  };

  /* ---------- Chips de estado ---------- */
  const CH = {
    ruta: { pagado: ['green', 'Pagó'], nopago: ['red', 'No pagó'], pendiente: ['amber', 'Pendiente'], espera: ['blue', 'Esperando llave'], inactivo: ['gray', 'Sin crédito'] },
    aut: { pendiente: ['amber', 'Pendiente'], aprobada: ['green', 'Aprobada'], rechazada: ['red', 'Rechazada'] },
    cr: { activo: ['blue', 'Activo'], pagado: ['green', 'Pagado'], renovado: ['purple', 'Renovado'], pendiente: ['amber', 'Por aprobar'], rechazado: ['red', 'Rechazado'] },
    gasto: { aprobado: ['green', 'Aprobado'], pendiente: ['amber', 'Por aprobar'], rechazado: ['red', 'Rechazado'] },
    caja: { abierta: ['blue', 'Abierta'], cerrada: ['gray', 'Cerrada'] },
  };
  UI.chip = (estado, kind = 'ruta') => { const c = (CH[kind] || {})[estado] || ['gray', estado]; return `<span class="chip chip-${c[0]}">${c[1]}</span>`; };

  UI.empty = (msg, icon = 'search') => `<div class="empty">${UI.icon(icon)}<p>${msg}</p></div>`;
  UI.avatar = (name, color) => `<span class="avatar" ${color ? `style="background:${color}"` : ''}>${U.initials(name)}</span>`;

  UI.kpi = ({ label, value, sub, icon, tone = 'brand', href, pct }) => {
    const tag = href ? 'a' : 'div';
    return `<${tag} class="kpi tone-${tone}" ${href ? `href="${href}"` : ''}><div class="kpi-ic">${UI.icon(icon)}</div><div class="kpi-b"><small>${label}</small><b>${value}</b><span>${sub || ''}</span>${pct != null ? `<div class="progress sm"><span style="width:${Math.min(100, pct)}%"></span></div>` : ''}</div></${tag}>`;
  };

  UI.bars = (data, { fmt = U.money } = {}) => {
    const max = Math.max(1, ...data.map(d => d.value));
    return `<div class="bars">${data.map(d => `<div class="bar-col" title="${d.label}: ${fmt(d.value)}"><span class="bar-val">${U.short(d.value).replace('$', '')}</span><div class="bar-track"><div class="bar ${d.hl ? 'hl' : ''}" style="height:${Math.max(2, d.value / max * 100)}%"></div></div><span class="bar-lbl">${d.label}</span></div>`).join('')}</div>`;
  };

  UI.donut = (segs, center = '', sub = '') => {
    const tot = segs.reduce((s, x) => s + x.value, 0) || 1;
    let off = 25;
    const arcs = segs.map(s => {
      const p = s.value / tot * 100;
      const c = p > 0 ? `<circle r="15.915" cx="21" cy="21" fill="none" stroke="${s.color}" stroke-width="5.5" stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${off}"/>` : '';
      off -= p;
      return c;
    }).join('');
    return `<div class="donut"><svg viewBox="0 0 42 42"><circle r="15.915" cx="21" cy="21" fill="none" stroke="#eef2f7" stroke-width="5.5"/>${arcs}</svg><div class="donut-c"><b>${center}</b><small>${sub}</small></div></div>`;
  };

  UI.ledger = k => `<ul class="ledger">
    <li><span>Caja inicial (base)</span><b>${U.money(k.inicial)}</b></li>
    <li class="plus"><span>Cobros en efectivo (${k.nEfectivo})</span><b>+ ${U.money(k.efectivo)}</b></li>
    <li class="minus"><span>Préstamos entregados (${k.ventasL.length})</span><b>− ${U.money(k.ventas)}</b></li>
    <li class="minus"><span>Gastos aprobados</span><b>− ${U.money(k.gastos)}</b></li>
    <li class="minus"><span>Entregas / retiros</span><b>− ${U.money(k.retiros)}</b></li>
    <li class="total"><span>Caja final esperada</span><b>${U.money(k.esperado)}</b></li>
    <li class="info"><span>Cobros electrónicos (no suman al efectivo)</span><b>${U.money(k.electronico)}</b></li>
  </ul>`;

  /* ---------- Recibo ---------- */
  GC.showRecibo = function (pid) {
    const S = GC.S, d = S.db();
    const p = d.pagos.find(x => x.id === pid);
    if (!p) return;
    const cr = d.creditos.find(c => c.id === p.creditoId), cl = S.cliente(p.clienteId), cob = S.cobrador(p.cobradorId);
    const saldo = S.saldoDespuesDe(p);
    const pagadas = Math.min(cr.cuotas, Math.floor((cr.valorTotal - saldo) / cr.valorCuota));
    const txt = `*GeoCartera · Recibo N° ${p.recibo || '—'}*\nCliente: ${cl.nombre}\nFecha: ${U.fmtDateTime(p.fecha)}\nAbono: ${U.money(p.valor)} (${GC.METODOS[p.metodo]})\nSaldo pendiente: ${U.money(saldo)}\nCuotas pagadas: ${pagadas}/${cr.cuotas}\nCobrador: ${cob.nombre}\n¡Gracias por su pago!`;
    UI.modal(UI.modalHeader('Recibo de pago', 'Comprobante digital') + `<div class="modal-body">
      <div class="receipt">
        <div class="rc-head">${GC.logo()}<div><b>GeoCartera</b><small>Recibo N° ${p.recibo || '—'}</small></div></div>
        <div class="rc-amount"><small>Valor abonado</small><b>${U.money(p.valor)}</b><span>${GC.METODOS[p.metodo]}</span></div>
        <ul class="rc-list">
          <li><span>Cliente</span><b>${U.esc(cl.nombre)}</b></li>
          <li><span>Documento</span><b>${cl.doc}</b></li>
          <li><span>Fecha</span><b>${U.fmtDateTime(p.fecha)}</b></li>
          <li><span>Cuotas pagadas</span><b>${pagadas} de ${cr.cuotas}</b></li>
          <li><span>Saldo pendiente</span><b>${U.money(saldo)}</b></li>
          <li><span>Cobrador</span><b>${U.esc(cob.nombre)}</b></li>
          ${p.dist != null ? `<li><span>Verificación GPS</span><b>${p.dist} m del domicilio</b></li>` : ''}
        </ul>
        <p class="rc-foot">Consulta tu estado de cuenta en PayView con tu documento.</p>
      </div>
      <div class="actions-row no-print">
        <a class="btn btn-wa" target="_blank" rel="noopener" href="${GC.wa(cl.tel, txt)}">${UI.icon('msg')} Enviar por WhatsApp</a>
        <button class="btn btn-ghost" data-action="print">${UI.icon('receipt')} Imprimir</button>
      </div></div>`);
  };
})(window.GC);

