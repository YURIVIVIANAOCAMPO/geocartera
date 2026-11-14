/* GeoCartera · Portal PayView para Clientes */
(function (GC) {
  const U = GC.U, S = GC.S, UI = GC.UI;
  const PayView = (GC.PayView = {});

  PayView.view = function (clienteId = null) {
    const db = S.db();
    let cliente = clienteId ? S.cliente(clienteId) : null;

    return `
      <div class="payview-layout">
        <header class="payview-header">
          <div class="payview-brand">
            ${GC.logo()}
            <div>
              <h2>GeoCartera PayView</h2>
              <span class="text-xs text-muted">Portal de Autoservicio y Transparencia del Cliente</span>
            </div>
          </div>
          <div>
            <a href="#" class="btn btn-sm btn-ghost">${UI.icon('logout')} Volver</a>
          </div>
        </header>

        <main class="payview-body">
          <div class="payview-search shadow-card p-4 mb-4">
            <h3 class="mb-2">Consulta de Estado de Cuenta</h3>
            <p class="text-muted text-sm mb-3">Ingresa tu número de documento de identidad para ver tu saldo y cuotas pactadas.</p>
            <div class="search-form-row">
              <input type="text" id="payview-doc-input" class="form-input" placeholder="Ej. 10203040" value="${cliente ? cliente.doc : ''}">
              <button class="btn btn-primary" data-action="payview-consultar">${UI.icon('search')} Consultar</button>
            </div>
            <div class="quick-demo-clients mt-2">
              <small class="text-muted">Probar rápido con:</small>
              ${db.clientes.slice(0, 3).map(c => `
                <button class="btn btn-xs btn-outline" data-action="payview-set-doc" data-doc="${c.doc}">${c.nombre.split(' ')[0]} (${c.doc})</button>
              `).join('')}
            </div>
          </div>

          ${cliente ? PayView.renderClienteDetalle(cliente) : PayView.renderIntro()}
        </main>
      </div>
    `;
  };

  PayView.renderIntro = function () {
    return `
      <div class="shadow-card p-5 text-center">
        <div class="intro-icon mb-3">${UI.icon('shield')}</div>
        <h3>Transparencia Total en Tus Pagos</h3>
        <p class="text-muted max-w-md mx-auto mt-2">
          Con PayView puedes verificar en cualquier momento el saldo pendiente de tu crédito, tus cuotas pagadas, historial de recibos electrónicos y tu cupo disponible de renovación.
        </p>
      </div>
    `;
  };

  PayView.renderClienteDetalle = function (cl) {
    const cr = S.creditoActivo(cl.id) || S.ultimoCredito(cl.id);
    const pagos = cr ? S.pagosDe(cr.id) : [];
    const saldo = cr ? S.saldo(cr) : 0;
    const pagado = cr ? S.pagado(cr) : 0;
    const cuotasPagadas = cr ? S.cuotasPagadas(cr) : 0;
    const cob = S.cobrador(cl.cobradorId);

    return `
      <div class="payview-cliente-grid">
        <div class="shadow-card p-4 mb-4">
          <div class="section-title-row">
            <div>
              <h3>Hola, ${U.esc(cl.nombre)}</h3>
              <p class="text-muted text-sm">C.C. ${cl.doc} · Cupo Pre-aprobado: <b>${U.money(cl.cupo)}</b></p>
            </div>
            <div>
              <span class="badge ${cr && cr.estado === 'activo' ? 'badge-success' : 'badge-subtle'}">
                ${cr ? cr.estado.toUpperCase() : 'SIN CRÉDITO'}
              </span>
            </div>
          </div>

          ${cr ? `
            <div class="payview-metrics-row mt-4">
              <div class="payview-metric">
                <span class="text-muted text-xs">SALDO PENDIENTE</span>
                <b class="metric-val text-primary">${U.money(saldo)}</b>
              </div>
              <div class="payview-metric">
                <span class="text-muted text-xs">VALOR DE CUOTA</span>
                <b class="metric-val">${U.money(cr.valorCuota)}</b>
              </div>
              <div class="payview-metric">
                <span class="text-muted text-xs">TOTAL ABONADO</span>
                <b class="metric-val text-success">${U.money(pagado)}</b>
              </div>
              <div class="payview-metric">
                <span class="text-muted text-xs">AVANCE DE CUOTAS</span>
                <b class="metric-val">${cuotasPagadas} / ${cr.cuotas}</b>
              </div>
            </div>

            <div class="progress mt-3"><span style="width:${Math.round((pagado / cr.valorTotal) * 100)}%"></span></div>
          ` : `
            <div class="alert alert-info mt-3">Actualmente no cuentas con ningún crédito vigente. ¡Tienes cupo disponible para solicitar uno nuevo!</div>
          `}
        </div>

        ${cr ? `
          <div class="shadow-card p-4">
            <h4 class="mb-3">Historial de Pagos y Comprobantes Recibidos</h4>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Recibo</th>
                    <th>Fecha</th>
                    <th>Monto Pagado</th>
                    <th>Método</th>
                    <th>Comprobante</th>
                  </tr>
                </thead>
                <tbody>
                  ${pagos.length === 0 ? `<tr><td colspan="5" class="text-center text-muted">Aún no se han registrado abonos en este crédito</td></tr>` : ''}
                  ${pagos.map(p => `
                    <tr>
                      <td><span class="badge-num">#${p.recibo || '—'}</span></td>
                      <td>${U.fmtDateTime(p.fecha)}</td>
                      <td><b>${U.money(p.valor)}</b></td>
                      <td>${GC.METODOS[p.metodo] || p.metodo}</td>
                      <td>
                        <button class="btn btn-xs btn-outline" data-action="show-recibo" data-id="${p.id}">
                          ${UI.icon('receipt')} Ver Recibo
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <div class="shadow-card p-4 mt-4">
          <div class="section-title-row">
            <div>
              <h4>¿Tienes alguna duda o necesitas soporte?</h4>
              <p class="text-muted text-xs">Comunícate directamente con tu asesor de cobranza asignado</p>
            </div>
            ${cob ? `
              <a class="btn btn-sm btn-wa" href="${GC.wa(cob.tel, `Hola ${cob.nombre}, soy ${cl.nombre}. Quisiera información sobre mi estado de cuenta.`)}" target="_blank">
                ${UI.icon('msg')} Contactar a ${cob.nombre.split(' ')[0]}
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  };
})(window.GC);
