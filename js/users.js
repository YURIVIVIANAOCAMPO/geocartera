/* GeoCartera · Módulo de Gestión de Usuarios, Roles y Permisos (RBAC) */
(function (GC) {
  const U = GC.U, S = GC.S, UI = GC.UI;
  const Users = (GC.Users = {});

  // Catálogo base de permisos del sistema
  Users.PERMISOS = [
    { id: 'recaudo_cobrar', nombre: 'Registrar Cobros', desc: 'Permite registrar abonos y visitas sin pago en campo', cat: 'Operación' },
    { id: 'recaudo_geocerca_bypass', nombre: 'Ignorar Geocerca', desc: 'Permite cobrar a más de 50 metros sin requerir llave', cat: 'Operación' },
    { id: 'ventas_crear', nombre: 'Registrar Nuevas Ventas', desc: 'Permite colocar préstamos a clientes nuevos o renovaciones', cat: 'Ventas' },
    { id: 'ventas_aprobar', nombre: 'Aprobar Pre-Ventas', desc: 'Autorizar solicitudes de crédito que superen cupo', cat: 'Ventas' },
    { id: 'caja_abrir_cerrar', nombre: 'Apertura y Cierre de Caja', desc: 'Realizar cuadre diario y registrar arqueo físico', cat: 'Caja' },
    { id: 'caja_modificar_base', nombre: 'Modificar Base Inicial', desc: 'Ajustar la base de dinero entregada al cobrador', cat: 'Caja' },
    { id: 'gastos_registrar', nombre: 'Registrar Gastos de Ruta', desc: 'Reportar gastos de gasolina, viáticos y repuestos', cat: 'Caja' },
    { id: 'gastos_aprobar', nombre: 'Aprobar Pre-Gastos', desc: 'Autorizar gastos imprevistos por encima del límite', cat: 'Caja' },
    { id: 'rutas_reordenar', nombre: 'Modificar y Optimizar Rutas', desc: 'Alterar el orden de visita de los clientes', cat: 'Rutas' },
    { id: 'clientes_modificar_cupo', nombre: 'Modificar Cupos Financieros', desc: 'Aumentar o reducir la línea de crédito del cliente', cat: 'Clientes' },
    { id: 'seguridad_usuarios', nombre: 'Administrar Usuarios y Roles', desc: 'Crear personal, asignar perfiles y bloquear cuentas', cat: 'Seguridad' },
    { id: 'reportes_auditoria', nombre: 'Ver Auditoría y Exportar Datos', desc: 'Acceso a la bitácora forense de operaciones y CSV', cat: 'Seguridad' }
  ];

  // Definición de Roles predeterminados
  Users.ROLES_DEFAULT = [
    {
      id: 'admin_general',
      nombre: 'Administrador General',
      color: '#0f766e',
      desc: 'Acceso ilimitado a todas las funciones financieras, operativas y de seguridad.',
      permisos: Users.PERMISOS.map(p => p.id)
    },
    {
      id: 'supervisor',
      nombre: 'Supervisor de Zona',
      color: '#2563eb',
      desc: 'Supervisión en tiempo real de cobradores, auditoría de rutas y aprobación de llaves.',
      permisos: [
        'recaudo_cobrar', 'ventas_crear', 'ventas_aprobar', 'gastos_aprobar',
        'rutas_reordenar', 'clientes_modificar_cupo', 'reportes_auditoria'
      ]
    },
    {
      id: 'cobrador_senior',
      nombre: 'Cobrador / Asesor en Campo',
      color: '#7c3aed',
      desc: 'Gestión diaria de ruta puerta a puerta, cobros offline y registro de gastos.',
      permisos: [
        'recaudo_cobrar', 'ventas_crear', 'caja_abrir_cerrar', 'gastos_registrar'
      ]
    },
    {
      id: 'auditor',
      nombre: 'Auditor Financiero',
      color: '#d97706',
      desc: 'Inspección de reportes de flujo de caja y logs forenses sin permisos de escritura.',
      permisos: [
        'reportes_auditoria'
      ]
    }
  ];

  // Inicializar o cargar usuarios y roles en la base de datos
  Users.initDB = function () {
    const raw = S.raw();
    if (!raw.roles) {
      raw.roles = JSON.parse(JSON.stringify(Users.ROLES_DEFAULT));
    }
    if (!raw.usuarios) {
      raw.usuarios = [
        {
          id: 'usr_admin',
          nombre: 'Administrador General',
          email: 'admin@geocartera.app',
          rolId: 'admin_general',
          estado: 'activo',
          ultimoAcceso: new Date().toISOString(),
          cobradorId: null
        },
        {
          id: 'usr_c1',
          nombre: 'Carlos Pérez',
          email: 'carlos.perez@geocartera.app',
          rolId: 'cobrador_senior',
          estado: 'activo',
          ultimoAcceso: new Date().toISOString(),
          cobradorId: 'c1'
        },
        {
          id: 'usr_c2',
          nombre: 'Andrea Gómez',
          email: 'andrea.gomez@geocartera.app',
          rolId: 'cobrador_senior',
          estado: 'activo',
          ultimoAcceso: new Date().toISOString(),
          cobradorId: 'c2'
        },
        {
          id: 'usr_c3',
          nombre: 'Luis Martínez',
          email: 'luis.martinez@geocartera.app',
          rolId: 'cobrador_senior',
          estado: 'activo',
          ultimoAcceso: new Date().toISOString(),
          cobradorId: 'c3'
        },
        {
          id: 'usr_sup',
          nombre: 'Marcela Castillo',
          email: 'marcela.sup@geocartera.app',
          rolId: 'supervisor',
          estado: 'activo',
          ultimoAcceso: new Date(Date.now() - 3600000 * 4).toISOString(),
          cobradorId: null
        }
      ];
      S.save();
    }
  };

  // Consultas de verificación de permisos
  Users.tienePermiso = function (rolId, permisoId) {
    const raw = S.raw();
    const rol = (raw.roles || Users.ROLES_DEFAULT).find(r => r.id === rolId);
    if (!rol) return false;
    return rol.permisos.includes(permisoId);
  };

  // Vista del módulo en la plataforma de administración
  Users.renderView = function () {
    Users.initDB();
    const raw = S.raw();
    const usuarios = raw.usuarios || [];
    const roles = raw.roles || [];

    return `
      <div class="shadow-card p-4">
        <div class="section-title-row">
          <div>
            <h3>Gestión de Usuarios, Roles y Permisos (RBAC)</h3>
            <p class="text-muted text-sm">Control de acceso granular a módulos, facultades operativas y personal autorizado</p>
          </div>
          <div class="actions-group">
            <button class="btn btn-sm btn-outline" data-action="crear-rol">
              ${UI.icon('key')} Nuevo Rol
            </button>
            <button class="btn btn-sm btn-primary" data-action="crear-usuario">
              ${UI.icon('plus')} Nuevo Usuario
            </button>
          </div>
        </div>

        <!-- Matriz de Roles y Niveles -->
        <div class="roles-grid-summary mt-4">
          ${roles.map(r => `
            <div class="role-summary-card shadow-card" style="border-top: 4px solid ${r.color};">
              <div class="role-card-header">
                <b>${U.esc(r.nombre)}</b>
                <span class="badge-subtle">${r.permisos.length} permisos</span>
              </div>
              <p class="role-desc">${U.esc(r.desc)}</p>
              <div class="role-footer-action">
                <button class="btn btn-xs btn-outline" data-action="editar-permisos-rol" data-id="${r.id}">
                  ${UI.icon('gear')} Configurar Permisos
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Tabla de Usuarios Registrados -->
        <h4 class="mt-5 mb-3">Usuarios y Colaboradores del Sistema</h4>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuario / Funcionario</th>
                <th>Correo Electrónico</th>
                <th>Rol Asignado</th>
                <th>Vínculo Operativo</th>
                <th>Estado</th>
                <th>Última Conexión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${usuarios.map(u => {
                const rol = roles.find(r => r.id === u.rolId) || { nombre: u.rolId, color: '#666' };
                const cob = u.cobradorId ? S.cobrador(u.cobradorId) : null;
                return `
                  <tr>
                    <td>
                      <b>${U.esc(u.nombre)}</b>
                    </td>
                    <td><span class="font-mono text-sm">${U.esc(u.email)}</span></td>
                    <td>
                      <span class="badge" style="background:${rol.color}18; color:${rol.color}; border:1px solid ${rol.color}40;">
                        ${U.esc(rol.nombre)}
                      </span>
                    </td>
                    <td>
                      ${cob ? `<span class="badge-subtle">Ruta: ${cob.zona}</span>` : '<span class="text-muted">Personal Administrativo</span>'}
                    </td>
                    <td>
                      <span class="badge ${u.estado === 'activo' ? 'badge-success' : 'badge-danger'}">
                        ${u.estado.toUpperCase()}
                      </span>
                    </td>
                    <td><small class="text-muted">${U.ago(u.ultimoAcceso)}</small></td>
                    <td>
                      <div class="actions-group">
                        <button class="btn btn-xs btn-outline" data-action="cambiar-rol-usuario" data-id="${u.id}">
                          Cambiar Rol
                        </button>
                        <button class="btn btn-xs ${u.estado === 'activo' ? 'btn-outline-danger' : 'btn-outline-success'}" 
                                data-action="toggle-estado-usuario" data-id="${u.id}">
                          ${u.estado === 'activo' ? 'Bloquear' : 'Activar'}
                        </button>
                      </div>
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

  // Modal para configurar permisos de un rol
  Users.modalPermisosRol = function (rolId) {
    const raw = S.raw();
    const rol = (raw.roles || []).find(r => r.id === rolId);
    if (!rol) return;

    // Agrupar permisos por categoría
    const categorias = {};
    Users.PERMISOS.forEach(p => {
      categorias[p.cat] = categorias[p.cat] || [];
      categorias[p.cat].push(p);
    });

    const html = `
      ${UI.modalHeader(`Permisos del Rol: ${U.esc(rol.nombre)}`, rol.desc)}
      <div class="modal-body">
        <form id="form-permisos-rol" data-action="guardar-permisos-rol">
          <input type="hidden" name="rolId" value="${rol.id}">
          
          <div class="permisos-cat-container">
            ${Object.entries(categorias).map(([cat, perms]) => `
              <div class="permiso-cat-block mb-3">
                <h5 class="text-primary border-bottom pb-1 mb-2">${cat}</h5>
                <div class="permisos-checklist">
                  ${perms.map(p => `
                    <label class="permiso-checkbox-item">
                      <input type="checkbox" name="permisos" value="${p.id}" ${rol.permisos.includes(p.id) ? 'checked' : ''}>
                      <div>
                        <b>${p.nombre}</b>
                        <p class="text-muted text-xs mb-0">${p.desc}</p>
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="actions-row end mt-4">
            <button type="button" class="btn btn-ghost" data-action="close-modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">${UI.icon('check')} Guardar Cambios</button>
          </div>
        </form>
      </div>
    `;

    UI.modal(html, { wide: true });
  };

  // Modal para crear un nuevo usuario
  Users.modalNuevoUsuario = function () {
    const raw = S.raw();
    const roles = raw.roles || [];
    const cobradores = raw.cobradores || [];

    const html = `
      ${UI.modalHeader('Crear Nuevo Usuario', 'Asigna credenciales, rol y ruta operativa')}
      <div class="modal-body">
        <form id="form-nuevo-usuario" data-action="submit-nuevo-usuario">
          <div class="form-group">
            <label class="form-label">Nombre y Apellidos *</label>
            <input type="text" name="nombre" class="form-input" placeholder="Ej. Javier Mendoza" required>
          </div>

          <div class="form-group">
            <label class="form-label">Correo Electrónico *</label>
            <input type="email" name="email" class="form-input" placeholder="javier@geocartera.app" required>
          </div>

          <div class="form-group">
            <label class="form-label">Rol y Nivel de Acceso *</label>
            <select name="rolId" class="form-input" required>
              ${roles.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Vincular a Cobrador / Ruta (Opcional)</label>
            <select name="cobradorId" class="form-input">
              <option value="">-- Ninguno (Usuario de Oficina) --</option>
              ${cobradores.map(c => `<option value="${c.id}">${c.nombre} (${c.zona})</option>`).join('')}
            </select>
          </div>

          <div class="actions-row end mt-4">
            <button type="button" class="btn btn-ghost" data-action="close-modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">${UI.icon('check')} Registrar Usuario</button>
          </div>
        </form>
      </div>
    `;

    UI.modal(html);
  };
})(window.GC);
