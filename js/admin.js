/* GeoCartera · Plataforma Web de Administración Central */
(function (GC) {
  const U = GC.U, S = GC.S, UI = GC.UI;
  const Admin = (GC.Admin = {});

  Admin.view = function (tab = 'dashboard') {
    const db = S.db();
    const autPendientes = db.autorizaciones.filter(a => a.estado === 'pendiente').length;

    return `
      <div class="admin-layout">
        <aside class="admin-sidebar" id="admin-sidebar">
          <div class="admin-brand">
            ${GC.logo()}
            <div>
              <h1 class="brand-title">GeoCartera</h1>
              <span class="brand-badge">ADMIN PANEL</span>
            </div>
          </div>

          <nav class="admin-nav">
            <a href="#admin/dashboard" class="admin-nav-item ${tab === 'dashboard' ? 'active' : ''}">
              ${UI.icon('dashboard')} <span>Dashboard</span>
            </a>
            <a href="#admin/rutas" class="admin-nav-item ${tab === 'rutas' ? 'active' : ''}">
              ${UI.icon('route')} <span>Rutas y Recaudos</span>
            </a>
            <a href="#admin/mapa" class="admin-nav-item ${tab === 'mapa' ? 'active' : ''}">
              ${UI.icon('map')} <span>Rastreo GPS en Vivo</span>
            </a>
            <a href="#admin/autorizaciones" class="admin-nav-item ${tab === 'autorizaciones' ? 'active' : ''}">
              ${UI.icon('key')} <span>Llaves y Autorizaciones</span>
              ${autPendientes > 0 ? `<span class="badge-counter">${autPendientes}</span>` : ''}
            </a>
            <a href="#admin/clientes" class="admin-nav-item ${tab === 'clientes' ? 'active' : ''}">
              ${UI.icon('users')} <span>Clientes y Créditos</span>
            </a>
            <a href="#admin/cajas" class="admin-nav-item ${tab === 'cajas' ? 'active' : ''}">
              ${UI.icon('wallet')} <span>Gestión de Cajas</span>
            </a>
            <a href="#admin/usuarios" class="admin-nav-item ${tab === 'usuarios' ? 'active' : ''}">
              ${UI.icon('shield')} <span>Usuarios y Roles</span>
            </a>
            <a href="#admin/reportes" class="admin-nav-item ${tab === 'reportes' ? 'active' : ''}">
              ${UI.icon('file')} <span>Reportes y Auditoría</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="user-pill">
              <span class="avatar-sm">AD</span>
              <div class="user-meta">
                <b>Admin General</b>
                <small>Superusuario</small>
              </div>
              <button class="icon-btn-sm" data-action="logout" title="Cerrar sesión">${UI.icon('logout')}</button>
            </div>
          </div>
        </aside>

        <div class="admin-main">
          <header class="admin-header">
            <div class="header-left">
              <button class="icon-btn admin-toggle-btn hide-desktop" data-action="toggle-admin-menu">
                ${UI.icon('menu')}
              </button>
              <div class="header-breadcrumb">
                <span class="text-muted">GeoCartera Cloud</span> / <b>${Admin.tabTitle(tab)}</b>
              </div>
            </div>
            <div class="header-right">
              <button class="btn btn-sm btn-ghost" data-action="reset-demo" title="Restaurar base de datos a estado inicial">
                ${UI.icon('refresh')} <span>Reset Demo</span>
              </button>
              <a href="#payview" class="btn btn-sm btn-outline" target="_blank">
                ${UI.icon('eye')} <span>Portal PayView</span>
              </a>
            </div>
          </header>

          <div class="admin-body">
            ${Admin.renderTab(tab)}
          </div>
        </div>
      </div>
    `;
  };

  Admin.tabTitle = function (t) {
    const titles = {
      dashboard: 'Cuadro de Mando Financiero',
      rutas: 'Control de Rutas y Cobranza',
      mapa: 'Mapa de Rastreo y Geocercas',
      autorizaciones: 'Módulo de Autorizaciones y Llaves',
      clientes: 'Cartera y Clientes',
      cajas: 'Arqueo de Cajas y Flujo de Efectivo',
      usuarios: 'Gestión de Usuarios, Roles y Permisos (RBAC)',
      reportes: 'Auditoría Forense y Reportes'
    };
    return titles[t] || 'Administración';
  };

  Admin.renderTab = function (tab) {
    if (tab === 'dashboard') return Admin.tabDashboard();
    if (tab === 'rutas') return Admin.tabRutas();
    if (tab === 'mapa') return Admin.tabMapa();
    if (tab === 'autorizaciones') return Admin.tabAutorizaciones();
    if (tab === 'clientes') return Admin.tabClientes();
    if (tab === 'cajas') return Admin.tabCajas();
    if (tab === 'usuarios') return GC.Users.renderView();
    if (tab === 'reportes') return Admin.tabReportes();
    return Admin.tabDashboard();
  };

  /* Tab 1: Dashboard */
  Admin.tabDashboard = function () {
    const db = S.db(), T = U.today();
    const pagosHoy = db.pagos.filter(p => U.dayOf(p.fecha) === T && p.metodo !== 'renovacion');
    const recaudoTotal = S.sum(pagosHoy);
    const carteraActiva = db.creditos.filter(c => c.estado === 'activo');
    const saldoTotalCartera = S.sum(carteraActiva, cr => S.saldo(cr));
    const ventasHoy = db.creditos.filter(c => c.fechaDesembolso === T && ['activo', 'pagado', 'renovado'].includes(c.estado));
    const montoColocadoHoy = S.sum(ventasHoy, c => c.netoEntregado);
    const morosos = carteraActiva.filter(c => S.diasAtraso(c) > 0);

    return `
      <div class="admin-dashboard-grid">
        <div class="kpi-card shadow-card">
          <div class="kpi-ic ic-emerald">${UI.icon('cash')}</div>
          <div>
            <span class="kpi-lbl">Recaudado Hoy</span>
            <div class="kpi-val">${U.money(recaudoTotal)}</div>
            <small class="text-muted">${pagosHoy.length} abonos registrados</small>
          </div>
        </div>

        <div class="kpi-card shadow-card">
          <div class="kpi-ic ic-blue">${UI.icon('file')}</div>
          <div>
            <span class="kpi-lbl">Cartera Total Activa</span>
            <div class="kpi-val">${U.money(saldoTotalCartera)}</div>
            <small class="text-muted">${carteraActiva.length} créditos vigentes</small>
          </div>
        </div>

        <div class="kpi-card shadow-card">
          <div class="kpi-ic ic-purple">${UI.icon('plus')}</div>
          <div>
            <span class="kpi-lbl">Colocación / Préstamos Hoy</span>
            <div class="kpi-val">${U.money(montoColocadoHoy)}</div>
            <small class="text-muted">${ventasHoy.length} préstamos desembolsados</small>
          </div>
        </div>

        <div class="kpi-card shadow-card">
          <div class="kpi-ic ic-rose">${UI.icon('alert')}</div>
          <div>
            <span class="kpi-lbl">Clientes en Mora</span>
            <div class="kpi-val">${morosos.length}</div>
            <small class="text-danger font-semibold">Requieren seguimiento especial</small>
          </div>
        </div>
      </div>

      <div class="admin-two-cols mt-4">
        <div class="shadow-card p-4">
          <h3 class="mb-3">Rendimiento por Cobrador (Hoy)</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Cobrador</th>
                  <th>Zona</th>
                  <th>Meta</th>
                  <th>Cobrado</th>
                  <th>Progreso</th>
                </tr>
              </thead>
              <tbody>
                ${db.cobradores.map(c => {
                  const cobrado = S.cobradoHoy(c.id);
                  const meta = S.metaHoy(c.id);
                  const pct = meta > 0 ? Math.round((cobrado / meta) * 100) : 0;
                  return `
                    <tr>
                      <td><b>${U.esc(c.nombre)}</b></td>
                      <td><span class="badge-subtle">${c.zona}</span></td>
                      <td>${U.money(meta)}</td>
                      <td><b>${U.money(cobrado)}</b></td>
                      <td>
                        <div class="progress"><span style="width:${Math.min(100, pct)}%"></span></div>
                        <small class="text-muted">${pct}%</small>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="shadow-card p-4">
          <h3 class="mb-3">Últimas Transacciones en Vivo</h3>
          <div class="stream-list">
            ${pagosHoy.slice(-6).reverse().map(p => {
              const cl = S.cliente(p.clienteId);
              const cob = S.cobrador(p.cobradorId);
              return `
                <div class="stream-item">
                  <div class="stream-icon">${UI.icon('cash')}</div>
                  <div class="stream-content">
                    <div><b>${U.esc(cl.nombre)}</b> abonó <b>${U.money(p.valor)}</b></div>
                    <small class="text-muted">Cobrador: ${U.esc(cob.nombre)} · ${U.ago(p.fecha)}</small>
                  </div>
                  <button class="btn btn-xs btn-outline" data-action="show-recibo" data-id="${p.id}">Recibo</button>
                </div>
              `;
            }).join('') || '<p class="text-muted text-sm">Sin transacciones recientes hoy.</p>'}
          </div>
        </div>
      </div>
    `;
  };

  /* Tab 2: Control de Rutas */
  Admin.tabRutas = function () {
    const db = S.db();
    return `
      <div class="shadow-card p-4">
        <div class="section-title-row">
          <div>
            <h3>Gestión de Rutas Puerta a Puerta</h3>
            <p class="text-muted text-sm">Reordenamiento de visitas, optimización y asignación de cartera</p>
          </div>
        </div>

        <div class="cobradores-tab-bar">
          ${db.cobradores.map((c, i) => `
            <button class="tab-btn ${i === 0 ? 'active' : ''}" data-action="admin-switch-ruta" data-id="${c.id}">
              ${c.nombre} (${c.zona})
            </button>
          `).join('')}
        </div>

        <div id="admin-ruta-container" class="mt-4">
          ${Admin.renderRutaDetalle(db.cobradores[0].id)}
        </div>
      </div>
    `;
  };

  Admin.renderRutaDetalle = function (cobId) {
    const cob = S.cobrador(cobId);
    const items = S.ruta(cobId, 'todos');

    return `
      <div class="ruta-head-actions mb-3">
        <div>
          <b>Ruta actual de ${U.esc(cob.nombre)}</b> · ${items.length} clientes en secuencia
        </div>
        <button class="btn btn-sm btn-primary" data-action="optimize-route" data-cobrador="${cob.id}">
          ${UI.icon('spark')} Auto-Optimizar Secuencia (Menor recorrido)
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th width="60">Orden</th>
              <th>Cliente</th>
              <th>Dirección / Barrio</th>
              <th>Cuota</th>
              <th>Saldo</th>
              <th>Estado Hoy</th>
              <th width="120">Reordenar</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((it, idx) => `
              <tr>
                <td><span class="badge-num">${it.cl.orden}</span></td>
                <td><b>${U.esc(it.cl.nombre)}</b><br><small class="text-muted">${it.cl.tel}</small></td>
                <td>${U.esc(it.cl.direccion)}<br><small class="text-muted">${U.esc(it.cl.barrio)}</small></td>
                <td>${U.money(it.cr ? it.cr.valorCuota : 0)}</td>
                <td><b>${U.money(it.saldo)}</b></td>
                <td>${UI.chip(it.estado, 'ruta')}</td>
                <td>
                  <button class="icon-btn-sm" data-action="reorder" data-id="${it.cl.id}" data-dir="-1" ${idx === 0 ? 'disabled' : ''} title="Subir">
                    ${UI.icon('up')}
                  </button>
                  <button class="icon-btn-sm" data-action="reorder" data-id="${it.cl.id}" data-dir="1" ${idx === items.length - 1 ? 'disabled' : ''} title="Bajar">
                    ${UI.icon('down')}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  /* Tab 3: Mapa en vivo */
  Admin.tabMapa = function () {
    const db = S.db();
    const cobradoresConPos = db.cobradores.map(c => ({ ...c, pos: S.posicion(c.id) }));
    const allItems = [];
    db.cobradores.forEach(c => allItems.push(...S.ruta(c.id, 'todos')));
    const trails = db.cobradores.map(c => ({ pts: S.trail(c.id), color: c.color }));

    return `
      <div class="shadow-card p-4">
        <div class="section-title-row">
          <div>
            <h3>Centro de Monitoreo GPS en Tiempo Real</h3>
            <p class="text-muted text-sm">Supervisión satelital de cobradores, geocercas y paradas realizadas</p>
          </div>
        </div>

        <div class="map-wrapper shadow-card">
          ${GC.Map.svg({
            items: allItems,
            cobradores: cobradoresConPos,
            trails
          })}
        </div>
        ${GC.Map.legend()}
      </div>
    `;
  };

  /* Tab 4: Autorizaciones y Llaves */
  Admin.tabAutorizaciones = function () {
    const db = S.db();
    const auts = db.autorizaciones;

    return `
      <div class="shadow-card p-4">
        <div class="section-title-row">
          <div>
            <h3>Módulo de Autorizaciones y Generación de Llaves</h3>
            <p class="text-muted text-sm">Aprobación remota para pre-ventas, cobros fuera de geocerca y gastos imprevistos</p>
          </div>
        </div>

        <div class="table-container mt-3">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Tipo Solicitud</th>
                <th>Cobrador / Solicitante</th>
                <th>Detalle del Requerimiento</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Llave / Acción</th>
              </tr>
            </thead>
            <tbody>
              ${auts.map(a => {
                const cob = S.cobrador(a.cobradorId);
                return `
                  <tr>
                    <td>${U.fmtDateTime(a.fecha)}</td>
                    <td><b>${GC.TIPOS_AUT[a.tipo] || a.tipo}</b></td>
                    <td>${cob ? U.esc(cob.nombre) : '—'}</td>
                    <td>${U.esc(a.detalle)}</td>
                    <td><b>${a.valor > 0 ? U.money(a.valor) : '—'}</b></td>
                    <td>${UI.chip(a.estado, 'aut')}</td>
                    <td>
                      ${a.estado === 'pendiente' ? `
                        <div class="actions-group">
                          <button class="btn btn-xs btn-success" data-action="resolver-aut" data-id="${a.id}" data-aprob="1">Aprobar</button>
                          <button class="btn btn-xs btn-danger" data-action="resolver-aut" data-id="${a.id}" data-aprob="0">Rechazar</button>
                        </div>
                      ` : `
                        ${a.llave ? `<span class="badge-key font-mono">🔑 ${a.llave}</span>` : `<small class="text-muted">${a.estado}</small>`}
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  /* Tab 5: Clientes y Cartera */
  Admin.tabClientes = function () {
    const db = S.db();
    return `
      <div class="shadow-card p-4">
        <div class="section-title-row">
          <div>
            <h3>Expedientes de Cartera y Cupos</h3>
            <p class="text-muted text-sm">Base de datos de titulares de crédito y ampliación de líneas financieras</p>
          </div>
        </div>

        <div class="table-container mt-3">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Ruta / Zona</th>
                <th>Cupo Aprobado</th>
                <th>Crédito Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${db.clientes.map(cl => {
                const cob = S.cobrador(cl.cobradorId);
                const cr = S.creditoActivo(cl.id);
                return `
                  <tr>
                    <td><b>${U.esc(cl.nombre)}</b></td>
                    <td>${cl.doc}</td>
                    <td>${cl.tel}</td>
                    <td>${U.esc(cl.direccion)}<br><small class="text-muted">${U.esc(cl.barrio)}</small></td>
                    <td><span class="badge-subtle">${cob ? cob.zona : '—'}</span></td>
                    <td><b>${U.money(cl.cupo)}</b></td>
                    <td>
                      ${cr ? `<span class="text-primary font-semibold">${U.money(S.saldo(cr))}</span>` : '<span class="text-muted">Al día</span>'}
                    </td>
                    <td>
                      <button class="btn btn-xs btn-outline" data-action="editar-cupo" data-id="${cl.id}">Modificar Cupo</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  /* Tab 6: Gestión de Cajas */
  Admin.tabCajas = function () {
    const db = S.db(), T = U.today();
    return `
      <div class="shadow-card p-4">
        <div class="section-title-row">
          <div>
            <h3>Arqueo de Cajas del Día (${T})</h3>
            <p class="text-muted text-sm">Balance entre caja inicial, cobranza neta, colocaciones y gastos en calle</p>
          </div>
        </div>

        <div class="admin-boxes-grid mt-4">
          ${db.cobradores.map(c => {
            const k = S.caja(c.id);
            const cerrada = !!k.caja.cierre;
            return `
              <div class="shadow-card p-4 box-card">
                <div class="box-card-head">
                  <div>
                    <h4>${U.esc(c.nombre)}</h4>
                    <span class="text-muted text-xs">${c.zona}</span>
                  </div>
                  <span class="badge ${cerrada ? 'badge-danger' : 'badge-success'}">${cerrada ? 'Cerrada' : 'Abierta'}</span>
                </div>
                <div class="my-3">
                  ${UI.ledger(k)}
                </div>
                ${cerrada ? `
                  <div class="alert alert-info text-xs">
                    Cerrada a las ${U.fmtTime(k.caja.cierre.hora)} con un conteo de ${U.money(k.caja.cierre.contado)}
                    (Diferencia: <b>${U.money(k.caja.cierre.diferencia)}</b>)
                  </div>
                ` : `
                  <div class="actions-row mt-3">
                    <button class="btn btn-sm btn-outline" data-action="admin-ajustar-base" data-cobrador="${c.id}">Ajustar Base</button>
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  /* Tab 7: Reportes y Auditoría */
  Admin.tabReportes = function () {
    const db = S.db();
    return `
      <div class="shadow-card p-4">
        <div class="section-title-row">
          <div>
            <h3>Bitácora Forense y Registro Inmutable de Auditoría</h3>
            <p class="text-muted text-sm">Trazabilidad completa de modificaciones, autorizaciones y movimientos críticos</p>
          </div>
          <button class="btn btn-sm btn-outline" data-action="export-audit-csv">
            ${UI.icon('download')} Exportar CSV
          </button>
        </div>

        <div class="table-container mt-3">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acción Ejecutada</th>
                <th>Detalle Operativo</th>
              </tr>
            </thead>
            <tbody>
              ${db.audit.slice(0, 100).map(a => `
                <tr>
                  <td><small class="font-mono">${U.fmtDateTime(a.fecha)}</small></td>
                  <td><b>${U.esc(a.usuario)}</b></td>
                  <td><span class="badge-role">${a.rol}</span></td>
                  <td><b>${U.esc(a.accion)}</b></td>
                  <td>${U.esc(a.detalle)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };
})(window.GC);
