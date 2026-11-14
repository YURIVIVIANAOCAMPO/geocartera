<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">SaaS Control Center</span>
          <span class="text-xs text-slate-500">Módulo Maestro</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mt-1">Gestión Global de Empresas (Tenants)</h2>
        <p class="text-sm text-slate-500">Administra clientes corporativos, planes de suscripción, límites de rutas y facturación recurrente.</p>
      </div>
      <button @click="showNewTenantModal = true" class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition">
        <BaseIcon name="plus" />
        <span>Nueva Empresa</span>
      </button>
    </div>

    <!-- Métricas SaaS Globales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <BaseIcon name="building" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empresas Activas</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ tenants.length }}</div>
          <span class="text-xs text-emerald-600 font-medium">100% al día</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <BaseIcon name="cash" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">MRR Facturado</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ U.money(totalMRR) }}</div>
          <span class="text-xs text-slate-500">Ingreso mensual recurrente</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          <BaseIcon name="route" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rutas en Calle</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ totalRutas }}</div>
          <span class="text-xs text-sky-600 font-medium">Cobradores activos</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <BaseIcon name="users" />
        </div>
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Titulares Cartera</span>
          <div class="text-2xl font-extrabold text-slate-900">{{ totalClientes }}</div>
          <span class="text-xs text-slate-500">Expedientes en nube</span>
        </div>
      </div>
    </div>

    <!-- Lista de Empresas / Tenants -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 class="font-bold text-slate-800">Directorio de Empresas Suscritas</h3>
        <span class="text-xs text-slate-400">Aislamiento lógico Multi-Tenant activo</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <th class="p-3.5">Empresa / Razón Social</th>
              <th class="p-3.5">Código Tenant</th>
              <th class="p-3.5">Plan Contratado</th>
              <th class="p-3.5">Rutas Asignadas</th>
              <th class="p-3.5">Estado Suscripción</th>
              <th class="p-3.5">Próxima Renovación</th>
              <th class="p-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="t in tenants" :key="t.id" class="hover:bg-slate-50/80 transition">
              <td class="p-3.5">
                <div class="font-bold text-slate-900">{{ t.nombreEmpresa }}</div>
                <div class="text-xs text-slate-500">NIT: {{ t.nit }} · {{ t.ciudad }}</div>
              </td>
              <td class="p-3.5">
                <span class="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-700">{{ t.codigo }}</span>
              </td>
              <td class="p-3.5">
                <span class="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                  {{ getPlan(t.planId)?.nombre || t.planId }}
                </span>
                <div class="text-xs text-slate-400 mt-0.5">{{ U.money(getPlan(t.planId)?.precio) }}/mes</div>
              </td>
              <td class="p-3.5">
                <div class="font-semibold text-slate-800">{{ getRutasDeTenant(t.id).length }} de {{ getPlan(t.planId)?.maxRutas || 10 }} rutas</div>
                <div class="w-24 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div class="bg-indigo-600 h-full" :style="{ width: Math.min(100, (getRutasDeTenant(t.id).length / (getPlan(t.planId)?.maxRutas || 10)) * 100) + '%' }"></div>
                </div>
              </td>
              <td class="p-3.5">
                <span :class="t.estadoSuscripcion === 'activa' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'" class="px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {{ t.estadoSuscripcion.toUpperCase() }}
                </span>
              </td>
              <td class="p-3.5 text-slate-600 text-xs">
                {{ U.fmtDate(t.renovacionFecha) }}
              </td>
              <td class="p-3.5 text-right space-x-2">
                <button @click="openConfigModal(t)" class="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-700 hover:bg-slate-100">
                  Parámetros
                </button>
                <button @click="saasActions.toggleTenantStatus(t.id)" :class="t.estadoSuscripcion === 'activa' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'" class="px-2.5 py-1 text-xs font-semibold rounded border">
                  {{ t.estadoSuscripcion === 'activa' ? 'Suspender' : 'Activar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Planes y Tarifas SaaS -->
    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div class="mb-4">
        <h3 class="font-bold text-slate-900 text-lg">Planes de Suscripción Disponibles en el Catálogo</h3>
        <p class="text-sm text-slate-500">Configuración de límites de rutas, volumen de clientes y soporte por nivel.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="plan in planes" :key="plan.id" class="p-5 rounded-xl border border-slate-200 hover:border-indigo-500 transition shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-slate-900 text-lg">{{ plan.nombre }}</span>
              <span class="text-xs bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-600">Tier SaaS</span>
            </div>
            <div class="text-2xl font-black text-indigo-600 mb-4">{{ U.money(plan.precio) }} <span class="text-xs font-normal text-slate-500">/ mes</span></div>
            <ul class="text-xs text-slate-600 space-y-2 mb-6">
              <li class="flex items-center gap-1.5 font-medium"><BaseIcon name="check" class="text-emerald-600 w-4 h-4" /> Hasta {{ plan.maxRutas }} rutas de cobro</li>
              <li class="flex items-center gap-1.5"><BaseIcon name="check" class="text-emerald-600 w-4 h-4" /> Límite de {{ plan.maxClientes }} clientes</li>
              <li class="flex items-center gap-1.5"><BaseIcon name="check" class="text-emerald-600 w-4 h-4" /> Modo Avión / Sincronización Offline</li>
              <li class="flex items-center gap-1.5"><BaseIcon name="check" class="text-emerald-600 w-4 h-4" /> Geocercas GPS (50 metros)</li>
              <li class="flex items-center gap-1.5"><BaseIcon name="check" class="text-emerald-600 w-4 h-4" /> Soporte: {{ plan.soporte }}</li>
            </ul>
          </div>
          <button class="w-full py-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
            Editar Parámetros de Plan
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Tenant -->
    <div v-if="showNewTenantModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 class="font-bold text-slate-900 text-lg">Registrar Nueva Empresa (Tenant)</h3>
          <button @click="showNewTenantModal = false" class="text-slate-400 hover:text-slate-600"><BaseIcon name="x" /></button>
        </div>

        <form @submit.prevent="handleCreateTenant" class="space-y-4 text-sm">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nombre / Razón Social *</label>
            <input v-model="newTenantForm.nombreEmpresa" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Ej. Cobranzas & Créditos del Caribe S.A.S." required>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Código Tenant *</label>
              <input v-model="newTenantForm.codigo" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase" placeholder="CREDI_CARIBE" required>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">NIT / Identificación *</label>
              <input v-model="newTenantForm.nit" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="900.123.456-7" required>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Ciudad / Región</label>
              <input v-model="newTenantForm.ciudad" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Medellín, Colombia">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Teléfono Contacto</label>
              <input v-model="newTenantForm.telefono" type="tel" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="3001234567">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Email Corporativo *</label>
            <input v-model="newTenantForm.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="admin@credicaribe.co" required>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Plan de Suscripción SaaS *</label>
            <select v-model="newTenantForm.planId" class="w-full px-3 py-2 border border-slate-300 rounded-lg" required>
              <option v-for="p in planes" :key="p.id" :value="p.id">{{ p.nombre }} ({{ U.money(p.precio) }}/mes) - Hasta {{ p.maxRutas }} rutas</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showNewTenantModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Crear Empresa</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Configuración Tenant -->
    <div v-if="configTenant" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 class="font-bold text-slate-900 text-lg">Parámetros Operativos</h3>
            <p class="text-xs text-slate-500">{{ configTenant.nombreEmpresa }}</p>
          </div>
          <button @click="configTenant = null" class="text-slate-400 hover:text-slate-600"><BaseIcon name="x" /></button>
        </div>

        <form @submit.prevent="handleSaveTenantConfig" class="space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Radio Geocerca (Metros)</label>
              <input v-model.number="configTenant.configuracion.geocercaMetros" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-lg" min="10" max="300" required>
              <small class="text-xs text-slate-400">Límite para exigir Llave OTP</small>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Interés Predeterminado (%)</label>
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
            <button type="button" @click="configTenant = null" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50">Cerrar</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Guardar Parámetros</button>
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
import BaseIcon from '../components/BaseIcon.vue';

const tenants = computed(() => saasState.db.tenants);
const planes = computed(() => saasState.db.planes);

const totalMRR = computed(() => {
  return tenants.value.reduce((sum, t) => {
    const plan = getPlan(t.planId);
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
