<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">{{ t('saasCenter') }}</span>
          <span class="text-xs text-slate-500">Multi-Tenant Global</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mt-1">{{ t('saasGlobalTitle') }}</h2>
        <p class="text-sm text-slate-500">{{ t('saasGlobalDesc') }}</p>
      </div>
      <button @click="showNewTenantModal = true" class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition">
        <BaseIcon name="plus" />
        <span>{{ t('newTenant') }}</span>
      </button>
    </div>

    <!-- Métricas SaaS Globales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <BaseIcon name="building" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ t('activeTenantsKpi') }}</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ tenants.length }}</div>
          <span class="text-xs text-emerald-600 font-medium">{{ t('allUpToDate') }}</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <BaseIcon name="cash" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ t('mrrKpi') }}</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ U.money(totalMRR) }}</div>
          <span class="text-xs text-slate-500">Mensual</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          <BaseIcon name="route" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ t('routesInStreet') }}</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ totalRutas }}</div>
          <span class="text-xs text-sky-600 font-medium">{{ t('activeCollectors') }}</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <BaseIcon name="users" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ t('portfolioHolders') }}</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ totalClientes }}</div>
          <span class="text-xs text-slate-500">{{ t('cloudFiles') }}</span>
        </div>
      </div>
    </div>

    <!-- Lista de Empresas / Tenants -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 class="font-bold text-slate-800">{{ t('tenantsDirectory') }}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <th class="p-3.5">{{ t('companyName') }}</th>
              <th class="p-3.5">{{ t('tenantCode') }}</th>
              <th class="p-3.5">{{ t('contractedPlan') }}</th>
              <th class="p-3.5">{{ t('assignedRoutes') }}</th>
              <th class="p-3.5">{{ t('subStatus') }}</th>
              <th class="p-3.5">{{ t('nextRenewal') }}</th>
              <th class="p-3.5 text-right">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="tItem in tenants" :key="tItem.id" class="hover:bg-slate-50/80 transition">
              <td class="p-3.5">
                <div class="font-bold text-slate-900">{{ tItem.nombreEmpresa }}</div>
                <div class="text-xs text-slate-500">NIT: {{ tItem.nit }} · {{ tItem.ciudad }}</div>
              </td>
              <td class="p-3.5">
                <span class="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-700">{{ tItem.codigo }}</span>
              </td>
              <td class="p-3.5">
                <span class="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                  {{ getPlan(tItem.planId)?.nombre || tItem.planId }}
                </span>
                <div class="text-xs text-slate-400 mt-0.5">{{ U.money(getPlan(tItem.planId)?.precio) }}/mes</div>
              </td>
              <td class="p-3.5">
                <div class="font-semibold text-slate-800">{{ getRutasDeTenant(tItem.id).length }} de {{ getPlan(tItem.planId)?.maxRutas || 10 }}</div>
              </td>
              <td class="p-3.5">
                <span :class="tItem.estadoSuscripcion === 'activa' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'" class="px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {{ tItem.estadoSuscripcion.toUpperCase() }}
                </span>
              </td>
              <td class="p-3.5 text-slate-600 text-xs">
                {{ U.fmtDate(tItem.renovacionFecha) }}
              </td>
              <td class="p-3.5 text-right space-x-2">
                <button @click="openConfigModal(tItem)" class="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-700 hover:bg-slate-100">
                  {{ t('parameters') }}
                </button>
                <button @click="saasActions.toggleTenantStatus(tItem.id)" :class="tItem.estadoSuscripcion === 'activa' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'" class="px-2.5 py-1 text-xs font-semibold rounded border">
                  {{ tItem.estadoSuscripcion === 'activa' ? t('suspend') : t('activate') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nuevo Tenant -->
    <div v-if="showNewTenantModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 class="font-bold text-slate-900 text-lg">{{ t('newTenant') }}</h3>
          <button @click="showNewTenantModal = false" class="text-slate-400 hover:text-slate-600"><BaseIcon name="x" /></button>
        </div>

        <form @submit.prevent="handleCreateTenant" class="space-y-4 text-sm">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('companyName') }} *</label>
            <input v-model="newTenantForm.nombreEmpresa" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg" required>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">{{ t('tenantCode') }} *</label>
              <input v-model="newTenantForm.codigo" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase" required>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">NIT / CNPJ *</label>
              <input v-model="newTenantForm.nit" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg" required>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Ciudad / Cidade</label>
              <input v-model="newTenantForm.ciudad" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Teléfono</label>
              <input v-model="newTenantForm.telefono" type="tel" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Email *</label>
            <input v-model="newTenantForm.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg" required>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">{{ t('contractedPlan') }} *</label>
            <select v-model="newTenantForm.planId" class="w-full px-3 py-2 border border-slate-300 rounded-lg" required>
              <option v-for="p in planes" :key="p.id" :value="p.id">{{ p.nombre }} ({{ U.money(p.precio) }}/mes)</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showNewTenantModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50">{{ t('cancel') }}</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">{{ t('newTenant') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Configuración Parámetros Tenant -->
    <div v-if="configTenant" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 class="font-bold text-slate-900 text-lg">{{ t('parameters') }}</h3>
            <p class="text-xs text-slate-500">{{ configTenant.nombreEmpresa }}</p>
          </div>
          <button @click="configTenant = null" class="text-slate-400 hover:text-slate-600"><BaseIcon name="x" /></button>
        </div>

        <form @submit.prevent="handleSaveTenantConfig" class="space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Radio Geocerca (Metros)</label>
              <input v-model.number="configTenant.configuracion.geocercaMetros" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg" min="10" max="300" required>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Interés Default (%)</label>
              <input v-model.number="configTenant.configuracion.interesDefault" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg" min="1" max="100" required>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Venta Máx Sin Llave ($)</label>
              <input v-model.number="configTenant.configuracion.ventaMaxSinLlave" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg" step="50000" required>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Gasto Máx Sin Llave ($)</label>
              <input v-model.number="configTenant.configuracion.gastoMaxSinLlave" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg" step="5000" required>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" @click="configTenant = null" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50">{{ t('close') }}</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">{{ t('saveParameters') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { saasState, saasActions } from '../stores/saasStore.js';
import { U } from '../utils/formatters.js';
import { i18n } from '../utils/i18n.js';
import BaseIcon from '../components/BaseIcon.vue';

function t(key) {
  const lang = saasState.locale || 'es';
  return (i18n[lang] && i18n[lang][key]) || (i18n['es'] && i18n['es'][key]) || key;
}

const tenants = computed(() => saasState.db.tenants);
const planes = computed(() => saasState.db.planes);

const totalMRR = computed(() => {
  return tenants.value.reduce((sum, item) => {
    const plan = getPlan(item.planId);
    return sum + (plan ? plan.precio : 0);
  }, 0);
});

const totalRutas = computed(() => saasState.db.cobradores.length);
const totalClientes = computed(() => saasState.db.clientes.length);

const showNewTenantModal = ref(false);
const configTenant = ref(null);

const newTenantForm = ref({
  nombreEmpresa: '',
  codigo: '',
  nit: '',
  ciudad: '',
  telefono: '',
  email: '',
  planId: 'plan_starter'
});

function getPlan(planId) {
  return planes.value.find(p => p.id === planId);
}

function getRutasDeTenant(tenantId) {
  return saasState.db.cobradores.filter(c => c.tenantId === tenantId);
}

function openConfigModal(tenant) {
  configTenant.value = JSON.parse(JSON.stringify(tenant));
}

function handleCreateTenant() {
  saasActions.createTenant(newTenantForm.value);
  showNewTenantModal.value = false;
  newTenantForm.value = {
    nombreEmpresa: '',
    codigo: '',
    nit: '',
    ciudad: '',
    telefono: '',
    email: '',
    planId: 'plan_starter'
  };
}

function handleSaveTenantConfig() {
  if (configTenant.value) {
    saasActions.updateTenantConfig(configTenant.value.id, configTenant.value.configuracion);
    configTenant.value = null;
  }
}
</script>
