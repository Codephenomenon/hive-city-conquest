<template>
  <defs>
    <radialGradient id="single-radial-vignette">
      <stop 
        offset="50%" 
        stop-color="rgba(0,0,0,0)" 
      />
      <stop 
        offset="100%" 
        stop-color="rgba(0,0,0,0.6)" 
      />
    </radialGradient>

    <clipPath id="clip-single-hex">
      <polygon :points="getHexagonPoints({ centerX, centerY })" />
    </clipPath>
  </defs>

  <!-- Render single hex -->
  <g
    :class="[selectedHex.location.type, 'single-hex']"
    class="hex"
  >
    <polygon
      :points="getHexagonPoints({ centerX, centerY })"
      fill="#708090"
      :stroke="selectedHex.controlledBy ? getPlayerColor(selectedHex.controlledBy) : '#000'"
      stroke-width="3"
      :opacity="selectedHex.isRazed ? 0.7 : 1"
    />
    <g v-if="locationHasImage(selectedHex)">
      <image
        :href="getImagePath(selectedHex)"
        :x="centerX - hexRadius"
        :y="centerY - hexRadius"
        :width="hexRadius * 2"
        :height="hexRadius * 2"
        clip-path="url(#clip-single-hex)"
        preserveAspectRatio="xMidYMid slice"
        :opacity="selectedHex.isRazed ? 0.6 : 1"
      />
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="hexRadius"
        clip-path="url(#clip-single-hex)"
        fill="url(#single-radial-vignette)"
      />
    </g>
    <g v-if="selectedHex.isRazed">
      <line
        :x1="centerX - hexRadius * 0.7"
        :y1="centerY - hexRadius * 0.7"
        :x2="centerX + hexRadius * 0.7"
        :y2="centerY + hexRadius * 0.7"
        stroke="red"
        stroke-width="4"
      />
      <line
        :x1="centerX - hexRadius * 0.7"
        :y1="centerY + hexRadius * 0.7"
        :x2="centerX + hexRadius * 0.7"
        :y2="centerY - hexRadius * 0.7"
        stroke="red"
        stroke-width="4"
      />
    </g>
    <g v-if="selectedHex.upgrades && selectedHex.upgrades.length > 0">
      <circle
        v-for="(upgrade, index) in selectedHex.upgrades"
        :key="upgrade"
        :cx="centerX - 30 + (index * 20)"
        :cy="centerY + (hexRadius * 0.6)"
        r="7"
        :fill="getUpgradeColor(upgrade)"
        stroke="#fff"
        stroke-width="1"
      />
    </g>
    <text
      :x="centerX"
      :y="centerY + 20"
      text-anchor="middle"
      fill="#fff"
      font-size="12"
      pointer-events="none"
    >
      R: {{ selectedHex.location.resourceValue }} / S: {{ selectedHex.location.strategicValue }}
    </text>
  </g>
</template>

<script setup>
  import { computed } from 'vue';
  import { usePlayerStore } from '@/stores/playerStore';

  const playerStore = usePlayerStore();

  // Props
  const props = defineProps({
    selectedHex: {
      type: Object,
      required: true
    },
    hexRadius: {
      type: Number,
      default: 100
    }
  });

  // Computed values for center position
  const centerX = computed(() => props.hexRadius);
  const centerY = computed(() => props.hexRadius);

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
      const x = centerX + props.hexRadius * 0.85 * Math.cos(angleRad);
      const y = centerY + props.hexRadius * 0.85 * Math.sin(angleRad);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
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

  // Helper function to get color for an upgrade
  const getUpgradeColor = (upgrade) => {
    switch (upgrade) {
      case 'fortified':
        return '#8B4513'; // Brown
      case 'comms':
        return '#4682B4'; // Steel Blue
      case 'outpost':
        return '#228B22'; // Forest Green
      default:
        return '#555555'; // Dark Gray
    }
  };
</script>

<style scoped>
.single-hex {
  transition: all 0.3s ease;
}

.hex__copy {
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}
</style>
