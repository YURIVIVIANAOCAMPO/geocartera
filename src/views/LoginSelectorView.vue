<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-slate-100">
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
          <BaseIcon name="shield" class="w-8 h-8" />
        </div>
        <h1 class="text-2xl font-black text-slate-900">GeoCartera SaaS</h1>
        <p class="text-sm text-slate-500 mt-1">Plataforma Cloud Multi-Tenant de Gestión de Cartera y Cobranzas</p>
      </div>

      <div class="space-y-4">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Selecciona Perfil de Demostración</div>

        <!-- Opción 1: SuperAdmin SaaS -->
        <button @click="login('usr_super', 'super_admin', null)" class="w-full p-4 rounded-xl border border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition flex items-center gap-4 text-left group">
          <div class="w-11 h-11 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <BaseIcon name="building" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
              <span>Super Administrador SaaS</span>
              <span class="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded-full">Plataforma</span>
            </div>
            <div class="text-xs text-slate-500 truncate">Control de Tenants, planes de suscripción y facturación global</div>
          </div>
        </button>

        <!-- Opción 2: Administrador Empresa -->
        <button @click="login('usr_admin_alfa', 'tenant_admin', 'tenant_1')" class="w-full p-4 rounded-xl border border-emerald-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition flex items-center gap-4 text-left group">
          <div class="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <BaseIcon name="dashboard" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 group-hover:text-emerald-600 transition flex items-center gap-1.5">
              <span>Administrador de Empresa</span>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">Inversiones Alfa</span>
            </div>
            <div class="text-xs text-slate-500 truncate">Cuadro de mando, arqueo de cajas, llaves OTP, usuarios y rutas</div>
          </div>
        </button>

        <!-- Opción 3: Cobrador Móvil -->
        <button @click="login('usr_cob1', 'cobrador', 'tenant_1', 'c1')" class="w-full p-4 rounded-xl border border-sky-200 hover:border-sky-600 hover:bg-sky-50/50 transition flex items-center gap-4 text-left group">
          <div class="w-11 h-11 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
            <BaseIcon name="route" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 group-hover:text-sky-600 transition flex items-center gap-1.5">
              <span>Cobrador Móvil en Calle</span>
              <span class="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.2 rounded-full">Ruta Norte</span>
            </div>
            <div class="text-xs text-slate-500 truncate">App móvil 100% responsive, modo offline y verificación GPS 50m</div>
          </div>
        </button>
      </div>

      <div class="mt-8 pt-6 border-t border-slate-100 text-center">
        <p class="text-xs text-slate-400">Desarrollo Vue.js 3 + Vite · Multi-Tenant con RBAC y Soporte Offline</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { saasActions, saasState } from '../stores/saasStore.js';
import BaseIcon from '../components/BaseIcon.vue';

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
  saasActions.showToast(`Bienvenido a GeoCartera, ${u.nombre}`);
}
</script>

