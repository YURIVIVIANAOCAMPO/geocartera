<template>
  <div class="h-full w-full bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-slate-100 my-auto">
      <div class="flex justify-between items-center mb-6">
        <div class="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 font-black text-xl">
          GC
        </div>
        <!-- Selector Idioma en Login -->
        <div class="flex items-center bg-slate-100 rounded-lg p-1 text-xs">
          <button @click="saasActions.setLocale('es')" :class="saasState.locale === 'es' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500'" class="px-2.5 py-1 rounded transition">
            ES
          </button>
          <button @click="saasActions.setLocale('pt')" :class="saasState.locale === 'pt' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500'" class="px-2.5 py-1 rounded transition">
            PT
          </button>
        </div>
      </div>

      <div class="text-left mb-6">
        <h1 class="text-2xl font-black text-slate-900">{{ t('appName') }} SaaS</h1>
        <p class="text-sm text-slate-500 mt-1">{{ t('saasSubtitle') }}</p>
      </div>

      <div class="space-y-4">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">{{ t('quickAccessByRole') }}</div>

        <!-- Opción 1: SuperAdmin SaaS -->
        <button @click="login('usr_super', 'super_admin', null)" class="w-full p-4 rounded-xl border border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition flex items-center gap-4 text-left group">
          <div class="w-11 h-11 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <BaseIcon name="building" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
              <span>{{ t('loginSuperAdmin') }}</span>
              <span class="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded-full font-bold">Global</span>
            </div>
            <div class="text-xs text-slate-500 truncate">{{ t('loginSuperAdminDesc') }}</div>
          </div>
        </button>

        <!-- Opción 2: Administrador Empresa -->
        <button @click="login('usr_admin_alfa', 'tenant_admin', 'tenant_1')" class="w-full p-4 rounded-xl border border-emerald-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition flex items-center gap-4 text-left group">
          <div class="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <BaseIcon name="dashboard" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 group-hover:text-emerald-600 transition flex items-center gap-1.5">
              <span>{{ t('loginTenantAdmin') }}</span>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">Inversiones Alfa</span>
            </div>
            <div class="text-xs text-slate-500 truncate">{{ t('loginTenantAdminDesc') }}</div>
          </div>
        </button>

        <!-- Opción 3: Cobrador Móvil -->
        <button @click="login('usr_cob1', 'cobrador', 'tenant_1', 'c1')" class="w-full p-4 rounded-xl border border-sky-200 hover:border-sky-600 hover:bg-sky-50/50 transition flex items-center gap-4 text-left group">
          <div class="w-11 h-11 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
            <BaseIcon name="route" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 group-hover:text-sky-600 transition flex items-center gap-1.5">
              <span>{{ t('loginCollector') }}</span>
              <span class="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.2 rounded-full font-bold">Ruta Norte</span>
            </div>
            <div class="text-xs text-slate-500 truncate">{{ t('loginCollectorDesc') }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { saasActions, saasState } from '../stores/saasStore.js';
import { i18n } from '../utils/i18n.js';
import BaseIcon from '../components/BaseIcon.vue';

function t(key) {
  const lang = saasState.locale || 'es';
  return (i18n[lang] && i18n[lang][key]) || (i18n['es'] && i18n['es'][key]) || key;
}

function login(userId, role, tenantId, cobradorId = null) {
  const u = saasState.db.usuarios.find(x => x.id === userId) || { nombre: 'Usuario Demo', email: 'demo@geocartera.app' };
  saasActions.setSession({
    userId,
    nombre: u.nombre,
    email: u.email,
    role,
    tenantId,
    cobradorId
  });
  saasActions.showToast(`${t('welcome')}, ${u.nombre}`);
}
</script>
