<template>
  <div class="h-full w-full bg-slate-900 flex justify-center overflow-hidden">
    <div class="max-w-md w-full bg-slate-100 h-full flex flex-col shadow-2xl relative">
      <!-- Topbar Móvil Cobrador -->
      <header class="bg-emerald-700 text-white p-4 sticky top-0 z-30 shadow flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center font-bold text-lg">
            $
          </div>
          <div>
            <div class="font-bold leading-tight">{{ currentCobrador?.nombre }}</div>
            <div class="text-xs text-emerald-200">{{ currentCobrador?.zona }} · {{ currentTenant?.nombreEmpresa }}</div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Selector Idioma en Móvil -->
          <button @click="toggleLang" class="px-2 py-1 bg-emerald-800/80 rounded text-xs font-bold text-emerald-200">
            {{ saasState.locale === 'es' ? 'ES' : 'PT' }}
          </button>

          <button @click="saasActions.toggleOffline" :class="saasState.isOffline ? 'bg-rose-500' : 'bg-emerald-600'" class="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
            <BaseIcon :name="saasState.isOffline ? 'wifioff' : 'wifi'" class="w-3.5 h-3.5" />
            <span>{{ saasState.isOffline ? t('offline') : t('online') }}</span>
          </button>
          <button @click="saasActions.logout" class="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
            <BaseIcon name="logout" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Contenido Scrollable de la App Móvil -->
      <main class="flex-1 p-4 pb-24 space-y-4 overflow-y-auto">
        <!-- Banner Recaudo Cobrador -->
        <div class="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-5 rounded-2xl shadow-md">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-emerald-200 uppercase tracking-wider">{{ t('collectedToday') }}</span>
            <button @click="saasActions.optimizarRuta(currentCobrador.id)" class="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <BaseIcon name="route" class="w-3 h-3" />
              <span>2-opt</span>
            </button>
          </div>
          <div class="text-3xl font-black">{{ U.money(cobradoHoy) }}</div>
          <div class="w-full bg-black/20 h-2 rounded-full overflow-hidden mt-3">
            <div class="bg-emerald-400 h-full rounded-full transition-all" :style="{ width: Math.min(100, (cobradoHoy / (metaHoy || 1)) * 100) + '%' }"></div>
          </div>
          <div class="flex justify-between text-xs text-emerald-200 mt-2">
            <span>Meta: {{ U.money(metaHoy) }}</span>
            <span>{{ clientesRuta.length }} clientes</span>
          </div>
        </div>

        <div v-if="saasState.isOffline" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <BaseIcon name="wifioff" class="w-4 h-4 text-amber-600 shrink-0" />
          <span><b>{{ t('offlineModeActive') }}:</b> {{ t('offlineNotice') }}</span>
        </div>

        <!-- Pestaña 1: Mi Ruta -->
        <div v-if="activeTab === 'ruta'" class="space-y-3">
          <div class="flex justify-between items-center px-1">
            <h3 class="font-bold text-slate-800 text-sm">{{ t('doorToDoorSequence') }}</h3>
            <span class="text-xs text-slate-500 font-medium">{{ t('gpsLimit') }}</span>
          </div>

          <div v-for="cl in clientesRuta" :key="cl.id" @click="openClientModal(cl)" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition">
            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
              {{ cl.orden }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline mb-0.5">
                <span class="font-bold text-slate-900 text-sm truncate">{{ cl.nombre }}</span>
                <span v-if="hasPaidToday(cl.id)" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{{ t('paidStatus') }}</span>
                <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">{{ t('pendingStatus') }}</span>
              </div>
              <div class="text-xs text-slate-500 truncate">{{ cl.direccion }} · {{ cl.barrio }}</div>
              <div class="text-xs font-semibold text-slate-700 mt-1 flex gap-3">
                <span>{{ t('installment') }}: <b class="text-emerald-700">{{ U.money(getCredito(cl.id)?.valorCuota) }}</b></span>
                <span>{{ t('balance') }}: {{ U.money(getSaldo(cl.id)) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña 2: Mapa GPS -->
        <div v-if="activeTab === 'mapa'" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-slate-900 text-sm">Geocercas Satelitales</h3>
            <button @click="simularGPS" class="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-semibold">
              Simular GPS
            </button>
          </div>
          <div class="border rounded-lg overflow-hidden bg-slate-50">
            <svg viewBox="0 0 400 300" class="w-full h-auto">
              <rect width="400" height="300" fill="#f8fafc" />
              <polyline :points="routePoints" fill="none" stroke="#0f766e" stroke-width="3" stroke-dasharray="4" />
              <g v-for="cl in clientesRuta" :key="cl.id" :transform="`translate(${cl.x * 0.4}, ${cl.y * 0.4})`">
                <circle r="8" :fill="hasPaidToday(cl.id) ? '#16a34a' : '#f59e0b'" stroke="#fff" stroke-width="2" />
                <text y="3" text-anchor="middle" font-size="7" font-weight="bold" fill="#fff">{{ cl.orden }}</text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Pestaña 3: Mi Caja -->
        <div v-if="activeTab === 'caja'" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-900 text-sm">{{ t('cashFlowTitle') }}</h3>
          <ul class="text-xs space-y-2.5 border-b border-slate-100 pb-4">
            <li class="flex justify-between"><span>{{ t('initialBase') }}</span><b>{{ U.money(miCaja?.inicial || 400000) }}</b></li>
            <li class="flex justify-between text-emerald-600"><span>{{ t('cashCollectedToday') }}</span><b>+ {{ U.money(cobradoHoy) }}</b></li>
            <li class="flex justify-between text-rose-600"><span>{{ t('routeExpenses') }}</span><b>- $ 0</b></li>
            <li class="flex justify-between text-indigo-600 font-bold border-t pt-2 text-sm">
              <span>{{ t('expectedPhysicalCash') }}</span>
              <b>{{ U.money((miCaja?.inicial || 400000) + cobradoHoy) }}</b>
            </li>
          </ul>
          <button class="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-xs shadow">
            {{ t('closeDayCashbox') }}
          </button>
        </div>
      </main>

      <!-- Bottom Navigation Móvil -->
      <nav class="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-30 shadow-lg">
        <button @click="activeTab = 'ruta'" :class="activeTab === 'ruta' ? 'text-emerald-700' : 'text-slate-400'" class="flex flex-col items-center text-[10px] font-bold">
          <BaseIcon name="route" class="w-5 h-5 mb-0.5" />
          <span>{{ t('myRoute') }}</span>
        </button>
        <button @click="activeTab = 'mapa'" :class="activeTab === 'mapa' ? 'text-emerald-700' : 'text-slate-400'" class="flex flex-col items-center text-[10px] font-bold">
          <BaseIcon name="map" class="w-5 h-5 mb-0.5" />
          <span>{{ t('gpsMap') }}</span>
        </button>
        <button @click="activeTab = 'caja'" :class="activeTab === 'caja' ? 'text-emerald-700' : 'text-slate-400'" class="flex flex-col items-center text-[10px] font-bold">
          <BaseIcon name="wallet" class="w-5 h-5 mb-0.5" />
          <span>{{ t('myCashbox') }}</span>
        </button>
      </nav>

      <!-- Modal Registro Cobro -->
      <div v-if="selectedClient" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
        <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 class="font-bold text-slate-900">{{ selectedClient.nombre }}</h3>
              <p class="text-xs text-slate-500">C.C. {{ selectedClient.doc }}</p>
            </div>
            <button @click="selectedClient = null" class="text-slate-400 hover:text-slate-600"><BaseIcon name="x" /></button>
          </div>

          <div class="p-2.5 rounded-lg mb-4 text-xs" :class="simulatedDist <= 50 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800 font-semibold'">
            <span>GPS: <b>{{ simulatedDist }} metros</b> {{ simulatedDist <= 50 ? t('inGeofence') : t('outGeofence') }}</span>
          </div>

          <form @submit.prevent="handlePagar" class="space-y-4 text-sm">
            <div>
              <label class="block font-semibold text-slate-700 mb-1 text-xs">{{ t('amountToPay') }} *</label>
              <input v-model.number="paymentAmount" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-bold text-emerald-700" required>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1 text-xs">{{ t('paymentMethod') }}</label>
              <select v-model="paymentMethod" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs">
                <option value="efectivo">{{ t('cashMethod') }}</option>
                <option value="nequi">{{ t('digitalMethod') }}</option>
                <option value="transferencia">{{ t('bankMethod') }}</option>
              </select>
            </div>

            <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition">
              {{ t('registerPaymentModal') }}
            </button>
          </form>
        </div>
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

function toggleLang() {
  const next = saasState.locale === 'es' ? 'pt' : 'es';
  saasActions.setLocale(next);
}

const activeTab = ref('ruta');
const currentTenant = saasGetters.currentTenant;
const currentCobrador = computed(() => {
  const cid = saasState.currentSession?.cobradorId || 'c1';
  return saasState.db.cobradores.find(c => c.id === cid) || saasState.db.cobradores[0];
});

const clientesRuta = computed(() => {
  return saasState.db.clientes
    .filter(c => c.cobradorId === currentCobrador.value?.id)
    .sort((a, b) => a.orden - b.orden);
});

const cobradoHoy = computed(() => {
  const T = U.today();
  return saasState.db.pagos
    .filter(p => p.cobradorId === currentCobrador.value?.id && U.dayOf(p.fecha) === T && p.metodo !== 'renovacion')
    .reduce((sum, p) => sum + (p.valor || 0), 0);
});

const metaHoy = computed(() => {
  return clientesRuta.value.reduce((sum, cl) => {
    const cr = getCredito(cl.id);
    return sum + (cr ? cr.valorCuota : 0);
  }, 0);
});

const miCaja = computed(() => {
  return saasState.db.cajas.find(c => c.cobradorId === currentCobrador.value?.id);
});

const selectedClient = ref(null);
const simulatedDist = ref(15);
const paymentAmount = ref(0);
const paymentMethod = ref('efectivo');

const routePoints = computed(() => {
  return clientesRuta.value.map(c => `${c.x * 0.4},${c.y * 0.4}`).join(' ');
});

function getCredito(clienteId) {
  return saasState.db.creditos.find(c => c.clienteId === clienteId && c.estado === 'activo');
}

function getSaldo(clienteId) {
  const cr = getCredito(clienteId);
  return cr ? saasGetters.saldoDeCredito(cr) : 0;
}

function hasPaidToday(clienteId) {
  const T = U.today();
  return saasState.db.pagos.some(p => p.clienteId === clienteId && U.dayOf(p.fecha) === T);
}

function openClientModal(cl) {
  selectedClient.value = cl;
  simulatedDist.value = Math.floor(Math.random() * 80) + 5;
  const cr = getCredito(cl.id);
  paymentAmount.value = cr ? cr.valorCuota : 0;
}

function simularGPS() {
  saasActions.showToast('GPS sincronizado');
}

function handlePagar() {
  if (!selectedClient.value) return;
  const cr = getCredito(selectedClient.value.id);
  if (!cr) return;

  const res = saasActions.registrarPago({
    creditoId: cr.id,
    valor: paymentAmount.value,
    metodo: paymentMethod.value,
    dist: simulatedDist.value
  });

  if (res.error) {
    saasActions.showToast(res.error, 'danger');
    return;
  }
  if (res.pendiente) {
    saasActions.showToast('Requiere Llave del Administrador', 'warning');
  } else {
    saasActions.showToast('Abono registrado!');
  }
  selectedClient.value = null;
}
</script>
