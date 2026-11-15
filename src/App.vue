<template>
  <div class="h-screen w-screen bg-slate-900 text-slate-800 flex flex-col overflow-hidden font-sans select-none antialiased">
    <!-- Barra Superior de Control de Demostración Rápida (Demo Mode Pill) -->
    <header class="bg-slate-950 border-b border-slate-800/90 px-3 sm:px-6 py-2 flex items-center justify-between text-xs text-slate-300 shrink-0 z-50 shadow-md">
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="flex items-center gap-1.5 font-bold text-white tracking-wide">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="text-xs font-black text-indigo-400 hidden sm:inline">GeoCartera SaaS</span>
          <span class="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
            Demo Live
          </span>
        </div>
      </div>

      <!-- Selector Rápido de Roles para la Demostración -->
      <div class="flex items-center gap-1 sm:gap-2">
        <span class="text-[11px] text-slate-400 hidden lg:inline mr-1 font-medium">{{ t('demoRolesBanner') }}</span>
        
        <button 
          @click="quickSwitchRole('super_admin')" 
          :class="session?.role === 'super_admin' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'" 
          class="px-2.5 py-1 rounded-lg text-[11px] transition flex items-center gap-1 border border-slate-800"
          title="Super Administrador SaaS"
        >
          <span>👑</span>
          <span class="hidden md:inline">{{ t('superAdminRole') }}</span>
        </button>

        <button 
          @click="quickSwitchRole('tenant_admin')" 
          :class="session?.role === 'tenant_admin' ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'" 
          class="px-2.5 py-1 rounded-lg text-[11px] transition flex items-center gap-1 border border-slate-800"
          title="Administrador de Empresa"
        >
          <span>🏢</span>
          <span class="hidden md:inline">{{ t('tenantAdminRole') }}</span>
        </button>

        <button 
          @click="quickSwitchRole('cobrador')" 
          :class="session?.role === 'cobrador' ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'" 
          class="px-2.5 py-1 rounded-lg text-[11px] transition flex items-center gap-1 border border-slate-800"
          title="Cobrador Móvil en Campo"
        >
          <span>📱</span>
          <span class="hidden md:inline">{{ t('collectorRole') }}</span>
        </button>

        <!-- Selector Idioma Compacto en Barra Superior -->
        <div class="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] ml-1 sm:ml-2">
          <button 
            @click="saasActions.setLocale('es')" 
            :class="saasState.locale === 'es' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'" 
            class="px-2 py-0.5 rounded transition"
          >
            ES
          </button>
          <button 
            @click="saasActions.setLocale('pt')" 
            :class="saasState.locale === 'pt' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'" 
            class="px-2 py-0.5 rounded transition"
          >
            PT
          </button>
        </div>
      </div>
    </header>

    <!-- Toast Global con animación y diseño flotante -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="saasState.toast" class="fixed bottom-6 right-6 z-50 max-w-sm w-full pointer-events-auto">
        <div 
          :class="[
            'flex items-center gap-3 p-4 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-md',
            saasState.toast.type === 'danger' 
              ? 'bg-rose-950/90 text-rose-100 border-rose-800 shadow-rose-950/50' 
              : saasState.toast.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-800 shadow-amber-950/50'
                : 'bg-slate-900/95 text-emerald-300 border-slate-700 shadow-slate-950/60'
          ]"
        >
          <div 
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
              saasState.toast.type === 'danger' ? 'bg-rose-600/30 text-rose-400' : saasState.toast.type === 'warning' ? 'bg-amber-600/30 text-amber-400' : 'bg-emerald-600/30 text-emerald-400'
            ]"
          >
            <BaseIcon :name="saasState.toast.type === 'danger' ? 'x' : 'check'" size="sm" />
          </div>
          <span class="flex-1 leading-snug">{{ saasState.toast.message }}</span>
        </div>
      </div>
    </Transition>

    <!-- 1. Login Selector (Sin sesión) -->
    <div v-if="!session" class="h-full w-full overflow-y-auto bg-slate-950">
      <LoginSelectorView />
    </div>

    <!-- 2. App Móvil para Cobrador (Layout optimizado móvil) -->
    <div v-else-if="session.role === 'cobrador'" class="flex-1 w-full overflow-hidden flex flex-col bg-slate-950">
      <MobileCollectorView />
    </div>

    <!-- 3. Plataforma Web SaaS (SuperAdmin o Tenant Admin) -->
    <div v-else class="flex-1 w-full flex flex-row overflow-hidden bg-slate-100">
      
      <!-- BACKDROP PARA MÓVIL/TABLET -->
      <div 
        v-if="isMobileSidebarOpen" 
        @click="isMobileSidebarOpen = false" 
        class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300"
      ></div>

      <!-- BARRA LATERAL QUE OCUPA EL 100% DE LA ALTURA DE LA PANTALLA -->
      <aside 
        :class="[
          'fixed lg:static top-0 bottom-0 left-0 w-72 h-full bg-slate-950 text-white shrink-0 flex flex-col justify-between z-40 shadow-2xl lg:shadow-none border-r border-slate-800/80 transition-transform duration-300 ease-in-out',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <!-- Bloque Superior: Logo, Rol y Switcher de Idioma -->
        <div class="flex flex-col">
          <div class="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-600/30">
                GC
              </div>
              <div>
                <h1 class="font-black text-lg leading-tight tracking-wider text-white">{{ t('appName') }}</h1>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase border border-indigo-500/30 tracking-wider">
                    {{ session.role === 'super_admin' ? t('superAdminRole') : t('tenantAdminRole') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Botón cerrar menú en móviles -->
            <button @click="isMobileSidebarOpen = false" class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900">
              <BaseIcon name="x" size="sm" />
            </button>
          </div>

          <!-- Selector de Idioma Español / Português Estilizado -->
          <div class="px-5 py-3 border-b border-slate-900/80 bg-slate-950/40 flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Idioma / Language</span>
            <div class="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button 
                @click="saasActions.setLocale('es')" 
                :class="saasState.locale === 'es' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'" 
                class="px-2.5 py-1 rounded-md transition"
              >
                ES
              </button>
              <button 
                @click="saasActions.setLocale('pt')" 
                :class="saasState.locale === 'pt' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'" 
                class="px-2.5 py-1 rounded-md transition"
              >
                PT
              </button>
            </div>
          </div>

          <!-- Navegación Lateral con Efectos Hover y Active -->
          <nav class="p-4 space-y-1.5">
            <template v-if="session.role === 'super_admin'">
              <button 
                @click="navigate('tenants')" 
                :class="currentView === 'tenants' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white font-medium'" 
                class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all text-left group"
              >
                <div :class="currentView === 'tenants' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'">
                  <BaseIcon name="building" size="md" />
                </div>
                <span class="truncate">{{ t('menuTenants') }}</span>
              </button>
              
              <button 
                @click="navigate('dashboard')" 
                :class="currentView === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white font-medium'" 
                class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all text-left group"
              >
                <div :class="currentView === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'">
                  <BaseIcon name="dashboard" size="md" />
                </div>
                <span class="truncate">{{ t('menuDashboard') }}</span>
              </button>
              
              <button 
                @click="navigate('users')" 
                :class="currentView === 'users' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white font-medium'" 
                class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all text-left group"
              >
                <div :class="currentView === 'users' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'">
                  <BaseIcon name="shield" size="md" />
                </div>
                <span class="truncate">{{ t('menuUsers') }}</span>
              </button>
            </template>

            <template v-else>
              <button 
                @click="navigate('dashboard')" 
                :class="currentView === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white font-medium'" 
                class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all text-left group"
              >
                <div :class="currentView === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'">
                  <BaseIcon name="dashboard" size="md" />
                </div>
                <span class="truncate">{{ t('menuDashboard') }}</span>
              </button>
              
              <button 
                @click="navigate('users')" 
                :class="currentView === 'users' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white font-medium'" 
                class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all text-left group"
              >
                <div :class="currentView === 'users' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'">
                  <BaseIcon name="shield" size="md" />
                </div>
                <span class="truncate">{{ t('menuUsers') }}</span>
              </button>
            </template>
          </nav>
        </div>

        <!-- Bloque Inferior: Selector de Empresa (SuperAdmin), Status & Usuario -->
        <div class="flex flex-col border-t border-slate-800/80 bg-slate-950/70">
          <!-- Selector de Empresa Rápido (SuperAdmin) -->
          <div v-if="session.role === 'super_admin'" class="p-4 border-b border-slate-900">
            <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{{ t('tenantInFocus') }}</label>
            <div class="relative">
              <select 
                v-model="selectedTenantId" 
                @change="switchTenant" 
                class="w-full bg-slate-900 text-white text-xs rounded-xl p-2.5 border border-slate-700/80 outline-none focus:border-indigo-500 cursor-pointer appearance-none pr-8"
              >
                <option v-for="tenant in saasState.db.tenants" :key="tenant.id" :value="tenant.id">{{ tenant.nombreEmpresa }}</option>
              </select>
              <div class="absolute right-3 top-3 pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <!-- Estado del Sistema -->
          <div class="px-4 py-2.5 border-b border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {{ t('systemStatus') }}
            </span>
            <span class="text-emerald-400 font-medium">99.9% Uptime</span>
          </div>

          <!-- Perfil y Logout -->
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                {{ session.nombre.substring(0, 2).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-white truncate">{{ session.nombre }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ session.email }}</div>
              </div>
            </div>
            <button 
              @click="saasActions.logout" 
              :title="t('logout')" 
              class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-900 transition"
            >
              <BaseIcon name="logout" size="sm" />
            </button>
          </div>
        </div>
      </aside>

      <!-- ÁREA DE CONTENIDO PRINCIPAL SCROLLABLE -->
      <div class="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <!-- Topbar Superior Profesional -->
        <header class="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <!-- Botón abrir menú hamburguesa en móvil -->
            <button 
              @click="isMobileSidebarOpen = true" 
              class="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <BaseIcon name="menu" size="md" />
            </button>

            <!-- Datos de la Empresa Activa -->
            <div class="min-w-0">
              <div class="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 truncate">
                <span class="text-slate-400 hidden sm:inline">{{ t('activeTenant') }}:</span>
                <b class="text-slate-900 truncate">{{ currentTenant?.nombreEmpresa }}</b>
                <span class="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {{ currentTenant?.planId }}
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones Rápidas del Topbar -->
          <div class="flex items-center gap-2 sm:gap-3">
            <button 
              @click="saasActions.resetDatabase" 
              class="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 transition shadow-xs"
              :title="t('resetDemo')"
            >
              <BaseIcon name="refresh" size="xs" />
              <span class="hidden sm:inline">{{ t('resetDemo') }}</span>
            </button>

            <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <!-- Avatar y datos de sesión -->
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                {{ session.tenantId ? 'FI' : 'SA' }}
              </div>
              <div class="text-left hidden md:block">
                <div class="text-xs font-extrabold text-slate-800 leading-tight truncate max-w-[140px]">{{ session.nombre }}</div>
                <div class="text-[10px] text-slate-400 truncate max-w-[140px]">{{ session.email }}</div>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenedor de Vistas -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <TenantsManagementView v-if="currentView === 'tenants'" />
          <DashboardTenantView v-else-if="currentView === 'dashboard'" />
          <UsersRolesView v-else-if="currentView === 'users'" />
        </main>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { saasState, saasActions, saasGetters } from './stores/saasStore.js';
import { i18n } from './utils/i18n.js';
import { sound } from './utils/sound.js';
import BaseIcon from './components/BaseIcon.vue';

// Vistas
import LoginSelectorView from './views/LoginSelectorView.vue';
import MobileCollectorView from './views/MobileCollectorView.vue';
import TenantsManagementView from './views/TenantsManagementView.vue';
import DashboardTenantView from './views/DashboardTenantView.vue';
import UsersRolesView from './views/UsersRolesView.vue';

function t(key) {
  const lang = saasState.locale || 'es';
  return (i18n[lang] && i18n[lang][key]) || (i18n['es'] && i18n['es'][key]) || key;
}

const session = computed(() => saasState.currentSession);
const currentTenant = saasGetters.currentTenant;

const currentView = ref('dashboard');
const isMobileSidebarOpen = ref(false);
const selectedTenantId = ref(currentTenant.value?.id || 'tenant_1');

watch(session, (newS) => {
  if (newS?.role === 'super_admin') {
    currentView.value = 'tenants';
  } else if (newS?.role === 'tenant_admin') {
    currentView.value = 'dashboard';
  }
}, { immediate: true });

function navigate(view) {
  sound.playTap();
  currentView.value = view;
  isMobileSidebarOpen.value = false;
}

function switchTenant() {
  sound.playTap();
  saasActions.switchTenant(selectedTenantId.value);
}

function quickSwitchRole(role) {
  sound.playTap();
  if (role === 'super_admin') {
    saasActions.setSession({
      userId: 'usr_super',
      nombre: 'Super Admin GeoCartera',
      email: 'master@geocartera.com',
      role: 'super_admin',
      tenantId: null,
      cobradorId: null
    });
    currentView.value = 'tenants';
  } else if (role === 'tenant_admin') {
    saasActions.setSession({
      userId: 'usr_admin_alfa',
      nombre: 'Carlos Eduardo Silveira',
      email: 'gerencia@inversoesalfa.com.br',
      role: 'tenant_admin',
      tenantId: 'tenant_1',
      cobradorId: null
    });
    currentView.value = 'dashboard';
  } else if (role === 'cobrador') {
    saasActions.setSession({
      userId: 'usr_cob1',
      nombre: 'Mateo Ferreira',
      email: 'mateo.rota@inversoesalfa.com.br',
      role: 'cobrador',
      tenantId: 'tenant_1',
      cobradorId: 'c1'
    });
  }
}
</script>
