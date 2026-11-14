/* GeoCartera · utilidades compartidas */
window.GC = window.GC || {};
(function (GC) {
  const U = (GC.U = {});

  U.pad = n => String(n).padStart(2, '0');
  U.dateISO = (d = new Date()) => `${d.getFullYear()}-${U.pad(d.getMonth() + 1)}-${U.pad(d.getDate())}`;
  U.today = () => U.dateISO(new Date());
  U.dayOf = iso => U.dateISO(new Date(iso));
  U.addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return U.dateISO(d); };
  U.daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);

  const toDate = iso => new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  U.fmtDate = iso => toDate(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  U.fmtShort = iso => toDate(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  U.fmtTime = iso => toDate(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  U.fmtDateTime = iso => `${U.fmtShort(iso)} · ${U.fmtTime(iso)}`;
  U.ago = iso => {
    const m = Math.round((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return 'ahora';
    if (m < 60) return `hace ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `hace ${h} h`;
    return U.fmtShort(iso);
  };

  const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  U.money = n => money.format(Math.round(n || 0));
  U.short = n => {
    const a = Math.abs(n || 0), s = n < 0 ? '-' : '';
    if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.0', '') + 'M';
    if (a >= 1e3) return s + '$' + Math.round(a / 1e3) + 'k';
    return s + '$' + Math.round(a);
  };

  U.uid = (p = 'id') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  U.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.initials = name => String(name || '?').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  U.rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  U.llave = () => String(Math.floor(100000 + Math.random() * 900000));
  U.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  U.csv = (filename, rows) => {
    const esc = v => { const s = String(v ?? ''); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const txt = '\ufeff' + rows.map(r => r.map(esc).join(';')).join('\n');
    const blob = new Blob([txt], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* Catálogos de negocio */
  GC.FREQ = {
    diario: { label: 'Diario', dias: 1 },
    semanal: { label: 'Semanal', dias: 7 },
    quincenal: { label: 'Quincenal', dias: 15 },
    mensual: { label: 'Mensual', dias: 30 },
  };
  GC.METODOS = { efectivo: 'Efectivo', transferencia: 'Transferencia', nequi: 'Nequi / Daviplata', renovacion: 'Cruce por renovación' };
  GC.TIPOS_AUT = {
    venta: 'Pre-venta sobre cupo',
    gasto: 'Pre-gasto',
    pago_adelantado: 'Pago adelantado',
    fuera_geocerca: 'Cobro fuera de geocerca',
    ampliacion_cupo: 'Ampliación de cupo',
  };
  GC.MOTIVOS = ['No estaba en casa', 'No tiene dinero', 'Promete pagar mañana', 'Se niega a pagar', 'Dirección incorrecta', 'Enfermedad / calamidad', 'Otro'];
  GC.CONCEPTOS_GASTO = ['Gasolina', 'Almuerzo', 'Repuestos moto', 'Papelería', 'Recarga celular', 'Otro'];
  GC.METROS_POR_UNIDAD = 5; // escala del mapa simulado

  GC.calcCredito = (monto, interes, cuotas) => {
    cuotas = Math.max(1, cuotas || 1);
    const total = monto * (1 + interes / 100);
    const cuota = Math.ceil(total / cuotas / 100) * 100;
    return { cuota, total: cuota * cuotas };
  };
})(window.GC);

