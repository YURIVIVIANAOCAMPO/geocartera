<template>
  <div class="space-y-6">
    <!-- Banner de bienvenida y KPIs Financieros -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <BaseIcon name="cash" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recaudado Hoy</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ U.money(recaudadoHoy) }}</div>
          <span class="text-xs text-emerald-600 font-medium">{{ pagosHoy.length }} abonos cobrados</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <BaseIcon name="wallet" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cartera en Calle</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ U.money(saldoCarteraActiva) }}</div>
          <span class="text-xs text-slate-500">{{ creditosActivos.length }} créditos activos</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          <BaseIcon name="route" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rutas Activas</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ cobradores.length }}</div>
          <span class="text-xs text-sky-600 font-medium">100% monitoreadas GPS</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <BaseIcon name="key" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Llaves Pendientes</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ autorizacionesPendientes.length }}</div>
          <span class="text-xs text-amber-600 font-medium">Requieren autorización</span>
        </div>
      </div>
    </div>

    <!-- Rendimiento de Rutas y Transacciones Recientes -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-slate-900 text-lg">Rendimiento Operativo por Ruta</h3>
          <span class="text-xs text-slate-400">Jornada de Hoy</span>
        </div>

        <div class="space-y-4">
          <div v-for="c in cobradores" :key="c.id" class="p-4 rounded-lg border border-slate-100 bg-slate-50/50">
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: c.color }"></span>
                <b class="text-slate-900">{{ c.nombre }}</b>
                <span class="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">{{ c.zona }}</span>
              </div>
              <div class="text-right">
                <span class="font-bold text-slate-900">{{ U.money(getCobradoPorCobrador(c.id)) }}</span>
                <span class="text-xs text-slate-500"> / {{ U.money(getMetaPorCobrador(c.id)) }}</span>
              </div>
            </div>

            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: getPorcentaje(c.id) + '%', backgroundColor: c.color }"></div>
            </div>

            <div class="flex justify-between items-center mt-2 text-xs text-slate-500">
              <span>Progreso: {{ getPorcentaje(c.id) }}%</span>
              <button @click="saasActions.optimizarRuta(c.id)" class="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
                <BaseIcon name="route" class="w-3 h-3" />
                <span>Optimizar Secuencia (2-opt)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Solicitudes de Llaves en Tiempo Real -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-slate-900 text-lg">Módulo de Llaves y OTP</h3>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">{{ autorizacionesPendientes.length }} pendientes</span>
          </div>

          <div v-if="autorizacionesPendientes.length === 0" class="text-center py-8 text-slate-400 text-sm">
            <BaseIcon name="check" class="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p>No hay solicitudes pendientes de autorización en este momento.</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="aut in autorizacionesPendientes" :key="aut.id" class="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 text-xs">
              <div class="flex justify-between font-bold text-slate-900 mb-1">
                <span>{{ aut.tipo.toUpperCase() }}</span>
                <span>{{ U.money(aut.valor) }}</span>
              </div>
              <p class="text-slate-600 mb-3">{{ aut.detalle }}</p>
              <div class="flex gap-2">
                <button @click="saasActions.resolverAutorizacion(aut.id, true)" class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-center">
                  Aprobar (Generar Llave)
                </button>
                <button @click="saasActions.resolverAutorizacion(aut.id, false)" class="px-3 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded font-semibold">
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
          💡 Las llaves de 6 dígitos evitan llamadas telefónicas y auditan pagos fuera de geocerca o gastos imprevistos.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { saasState, saasActions, saasGetters } from '../stores/saasStore.js';
import { U } from '../utils/formatters.js';
import BaseIcon from '../components/BaseIcon.vue';

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

