<template>
  <div class="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden font-sans">
    <!-- Toast Global -->
    <div v-if="saasState.toast" class="fixed bottom-5 right-5 z-50 animate-bounce">
      <div :class="saasState.toast.type === 'danger' ? 'bg-rose-600' : saasState.toast.type === 'warning' ? 'bg-amber-600' : 'bg-slate-900'" class="text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2">
        <BaseIcon name="check" class="w-4 h-4" />
        <span>{{ saasState.toast.message }}</span>
      </div>
    </div>

    <!-- 1. Login Selector -->
    <div v-if="!session" class="h-full w-full overflow-y-auto">
      <LoginSelectorView />
    </div>

    <!-- 2. App Móvil para Cobrador -->
    <div v-else-if="session.role === 'cobrador'" class="h-full w-full overflow-hidden flex flex-col">
      <MobileCollectorView />
    </div>

    <!-- 3. Plataforma Web SaaS: Barra lateral ocupa el 100% de la altura de la pantalla (h-screen fixed/flex-1) -->
    <div v-else class="h-screen w-screen flex flex-row overflow-hidden">
      <!-- BARRA LATERAL QUE OCUPA EL 100% DE LA ALTURA DE LA PANTALLA -->
      <aside class="w-72 h-full bg-slate-950 text-white shrink-0 flex flex-col justify-between shadow-2xl border-r border-slate-800/80 z-20">
        <!-- Parte Superior: Marca & Selector de Idioma -->
        <div class="flex flex-col">
          <div class="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-600/40">
                GC
              </div>
              <div>
                <h1 class="font-black text-lg leading-tight tracking-wide text-white">{{ t('appName') }}</h1>
                <span class="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase border border-indigo-500/30">
                  {{ session.role === 'super_admin' ? t('superAdminRole') : t('tenantAdminRole') }}
                </span>
              </div>
            </div>

            <!-- Selector de Idioma Español / Português -->
            <div class="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button @click="saasActions.setLocale('es')" :class="saasState.locale === 'es' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'" class="px-2 py-1 rounded transition">
                ES
              </button>
              <button @click="saasActions.setLocale('pt')" :class="saasState.locale === 'pt' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'" class="px-2 py-1 rounded transition">
                PT
              </button>
            </div>
          </div>

          <!-- Navegación Lateral -->
          <nav class="p-4 space-y-2">
            <template v-if="session.role === 'super_admin'">
              <button @click="currentView = 'tenants'" :class="currentView === 'tenants' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition text-left">
                <BaseIcon name="building" class="w-5 h-5 shrink-0" />
                <span class="truncate">{{ t('menuTenants') }}</span>
              </button>
              <button @click="currentView = 'dashboard'" :class="currentView === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition text-left">
                <BaseIcon name="dashboard" class="w-5 h-5 shrink-0" />
                <span class="truncate">{{ t('menuDashboard') }}</span>
              </button>
              <button @click="currentView = 'users'" :class="currentView === 'users' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition text-left">
                <BaseIcon name="shield" class="w-5 h-5 shrink-0" />
                <span class="truncate">{{ t('menuUsers') }}</span>
              </button>
            </template>

            <template v-else>
              <button @click="currentView = 'dashboard'" :class="currentView === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition text-left">
                <BaseIcon name="dashboard" class="w-5 h-5 shrink-0" />
                <span class="truncate">{{ t('menuDashboard') }}</span>
              </button>
              <button @click="currentView = 'users'" :class="currentView === 'users' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition text-left">
                <BaseIcon name="shield" class="w-5 h-5 shrink-0" />
                <span class="truncate">{{ t('menuUsers') }}</span>
              </button>
            </template>
          </nav>
        </div>

        <!-- Parte Inferior de la Barra Lateral -->
        <div class="flex flex-col border-t border-slate-850 bg-slate-950/60">
          <!-- Selector de Empresa Rápido (SuperAdmin) -->
          <div v-if="session.role === 'super_admin'" class="p-4 border-b border-slate-900">
            <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{{ t('tenantInFocus') }}</label>
            <select v-model="selectedTenantId" @change="switchTenant" class="w-full bg-slate-900 text-white text-xs rounded-lg p-2.5 border border-slate-700/80 outline-none focus:border-indigo-500">
              <option v-for="t in saasState.db.tenants" :key="t.id" :value="t.id">{{ t.nombreEmpresa }}</option>
            </select>
          </div>

          <!-- Perfil y Logout -->
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {{ session.nombre.substring(0, 2).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-white truncate">{{ session.nombre }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ session.email }}</div>
              </div>
            </div>
            <button @click="saasActions.logout" :title="t('logout')" class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900 transition">
              <BaseIcon name="logout" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <!-- ÁREA DE CONTENIDO PRINCIPAL SCROLLABLE -->
      <main class="flex-1 h-full overflow-y-auto flex flex-col bg-slate-50">
        <!-- Topbar Superior del Contenido -->
        <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-xs">
          <div class="text-xs font-semibold text-slate-600">
            {{ t('activeTenant') }}: <b class="text-slate-900">{{ currentTenant?.nombreEmpresa }}</b>
            <span class="mx-2 text-slate-300">|</span>
            {{ t('plan') }}: <span class="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{{ currentTenant?.planId }}</span>
          </div>

          <div class="flex items-center gap-4">
            <button @click="saasActions.resetDatabase" class="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition">
              <BaseIcon name="gear" class="w-3.5 h-3.5" />
              <span>{{ t('resetDemo') }}</span>
            </button>
          </div>
        </header>

        <!-- Vistas de la Plataforma -->
        <div class="p-6 md:p-8 flex-1">
          <TenantsManagementView v-if="currentView === 'tenants' && session.role === 'super_admin'" />
          <DashboardTenantView v-else-if="currentView === 'dashboard'" />
          <UsersRolesView v-else-if="currentView === 'users'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { saasState, saasActions, saasGetters } from './stores/saasStore.js';
import { i18n } from './utils/i18n.js';
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

function t(key) {
  const lang = saasState.locale || 'es';
  return (i18n[lang] && i18n[lang][key]) || (i18n['es'] && i18n['es'][key]) || key;
}

function switchTenant() {
  if (session.value) {
    session.value.tenantId = selectedTenantId.value;
    saasActions.setSession({ ...session.value });
    saasActions.showToast(`${t('activeTenant')}: ${currentTenant.value?.nombreEmpresa}`);
  }
}
</script>
