<template>
  <!-- Define filters and clip paths -->
  <defs>
    <!-- Inner shadow filter -->
    <radialGradient id="radial-vignette">
      <stop 
        offset="50%" 
        stop-color="rgba(0,0,0,0)" 
      />
      <stop 
        offset="100%" 
        stop-color="rgba(0,0,0,0.6)" 
      />
    </radialGradient>

    <!-- Clip paths for hexes -->
    <g 
      v-for="hex in gridStore.activeCampaign.hexMap.hexes" 
      :key="`def-${hex.id}`"
    >
      <clipPath :id="`clip-${hex.id}`">
        <polygon
          :points="getHexagonPoints(getHexPosition(hex.x, hex.y))"
        />
      </clipPath>
    </g>
  </defs>

  <!-- Render hexes -->
  <g
    v-for="hex in gridStore.activeCampaign.hexMap.hexes"
    :key="hex.id"
    :class="hex.location.type"
    class="hex"
    @click="$emit('select', hex)"
  >
    <!-- Background color polygon -->
    <polygon
      :points="getHexagonPoints(getHexPosition(hex.x, hex.y))"
      fill="#708090"
      :stroke="hex.controlledBy ? getPlayerColor(hex.controlledBy) : '#000'"
      stroke-width="3"
      cursor="pointer"
      :opacity="selectedHex && selectedHex.id === hex.id ? 0.8 : 1"
    />

    <!-- Add a clipped image with inner shadow effect -->
    <g v-if="locationHasImage(hex)">
      <image
        :href="getImagePath(hex)"
        :x="getHexPosition(hex.x, hex.y).centerX - hexRadius"
        :y="getHexPosition(hex.x, hex.y).centerY - hexRadius"
        :width="hexRadius * 2"
        :height="hexRadius * 2"
        :clip-path="`url(#clip-${hex.id})`"
        preserveAspectRatio="xMidYMid slice"
        filter="url(#inner-shadow)"
        :opacity="selectedHex && selectedHex.id === hex.id ? 0.8 : 1"
      />
      <circle
        :cx="getHexPosition(hex.x, hex.y).centerX"
        :cy="getHexPosition(hex.x, hex.y).centerY"
        :r="hexRadius"
        :clip-path="`url(#clip-${hex.id})`"
        fill="url(#radial-vignette)"
      />
    </g>

    <text
      class="hex__copy"
      :x="getHexPosition(hex.x, hex.y).centerX"
      :y="getHexPosition(hex.x, hex.y).centerY"
      text-anchor="middle"
      dominant-baseline="middle"
      fill="#fff"
      font-weight="bold"
      pointer-events="none"
    >
      {{ truncateText(hex.location.title, 19) }}
    </text>
  </g>
</template>

<script setup>
  import { useGridStore } from '@/stores/gridStore';
  import { usePlayerStore } from '@/stores/playerStore';

  const gridStore = useGridStore();
  const playerStore = usePlayerStore();

  // Destructure props directly from defineProps
  const { 
    totalWidth,
    totalHeight,
    horizontalDistance,
    verticalDistance,
    gridSize,
    hexRadius,
    selectedHex,
  } = defineProps({
    totalWidth: {
      type: Number,
      required: true
    },
    totalHeight: {
      type: Number,
      required: true
    },
    horizontalDistance: {
      type: Number,
      required: true
    },
    verticalDistance: {
      type: Number,
      required: true
    },
    gridSize: {
      type: Number,
      required: true
    },
    hexRadius: {
      type: Number,
      required: true
    },
    selectedHex: {
      type: [Object, null],
      required: true
    }
  });

  const getPlayerColor = (playerId) => {
    const player = playerStore.getPlayerById(playerId);
    return player ? player.color : '#000';
  };

  // Function to calculate the points of a hexagon
  const getHexagonPoints = ({ centerX, centerY }) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = centerX + hexRadius * Math.cos(angleRad);
      const y = centerY + hexRadius * Math.sin(angleRad);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // Function to get center coordinates for each hex, centered in the viewbox
  const getHexPosition = (col, row) => {
    // Calculate grid center offset
    const centerX = totalWidth / 2;
    const centerY = totalHeight / 2;
    
    // Calculate the width and height of the entire grid
    const gridWidthPixels = horizontalDistance * (gridSize - 1) + horizontalDistance / 2;
    const gridHeightPixels = verticalDistance * (gridSize - 1);
    
    // Calculate the top-left corner of the grid to center it
    const gridStartX = centerX - gridWidthPixels / 2;
    const gridStartY = centerY - gridHeightPixels / 2;
    
    // For a flat-topped hex grid using odd-q offset coordinates
    const x = gridStartX + col * horizontalDistance + (row % 2) * (horizontalDistance / 2);
    const y = gridStartY + row * verticalDistance;
    return { centerX: x, centerY: y };
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const locationHasImage = (hex) => {
    if (!hex.location || !hex.location.type) return false;
    
    const locationsWithImages = [
      'promethium-reactor',
      'snipers-alley',
      'fortified-palace',
      'shield-generator',
      'orbital-shuttleport',
      'saints-basilicanum',
      'hab-block',
      'manufactorum-zone',
      'sector-mechanicus',
      'sanctum',
      'administratum-disctrict',
      'adeptus-quarter',
      'adeptus-ministorum',
      'basilicanum-district',
      'warehouse-district'
    ];
 
    return locationsWithImages.includes(hex.location.type);
  };

  // Helper function to get the image path
  const getImagePath = (hex) => {
    if (!hex.location || !hex.location.type) return '';
    return `/images/${hex.location.type}.png`;
  };

  // Define emits
  defineEmits(['select']);
</script>

<style scoped>
</style>
