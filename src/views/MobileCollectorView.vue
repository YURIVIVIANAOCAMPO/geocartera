<template>
  <div class="max-w-md mx-auto bg-slate-100 min-h-screen flex flex-col shadow-xl">
    <!-- Topbar Móvil Cobrador -->
    <header class="bg-emerald-700 text-white p-4 sticky top-0 z-30 shadow flex justify-between items-center">
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
        <button @click="saasActions.toggleOffline" :class="saasState.isOffline ? 'bg-rose-500' : 'bg-emerald-600'" class="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
          <BaseIcon :name="saasState.isOffline ? 'wifioff' : 'wifi'" class="w-3.5 h-3.5" />
          <span>{{ saasState.isOffline ? 'Offline' : 'Online' }}</span>
        </button>
        <button @click="saasActions.logout" class="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
          <BaseIcon name="logout" class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Contenido Scrollable de la App Móvil -->
    <main class="flex-1 p-4 pb-24 space-y-4">
      <!-- Banner de Recaudo del Día -->
      <div class="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-5 rounded-2xl shadow-md">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs font-semibold text-emerald-200 uppercase">Recaudado Hoy</span>
          <button @click="saasActions.optimizarRuta(currentCobrador.id)" class="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
            <BaseIcon name="route" class="w-3 h-3" />
            <span>Optimizar Ruta</span>
          </button>
        </div>
        <div class="text-3xl font-black">{{ U.money(cobradoHoy) }}</div>
        <div class="w-full bg-black/20 h-2 rounded-full overflow-hidden mt-3">
          <div class="bg-emerald-400 h-full rounded-full transition-all" :style="{ width: Math.min(100, (cobradoHoy / (metaHoy || 1)) * 100) + '%' }"></div>
        </div>
        <div class="flex justify-between text-xs text-emerald-200 mt-2">
          <span>Meta: {{ U.money(metaHoy) }}</span>
          <span>{{ clientesRuta.length }} clientes asignados</span>
        </div>
      </div>

      <div v-if="saasState.isOffline" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
        <BaseIcon name="wifioff" class="w-4 h-4 text-amber-600 shrink-0" />
        <span><b>Modo Offline Activo:</b> Registra abonos sin señal. Se sincronizan al volver a la base.</span>
      </div>

      <!-- Pestaña 1: Mi Ruta -->
      <div v-if="activeTab === 'ruta'" class="space-y-3">
        <div class="flex justify-between items-center px-1">
          <h3 class="font-bold text-slate-800 text-sm">Secuencia de Cobro Puerta a Puerta</h3>
          <span class="text-xs text-slate-500 font-medium">Límite GPS: 50m</span>
        </div>

        <div v-for="cl in clientesRuta" :key="cl.id" @click="openClientModal(cl)" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
            {{ cl.orden }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-0.5">
              <span class="font-bold text-slate-900 text-sm truncate">{{ cl.nombre }}</span>
              <span v-if="hasPaidToday(cl.id)" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">PAGÓ</span>
              <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">PENDIENTE</span>
            </div>
            <div class="text-xs text-slate-500 truncate">{{ cl.direccion }} · {{ cl.barrio }}</div>
            <div class="text-xs font-semibold text-slate-700 mt-1 flex gap-3">
              <span>Cuota: <b class="text-emerald-700">{{ U.money(getCredito(cl.id)?.valorCuota) }}</b></span>
              <span>Saldo: {{ U.money(getSaldo(cl.id)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestaña 2: Mapa GPS -->
      <div v-if="activeTab === 'mapa'" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-slate-900 text-sm">Ubicación Satelital y Geocercas</h3>
          <button @click="simularGPS" class="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-semibold">
            Simular Posición
          </button>
        </div>
        <div class="border rounded-lg overflow-hidden bg-slate-50">
          <svg viewBox="0 0 400 300" class="w-full h-auto">
            <rect width="400" height="300" fill="#f8fafc" />
            <!-- Polilínea de ruta -->
            <polyline :points="routePoints" fill="none" stroke="#0f766e" stroke-width="3" stroke-dasharray="4" />
            <!-- Clientes -->
            <g v-for="cl in clientesRuta" :key="cl.id" :transform="`translate(${cl.x * 0.4}, ${cl.y * 0.4})`">
              <circle r="8" :fill="hasPaidToday(cl.id) ? '#16a34a' : '#f59e0b'" stroke="#fff" stroke-width="2" />
              <text y="3" text-anchor="middle" font-size="7" font-weight="bold" fill="#fff">{{ cl.orden }}</text>
            </g>
          </svg>
        </div>
        <div class="flex gap-4 text-[11px] text-slate-500 justify-center">
          <span class="flex items-center gap-1"><i class="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></i> Pagado</span>
          <span class="flex items-center gap-1"><i class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></i> Pendiente</span>
        </div>
      </div>

      <!-- Pestaña 3: Mi Caja -->
      <div v-if="activeTab === 'caja'" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 class="font-bold text-slate-900 text-sm">Flujo de Efectivo en Calle</h3>
        <ul class="text-xs space-y-2.5 border-b border-slate-100 pb-4">
          <li class="flex justify-between"><span>Base Inicial</span><b>{{ U.money(miCaja?.inicial || 400000) }}</b></li>
          <li class="flex justify-between text-emerald-600"><span>Cobros Efectivo Hoy</span><b>+ {{ U.money(cobradoHoy) }}</b></li>
          <li class="flex justify-between text-rose-600"><span>Gastos de Ruta</span><b>- $ 0</b></li>
          <li class="flex justify-between text-indigo-600 font-bold border-t pt-2 text-sm">
            <span>Efectivo Físico Esperado</span>
            <b>{{ U.money((miCaja?.inicial || 400000) + cobradoHoy) }}</b>
          </li>
        </ul>
        <button class="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-xs shadow">
          Cerrar Caja del Día
        </button>
      </div>
    </main>

    <!-- Bottom Navigation Móvil -->
    <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex justify-around py-2 z-30 shadow-lg">
      <button @click="activeTab = 'ruta'" :class="activeTab === 'ruta' ? 'text-emerald-700' : 'text-slate-400'" class="flex flex-col items-center text-[10px] font-bold">
        <BaseIcon name="route" class="w-5 h-5 mb-0.5" />
        <span>Mi Ruta</span>
      </button>
      <button @click="activeTab = 'mapa'" :class="activeTab === 'mapa' ? 'text-emerald-700' : 'text-slate-400'" class="flex flex-col items-center text-[10px] font-bold">
        <BaseIcon name="map" class="w-5 h-5 mb-0.5" />
        <span>Mapa GPS</span>
      </button>
      <button @click="activeTab = 'caja'" :class="activeTab === 'caja' ? 'text-emerald-700' : 'text-slate-400'" class="flex flex-col items-center text-[10px] font-bold">
        <BaseIcon name="wallet" class="w-5 h-5 mb-0.5" />
        <span>Mi Caja</span>
      </button>
    </nav>

    <!-- Modal Registro Cobro -->
    <div v-if="selectedClient" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 class="font-bold text-slate-900">{{ selectedClient.nombre }}</h3>
            <p class="text-xs text-slate-500">C.C. {{ selectedClient.doc }} · {{ selectedClient.direccion }}</p>
          </div>
          <button @click="selectedClient = null" class="text-slate-400 hover:text-slate-600"><BaseIcon name="x" /></button>
        </div>

        <div class="p-2.5 rounded-lg mb-4 text-xs flex items-center gap-2" :class="simulatedDist <= 50 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800 font-semibold'">
          <BaseIcon name="pin" class="w-4 h-4" />
          <span>GPS Cobrador: <b>{{ simulatedDist }} metros</b> {{ simulatedDist <= 50 ? '(En Geocerca)' : '(FUERA DE GEOCERCA > 50m - Exige Llave)' }}</span>
        </div>

        <form @submit.prevent="handlePagar" class="space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
            <div>
              <span class="text-slate-400 block">Cuota Pactada</span>
              <b class="text-slate-900 text-sm">{{ U.money(getCredito(selectedClient.id)?.valorCuota) }}</b>
            </div>
            <div>
              <span class="text-slate-400 block">Saldo Pendiente</span>
              <b class="text-slate-900 text-sm">{{ U.money(getSaldo(selectedClient.id)) }}</b>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1 text-xs">Monto a Abonar ($) *</label>
            <input v-model.number="paymentAmount" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-bold text-emerald-700" required>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1 text-xs">Método de Cobro</label>
            <select v-model="paymentMethod" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs">
              <option value="efectivo">Efectivo Físico</option>
              <option value="nequi">Nequi / Daviplata</option>
              <option value="transferencia">Transferencia Bancaria</option>
            </select>
          </div>

          <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition">
            Registrar Abono Recibido
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { saasState, saasActions, saasGetters } from '../stores/saasStore.js';
import { U } from '../utils/formatters.js';
import BaseIcon from '../components/BaseIcon.vue';

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
  simulatedDist.value = Math.floor(Math.random() * 80) + 5; // Simula distancia GPS
  const cr = getCredito(cl.id);
  paymentAmount.value = cr ? cr.valorCuota : 0;
}

function simularGPS() {
  saasActions.showToast('Ubicación GPS actualizada vía satélite');
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
    saasActions.showToast('Pago fuera de geocerca: Requiere Llave del Administrador', 'warning');
  } else {
    saasActions.showToast('¡Abono registrado exitosamente!');
  }
  selectedClient.value = null;
}
</script>

