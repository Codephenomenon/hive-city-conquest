<template>
  <div class="hex-grid-container">
    <h2 class="hex-grid-title">
      Hivecity {{ hivecityName }}
    </h2>

    <PlayerPanel :active-players="activePlayers" />
    
    <div
      v-if="gridStore.activeCampaign"
      class="hex-grid-svg-container"
      :style="{ width: `${viewportWidth}px`,
                height: `${viewportHeight}px` }"
    >
      <svg
        :width="totalWidth"
        :height="totalHeight"
        :viewBox="`0 0 ${totalWidth} ${totalHeight}`"
      >
        <HexObject
          :total-width="totalWidth"
          :total-height="totalHeight"
          :horizontal-distance="horizontalDistance"
          :vertical-distance="verticalDistance"
          :grid-size="gridSize"
          :hex-radius="hexRadius"
          :selected-hex="selectedHex"
          @select="selectHex"
        />
      </svg>
    </div>
    
    <HexDetails :selected-hex="selectedHex" />
    <LibraryModal />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useGridStore } from '@/stores/gridStore';
  import PlayerPanel from '@/components/control/PlayerPanel.vue';
  import HexDetails from '@/components/map/HexDetails.vue';
  import HexObject from '@/components/map/HexObject.vue';
  import LibraryModal from '@/components/library/LibraryModal.vue';

  // Get the grid store using Pinia
  const gridStore = useGridStore();

  // Container reference for ResizeObserver
  const containerRef = ref(null);

  // Get active campaign data from store
  const activeCampaign = computed(() => gridStore.activeCampaign);
  const activePlayers = computed(() => activeCampaign.value?.players);

  const hivecityName = computed(() => {
    return activeCampaign.value?.hivecityName || '';
  });

  // Reactive viewport dimensions
  const viewportWidth = ref(window.innerWidth);
  const viewportHeight = ref(window.innerHeight);
  
  // Hex geometry calculations based on viewport
  const hexRadius = ref(40); // Default value, will be recalculated
  const padding = ref(75);

  // Reactive state
  const selectedHex = ref(null);

  // Computed properties for hex dimensions
  const hexHeight = computed(() => hexRadius.value * 2);
  const hexWidth = computed(() => Math.sqrt(3) * hexRadius.value);
  const horizontalDistance = computed(() => hexWidth.value);
  const verticalDistance = computed(() => hexHeight.value * 0.75);

  // Calculate grid dimensions
  const gridSize = computed(() => gridStore.hexMap.gridSize);
  const gridWidthHexes = computed(() => gridSize.value);
  const gridHeightHexes = computed(() => gridSize.value);

  // Calculate total width and height needed for the grid
  const gridWidthPx = computed(() => horizontalDistance.value * (gridWidthHexes.value - 0.5) + horizontalDistance.value / 2);
  const gridHeightPx = computed(() => verticalDistance.value * (gridHeightHexes.value - 0.5) + hexHeight.value / 4);

  const totalWidth = computed(() => gridWidthPx.value + padding.value * 2);
  const totalHeight = computed(() => gridHeightPx.value + padding.value * 2);

  // Function to select a hex when clicked
  const selectHex = (hex) => {
    selectedHex.value = hex;
    gridStore.setSelectedHex(hex.id);
  };

  // Handle container resize
  const handleResize = () => {
    console.log('Resize detected');
    
    // Get viewport dimensions
    viewportWidth.value = window.innerWidth;
    viewportHeight.value = window.innerHeight;
    
    // Calculate appropriate hex radius based on viewport size
    const maxGridWidth = viewportWidth.value * 0.8; // 80% of viewport width
    const maxGridHeight = viewportHeight.value * 0.8; // 80% of viewport height
    
    // Calculate max radius that would fit in width
    const maxRadiusForWidth = maxGridWidth / ((gridSize.value * 2) * Math.sqrt(3));
    
    // Calculate max radius that would fit in height
    const maxRadiusForHeight = maxGridHeight / (gridSize.value * 3);
    
    // Use the smaller of the two to ensure grid fits in both dimensions
    hexRadius.value = Math.floor(Math.min(maxRadiusForWidth, maxRadiusForHeight, 60)); // Cap at 60 for performance
    
    console.log(`New dimensions: ${viewportWidth.value}x${viewportHeight.value}, Hex radius: ${hexRadius.value}`);
  };

  // ResizeObserver instance
  let resizeObserver = null;

  watch(() => gridStore.activeCampaign, (newCampaign) => {
    if (newCampaign) {
      setTimeout(() => {
        console.log('Campaign changed, hexes:', gridStore.getHexes?.length);
        handleResize(); // Recalculate dimensions when campaign changes
      }, 100);
    }
  });

  // Check if we need to initialize the hex map after component is mounted
  onMounted(async () => {
    // Initialize dimensions
    handleResize();
    
    // Set up window resize event listener
    window.addEventListener('resize', handleResize);
    
    // Set up ResizeObserver for more reliable resize detection
    if (window.ResizeObserver && containerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.value);
      
      // Also observe document.body for changes
      resizeObserver.observe(document.body);
    }
    
    // Force a recalculation after a short delay to catch any layout adjustments
    setTimeout(handleResize, 100);

    if (gridStore.activeCampaign && (!gridStore.getHexes || gridStore.getHexes.length === 0)) {
      try {
        await gridStore.initializeHexMap();
      } catch (error) {
        console.error('Error initializing hex map:', error);
      }
    }
  });

  onUnmounted(() => {
    // Clean up event listeners and observers
    window.removeEventListener('resize', handleResize);
    
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
</script>

<style scoped>
</style>
