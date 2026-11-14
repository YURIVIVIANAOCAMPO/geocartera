import { ref, reactive } from 'vue';

export const isMobileSidebarOpen = ref(false);
export const globalSearchQuery = ref('');

export const activeModal = reactive({
  type: null,
  data: null
});

export function openModal(type, data = null) {
  activeModal.type = type;
  activeModal.data = data;
}

export function closeModal() {
  activeModal.type = null;
  activeModal.data = null;
}

export function toggleMobileSidebar() {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
}
