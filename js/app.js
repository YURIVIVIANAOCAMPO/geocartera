/* GeoCartera · Controlador principal, enrutamiento y delegación de eventos */
(function (GC) {
  const U = GC.U, S = GC.S, UI = GC.UI;

  GC.init = function () {
    S.load();
    window.addEventListener('hashchange', GC.render);
    document.addEventListener('click', GC.handleClick);
    document.addEventListener('submit', GC.handleSubmit);
    document.addEventListener('change', GC.handleChange);
    GC.render();
  };

  GC.render = function () {
    const root = document.getElementById('app-root');
    const hash = window.location.hash || '';
    const session = S.session();

    // 1. Portal PayView público
    if (hash.startsWith('#payview')) {
      const parts = hash.split('/');
      const clienteId = parts[1] || null;
      root.innerHTML = GC.PayView.view(clienteId);
      return;
    }

    // 2. Si no hay sesión iniciada, mostrar Selector de Rol / Login Demo
    if (!session) {
      root.innerHTML = GC.renderRoleSelector();
      return;
    }

    // 3. Vistas de Administrador
    if (session.role === 'admin') {
      const tab = hash.startsWith('#admin/') ? hash.replace('#admin/', '') : 'dashboard';
      root.innerHTML = GC.Admin.view(tab);
      return;
    }

    // 4. Vistas de Cobrador Móvil
    if (session.role === 'cobrador') {
      const cob = S.cobrador(session.id);
      if (!cob) {
        S.setSession(null);
        GC.render();
        return;
      }
      const tab = hash.startsWith('#cob/') ? hash.replace('#cob/', '') : 'ruta';
      root.innerHTML = GC.Cob.view(cob, tab);
      return;
    }
  };

  /* Pantalla de Selección de Perfil Demo */
  GC.renderRoleSelector = function () {
    const db = S.db();
    return `
      <div class="login-wrapper">
        <div class="login-box shadow-card">
          <div class="login-header">
            ${GC.logo()}
            <h1>GeoCartera</h1>
            <p class="text-muted text-sm">Plataforma Móvil y Cloud de Gestión de Cartera y Cobranza</p>
          </div>

          <div class="login-roles-list">
            <div class="role-group-title">ACCESO ADMINISTRADOR WEB</div>
            <button class="role-select-btn" data-action="login-as" data-role="admin">
              <div class="role-icon ic-admin">${UI.icon('dashboard')}</div>
              <div class="role-info">
                <b>Plataforma Web Administrador</b>
                <small>Auditoría de cajas, llaves de autorización, GPS y reportes</small>
              </div>
              <div class="role-arrow">${UI.icon('chev')}</div>
            </button>

            <div class="role-group-title mt-4">ACCESO APP MÓVIL COBRADORES (PUERTA A PUERTA)</div>
            ${db.cobradores.map(c => `
              <button class="role-select-btn" data-action="login-as" data-role="cobrador" data-id="${c.id}">
                <div class="role-icon" style="background:${c.color}; color:#fff;">${UI.icon('route')}</div>
                <div class="role-info">
                  <b>${U.esc(c.nombre)}</b>
                  <small>${c.zona} · Rutas y recaudo offline</small>
                </div>
                <div class="role-arrow">${UI.icon('chev')}</div>
              </button>
            `).join('')}

            <div class="role-group-title mt-4">PORTAL AUTOSERVICIO CLIENTES</div>
            <a href="#payview" class="role-select-btn">
              <div class="role-icon ic-client">${UI.icon('eye')}</div>
              <div class="role-info">
                <b>PayView para Clientes</b>
                <small>Consulta transparente de estados de cuenta y recibos</small>
              </div>
              <div class="role-arrow">${UI.icon('chev')}</div>
            </a>
          </div>

          <div class="login-footer">
            <small class="text-muted">Desarrollo Demo 100% Responsive PWA · Funcionalidad Offline y GPS</small>
          </div>
        </div>
      </div>
    `;
  };

  /* Manejo centralizado de clicks */
  GC.handleClick = function (e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    // Login
    if (action === 'login-as') {
      const role = target.dataset.role;
      const id = target.dataset.id || null;
      S.setSession({ role, id });
      if (role === 'admin') window.location.hash = '#admin/dashboard';
      else if (role === 'cobrador') window.location.hash = '#cob/ruta';
      GC.render();
      return;
    }

    // Logout
    if (action === 'logout') {
      S.setSession(null);
      window.location.hash = '';
      GC.render();
      return;
    }

    // Navegación móvil cobrador
    if (action === 'nav') {
      const tab = target.dataset.tab;
      window.location.hash = `#cob/${tab}`;
      return;
    }

    // Alternar Offline (Modo Avión)
    if (action === 'toggle-offline') {
      const isOff = S.isOffline();
      S.setOffline(!isOff);
      if (isOff) {
        const synced = S.sync();
        UI.toast(`¡Conexión restablecida! Se sincronizaron ${synced} operaciones con la nube.`);
      } else {
        UI.toast('Modo Offline Activado. Las operaciones se guardan en el dispositivo.');
      }
      GC.render();
      return;
    }

    // Optimizar Ruta (Algoritmo 2-opt)
    if (action === 'optimize-route') {
      const cobId = target.dataset.cobrador;
      const res = S.optimizar(cobId);
      UI.toast(`Ruta optimizada con éxito: de ${res.antes.toFixed(1)} km a ${res.despues.toFixed(1)} km`);
      GC.render();
      return;
    }

    // Abrir Modal de Gestión de Cobro al Cliente
    if (action === 'open-modal-cliente' || action === 'open-cliente') {
      const clId = target.dataset.id;
      GC.showCobroModal(clId);
      return;
    }

    // Cerrar Modal
    if (action === 'close-modal' || action === 'close-modal-bg') {
      UI.closeModal();
      return;
    }

    // Ver Recibo
    if (action === 'show-recibo') {
      const pid = target.dataset.id;
      UI.closeModal();
      GC.showRecibo(pid);
      return;
    }

    // Reset Demo
    if (action === 'reset-demo') {
      if (confirm('¿Deseas reiniciar los datos de prueba a su estado original?')) {
        S.reset();
        UI.toast('Base de datos restaurada');
        GC.render();
      }
      return;
    }

    // Reordenar cliente en admin
    if (action === 'reorder') {
      const clId = target.dataset.id;
      const dir = parseInt(target.dataset.dir, 10);
      S.mover(clId, dir);
      GC.render();
      return;
    }

    // Switch de cobrador en vista admin rutas
    if (action === 'admin-switch-ruta') {
      document.querySelectorAll('.cobradores-tab-bar .tab-btn').forEach(b => b.classList.remove('active'));
      target.classList.add('active');
      const cobId = target.dataset.id;
      document.getElementById('admin-ruta-container').innerHTML = GC.Admin.renderRutaDetalle(cobId);
      return;
    }

    // Resolver Autorización
    if (action === 'resolver-aut') {
      const id = target.dataset.id;
      const aprob = target.dataset.aprob === '1';
      const aut = S.resolver(id, aprob);
      if (aut) {
        UI.toast(aprob ? `Autorización aprobada. Llave generada: ${aut.llave}` : 'Autorización rechazada');
        GC.render();
      }
      return;
    }

    // Cerrar Caja del Día
    if (action === 'cerrar-caja') {
      const cobId = target.dataset.cobrador;
      const input = document.getElementById('caja-contado-input');
      const contado = input ? input.value : 0;
      S.cerrarCaja(cobId, contado);
      UI.toast('Caja del día cerrada con éxito');
      GC.render();
      return;
    }

    // PayView consultar documento
    if (action === 'payview-consultar') {
      const docInput = document.getElementById('payview-doc-input');
      const doc = docInput ? docInput.value.trim() : '';
      const cl = S.db().clientes.find(c => c.doc === doc);
      if (cl) {
        window.location.hash = `#payview/${cl.id}`;
      } else {
        UI.toast('No se encontró ningún cliente con ese documento', 'danger');
      }
      return;
    }

    if (action === 'payview-set-doc') {
      const doc = target.dataset.doc;
      const cl = S.db().clientes.find(c => c.doc === doc);
      if (cl) window.location.hash = `#payview/${cl.id}`;
      return;
    }

    // Exportar CSV
    if (action === 'export-audit-csv') {
      const db = S.db();
      const rows = [['Timestamp', 'Usuario', 'Rol', 'Accion', 'Detalle']];
      db.audit.forEach(a => rows.push([a.fecha, a.usuario, a.rol, a.accion, a.detalle]));
      U.csv(`Auditoria_GeoCartera_${U.today()}.csv`, rows);
      return;
    }

    // Modificar Cupo
    if (action === 'editar-cupo') {
      const clId = target.dataset.id;
      const cl = S.cliente(clId);
      const nuevo = prompt(`Nuevo cupo para ${cl.nombre}:`, cl.cupo);
      if (nuevo && !isNaN(nuevo)) {
        S.setCupo(clId, Number(nuevo));
        UI.toast('Cupo actualizado con éxito');
        GC.render();
      }
      return;
    }

    // Simular GPS
    if (action === 'simular-gps') {
      UI.toast('Simulación de ubicación GPS actualizada en el mapa');
      GC.render();
      return;
    }

    // Imprimir
    if (action === 'print') {
      window.print();
      return;
    }

    // Toggle Admin Menu Mobile
    if (action === 'toggle-admin-menu') {
      const sb = document.getElementById('admin-sidebar');
      if (sb) sb.classList.toggle('open');
      return;
    }

    // --- ACCIONES DEL MÓDULO DE USUARIOS Y ROLES ---
    if (action === 'crear-usuario') {
      GC.Users.modalNuevoUsuario();
      return;
    }

    if (action === 'crear-rol') {
      const nombre = prompt('Nombre del nuevo Rol (Ej. Coordinador de Cobranzas):');
      if (nombre && nombre.trim()) {
        const raw = S.raw();
        const id = 'rol_' + Date.now().toString(36);
        raw.roles = raw.roles || [];
        raw.roles.push({
          id,
          nombre: nombre.trim(),
          color: '#0284c7',
          desc: 'Rol personalizado creado por el Administrador',
          permisos: ['recaudo_cobrar', 'ventas_crear']
        });
        S.audit('Rol creado', `Nuevo rol: ${nombre.trim()}`);
        S.save();
        UI.toast('Rol creado exitosamente');
        GC.render();
      }
      return;
    }

    if (action === 'editar-permisos-rol') {
      const rolId = target.dataset.id;
      GC.Users.modalPermisosRol(rolId);
      return;
    }

    if (action === 'toggle-estado-usuario') {
      const uid = target.dataset.id;
      const raw = S.raw();
      const u = (raw.usuarios || []).find(x => x.id === uid);
      if (u) {
        u.estado = u.estado === 'activo' ? 'inactivo' : 'activo';
        S.audit('Estado de usuario modificado', `${u.nombre}: ${u.estado}`);
        S.save();
        UI.toast(`Usuario ${u.nombre} ahora está ${u.estado}`);
        GC.render();
      }
      return;
    }

    if (action === 'cambiar-rol-usuario') {
      const uid = target.dataset.id;
      const raw = S.raw();
      const u = (raw.usuarios || []).find(x => x.id === uid);
      if (!u) return;
      const roles = raw.roles || [];
      const opts = roles.map((r, i) => `${i + 1}. ${r.nombre}`).join('\n');
      const elegida = prompt(`Selecciona el nuevo rol para ${u.nombre}:\n${opts}\n\nIngresa el número:`);
      const idx = parseInt(elegida, 10) - 1;
      if (roles[idx]) {
        u.rolId = roles[idx].id;
        S.audit('Rol de usuario asignado', `${u.nombre} ahora tiene rol ${roles[idx].nombre}`);
        S.save();
        UI.toast('Rol actualizado con éxito');
        GC.render();
      }
      return;
    }
  };

  /* Modal de gestión de cobro / no pago */
  GC.showCobroModal = function (clienteId) {
    const cl = S.cliente(clienteId);
    const cr = S.creditoActivo(cl.id);
    const estado = S.estadoHoy(cl.id);
    const saldo = cr ? S.saldo(cr) : 0;
    const simDist = GC.simGPS(0.85); // 85% de probabilidad de estar en geocerca

    const html = `
      ${UI.modalHeader(U.esc(cl.nombre), `C.C. ${cl.doc} · ${U.esc(cl.direccion)}`)}
      <div class="modal-body">
        <div class="gps-notice ${simDist <= 50 ? 'gps-ok' : 'gps-alert'} mb-3">
          ${UI.icon('pin')} <span>GPS Cobrador: <b>${simDist} metros</b> del domicilio ${simDist <= 50 ? '(Dentro de geocerca)' : '(FUERA DE GEOCERCA > 50m)'}</span>
        </div>

        ${cr ? `
          <div class="credit-summary-card mb-3">
            <div class="summary-item">
              <span class="text-muted text-xs">VALOR CUOTA</span>
              <b>${U.money(cr.valorCuota)}</b>
            </div>
            <div class="summary-item">
              <span class="text-muted text-xs">SALDO TOTAL</span>
              <b>${U.money(saldo)}</b>
            </div>
            <div class="summary-item">
              <span class="text-muted text-xs">CUOTAS</span>
              <b>${S.cuotasPagadas(cr)} / ${cr.cuotas}</b>
            </div>
          </div>

          <form id="form-registro-abono" data-action="submit-abono">
            <input type="hidden" name="creditoId" value="${cr.id}">
            <input type="hidden" name="dist" value="${simDist}">

            <div class="form-group">
              <label class="form-label">Valor del Abono ($)</label>
              <input type="number" name="valor" class="form-input" value="${cr.valorCuota}" max="${saldo}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Método de Pago</label>
              <select name="metodo" class="form-input">
                <option value="efectivo">Efectivo</option>
                <option value="nequi">Nequi / Daviplata</option>
                <option value="transferencia">Transferencia Bancaria</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary btn-block mb-2">
              ${UI.icon('check')} Registrar Abono Recibido
            </button>
          </form>

          <hr class="my-3">

          <form id="form-registro-nopago" data-action="submit-nopago">
            <input type="hidden" name="clienteId" value="${cl.id}">
            <input type="hidden" name="dist" value="${simDist}">

            <div class="form-group">
              <label class="form-label">Reportar No Pago</label>
              <select name="motivo" class="form-input">
                ${GC.MOTIVOS.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <input type="text" name="nota" class="form-input" placeholder="Nota adicional (opcional)">
            </div>
            <button type="submit" class="btn btn-outline-danger btn-block">
              ${UI.icon('alert')} Reportar Visita Sin Pago
            </button>
          </form>
        ` : `
          <div class="alert alert-info">Este cliente no tiene créditos activos en este momento.</div>
        `}
      </div>
    `;

    UI.modal(html);
  };

  /* Manejo centralizado de formularios */
  GC.handleSubmit = function (e) {
    const form = e.target;
    const action = form.dataset.action;
    if (!action) return;
    e.preventDefault();

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    // 1. Submit Abono
    if (action === 'submit-abono') {
      const res = S.registrarPago({
        creditoId: data.creditoId,
        valor: data.valor,
        metodo: data.metodo,
        dist: parseInt(data.dist, 10)
      });

      if (res.error) {
        UI.toast(res.error, 'danger');
        return;
      }
      if (res.pendiente) {
        UI.toast('El abono requiere aprobación remota (Geocerca o Adelanto). Llave solicitada a la web.', 'warning');
        UI.closeModal();
        GC.render();
        return;
      }
      UI.toast('¡Abono registrado con éxito!');
      UI.closeModal();
      GC.render();
      GC.showRecibo(res.pago.id);
      return;
    }

    // 2. Submit No Pago
    if (action === 'submit-nopago') {
      const res = S.registrarNoPago({
        clienteId: data.clienteId,
        motivo: data.motivo,
        nota: data.nota,
        dist: parseInt(data.dist, 10)
      });
      if (res.error) {
        UI.toast(res.error, 'danger');
        return;
      }
      UI.toast('Visita sin pago reportada');
      UI.closeModal();
      GC.render();
      return;
    }

    // 3. Submit Venta
    if (action === 'submit-venta') {
      const res = S.crearVenta(data);
      if (res.error) {
        UI.toast(res.error, 'danger');
        return;
      }
      if (res.pendiente) {
        UI.toast('Pre-venta enviada a la plataforma web para autorización remota del Administrador', 'warning');
      } else {
        UI.toast('¡Venta / Crédito aprobado y registrado!');
      }
      window.location.hash = '#cob/ruta';
      GC.render();
      return;
    }

    // 4. Submit Gasto
    if (action === 'submit-gasto') {
      const res = S.registrarGasto(data);
      if (res.error) {
        UI.toast(res.error, 'danger');
        return;
      }
      if (res.pendiente) {
        UI.toast('Pre-gasto supera el límite sin llave. Notificación enviada al administrador.', 'warning');
      } else {
        UI.toast('Gasto registrado en caja');
      }
      GC.render();
      return;
    }

    // 5. Submit Nuevo Usuario
    if (action === 'submit-nuevo-usuario') {
      const raw = S.raw();
      raw.usuarios = raw.usuarios || [];
      const nuevo = {
        id: 'usr_' + Date.now().toString(36),
        nombre: data.nombre.trim(),
        email: data.email.trim(),
        rolId: data.rolId,
        cobradorId: data.cobradorId || null,
        estado: 'activo',
        ultimoAcceso: new Date().toISOString()
      };
      raw.usuarios.push(nuevo);
      S.audit('Usuario registrado', `${nuevo.nombre} (${nuevo.email}) con rol ${nuevo.rolId}`);
      S.save();
      UI.closeModal();
      UI.toast('Usuario creado y activado correctamente');
      GC.render();
      return;
    }

    // 6. Guardar Permisos del Rol
    if (action === 'guardar-permisos-rol') {
      const raw = S.raw();
      const rolId = data.rolId;
      const checkboxes = form.querySelectorAll('input[name="permisos"]:checked');
      const perms = Array.from(checkboxes).map(c => c.value);

      const rol = (raw.roles || []).find(r => r.id === rolId);
      if (rol) {
        rol.permisos = perms;
        S.audit('Permisos de rol actualizados', `Rol ${rol.nombre}: ${perms.length} permisos asignados`);
        S.save();
        UI.closeModal();
        UI.toast(`Permisos actualizados para el rol ${rol.nombre}`);
        GC.render();
      }
      return;
    }
  };

  /* Manejo de eventos change */
  GC.handleChange = function (e) {
    if (e.target.name === 'tipo' && e.target.form && e.target.form.id === 'form-venta') {
      const isNuevo = e.target.value === 'nuevo';
      document.getElementById('venta-campos-nuevo').style.display = isNuevo ? 'block' : 'none';
      document.getElementById('venta-campos-renov').style.display = isNuevo ? 'none' : 'block';
    }
  };
})(window.GC);
