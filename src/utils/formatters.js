export const U = {
  pad: n => String(n).padStart(2, '0'),
  dateISO: (d = new Date()) => `${d.getFullYear()}-${U.pad(d.getMonth() + 1)}-${U.pad(d.getDate())}`,
  today: () => U.dateISO(new Date()),
  dayOf: iso => (iso ? iso.substring(0, 10) : U.today()),
  addDays: (iso, n) => {
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return U.dateISO(d);
  },
  daysBetween: (a, b) => {
    return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
  },
  fmtDate: iso => {
    if (!iso) return '—';
    const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  fmtTime: iso => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  },
  fmtDateTime: iso => `${U.fmtDate(iso)} ${U.fmtTime(iso)}`,
  money: n => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(Math.round(n || 0));
  },
  short: n => {
    const a = Math.abs(n || 0);
    const s = n < 0 ? '-' : '';
    if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(1).replace('.0', '') + 'M';
    if (a >= 1e3) return s + '$' + Math.round(a / 1e3) + 'k';
    return s + '$' + Math.round(a);
  },
  uid: (p = 'id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
  llave: () => String(Math.floor(100000 + Math.random() * 900000)),
  dist: (a, b) => Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0)),
  calcCredito: (monto, interes, cuotas) => {
    cuotas = Math.max(1, cuotas || 1);
    const total = monto * (1 + interes / 100);
    const cuota = Math.ceil(total / cuotas / 100) * 100;
    return { cuota, total: cuota * cuotas };
  },
  csv: (filename, rows) => {
    const esc = v => {
      const s = String(v ?? '');
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const txt = '\ufeff' + rows.map(r => r.map(esc).join(';')).join('\n');
    const blob = new Blob([txt], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
};
