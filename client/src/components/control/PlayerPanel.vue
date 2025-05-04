<template>
  <div
    class="players-container"
    :class="{ 'players-container--expanded' : panelToggle }"
  >
    <ul
      v-if="panelToggle"
      ref="playerPanel"
      class="players-list"
    >
      <li
        v-for="(player, index) in activePlayers"
        :key="index"
        class="player-card"
        :style="`border-left: 6px solid ${player.color};`"
      >
        <div class="player-icon">
          PA
        </div>
        <div class="player-info">
          <h2 class="player-name">
            {{ player.alliance }}
          </h2>
          <p class="faction-name">
            {{ player.faction }}
          </p>
          <div class="player-stats">
            <div
              v-for="(stat, statIndex) in player.stats"
              :key="`${index}-stat-${statIndex}`"
              class="stat"
            >
              <img
                v-if="stat.label !== 'Territory'"
                :src="Arrow"
                class="stat__arrow stat__arrow--left"
                @click="modifyStat('decrease', player, stat)"
              >
              <img
                v-if="stat.label !== 'Territory'"
                :src="Arrow"
                class="stat__arrow stat__arrow--right"
                @click="modifyStat('increase', player, stat)"
              >
              <p class="stat__value">
                {{ stat.value }}
              </p>
              <p class="stat__label">
                {{ stat.label }}
              </p>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <div
      v-else
      class="panel-toggle"
      @click="openPanel"
    >
      <img :src="PersonRound">
    </div>
  </div>
</template>

<script setup>
import Arrow from '@/assets/icons/arrow.svg';
import PersonRound from '@/assets/icons/person-round.svg';
import { ref, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';

// Store instance
const playerStore = usePlayerStore();

defineProps({
  activePlayers: {
    type: [Array, null],
    required: true
  }
});

const panelToggle = ref(false);
const playerPanel = ref(null);

const openPanel = (event) => {
  event.stopPropagation();
  panelToggle.value = true;
};

const handleOutsideClick = (event) => {
  // Prevent handling if the panel isn't open yet or if clicking the toggle button
  if (!panelToggle.value || event.target.closest('.panel-toggle')) {
    return;
  }
  
  // Wait for the DOM to update and references to be current
  setTimeout(() => {
    // Make sure playerPanel ref is set
    if (!playerPanel.value) {
      return;
    }
    
    // Check if click is inside the panel
    const isClickInsidePanel = playerPanel.value.contains(event.target);

    // If click is outside the panel entirely, close it
    if (!isClickInsidePanel) {
      panelToggle.value = false;
    }
  }, 0);
};

const modifyStat = (modifier, player, stat) => {
  if (modifier === 'increase') {
    playerStore.incrementStat(player.id, stat.label);
  } else {
    playerStore.decrementStat(player.id, stat.label);
  }
};

// Add click event listener when component is mounted
onMounted(() => {
  // Use timeout to ensure we only start listening after initial render
  setTimeout(() => {
    document.addEventListener('click', handleOutsideClick);
  }, 100);
});

// Remove event listener when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<style scoped>
</style>
