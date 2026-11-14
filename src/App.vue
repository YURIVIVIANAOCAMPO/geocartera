<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
    <!-- Notificación Toast Reactiva Global -->
    <div v-if="saasState.toast" class="fixed bottom-5 right-5 z-50">
      <div :class="saasState.toast.type === 'danger' ? 'bg-rose-600' : saasState.toast.type === 'warning' ? 'bg-amber-600' : 'bg-slate-900'" class="text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2">
        <BaseIcon name="check" class="w-4 h-4" />
        <span>{{ saasState.toast.message }}</span>
      </div>
    </div>

    <!-- 1. Si no hay sesión: Login Selector -->
    <LoginSelectorView v-if="!session" />

    <!-- 2. Si es Cobrador: App Móvil Responsive -->
    <MobileCollectorView v-else-if="session.role === 'cobrador'" />

    <!-- 3. Si es SuperAdmin o TenantAdmin: Layout Web de Gestión -->
    <div v-else class="min-h-screen flex flex-col md:flex-row">
      <!-- Sidebar de Navegación -->
      <aside class="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col">
        <div class="p-5 border-b border-slate-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white">
            GC
          </div>
          <div>
            <h1 class="font-black text-lg leading-tight">GeoCartera</h1>
            <span class="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase">
              {{ session.role === 'super_admin' ? 'SaaS SuperAdmin' : 'Empresa Admin' }}
            </span>
          </div>
        </div>

        <nav class="p-4 space-y-1.5 flex-1">
          <!-- Opciones para SuperAdmin SaaS -->
          <template v-if="session.role === 'super_admin'">
            <button @click="currentView = 'tenants'" :class="currentView === 'tenants' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition text-left">
              <BaseIcon name="building" />
              <span>Gestión de Empresas (Tenants)</span>
            </button>
            <button @click="currentView = 'dashboard'" :class="currentView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition text-left">
              <BaseIcon name="dashboard" />
              <span>Vista Operativa Empresa</span>
            </button>
            <button @click="currentView = 'users'" :class="currentView === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition text-left">
              <BaseIcon name="shield" />
              <span>Usuarios y Roles RBAC</span>
            </button>
          </template>

          <!-- Opciones para Administrador de Empresa -->
          <template v-else>
            <button @click="currentView = 'dashboard'" :class="currentView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition text-left">
              <BaseIcon name="dashboard" />
              <span>Panel de Control</span>
            </button>
            <button @click="currentView = 'users'" :class="currentView === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition text-left">
              <BaseIcon name="shield" />
              <span>Usuarios, Roles y Permisos</span>
            </button>
          </template>
        </nav>

        <!-- Selector de Tenant Rápido (Si es SuperAdmin) -->
        <div v-if="session.role === 'super_admin'" class="p-4 border-t border-slate-800 bg-slate-950/40">
          <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Empresa en Foco</label>
          <select v-model="selectedTenantId" @change="switchTenant" class="w-full bg-slate-800 text-white text-xs rounded p-2 border border-slate-700">
            <option v-for="t in saasState.db.tenants" :key="t.id" :value="t.id">{{ t.nombreEmpresa }}</option>
          </select>
        </div>

        <div class="p-4 border-t border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
              {{ session.nombre.substring(0, 2).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate">{{ session.nombre }}</div>
              <div class="text-[10px] text-slate-400 truncate">{{ session.email }}</div>
            </div>
          </div>
          <button @click="saasActions.logout" class="text-slate-400 hover:text-white p-1 rounded">
            <BaseIcon name="logout" class="w-4 h-4" />
          </button>
        </div>
      </aside>

      <!-- Contenido Principal -->
      <main class="flex-1 p-6 md:p-8 overflow-y-auto">
        <!-- Barra de herramientas superior -->
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
          <div class="text-xs font-semibold text-slate-500">
            Empresa activa: <b class="text-slate-900">{{ currentTenant?.nombreEmpresa }}</b> (Plan: {{ currentTenant?.planId }})
          </div>
          <button @click="saasActions.resetDatabase" class="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1">
            <BaseIcon name="gear" class="w-3.5 h-3.5" />
            <span>Restablecer Demo SaaS</span>
          </button>
        </div>

        <!-- Render de Vistas -->
        <TenantsManagementView v-if="currentView === 'tenants' && session.role === 'super_admin'" />
        <DashboardTenantView v-else-if="currentView === 'dashboard'" />
        <UsersRolesView v-else-if="currentView === 'users'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { saasState, saasActions, saasGetters } from './stores/saasStore.js';
import BaseIcon from './components/BaseIcon.vue';
import LoginSelectorView from './views/LoginSelectorView.vue';
import TenantsManagementView from './views/TenantsManagementView.vue';
import DashboardTenantView from './views/DashboardTenantView.vue';
import UsersRolesView from './views/UsersRolesView.vue';
import MobileCollectorView from './views/MobileCollectorView.vue';

const session = computed(() => saasState.currentSession);
const currentTenant = saasGetters.currentTenant;
const currentView = ref(session.value?.role === 'super_admin' ? 'tenants' : 'dashboard');
const selectedTenantId = ref(currentTenant.value?.id || 'tenant_1');

function switchTenant() {
  if (session.value) {
    session.value.tenantId = selectedTenantId.value;
    saasActions.setSession({ ...session.value });
    saasActions.showToast(`Cambiando a empresa: ${currentTenant.value?.nombreEmpresa}`);
  }
}
</script>
