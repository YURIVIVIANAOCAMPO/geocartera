/* GeoCartera · Vistas de la aplicación móvil para cobradores */
(function (GC) {
  const U = GC.U, S = GC.S, UI = GC.UI;
  const Cob = (GC.Cob = {});

  /* Layout principal del módulo cobrador */
  Cob.view = function (cob, tab = 'ruta') {
    return `
      <div class="app-layout">
        <header class="app-topbar">
          <div class="topbar-left">
            ${GC.logo()}
            <div>
              <h2 class="topbar-title">${U.esc(cob.nombre)}</h2>
              <div class="topbar-sub"><span class="badge-role">${cob.zona}</span> · <span class="text-muted">${U.today()}</span></div>
            </div>
          </div>
          <div class="topbar-right">
            <button class="btn btn-sm ${S.isOffline() ? 'btn-danger' : 'btn-ghost'}" data-action="toggle-offline" title="Alternar modo offline (Modo Avión)">
              ${UI.icon(S.isOffline() ? 'wifioff' : 'wifi')} <span class="hide-xs">${S.isOffline() ? 'Offline' : 'Online'}</span>
            </button>
            <button class="icon-btn" data-action="logout" title="Cambiar usuario">${UI.icon('logout')}</button>
          </div>
        </header>

        <main class="app-main-content">
          ${Cob.tabContent(cob, tab)}
        </main>

        <nav class="app-bottom-nav">
          <button class="nav-item ${tab === 'ruta' ? 'active' : ''}" data-action="nav" data-tab="ruta">
            ${UI.icon('route')} <span>Mi Ruta</span>
          </button>
          <button class="nav-item ${tab === 'mapa' ? 'active' : ''}" data-action="nav" data-tab="mapa">
            ${UI.icon('map')} <span>Mapa</span>
          </button>
          <button class="nav-item ${tab === 'venta' ? 'active' : ''}" data-action="nav" data-tab="venta">
            ${UI.icon('plus')} <span>Venta</span>
          </button>
          <button class="nav-item ${tab === 'gasto' ? 'active' : ''}" data-action="nav" data-tab="gasto">
            ${UI.icon('cash')} <span>Gastos</span>
          </button>
          <button class="nav-item ${tab === 'caja' ? 'active' : ''}" data-action="nav" data-tab="caja">
            ${UI.icon('wallet')} <span>Mi Caja</span>
          </button>
        </nav>
      </div>
    `;
  };

  Cob.tabContent = function (cob, tab) {
    if (tab === 'ruta') return Cob.tabRuta(cob);
    if (tab === 'mapa') return Cob.tabMapa(cob);
    if (tab === 'venta') return Cob.tabVenta(cob);
    if (tab === 'gasto') return Cob.tabGasto(cob);
    if (tab === 'caja') return Cob.tabCaja(cob);
    return Cob.tabRuta(cob);
  };

  /* Tab 1: Mi Ruta Diaria */
  Cob.tabRuta = function (cob) {
    const items = S.ruta(cob.id, 'todos');
    const cobrado = S.cobradoHoy(cob.id);
    const meta = S.metaHoy(cob.id);
    const pct = meta > 0 ? Math.round((cobrado / meta) * 100) : 0;
    const pendientes = items.filter(i => i.estado === 'pendiente').length;

    return `
      <div class="content-block">
        <div class="kpi-banner">
          <div class="kpi-banner-main">
            <span class="text-muted text-sm font-semibold">RECAUDO HOY</span>
            <div class="kpi-val">${U.money(cobrado)}</div>
            <div class="progress mt-2"><span style="width: ${Math.min(100, pct)}%"></span></div>
            <div class="kpi-banner-footer">
              <small>Meta: <b>${U.money(meta)}</b> (${pct}%)</small>
              <small>${pendientes} pendientes de ${items.length}</small>
            </div>
          </div>
          <div class="kpi-banner-actions">
            <button class="btn btn-sm btn-outline" data-action="optimize-route" data-cobrador="${cob.id}" title="Algoritmo de ruta óptima 2-opt">
              ${UI.icon('spark')} <span>Optimizar</span>
            </button>
          </div>
        </div>

        ${S.isOffline() ? `
          <div class="alert alert-warning mb-3">
            ${UI.icon('wifioff')} <span><b>Modo Offline Activo:</b> Abonos y gestiones se guardan en el teléfono (SQLite/LocalStorage). Sincronizan al reconectar.</span>
          </div>` : ''}

        <div class="section-title-row">
          <h3>Clientes Asignados (${items.length})</h3>
          <span class="badge-subtle">Ruta Puerta a Puerta</span>
        </div>

        <div class="client-cards-list">
          ${items.map(it => Cob.clientCard(it)).join('')}
        </div>
      </div>
    `;
  };

  Cob.clientCard = function (it) {
    const { cl, cr, estado, saldo, atraso } = it;
    return `
      <div class="client-card ${estado}" data-action="open-modal-cliente" data-id="${cl.id}">
        <div class="card-num">${cl.orden}</div>
        <div class="card-info">
          <div class="card-name-row">
            <b class="card-name">${U.esc(cl.nombre)}</b>
            ${UI.chip(estado, 'ruta')}
          </div>
          <div class="card-dir">${U.esc(cl.direccion)} · <span class="text-muted">${U.esc(cl.barrio)}</span></div>
          <div class="card-meta">
            <span>Cuota: <b>${U.money(cr ? cr.valorCuota : 0)}</b></span>
            <span>Saldo: <b>${U.money(saldo)}</b></span>
            ${atraso > 0 ? `<span class="badge-alert">${atraso}d atraso</span>` : ''}
          </div>
        </div>
        <div class="card-arrow">${UI.icon('chev')}</div>
      </div>
    `;
  };

  /* Tab 2: Mapa interactivo */
  Cob.tabMapa = function (cob) {
    const items = S.ruta(cob.id, 'todos');
    const pos = S.posicion(cob.id);
    const trail = S.trail(cob.id);

    return `
      <div class="content-block">
        <div class="section-title-row">
          <div>
            <h3>GPS y Geocercas</h3>
            <p class="text-muted text-xs">Monitoreo de proximidad y recorrido en vivo</p>
          </div>
          <button class="btn btn-sm btn-primary" data-action="simular-gps" data-cobrador="${cob.id}">
            ${UI.icon('pin')} Simular GPS
          </button>
        </div>

        <div class="map-wrapper shadow-card">
          ${GC.Map.svg({
            items,
            cobradores: [{ ...cob, pos }],
            route: { cob, list: items.map(i => i.cl) },
            trails: [{ pts: trail, color: cob.color }]
          })}
        </div>
        ${GC.Map.legend()}
      </div>
    `;
  };

  /* Tab 3: Registrar nueva venta / crédito */
  Cob.tabVenta = function (cob) {
    const misClientes = S.db().clientes.filter(c => c.cobradorId === cob.id);
    return `
      <div class="content-block">
        <div class="section-title-row">
          <h3>Nueva Venta / Crédito</h3>
          <span class="badge-subtle">Cupo y Plazos</span>
        </div>

        <form id="form-venta" class="form-card shadow-card" data-action="submit-venta">
          <div class="form-group">
            <label class="form-label">Tipo de Crédito</label>
            <div class="segmented-control">
              <input type="radio" id="vt-nuevo" name="tipo" value="nuevo" checked>
              <label for="vt-nuevo">Cliente Nuevo</label>
              <input type="radio" id="vt-renov" name="tipo" value="renovacion">
              <label for="vt-renov">Renovación</label>
            </div>
          </div>

          <div id="venta-campos-nuevo">
            <div class="form-group">
              <label class="form-label">Nombre Completo *</label>
              <input type="text" name="nombre" class="form-input" placeholder="Ej. Juan Pérez">
            </div>
            <div class="form-group">
              <label class="form-label">Cédula / Documento *</label>
              <input type="text" name="doc" class="form-input" placeholder="Ej. 10203040">
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono / WhatsApp</label>
              <input type="tel" name="tel" class="form-input" placeholder="Ej. 3001234567">
            </div>
            <div class="form-group">
              <label class="form-label">Dirección y Barrio</label>
              <input type="text" name="direccion" class="form-input" placeholder="Calle 10 # 20-30">
            </div>
          </div>

          <div id="venta-campos-renov" style="display:none;">
            <div class="form-group">
              <label class="form-label">Seleccionar Cliente Existente *</label>
              <select name="clienteId" class="form-input">
                <option value="">-- Seleccionar --</option>
                ${misClientes.map(c => `<option value="${c.id}">${U.esc(c.nombre)} (Cupo: ${U.money(c.cupo)})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label">Monto a Prestar ($)</label>
              <input type="number" name="monto" class="form-input" step="10000" min="50000" value="300000" required>
            </div>
            <div class="form-group col-6">
              <label class="form-label">Interés (%)</label>
              <input type="number" name="interes" class="form-input" value="20" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label class="form-label">Frecuencia</label>
              <select name="frecuencia" class="form-input">
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
            <div class="form-group col-6">
              <label class="form-label">N° de Cuotas</label>
              <input type="number" name="cuotas" class="form-input" value="24" min="1" max="120" required>
            </div>
          </div>

          <div class="alert alert-info text-sm mb-3">
            ℹ️ Si el crédito supera el cupo del cliente o el límite permitido ($ 1.000.000), el sistema generará una <b>Pre-venta</b> para autorización remota del administrador mediante <b>Llave</b>.
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            ${UI.icon('check')} Registrar Préstamo / Venta
          </button>
        </form>
      </div>
    `;
  };

  /* Tab 4: Gastos del día */
  Cob.tabGasto = function (cob) {
    const k = S.caja(cob.id);
    return `
      <div class="content-block">
        <div class="section-title-row">
          <h3>Gastos del Día</h3>
          <span class="badge-subtle">Control de Egresos</span>
        </div>

        <form id="form-gasto" class="form-card shadow-card mb-4" data-action="submit-gasto">
          <div class="form-group">
            <label class="form-label">Concepto *</label>
            <select name="concepto" class="form-input" required>
              ${GC.CONCEPTOS_GASTO.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Valor ($) *</label>
            <input type="number" name="valor" class="form-input" step="1000" min="1000" placeholder="Ej. 15000" required>
          </div>
          <div class="form-group">
            <label class="form-label">Detalle o Motivo</label>
            <input type="text" name="detalle" class="form-input" placeholder="Ej. Tanqueo moto en bomba Esso">
          </div>
          <button type="submit" class="btn btn-primary btn-block">
            ${UI.icon('plus')} Registrar Gasto
          </button>
        </form>

        <h4>Historial de Gastos de Hoy</h4>
        <div class="table-container shadow-card mt-2">
          ${k.gastosL.length === 0 ? UI.empty('No has registrado gastos hoy') : `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Concepto</th>
                  <th>Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${k.gastosL.map(g => `
                  <tr>
                    <td>${U.fmtTime(g.fecha)}</td>
                    <td><b>${U.esc(g.concepto)}</b><br><small class="text-muted">${U.esc(g.detalle || '—')}</small></td>
                    <td><b>${U.money(g.valor)}</b></td>
                    <td>${UI.chip(g.estado, 'gasto')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
  };

  /* Tab 5: Mi Caja y Cierre de jornada */
  Cob.tabCaja = function (cob) {
    const k = S.caja(cob.id);
    const estaCerrada = !!k.caja.cierre;

    return `
      <div class="content-block">
        <div class="section-title-row">
          <div>
            <h3>Flujo de Efectivo en Calle</h3>
            <p class="text-muted text-xs">Arqueo y balance en tiempo real</p>
          </div>
          <span class="badge ${estaCerrada ? 'badge-danger' : 'badge-success'}">${estaCerrada ? 'Caja Cerrada' : 'Caja Abierta'}</span>
        </div>

        <div class="shadow-card p-3 mb-4">
          ${UI.ledger(k)}
        </div>

        ${estaCerrada ? `
          <div class="alert alert-info">
            <b>Jornada Cerrada a las ${U.fmtTime(k.caja.cierre.hora)}:</b><br>
            Esperado: ${U.money(k.caja.cierre.esperado)} | Contado: ${U.money(k.caja.cierre.contado)} | 
            Diferencia: <b>${U.money(k.caja.cierre.diferencia)}</b>
          </div>
        ` : `
          <div class="shadow-card p-3">
            <h4 class="mb-2">Cerrar Jornada (Cuadre de Caja)</h4>
            <p class="text-muted text-xs mb-3">Cuenta el dinero en efectivo físico antes de entregar la cuenta.</p>
            <div class="form-group">
              <label class="form-label">Efectivo Físico Contado ($)</label>
              <input type="number" id="caja-contado-input" class="form-input" value="${k.esperado}">
            </div>
            <button class="btn btn-danger btn-block" data-action="cerrar-caja" data-cobrador="${cob.id}">
              ${UI.icon('shield')} Cerrar Caja del Día
            </button>
          </div>
        `}
      </div>
    `;
  };
})(window.GC);
