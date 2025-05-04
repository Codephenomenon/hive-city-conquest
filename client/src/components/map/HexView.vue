<template>
  <div class="hex-details-overlay">
    <!-- Example button to trigger modal -->
    <button 
      class="hex-details-overlay__edit"
      @click="showDetailsModal = true"
    >
      <img
        :src="hexDetailsEdit"
      >
    </button>
    
    <!-- Hex Details Modal -->
    <HexDetailsModal 
      :hex-id="selectedHexId"
      :show-modal="showDetailsModal"
      @close="showDetailsModal = false"
      @select-hex="handleSelectHex"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGridStore } from '@/stores/gridStore';
import HexDetailsModal from '@/components/map/HexDetailsModal.vue';

// Access the store
const gridStore = useGridStore();

const showDetailsModal = ref(false);
const selectedHexId = computed(() => gridStore.selectedHexId);
import hexDetailsEdit from '@/assets/icons/hex-details-edit.svg';

// Methods
const handleSelectHex = (hexId) => {
  gridStore.setSelectedHex(hexId);
};
</script>

<style scoped>
</style>
