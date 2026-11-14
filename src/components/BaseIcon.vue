<template>
  <svg 
    :class="[
      'inline-block shrink-0 transition-transform duration-200',
      sizeClasses[size] || 'w-5 h-5',
      customClass
    ]" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <!-- Edificio / Tenant -->
    <path v-if="name === 'building'" d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    
    <!-- Usuarios / Equipe -->
    <path v-else-if="name === 'users'" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    
    <!-- Llave OTP -->
    <path v-else-if="name === 'key'" d="m15.5 8.5 3 3M17 10l2 2M10.5 13.5a5 5 0 1 1 7-7 5 5 0 0 1-7 7L3 21l-1-1 4-4-2-2 6.5-6.5z" />
    
    <!-- Escudo / Segurança -->
    <path v-else-if="name === 'shield'" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    
    <!-- Dashboard / Painel -->
    <path v-else-if="name === 'dashboard'" d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />
    
    <!-- Rota / Caminho -->
    <path v-else-if="name === 'route'" d="M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0h8.5a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7H15M18 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    
    <!-- Carteira / Caixa -->
    <path v-else-if="name === 'wallet'" d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 7v14a2 2 0 0 0 2 2h16v-5M16 14h.01" />
    
    <!-- Dinheiro / Cash -->
    <path v-else-if="name === 'cash'" d="M2 6h20v12H2zM6 12h.01M18 12h.01M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    
    <!-- Mapa GPS -->
    <path v-else-if="name === 'map'" d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14M15 6v14" />
    
    <!-- Conectividade -->
    <path v-else-if="name === 'wifi'" d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    <path v-else-if="name === 'wifioff'" d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19.08 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    
    <!-- Logout -->
    <path v-else-if="name === 'logout'" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    
    <!-- Ações e Utilidades -->
    <path v-else-if="name === 'plus'" d="M12 5v14M5 12h14" />
    <path v-else-if="name === 'check'" d="m5 12 5 5L20 7" />
    <path v-else-if="name === 'x'" d="M18 6 6 18M6 6l12 12" />
    <path v-else-if="name === 'pin'" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    <path v-else-if="name === 'gear'" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    <path v-else-if="name === 'eye'" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    <path v-else-if="name === 'menu'" d="M3 12h18M3 6h18M3 18h18" />
    <path v-else-if="name === 'search'" d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
    <path v-else-if="name === 'bell'" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    <path v-else-if="name === 'trending-up'" d="m23 6-9.5 9.5-5-5L1 18M17 6h6v6" />
    <path v-else-if="name === 'filter'" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    <path v-else-if="name === 'spark'" d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    <path v-else-if="name === 'phone'" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    <path v-else-if="name === 'whatsapp'" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />

    <!-- Fallback / Alerta -->
    <path v-else d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md'
  },
  customClass: {
    type: String,
    default: ''
  }
});

const sizeClasses = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};
</script>
