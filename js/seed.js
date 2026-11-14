/* GeoCartera · generador de datos de demostración (determinístico) */
(function (GC) {
  GC.seed = function () {
    const U = GC.U, r = U.rng(20261114), T = U.today();
    const pick = a => a[Math.floor(r() * a.length)];
    const int = (a, b) => a + Math.floor(r() * (Math.max(a, b) - a + 1));
    const at = (date, h, m) => new Date(`${date}T${U.pad(h)}:${U.pad(m)}:00`).toISOString();
    const now = Date.now();
    const todayAt = maxMin => {
      const iso = new Date(now - int(5, maxMin) * 60000).toISOString();
      return U.dayOf(iso) === T ? iso : new Date(now).toISOString();
    };

    const cobradores = [
      { id: 'c1', nombre: 'Carlos Pérez', zona: 'Zona Norte', tel: '3001234567', color: '#0284c7', base: { x: 70, y: 70 } },
      { id: 'c2', nombre: 'Andrea Gómez', zona: 'Zona Centro', tel: '3017654321', color: '#9333ea', base: { x: 320, y: 230 } },
      { id: 'c3', nombre: 'Luis Martínez', zona: 'Zona Sur', tel: '3029876543', color: '#ea580c', base: { x: 590, y: 560 } },
    ];
    const zonas = { c1: [60, 470, 50, 250], c2: [300, 720, 220, 410], c3: [560, 960, 390, 570] };
    const barrios = {
      c1: ['La Castellana', 'El Prado', 'Santa Fe', 'Villa Country'],
      c2: ['San Nicolás', 'La Merced', 'El Centro', 'Chapinero'],
      c3: ['Las Palmas', 'El Bosque', 'La Esperanza', 'Villa Sol'],
    };
    const nombres = ['María Fernanda López', 'José Antonio Ruiz', 'Ana Lucía Torres', 'Pedro Pablo Castro', 'Luz Marina Rojas',
      'Jorge Eliécer Díaz', 'Sandra Milena Vargas', 'Óscar Iván Moreno', 'Claudia Patricia Ríos', 'Fabio Andrés Mejía',
      'Yolanda Herrera', 'Wilson Ospina', 'Gloria Inés Cárdenas', 'Hernán Darío Salazar', 'Patricia Quintero',
      'Édgar Alonso Pineda', 'Rosa Elena Muñoz', 'Diego Armando Silva', 'Martha Cecilia Giraldo', 'Javier Orlando Peña',
      'Carmen Rosa Navarro', 'Ricardo Antonio Vélez', 'Beatriz Elena Arango', 'Mauricio Restrepo', 'Lucía Fernanda Cano',
      'Alberto Mario Suárez', 'Esperanza Gil', 'Rubén Darío Zapata', 'Nelly Johana Correa', 'Camilo Andrés Duque'];

    const clientes = [], creditos = [], pagos = [], noPagos = [];
    let pn = 0, crn = 0;

    const plan = () => {
      const x = r();
      if (x < 0.6) return { f: 'diario', c: pick([20, 24, 30]) };
      if (x < 0.85) return { f: 'semanal', c: pick([6, 8, 10]) };
      return { f: 'quincenal', c: pick([4, 6]) };
    };
    const addPago = (cr, fecha) => {
      pn++;
      pagos.push({ id: 'p' + pn, creditoId: cr.id, clienteId: cr.clienteId, cobradorId: cr.cobradorId, valor: cr.valorCuota,
        metodo: r() < 0.78 ? 'efectivo' : pick(['transferencia', 'nequi']), fecha, dist: int(3, 42), recibo: 1000 + pn, sync: true });
    };
    const credito = (cl, fecha, pl, monto, tipo, cerrar) => {
      const { cuota } = GC.calcCredito(monto, 20, pl.c);
      const cr = { id: 'cr' + (++crn), clienteId: cl.id, cobradorId: cl.cobradorId, monto, interes: 20, cuotas: pl.c,
        frecuencia: pl.f, valorCuota: cuota, valorTotal: cuota * pl.c, fecha, fechaDesembolso: fecha, tipo,
        estado: cerrar ? 'pagado' : 'activo', netoEntregado: monto, creadoAt: at(fecha, 9, 0), sync: true };
      creditos.push(cr);
      const per = GC.FREQ[pl.f].dias;
      for (let k = 1; k <= pl.c; k++) {
        const d = U.addDays(fecha, k * per);
        if (d > T) break;
        if (d === T) { if (r() < (cl.perfil > 0.9 ? 0.35 : 0.12)) addPago(cr, todayAt(240)); continue; }
        if (cerrar || r() < cl.perfil) addPago(cr, at(d, int(7, 17), int(0, 59)));
        else if (r() < 0.7) noPagos.push({ id: 'np' + (noPagos.length + 1), clienteId: cl.id, cobradorId: cl.cobradorId,
          motivo: pick(GC.MOTIVOS.slice(0, 6)), nota: '', fecha: at(d, int(8, 17), int(0, 59)), dist: int(3, 40), sync: true });
      }
      return cr;
    };

    nombres.forEach((n, i) => {
      const cob = cobradores[i % 3], z = zonas[cob.id], p = r();
      const cl = {
        id: 'cl' + (i + 1), nombre: n, doc: String(int(10000000, 1099999999)), tel: '3' + int(100000000, 229999999),
        direccion: `Calle ${int(10, 98)} # ${int(5, 80)}-${int(10, 99)}`, barrio: pick(barrios[cob.id]),
        x: Math.round(z[0] + r() * (z[1] - z[0])), y: Math.round(z[2] + r() * (z[3] - z[2])),
        cobradorId: cob.id, orden: Math.floor(i / 3) + 1, cupo: pick([500000, 800000, 1000000, 1200000]),
        creado: U.addDays(T, -int(60, 400)), perfil: p < 0.68 ? 0.96 : p < 0.88 ? 0.75 : 0.4, sync: true,
      };
      clientes.push(cl);
      const pl = plan(), per = GC.FREQ[pl.f].dias;
      const k0 = int(2, pl.c - 3);
      const fecha = U.addDays(T, -k0 * per);
      const monto = Math.min(cl.cupo, pick([200000, 300000, 400000, 500000, 600000, 800000, 1000000]));
      const prev = r() < 0.45;
      if (prev) {
        const ppl = plan(), pper = GC.FREQ[ppl.f].dias;
        const pf = U.addDays(fecha, -(ppl.c * pper) - int(1, 6));
        credito(cl, pf, ppl, Math.max(200000, monto - 100000), 'nuevo', true);
      }
      credito(cl, fecha, pl, monto, prev ? 'renovacion' : 'nuevo', false);
    });

    /* Gastos */
    const gastos = [
      { id: 'g1', cobradorId: 'c1', concepto: 'Gasolina', detalle: 'Tanqueo moto', valor: 12000, fecha: todayAt(200), estado: 'aprobado', sync: true },
      { id: 'g2', cobradorId: 'c2', concepto: 'Almuerzo', detalle: '', valor: 15000, fecha: todayAt(120), estado: 'aprobado', sync: true },
      { id: 'g3', cobradorId: 'c3', concepto: 'Repuestos moto', detalle: 'Reparación de llanta', valor: 85000, fecha: todayAt(30), estado: 'pendiente', sync: true },
    ];
    for (let dd = 1; dd <= 6; dd++) cobradores.forEach(c => {
      const d = U.addDays(T, -dd);
      gastos.push({ id: U.uid('g'), cobradorId: c.id, concepto: 'Gasolina', detalle: '', valor: int(8, 15) * 1000, fecha: at(d, 8, int(0, 50)), estado: 'aprobado', sync: true });
    });

    /* Cajas: hoy abierta + 6 días de historial cerrado */
    const cajas = [];
    const bases = { c1: 400000, c2: 350000, c3: 450000 };
    cobradores.forEach(c => {
      cajas.push({ id: 'cj_' + c.id + '_hoy', cobradorId: c.id, fecha: T, inicial: bases[c.id], retiros: [], cierre: null });
      for (let dd = 1; dd <= 6; dd++) {
        const d = U.addDays(T, -dd), esperado = int(60, 150) * 10000;
        const diferencia = r() < 0.8 ? 0 : -pick([2000, 5000, 10000]);
        cajas.push({ id: U.uid('cj'), cobradorId: c.id, fecha: d, inicial: bases[c.id], retiros: [],
          cierre: { esperado, contado: esperado + diferencia, diferencia, hora: at(d, 18, int(0, 45)) } });
      }
    });

    /* Autorizaciones (llaves) */
    const N = i => clientes[i].nombre;
    const d1 = U.addDays(T, -1), d2 = U.addDays(T, -2), d3 = U.addDays(T, -3), d4 = U.addDays(T, -4);
    const autorizaciones = [
      { id: 'a1', tipo: 'gasto', cobradorId: 'c3', clienteId: null, valor: 85000, detalle: 'Repuestos moto · Reparación de llanta', refId: 'g3', payload: null, estado: 'pendiente', fecha: gastos[2].fecha, llave: null, sync: true },
      { id: 'a2', tipo: 'ampliacion_cupo', cobradorId: 'c1', clienteId: 'cl1', valor: 1500000, detalle: `Ampliar cupo de ${N(0)} a $ 1.500.000 · Cliente cumplido, quiere renovar`, payload: { clienteId: 'cl1', cupo: 1500000 }, estado: 'pendiente', fecha: todayAt(45), llave: null, sync: true },
      { id: 'a3', tipo: 'venta', cobradorId: 'c2', clienteId: 'cl5', valor: 1200000, detalle: `Renovación ${N(4)}: $ 1.200.000`, estado: 'aprobada', llave: '482913', fecha: at(d1, 10, 12), resueltoPor: 'Admin General', resueltoFecha: at(d1, 10, 19), sync: true },
      { id: 'a4', tipo: 'gasto', cobradorId: 'c1', valor: 70000, detalle: 'Repuestos moto · Cambio de aceite', estado: 'aprobada', llave: '190374', fecha: at(d2, 9, 40), resueltoPor: 'Admin General', resueltoFecha: at(d2, 9, 44), sync: true },
      { id: 'a5', tipo: 'fuera_geocerca', cobradorId: 'c3', clienteId: 'cl9', valor: 25000, detalle: `Cobro a ${N(8)} a 180 m del domicilio (límite 50 m)`, estado: 'rechazada', nota: 'Debe acercarse al domicilio del cliente', llave: null, fecha: at(d2, 15, 5), resueltoPor: 'Admin General', resueltoFecha: at(d2, 15, 12), sync: true },
      { id: 'a6', tipo: 'pago_adelantado', cobradorId: 'c2', clienteId: 'cl8', valor: 240000, detalle: `Pago adelantado de ${N(7)} por $ 240.000`, estado: 'aprobada', llave: '775120', fecha: at(d3, 11, 22), resueltoPor: 'Admin General', resueltoFecha: at(d3, 11, 25), sync: true },
      { id: 'a7', tipo: 'ampliacion_cupo', cobradorId: 'c1', clienteId: 'cl4', valor: 1000000, detalle: `Ampliar cupo de ${N(3)} a $ 1.000.000`, estado: 'aprobada', llave: '305661', fecha: at(d4, 16, 2), resueltoPor: 'Admin General', resueltoFecha: at(d4, 16, 30), sync: true },
    ];

    /* Auditoría inicial */
    const audit = [];
    autorizaciones.filter(a => a.estado !== 'pendiente').forEach(a => audit.push({
      id: U.uid('au'), fecha: a.resueltoFecha, usuario: 'Admin General', rol: 'admin',
      accion: a.estado === 'aprobada' ? 'Autorización aprobada' : 'Autorización rechazada',
      detalle: `${GC.TIPOS_AUT[a.tipo]} · ${a.detalle}${a.llave ? ' · Llave ' + a.llave : ''}`, sync: true,
    }));
    cajas.filter(c => c.cierre).forEach(c => {
      const cob = cobradores.find(x => x.id === c.cobradorId);
      audit.push({ id: U.uid('au'), fecha: c.cierre.hora, usuario: cob.nombre, rol: 'cobrador', accion: 'Cierre de caja',
        detalle: `Esperado ${U.money(c.cierre.esperado)}, contado ${U.money(c.cierre.contado)}, diferencia ${U.money(c.cierre.diferencia)}`, sync: true });
    });
    cobradores.forEach(c => audit.push({ id: U.uid('au'), fecha: todayAt(300), usuario: c.nombre, rol: 'cobrador', accion: 'Inicio de jornada', detalle: `Caja inicial ${U.money(bases[c.id])}`, sync: true }));
    audit.sort((a, b) => b.fecha.localeCompare(a.fecha));

    return {
      version: 1, seedDate: T, seqRecibo: 1000 + pn + 1,
      config: { ventaMaxSinLlave: 1000000, cupoClienteNuevo: 500000, gastoMaxSinLlave: 50000, geocercaMetros: 50, cuotasAdelantoMax: 3, interesDefault: 20, cajaInicialDefault: 400000 },
      cobradores, clientes, creditos, pagos, noPagos, gastos, autorizaciones, cajas, audit,
    };
  };
})(window.GC);

