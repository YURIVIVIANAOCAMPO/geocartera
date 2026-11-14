<template>
  <div class="space-y-6">
    <!-- Grid de Métricas Financieras en Reales Brasileños -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
          <BaseIcon name="cash" size="lg" />
        </div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{{ t('collectedToday') }}</span>
          <div class="text-2xl font-black text-slate-900 mt-0.5">{{ U.money(recaudadoHoy, 'BRL', saasState.locale) }}</div>
          <span class="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <BaseIcon name="check" size="xs" /> {{ pagosHoy.length }} {{ t('paymentsCount') }}
          </span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/60">
          <BaseIcon name="wallet" size="lg" />
        </div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{{ t('totalPortfolio') }}</span>
          <div class="text-2xl font-black text-slate-900 mt-0.5">{{ U.money(saldoCarteraActiva, 'BRL', saasState.locale) }}</div>
          <span class="text-xs text-slate-400 font-medium">{{ creditosActivos.length }} {{ t('activeCreditsCount') }}</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/60">
          <BaseIcon name="route" size="lg" />
        </div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{{ t('activeRoutes') }}</span>
          <div class="text-2xl font-black text-slate-900 mt-0.5">{{ cobradores.length }}</div>
          <span class="text-xs text-sky-600 font-bold">{{ t('monitoredGps') }}</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/60">
          <BaseIcon name="key" size="lg" />
        </div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{{ t('pendingKeys') }}</span>
          <div class="text-2xl font-black text-slate-900 mt-0.5">{{ autorizacionesPendientes.length }}</div>
          <span class="text-xs text-amber-600 font-bold">{{ t('keysRequiringAuth') }}</span>
        </div>
      </div>
    </div>

    <!-- Sección de Rutas Activas y Módulo de Chaves / OTP Remotas -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs">
        <div class="flex justify-between items-center mb-5">
          <div>
            <h3 class="font-extrabold text-slate-900 text-lg tracking-tight">{{ t('routesPerformance') }}</h3>
            <p class="text-xs text-slate-500">Monitoramento em tempo real dos cobradores em campo</p>
          </div>
          <span class="text-xs bg-slate-100 font-bold text-slate-600 px-3 py-1 rounded-full">
            Jornada de Hoje
          </span>
        </div>

        <div class="space-y-4">
          <div v-for="c in cobradores" :key="c.id" class="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full shrink-0 shadow-xs" :style="{ backgroundColor: c.color }"></div>
                <div>
                  <b class="text-slate-900 text-sm block">{{ c.nombre }}</b>
                  <span class="text-xs text-slate-500">{{ c.zona }} · Tel: {{ c.tel }}</span>
                </div>
              </div>
              <div class="text-left sm:text-right">
                <span class="font-black text-slate-900 text-sm">{{ U.money(getCobradoPorCobrador(c.id), 'BRL', saasState.locale) }}</span>
                <span class="text-xs text-slate-400 font-medium"> / {{ U.money(getMetaPorCobrador(c.id), 'BRL', saasState.locale) }}</span>
              </div>
            </div>

            <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: getPorcentaje(c.id) + '%', backgroundColor: c.color }"></div>
            </div>

            <div class="flex justify-between items-center mt-3 text-xs text-slate-500 font-medium">
              <span>Progresso: <b class="text-slate-700">{{ getPorcentaje(c.id) }}%</b></span>
              <button 
                @click="saasActions.optimizarRuta(c.id)" 
                class="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <BaseIcon name="spark" size="xs" />
                <span>{{ t('optimizeRoute2opt') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Módulo de Liberação de Chaves OTP (Elimina ligações telefônicas) -->
      <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-5">
            <div>
              <h3 class="font-extrabold text-slate-900 text-lg tracking-tight">{{ t('keysModuleTitle') }}</h3>
              <p class="text-xs text-slate-500">Autorizações remotas instantâneas</p>
            </div>
            <span 
              :class="autorizacionesPendientes.length > 0 ? 'bg-amber-100 text-amber-900 font-black' : 'bg-slate-100 text-slate-500 font-bold'" 
              class="px-2.5 py-1 rounded-full text-xs"
            >
              {{ autorizacionesPendientes.length }}
            </span>
          </div>

          <div v-if="autorizacionesPendientes.length === 0" class="text-center py-12 text-slate-400 text-sm">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <BaseIcon name="check" size="md" />
            </div>
            <p class="font-medium text-slate-600">{{ t('noPendingKeys') }}</p>
            <span class="text-xs text-slate-400 mt-1 block">Toda a operação está dentro dos limites pré-aprovados</span>
          </div>

          <div v-else class="space-y-3.5">
            <div v-for="aut in autorizacionesPendientes" :key="aut.id" class="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/60 text-xs shadow-xs">
              <div class="flex justify-between items-center font-black text-slate-900 mb-1.5">
                <span class="uppercase tracking-wider text-[11px] text-amber-900 font-extrabold">{{ aut.tipo }}</span>
                <span class="text-emerald-800 text-sm">{{ U.money(aut.valor, 'BRL', saasState.locale) }}</span>
              </div>
              <p class="text-slate-600 mb-3 leading-relaxed">{{ aut.detalle }}</p>
              <div class="flex gap-2">
                <button 
                  @click="saasActions.resolverAutorizacion(aut.id, true)" 
                  class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-center shadow-xs transition active:scale-95"
                >
                  {{ t('approveKey') }}
                </button>
                <button 
                  @click="saasActions.resolverAutorizacion(aut.id, false)" 
                  class="px-3.5 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition active:scale-95"
                >
                  {{ t('rejectKey') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          💡 As chaves de 6 dígitos autorizam operações acima do limite ou cobranças a mais de 50 metros.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { saasState, saasActions, saasGetters } from '../stores/saasStore.js';
import { U } from '../utils/formatters.js';
import { i18n } from '../utils/i18n.js';
import BaseIcon from '../components/BaseIcon.vue';

function t(key) {
  const lang = saasState.locale || 'pt';
  return (i18n[lang] && i18n[lang][key]) || (i18n['es'] && i18n['es'][key]) || key;
}

const currentTenant = saasGetters.currentTenant;
const T = U.today();

const cobradores = computed(() => {
  return saasState.db.cobradores.filter(c => c.tenantId === currentTenant.value?.id);
});

const creditosActivos = computed(() => {
  return saasState.db.creditos.filter(c => c.tenantId === currentTenant.value?.id && c.estado === 'activo');
});

const saldoCarteraActiva = computed(() => {
  return creditosActivos.value.reduce((sum, cr) => sum + saasGetters.saldoDeCredito(cr), 0);
});

const pagosHoy = computed(() => {
  return saasState.db.pagos.filter(p => p.tenantId === currentTenant.value?.id && U.dayOf(p.fecha) === T && p.metodo !== 'renovacion');
});

const recaudadoHoy = computed(() => {
  return pagosHoy.value.reduce((sum, p) => sum + (p.valor || 0), 0);
});

const autorizacionesPendientes = computed(() => {
  return saasState.db.autorizaciones.filter(a => a.tenantId === currentTenant.value?.id && a.estado === 'pendiente');
});

function getCobradoPorCobrador(cobradorId) {
  return saasState.db.pagos
    .filter(p => p.cobradorId === cobradorId && U.dayOf(p.fecha) === T && p.metodo !== 'renovacion')
    .reduce((sum, p) => sum + (p.valor || 0), 0);
}

function getMetaPorCobrador(cobradorId) {
  const misClientes = saasState.db.clientes.filter(c => c.cobradorId === cobradorId);
  return misClientes.reduce((sum, cl) => {
    const cr = saasState.db.creditos.find(c => c.clienteId === cl.id && c.estado === 'activo');
    return sum + (cr ? cr.valorCuota : 0);
  }, 0);
}

function getPorcentaje(cobradorId) {
  const meta = getMetaPorCobrador(cobradorId);
  const cobrado = getCobradoPorCobrador(cobradorId);
  if (!meta) return 0;
  return Math.min(100, Math.round((cobrado / meta) * 100));
}
</script>
