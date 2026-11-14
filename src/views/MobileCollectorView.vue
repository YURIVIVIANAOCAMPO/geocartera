<template>
  <div class="h-full w-full bg-slate-950 flex justify-center overflow-hidden">
    <!-- Contenedor con aspecto de dispositivo móvil real -->
    <div class="max-w-md w-full bg-slate-100 h-full flex flex-col shadow-2xl relative border-x border-slate-800/40">
      
      <!-- Topbar Móvil Cobrador Elegante -->
      <header class="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sticky top-0 z-30 shadow-lg flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold text-lg text-emerald-300 border border-white/20 shadow-inner">
            R$
          </div>
          <div>
            <div class="font-extrabold text-sm leading-tight text-white tracking-wide">{{ currentCobrador?.nombre }}</div>
            <div class="text-[11px] text-emerald-200/90 font-medium truncate max-w-[160px]">{{ currentCobrador?.zona }}</div>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Switcher Idioma en Móvil -->
          <button 
            @click="toggleLang" 
            class="px-2 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-xs font-bold text-emerald-200 border border-white/10 transition"
          >
            {{ saasState.locale === 'es' ? 'ES' : 'PT' }}
          </button>

          <!-- Toggle Offline / Modo Avión -->
          <button 
            @click="saasActions.toggleOffline" 
            :class="saasState.isOffline ? 'bg-rose-500 shadow-rose-900/50' : 'bg-emerald-600 shadow-emerald-900/50'" 
            class="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <BaseIcon :name="saasState.isOffline ? 'wifioff' : 'wifi'" size="xs" />
            <span>{{ saasState.isOffline ? t('offline') : t('online') }}</span>
          </button>

          <!-- Salir -->
          <button @click="saasActions.logout" class="p-1.5 rounded-xl hover:bg-white/10 text-emerald-100 transition">
            <BaseIcon name="logout" size="sm" />
          </button>
        </div>
      </header>

      <!-- Contenido Scrollable de la App Móvil -->
      <main class="flex-1 p-4 pb-24 space-y-4 overflow-y-auto">
        <!-- Banner de Recaudo Financiero en Reales Brasileños -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-3xl shadow-xl border border-slate-700/50 relative overflow-hidden">
          <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div class="flex justify-between items-start mb-2 relative z-10">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                {{ t('collectedToday') }}
              </span>
            </div>
            <button 
              @click="saasActions.optimizarRuta(currentCobrador.id)" 
              class="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <BaseIcon name="spark" size="xs" />
              <span>Otimizar Rota</span>
            </button>
          </div>

          <div class="text-3xl font-black tracking-tight text-white mt-1 relative z-10">
            {{ U.money(cobradoHoy, 'BRL', saasState.locale) }}
          </div>

          <!-- Barra de Progreso Dinámica -->
          <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 p-0.5 border border-slate-700/80">
            <div 
              class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
              :style="{ width: Math.min(100, (cobradoHoy / (metaHoy || 1)) * 100) + '%' }"
            ></div>
          </div>

          <div class="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
            <span>Meta: <b class="text-slate-200">{{ U.money(metaHoy, 'BRL', saasState.locale) }}</b></span>
            <span>{{ clientesRuta.length }} clientes na rota</span>
          </div>
        </div>

        <!-- Alerta de Modo Offline / Modo Avión -->
        <div v-if="saasState.isOffline" class="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-3 shadow-sm animate-pulse">
          <div class="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <BaseIcon name="wifioff" size="sm" />
          </div>
          <div>
            <b>{{ t('offlineModeActive') }}:</b> {{ t('offlineNotice') }}
          </div>
        </div>

        <!-- Pestaña 1: Mi Ruta Diaria -->
        <div v-if="activeTab === 'ruta'" class="space-y-3">
          <div class="flex justify-between items-center px-1">
            <h3 class="font-extrabold text-slate-800 text-sm tracking-wide">{{ t('doorToDoorSequence') }}</h3>
            <span class="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {{ t('gpsLimit') }}
            </span>
          </div>

          <!-- Tarjetas de Clientes Amigables e Intuitivas -->
          <div class="space-y-2.5">
            <div 
              v-for="cl in clientesRuta" 
              :key="cl.id" 
              @click="openClientModal(cl)" 
              class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-emerald-500 hover:shadow-md transition active:scale-[0.99]"
            >
              <div 
                :class="[
                  'w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs',
                  hasPaidToday(cl.id) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                ]"
              >
                {{ cl.orden }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-0.5">
                  <span class="font-bold text-slate-900 text-sm truncate">{{ cl.nombre }}</span>
                  <span 
                    v-if="hasPaidToday(cl.id)" 
                    class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0"
                  >
                    {{ t('paidStatus') }}
                  </span>
                  <span 
                    v-else 
                    class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 shrink-0"
                  >
                    {{ t('pendingStatus') }}
                  </span>
                </div>

                <div class="text-xs text-slate-500 truncate flex items-center gap-1">
                  <BaseIcon name="pin" size="xs" class="text-slate-400 shrink-0" />
                  <span>{{ cl.direccion }} · {{ cl.barrio }}</span>
                </div>

                <div class="text-xs font-semibold text-slate-700 mt-2 flex gap-4 pt-1.5 border-t border-slate-100">
                  <span>{{ t('installment') }}: <b class="text-emerald-700 font-extrabold">{{ U.money(getCredito(cl.id)?.valorCuota, 'BRL', saasState.locale) }}</b></span>
                  <span>{{ t('balance') }}: {{ U.money(getSaldo(cl.id), 'BRL', saasState.locale) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña 2: Mapa GPS -->
        <div v-if="activeTab === 'mapa'" class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Geocercas Satelitais</h3>
              <p class="text-xs text-slate-500">Raio de segurança de 50 metros</p>
            </div>
            <button @click="simularGPS" class="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 transition">
              Simular GPS
            </button>
          </div>

          <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-2 shadow-inner">
            <svg viewBox="0 0 400 300" class="w-full h-auto">
              <rect width="400" height="300" fill="#f8fafc" />
              <!-- Traçado de rota -->
              <polyline :points="routePoints" fill="none" stroke="#0f766e" stroke-width="3" stroke-dasharray="5 3" />
              <!-- Base -->
              <rect x="25" y="25" width="16" height="16" rx="4" fill="#0f172a" />
              <!-- Marcadores de Clientes -->
              <g v-for="cl in clientesRuta" :key="cl.id" :transform="`translate(${cl.x * 0.4}, ${cl.y * 0.4})`">
                <circle r="9" :fill="hasPaidToday(cl.id) ? '#10b981' : '#f59e0b'" stroke="#fff" stroke-width="2.5" />
                <text y="3.5" text-anchor="middle" font-size="8" font-weight="900" fill="#fff">{{ cl.orden }}</text>
              </g>
            </svg>
          </div>

          <div class="flex gap-4 text-xs text-slate-600 justify-center font-medium">
            <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></i> Pago</span>
            <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></i> Pendente</span>
          </div>
        </div>

        <!-- Pestaña 3: Mi Caja y Arqueo -->
        <div v-if="activeTab === 'caja'" class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 class="font-extrabold text-slate-900 text-sm tracking-wide">{{ t('cashFlowTitle') }}</h3>
          
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
            <div class="flex justify-between py-1">
              <span class="text-slate-600">{{ t('initialBase') }}</span>
              <b class="text-slate-900">{{ U.money(miCaja?.inicial || 1000, 'BRL', saasState.locale) }}</b>
            </div>
            <div class="flex justify-between py-1 text-emerald-700">
              <span>{{ t('cashCollectedToday') }}</span>
              <b class="font-bold">+ {{ U.money(cobradoHoy, 'BRL', saasState.locale) }}</b>
            </div>
            <div class="flex justify-between py-1 text-rose-700">
              <span>{{ t('routeExpenses') }}</span>
              <b>- {{ U.money(0, 'BRL', saasState.locale) }}</b>
            </div>
            <div class="flex justify-between pt-2.5 border-t border-slate-200 text-indigo-900 font-extrabold text-sm">
              <span>{{ t('expectedPhysicalCash') }}</span>
              <b class="text-base text-indigo-700">{{ U.money((miCaja?.inicial || 1000) + cobradoHoy, 'BRL', saasState.locale) }}</b>
            </div>
          </div>

          <button 
            @click="saasActions.showToast('Fechamento de caixa registrado!')" 
            class="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-xs shadow-lg transition active:scale-95"
          >
            {{ t('closeDayCashbox') }}
          </button>
        </div>
      </main>

      <!-- Bottom Navigation Móvil Profesional -->
      <nav class="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around py-2.5 z-30 shadow-2xl">
        <button 
          @click="activeTab = 'ruta'" 
          :class="activeTab === 'ruta' ? 'text-emerald-700 font-black' : 'text-slate-400 font-medium'" 
          class="flex flex-col items-center text-[10px] transition"
        >
          <BaseIcon name="route" size="md" class="mb-0.5" />
          <span>{{ t('myRoute') }}</span>
        </button>

        <button 
          @click="activeTab = 'mapa'" 
          :class="activeTab === 'mapa' ? 'text-emerald-700 font-black' : 'text-slate-400 font-medium'" 
          class="flex flex-col items-center text-[10px] transition"
        >
          <BaseIcon name="map" size="md" class="mb-0.5" />
          <span>{{ t('gpsMap') }}</span>
        </button>

        <button 
          @click="activeTab = 'caja'" 
          :class="activeTab === 'caja' ? 'text-emerald-700 font-black' : 'text-slate-400 font-medium'" 
          class="flex flex-col items-center text-[10px] transition"
        >
          <BaseIcon name="wallet" size="md" class="mb-0.5" />
          <span>{{ t('myCashbox') }}</span>
        </button>
      </nav>

      <!-- Modal de Registro de Abono / Pagamento -->
      <div v-if="selectedClient" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
        <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
          <div class="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 class="font-extrabold text-slate-900 text-base leading-tight">{{ selectedClient.nombre }}</h3>
              <p class="text-xs text-slate-500 mt-0.5">CPF/DOC: {{ selectedClient.doc }}</p>
            </div>
            <button @click="selectedClient = null" class="text-slate-400 hover:text-slate-700 p-1">
              <BaseIcon name="x" size="md" />
            </button>
          </div>

          <!-- Alerta de Proximidad GPS -->
          <div 
            :class="[
              'p-3 rounded-2xl mb-4 text-xs font-semibold flex items-center gap-2.5',
              simulatedDist <= 50 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            ]"
          >
            <BaseIcon name="pin" size="sm" class="shrink-0" />
            <span>GPS: <b>{{ simulatedDist }} metros</b> {{ simulatedDist <= 50 ? t('inGeofence') : t('outGeofence') }}</span>
          </div>

          <form @submit.prevent="handlePagar" class="space-y-4 text-sm">
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('amountToPay') }} (R$) *</label>
              <input 
                v-model.number="paymentAmount" 
                type="number" 
                step="0.01" 
                class="w-full px-4 py-3 border border-slate-300 rounded-2xl text-xl font-extrabold text-emerald-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20" 
                required
              >
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('paymentMethod') }}</label>
              <select 
                v-model="paymentMethod" 
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
              >
                <option value="dinheiro">{{ t('cashMethod') }}</option>
                <option value="pix">{{ t('digitalMethod') }}</option>
                <option value="transferencia">{{ t('bankMethod') }}</option>
              </select>
            </div>

            <button 
              type="submit" 
              class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-emerald-700/30 transition active:scale-95"
            >
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
  const lang = saasState.locale || 'pt';
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
const paymentMethod = ref('dinheiro');

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
