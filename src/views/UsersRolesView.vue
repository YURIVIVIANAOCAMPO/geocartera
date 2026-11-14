<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Seguridad & RBAC</span>
          <span class="text-xs text-slate-500">Matriz de Acceso</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mt-1">Gestión de Usuarios, Roles y Permisos</h2>
        <p class="text-sm text-slate-500">Configuración de niveles de autorización para la empresa actual: <b>{{ currentTenant?.nombreEmpresa }}</b></p>
      </div>

      <div class="flex gap-2">
        <button @click="showNewRoleModal = true" class="flex items-center gap-2 px-3.5 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">
          <BaseIcon name="shield" />
          <span>Nuevo Rol</span>
        </button>
        <button @click="showNewUserModal = true" class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-sm transition">
          <BaseIcon name="plus" />
          <span>Nuevo Usuario</span>
        </button>
      </div>
    </div>

    <!-- Resumen de Roles y Permisos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="rol in roles" :key="rol.id" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="font-bold text-slate-900">{{ rol.nombre }}</span>
            <span class="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-slate-600">{{ rol.permisos.length }} perms</span>
          </div>
          <p class="text-xs text-slate-500 mb-4">{{ rol.desc }}</p>
        </div>
        <button @click="openEditPerms(rol)" class="w-full py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center justify-center gap-1.5">
          <BaseIcon name="gear" class="w-3.5 h-3.5" />
          <span>Configurar Permisos</span>
        </button>
      </div>
    </div>

    <!-- Directorio de Usuarios -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 class="font-bold text-slate-800">Personal Registrado en la Empresa</h3>
        <span class="text-xs text-slate-400">{{ usuarios.length }} cuentas configuradas</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <th class="p-3.5">Funcionario / Nombre</th>
              <th class="p-3.5">Correo Electrónico</th>
              <th class="p-3.5">Rol Asignado</th>
              <th class="p-3.5">Ruta Vinculada</th>
              <th class="p-3.5">Estado</th>
              <th class="p-3.5">Último Acceso</th>
              <th class="p-3.5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in usuarios" :key="u.id" class="hover:bg-slate-50/80 transition">
              <td class="p-3.5 font-bold text-slate-900">{{ u.nombre }}</td>
              <td class="p-3.5 font-mono text-xs text-slate-600">{{ u.email }}</td>
              <td class="p-3.5">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {{ getRoleName(u.rolId) }}
                </span>
              </td>
              <td class="p-3.5 text-xs">
                <span v-if="getCobrador(u.cobradorId)" class="font-semibold text-slate-700">
                  {{ getCobrador(u.cobradorId).zona }}
                </span>
                <span v-else class="text-slate-400">Usuario de Oficina</span>
              </td>
              <td class="p-3.5">
                <span :class="u.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'" class="px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {{ u.estado.toUpperCase() }}
                </span>
              </td>
              <td class="p-3.5 text-xs text-slate-500">
                {{ U.fmtDateTime(u.ultimoAcceso) }}
              </td>
              <td class="p-3.5 text-right">
                <button @click="saasActions.toggleUserStatus(u.id)" :class="u.estado === 'activo' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'" class="px-2.5 py-1 text-xs font-semibold rounded border">
                  {{ u.estado === 'activo' ? 'Bloquear' : 'Activar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Editar Permisos Rol -->
    <div v-if="editingRole" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 class="font-bold text-slate-900 text-lg">Permisos: {{ editingRole.nombre }}</h3>
            <p class="text-xs text-slate-500">Selecciona las facultades y permisos autorizados para este rol.</p>
          </div>
          <button @click="editingRole = null" class="text-slate-400 hover:text-slate-600"><BaseIcon name="x" /></button>
        </div>

        <div class="overflow-y-auto flex-1 pr-2 space-y-4">
          <div v-for="(catPerms, catName) in permisosPorCategoria" :key="catName" class="border border-slate-200 rounded-lg p-4">
            <h4 class="font-bold text-sm text-slate-800 mb-3 text-indigo-700 border-b border-slate-100 pb-1">{{ catName }}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label v-for="p in catPerms" :key="p.id" class="flex items-start gap-2.5 p-2 rounded border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" :value="p.id" v-model="editingRole.permisos" class="mt-1 rounded text-emerald-600">
                <div>
                  <div class="text-xs font-bold text-slate-900">{{ p.nombre }}</div>
                  <div class="text-[11px] text-slate-500">{{ p.desc }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button type="button" @click="editingRole = null" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Cancelar</button>
          <button type="button" @click="saveRolePerms" class="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 text-sm">Guardar Permisos</button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Usuario -->
    <div v-if="showNewUserModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 class="font-bold text-slate-900 text-lg">Crear Nuevo Usuario</h3>
          <button @click="showNewUserModal = false" class="text-slate-400 hover:text-slate-600"><BaseIcon name="x" /></button>
        </div>

        <form @submit.prevent="handleCreateUser" class="space-y-4 text-sm">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
            <input v-model="newUserForm.nombre" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Ej. Fernando Ramos" required>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
            <input v-model="newUserForm.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="fernando@empresa.co" required>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Rol y Nivel de Acceso *</label>
            <select v-model="newUserForm.rolId" class="w-full px-3 py-2 border border-slate-300 rounded-lg" required>
              <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Vincular a Ruta / Cobrador (Opcional)</label>
            <select v-model="newUserForm.cobradorId" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option :value="null">-- Ninguno (Usuario Administrativo) --</option>
              <option v-for="c in cobradores" :key="c.id" :value="c.id">{{ c.nombre }} ({{ c.zona }})</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showNewUserModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">Guardar Usuario</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { saasState, saasActions, saasGetters } from '../stores/saasStore.js';
import { U } from '../utils/formatters.js';
import BaseIcon from '../components/BaseIcon.vue';

const currentTenant = saasGetters.currentTenant;

const CATALOGO_PERMISOS = [
  { id: 'recaudo_cobrar', nombre: 'Registrar Cobros', desc: 'Permite registrar abonos y visitas sin pago en campo', cat: 'Operación Calle' },
  { id: 'recaudo_geocerca_bypass', nombre: 'Ignorar Geocerca', desc: 'Permite cobrar a más de 50 metros sin requerir llave', cat: 'Operación Calle' },
  { id: 'ventas_crear', nombre: 'Registrar Nuevas Ventas', desc: 'Permite colocar préstamos a clientes nuevos o renovaciones', cat: 'Ventas y Créditos' },
  { id: 'ventas_aprobar', nombre: 'Aprobar Pre-Ventas', desc: 'Autorizar solicitudes de crédito que superen cupo', cat: 'Ventas y Créditos' },
  { id: 'caja_abrir_cerrar', nombre: 'Apertura y Cierre de Caja', desc: 'Realizar cuadre diario y registrar arqueo físico', cat: 'Flujo de Caja' },
  { id: 'caja_modificar_base', nombre: 'Modificar Base Inicial', desc: 'Ajustar la base de dinero entregada al cobrador', cat: 'Flujo de Caja' },
  { id: 'gastos_registrar', nombre: 'Registrar Gastos de Ruta', desc: 'Reportar gastos de gasolina, viáticos y repuestos', cat: 'Flujo de Caja' },
  { id: 'gastos_aprobar', nombre: 'Aprobar Pre-Gastos', desc: 'Autorizar gastos imprevistos por encima del límite', cat: 'Flujo de Caja' },
  { id: 'rutas_reordenar', nombre: 'Modificar y Optimizar Rutas', desc: 'Alterar el orden de visita de los clientes', cat: 'Rutas Inteligentes' },
  { id: 'clientes_modificar_cupo', nombre: 'Modificar Cupos Financieros', desc: 'Aumentar o reducir la línea de crédito del cliente', cat: 'Cartera y Clientes' },
  { id: 'seguridad_usuarios', nombre: 'Administrar Usuarios y Roles', desc: 'Crear personal, asignar perfiles y bloquear cuentas', cat: 'Seguridad' },
  { id: 'reportes_auditoria', nombre: 'Ver Auditoría y Exportar Datos', desc: 'Acceso a la bitácora forense de operaciones y CSV', cat: 'Seguridad' }
];

const roles = computed(() => {
  return saasState.db.roles.filter(r => r.tenantId === currentTenant.value?.id || r.tenantId === null);
});

const usuarios = computed(() => {
  return saasState.db.usuarios.filter(u => u.tenantId === currentTenant.value?.id);
});

const cobradores = computed(() => {
  return saasState.db.cobradores.filter(c => c.tenantId === currentTenant.value?.id);
});

const permisosPorCategoria = computed(() => {
  const map = {};
  CATALOGO_PERMISOS.forEach(p => {
    map[p.cat] = map[p.cat] || [];
    map[p.cat].push(p);
  });
  return map;
});

const editingRole = ref(null);
const showNewUserModal = ref(false);
const showNewRoleModal = ref(false);

const newUserForm = ref({
  nombre: '',
  email: '',
  rolId: 'cobrador',
  cobradorId: null
});

function getRoleName(rolId) {
  const r = saasState.db.roles.find(x => x.id === rolId);
  return r ? r.nombre : rolId;
}

function getCobrador(cobId) {
  return saasState.db.cobradores.find(c => c.id === cobId);
}

function openEditPerms(rol) {
  editingRole.value = JSON.parse(JSON.stringify(rol));
}

function saveRolePerms() {
  if (editingRole.value) {
    saasActions.saveRolePermissions(editingRole.value.id, editingRole.value.permisos);
    editingRole.value = null;
  }
}

function handleCreateUser() {
  saasActions.createUser({
    ...newUserForm.value,
    tenantId: currentTenant.value?.id
  });
  showNewUserModal.value = false;
  newUserForm.value = {
    nombre: '',
    email: '',
    rolId: 'cobrador',
    cobradorId: null
  };
}
</script>
