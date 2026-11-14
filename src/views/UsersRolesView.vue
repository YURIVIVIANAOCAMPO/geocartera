<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-100">
            {{ t('securityBadge') }}
          </span>
          <span class="text-xs text-slate-400">{{ t('accessControlBadge') }}</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('rbacTitle') }}</h2>
        <p class="text-sm text-slate-500 mt-0.5">{{ t('rbacSubtitle') }} <b>{{ currentTenant?.nombreEmpresa }}</b></p>
      </div>

      <div class="flex gap-2.5">
        <button 
          @click="showNewRoleModal = true" 
          class="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 text-xs transition active:scale-95 shadow-xs"
        >
          <BaseIcon name="shield" size="xs" />
          <span>{{ t('newRole') }}</span>
        </button>
        <button 
          @click="showNewUserModal = true" 
          class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-700/20 transition active:scale-95"
        >
          <BaseIcon name="plus" size="xs" />
          <span>{{ t('newUser') }}</span>
        </button>
      </div>
    </div>

    <!-- Resumo dos Perfis / Funções (Roles) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="rol in roles" 
        :key="rol.id" 
        class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition"
      >
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <span class="font-extrabold text-slate-900 text-sm">{{ getRoleName(rol) }}</span>
            <span class="text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full font-black text-slate-600 border border-slate-200/60">
              {{ rol.permisos.length }} {{ t('rolePermsCount') }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mb-4 leading-relaxed">{{ getRoleDesc(rol) }}</p>
        </div>
        <button 
          @click="openEditPerms(rol)" 
          class="w-full py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-100"
        >
          <BaseIcon name="gear" size="xs" />
          <span>{{ t('configurePerms') }}</span>
        </button>
      </div>
    </div>

    <!-- Tabela de Usuários e Equipe -->
    <div class="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div class="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 class="font-bold text-slate-900 text-base">{{ t('registeredStaff') }}</h3>
          <p class="text-xs text-slate-500">{{ t('membersWithCredentials') }}</p>
        </div>
        <span class="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-600">
          {{ usuarios.length }} {{ t('accountsCount') }}
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50/75 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
              <th class="p-4">{{ t('colleagueName') }}</th>
              <th class="p-4">{{ t('email') }}</th>
              <th class="p-4">{{ t('assignedRole') }}</th>
              <th class="p-4">{{ t('linkedRoute') }}</th>
              <th class="p-4">{{ t('status') }}</th>
              <th class="p-4">{{ t('lastAccess') }}</th>
              <th class="p-4 text-right">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="u in usuarios" :key="u.id" class="hover:bg-slate-50/80 transition">
              <td class="p-4 font-extrabold text-slate-900 text-sm">{{ u.nombre }}</td>
              <td class="p-4 font-mono text-xs text-slate-600">{{ u.email }}</td>
              <td class="p-4">
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {{ getRoleNameById(u.rolId) }}
                </span>
              </td>
              <td class="p-4 text-xs font-medium">
                <span v-if="getCobrador(u.cobradorId)" class="font-bold text-slate-800 flex items-center gap-1">
                  <BaseIcon name="route" size="xs" class="text-slate-400" />
                  {{ getCobrador(u.cobradorId).zona }}
                </span>
                <span v-else class="text-slate-400">{{ t('officeUser') }}</span>
              </td>
              <td class="p-4">
                <span 
                  :class="u.estado === 'activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" 
                  class="px-2.5 py-1 rounded-full text-xs font-bold border"
                >
                  {{ u.estado === 'activo' ? t('activeStatus') : t('inactiveStatus') }}
                </span>
              </td>
              <td class="p-4 text-xs text-slate-500 font-medium">
                {{ U.fmtDateTime(u.ultimoAcceso, saasState.locale) }}
              </td>
              <td class="p-4 text-right">
                <button 
                  @click="saasActions.toggleUserStatus(u.id)" 
                  :class="u.estado === 'activo' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'" 
                  class="px-3 py-1.5 text-xs font-bold rounded-xl border transition active:scale-95"
                >
                  {{ u.estado === 'activo' ? t('block') : t('activate') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Editar Permisos Rol (RBAC) -->
    <div v-if="editingRole" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-5 shrink-0">
          <div>
            <h3 class="font-extrabold text-slate-900 text-lg">{{ t('configurePerms') }}: {{ getRoleName(editingRole) }}</h3>
            <p class="text-xs text-slate-500 font-medium">{{ t('definePermissionsMsg') }}</p>
          </div>
          <button @click="editingRole = null" class="text-slate-400 hover:text-slate-700 p-1">
            <BaseIcon name="x" size="md" />
          </button>
        </div>

        <div class="overflow-y-auto flex-1 pr-2 space-y-4">
          <div v-for="(catPerms, catKey) in permisosPorCategoria" :key="catKey" class="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <h4 class="font-black text-xs text-indigo-700 uppercase tracking-wider border-b border-slate-200/80 pb-2 mb-3">{{ t(catKey) }}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label 
                v-for="p in catPerms" 
                :key="p.id" 
                class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 cursor-pointer transition shadow-xs"
              >
                <input type="checkbox" :value="p.id" v-model="editingRole.permisos" class="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4">
                <div>
                  <div class="text-xs font-bold text-slate-900">{{ t('perm_' + p.id) }}</div>
                  <div class="text-[11px] text-slate-500 leading-snug mt-0.5">{{ t('perm_' + p.id + '_desc') }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-4 shrink-0">
          <button type="button" @click="editingRole = null" class="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition text-xs">
            {{ t('cancel') }}
          </button>
          <button type="button" @click="saveRolePerms" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md transition text-xs active:scale-95">
            {{ t('savePerms') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Novo Usuário -->
    <div v-if="showNewUserModal" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
          <h3 class="font-extrabold text-slate-900 text-lg">{{ t('newUser') }}</h3>
          <button @click="showNewUserModal = false" class="text-slate-400 hover:text-slate-700 p-1">
            <BaseIcon name="x" size="md" />
          </button>
        </div>

        <form @submit.prevent="handleCreateUser" class="space-y-4 text-sm">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('colleagueName') }} *</label>
            <input v-model="newUserForm.nombre" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600" required>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('email') }} *</label>
            <input v-model="newUserForm.email" type="email" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600" required>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('assignedRole') }} *</label>
            <select v-model="newUserForm.rolId" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-semibold" required>
              <option v-for="r in roles" :key="r.id" :value="r.id">{{ getRoleName(r) }}</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('linkedRoute') }}</label>
            <select v-model="newUserForm.cobradorId" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium">
              <option :value="null">{{ t('noneOfficeUser') }}</option>
              <option v-for="c in cobradores" :key="c.id" :value="c.id">{{ c.nombre }} ({{ c.zona }})</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button type="button" @click="showNewUserModal = false" class="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">
              {{ t('cancel') }}
            </button>
            <button type="submit" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md transition active:scale-95">
              {{ t('saveUser') }}
            </button>
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
import { i18n } from '../utils/i18n.js';
import BaseIcon from '../components/BaseIcon.vue';

function t(key) {
  const lang = saasState.locale || 'es';
  return (i18n[lang] && i18n[lang][key]) || (i18n['es'] && i18n['es'][key]) || key;
}

const currentTenant = saasGetters.currentTenant;

const CATALOGO_PERMISOS = [
  { id: 'recaudo_cobrar', catKey: 'cat_campo' },
  { id: 'recaudo_geocerca_bypass', catKey: 'cat_campo' },
  { id: 'ventas_crear', catKey: 'cat_ventas' },
  { id: 'ventas_aprobar', catKey: 'cat_ventas' },
  { id: 'caja_abrir_cerrar', catKey: 'cat_caja' },
  { id: 'caja_modificar_base', catKey: 'cat_caja' },
  { id: 'gastos_registrar', catKey: 'cat_caja' },
  { id: 'gastos_aprobar', catKey: 'cat_caja' },
  { id: 'rutas_reordenar', catKey: 'cat_rutas' },
  { id: 'clientes_modificar_cupo', catKey: 'cat_clientes' },
  { id: 'seguridad_usuarios', catKey: 'cat_seguridad' },
  { id: 'reportes_auditoria', catKey: 'cat_seguridad' }
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
    map[p.catKey] = map[p.catKey] || [];
    map[p.catKey].push(p);
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

function getRoleName(rol) {
  if (!rol) return '';
  const key = rol.key || rol.id;
  const i18nKey = `role_${key}_name`;
  const translated = t(i18nKey);
  if (translated !== i18nKey) return translated;
  return rol.nombre || key;
}

function getRoleDesc(rol) {
  if (!rol) return '';
  const key = rol.key || rol.id;
  const i18nKey = `role_${key}_desc`;
  const translated = t(i18nKey);
  if (translated !== i18nKey) return translated;
  return rol.desc || '';
}

function getRoleNameById(rolId) {
  const r = saasState.db.roles.find(x => x.id === rolId || x.key === rolId);
  if (!r) return rolId;
  return getRoleName(r);
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
