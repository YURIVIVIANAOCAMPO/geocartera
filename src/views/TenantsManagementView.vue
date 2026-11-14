<template>
  <div class="space-y-6">
    <!-- Header Profesional con Breadcrumbs y Botón de Acción -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {{ t('saasCenter') }}
          </span>
          <span class="text-xs text-slate-400">Multi-Tenant Global</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('saasGlobalTitle') }}</h2>
        <p class="text-sm text-slate-500 mt-0.5">{{ t('saasGlobalDesc') }}</p>
      </div>

      <button 
        @click="showNewTenantModal = true" 
        class="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition active:scale-95 text-sm"
      >
        <BaseIcon name="plus" size="sm" />
        <span>{{ t('newTenant') }}</span>
      </button>
    </div>

    <!-- Métricas SaaS Globales con Tarjetas Amigables y Efecto Hover -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50">
          <BaseIcon name="building" size="lg" />
        </div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{{ t('activeTenantsKpi') }}</span>
          <div class="text-2xl font-black text-slate-900 mt-0.5">{{ tenants.length }}</div>
          <span class="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <BaseIcon name="check" size="xs" /> {{ t('allUpToDate') }}
          </span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
          <BaseIcon name="cash" size="lg" />
        </div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{{ t('mrrKpi') }}</span>
          <div class="text-2xl font-black text-slate-900 mt-0.5">{{ U.money(totalMRR, 'BRL', saasState.locale) }}</div>
          <span class="text-xs text-slate-400 font-medium">Recorrente mensal</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/50">
          <BaseIcon name="route" size="lg" />
        </div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{{ t('routesInStreet') }}</span>
          <div class="text-2xl font-black text-slate-900 mt-0.5">{{ totalRutas }}</div>
          <span class="text-xs text-sky-600 font-bold">{{ t('activeCollectors') }}</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50">
          <BaseIcon name="users" size="lg" />
        </div>
        <div>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{{ t('portfolioHolders') }}</span>
          <div class="text-2xl font-black text-slate-900 mt-0.5">{{ totalClientes }}</div>
          <span class="text-xs text-slate-400 font-medium">{{ t('cloudFiles') }}</span>
        </div>
      </div>
    </div>

    <!-- Lista de Empresas / Tenants con Búsqueda Integrada -->
    <div class="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 class="font-bold text-slate-900 text-base">{{ t('tenantsDirectory') }}</h3>
          <p class="text-xs text-slate-500">Isolamento de banco e regras por empresa</p>
        </div>

        <div class="w-full sm:w-64 relative">
          <input 
            v-model="searchFilter" 
            type="text" 
            :placeholder="t('searchPlaceholder')" 
            class="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:bg-white transition"
          >
          <div class="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
            <BaseIcon name="search" size="xs" />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50/75 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
              <th class="p-4">{{ t('companyName') }}</th>
              <th class="p-4">{{ t('tenantCode') }}</th>
              <th class="p-4">{{ t('contractedPlan') }}</th>
              <th class="p-4">{{ t('assignedRoutes') }}</th>
              <th class="p-4">{{ t('subStatus') }}</th>
              <th class="p-4">{{ t('nextRenewal') }}</th>
              <th class="p-4 text-right">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="tItem in filteredTenants" :key="tItem.id" class="hover:bg-slate-50/80 transition">
              <td class="p-4">
                <div class="font-extrabold text-slate-900 text-sm">{{ tItem.nombreEmpresa }}</div>
                <div class="text-xs text-slate-400 mt-0.5">CNPJ: {{ tItem.nit }} · {{ tItem.ciudad }}</div>
              </td>
              <td class="p-4">
                <span class="font-mono text-xs font-black px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 border border-slate-200/60">
                  {{ tItem.codigo }}
                </span>
              </td>
              <td class="p-4">
                <span class="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs">
                  {{ getPlan(tItem.planId)?.nombre || tItem.planId }}
                </span>
                <div class="text-xs text-slate-400 mt-1 font-medium">{{ U.money(getPlan(tItem.planId)?.precio, 'BRL', saasState.locale) }}/mês</div>
              </td>
              <td class="p-4 font-semibold text-slate-800">
                {{ getRutasDeTenant(tItem.id).length }} de {{ getPlan(tItem.planId)?.maxRutas || 10 }} rotas
              </td>
              <td class="p-4">
                <span 
                  :class="tItem.estadoSuscripcion === 'activa' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" 
                  class="px-2.5 py-1 rounded-full text-xs font-bold border"
                >
                  {{ tItem.estadoSuscripcion.toUpperCase() }}
                </span>
              </td>
              <td class="p-4 text-slate-500 text-xs font-medium">
                {{ U.fmtDate(tItem.renovacionFecha, saasState.locale) }}
              </td>
              <td class="p-4 text-right space-x-2">
                <button 
                  @click="openConfigModal(tItem)" 
                  class="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                >
                  {{ t('parameters') }}
                </button>
                <button 
                  @click="saasActions.toggleTenantStatus(tItem.id)" 
                  :class="tItem.estadoSuscripcion === 'activa' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'" 
                  class="px-3 py-1.5 text-xs font-bold rounded-xl border transition"
                >
                  {{ tItem.estadoSuscripcion === 'activa' ? t('suspend') : t('activate') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nova Empresa -->
    <div v-if="showNewTenantModal" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
          <h3 class="font-extrabold text-slate-900 text-lg">{{ t('newTenant') }}</h3>
          <button @click="showNewTenantModal = false" class="text-slate-400 hover:text-slate-700 p-1">
            <BaseIcon name="x" size="md" />
          </button>
        </div>

        <form @submit.prevent="handleCreateTenant" class="space-y-4 text-sm">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('companyName') }} *</label>
            <input v-model="newTenantForm.nombreEmpresa" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600" required>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('tenantCode') }} *</label>
              <input v-model="newTenantForm.codigo" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono uppercase outline-none focus:border-indigo-600" required>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">CNPJ / NIT *</label>
              <input v-model="newTenantForm.nit" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600" required>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">Cidade</label>
              <input v-model="newTenantForm.ciudad" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">Telefone</label>
              <input v-model="newTenantForm.telefono" type="tel" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1.5 text-xs">E-mail Corporativo *</label>
            <input v-model="newTenantForm.email" type="email" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600" required>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1.5 text-xs">{{ t('contractedPlan') }} *</label>
            <select v-model="newTenantForm.planId" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 font-semibold" required>
              <option v-for="p in planes" :key="p.id" :value="p.id">
                {{ p.nombre }} ({{ U.money(p.precio, 'BRL', saasState.locale) }}/mês)
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button type="button" @click="showNewTenantModal = false" class="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">
              {{ t('cancel') }}
            </button>
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition">
              {{ t('newTenant') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Configuração Parâmetros Tenant -->
    <div v-if="configTenant" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 class="font-extrabold text-slate-900 text-lg">{{ t('parameters') }}</h3>
            <p class="text-xs text-slate-500 font-medium">{{ configTenant.nombreEmpresa }}</p>
          </div>
          <button @click="configTenant = null" class="text-slate-400 hover:text-slate-700 p-1">
            <BaseIcon name="x" size="md" />
          </button>
        </div>

        <form @submit.prevent="handleSaveTenantConfig" class="space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">Raio Cerca GPS (Metros)</label>
              <input v-model.number="configTenant.configuracion.geocercaMetros" type="number" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl" min="10" max="300" required>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">Juros Padrão (%)</label>
              <input v-model.number="configTenant.configuracion.interesDefault" type="number" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl" min="1" max="100" required>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">Empréstimo Máx Sem Chave (R$)</label>
              <input v-model.number="configTenant.configuracion.ventaMaxSinLlave" type="number" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl" step="50" required>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 text-xs">Despesa Máx Sem Chave (R$)</label>
              <input v-model.number="configTenant.configuracion.gastoMaxSinLlave" type="number" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl" step="10" required>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button type="button" @click="configTenant = null" class="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">
              {{ t('close') }}
            </button>
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition">
              {{ t('saveParameters') }}
            </button>
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
  const lang = saasState.locale || 'pt';
  return (i18n[lang] && i18n[lang][key]) || (i18n['es'] && i18n['es'][key]) || key;
}

const tenants = computed(() => saasState.db.tenants);
const planes = computed(() => saasState.db.planes);
const searchFilter = ref('');

const filteredTenants = computed(() => {
  if (!searchFilter.value.trim()) return tenants.value;
  const q = searchFilter.value.toLowerCase();
  return tenants.value.filter(t => 
    t.nombreEmpresa.toLowerCase().includes(q) || 
    t.codigo.toLowerCase().includes(q) || 
    t.nit.toLowerCase().includes(q)
  );
});

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
