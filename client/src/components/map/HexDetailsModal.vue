<template>
  <div
    v-if="showModal"
    class="modal-overlay"
    @click.self="closeModal"
  >
    <div class="modal-container hex-details-modal">
      <div class="modal-header">
        <h2>Hex Details</h2>
        <button
          class="close-button"
          aria-label="Close modal"
          @click="closeModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
            />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            />
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <!-- Left panel with basic hex information -->
        <div class="left-panel">
          <div v-if="activeHex">
            <h3>{{ activeHex.location.title }}</h3>
            <div class="hex-modal-container">
              <svg
                :width="200"
                :height="200"
                :viewBox="`0 0 ${200} ${200}`"
              >
                <SingleHexObject
                  :selected-hex="activeHex"
                  :hex-radius="100"
                />
              </svg>
            </div>
          </div>
          <div 
            v-else 
            class="no-results"
          >
            No hex selected
          </div>
        </div>

        <!-- Right panel with detailed information -->
        <div 
          v-if="activeHex" 
          class="right-panel"
        >
          <div class="location-details">
            <h3>Location Details</h3>
            
            <div class="detail-row">
              <div class="detail-label">
                Type:
              </div>
              <div class="detail-value">
                {{ formatLocationType(activeHex.location.type) }}
                <span 
                  v-if="activeHex.location.special" 
                  class="special-tag"
                >
                  Special Location
                </span>
              </div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">
                Resource Value:
              </div>
              <div class="detail-value">
                {{ activeHex.location.resourceValue }}
              </div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">
                Strategic Value:
              </div>
              <div class="detail-value">
                {{ activeHex.location.strategicValue }}
              </div>
            </div>
            
            <div 
              v-if="activeHex.isRazed" 
              class="detail-row"
            >
              <div class="detail-label status-razed">
                Status:
              </div>
              <div class="detail-value status-razed">
                RAZED
              </div>
            </div>
          </div>
          
          <div class="control-details">
            <h3>Control Information</h3>
            
            <div class="control-info">
              <div class="detail-row">
                <div class="detail-label">
                  Controlled By:
                </div>
                <div class="detail-value">
                  <div class="player-selector">
                    <select 
                      v-model="selectedPlayerId"
                      :disabled="activeHex.isRazed" 
                      class="player-dropdown"
                      @change="updateHexControl"
                    >
                      <option value="">
                        No Control
                      </option>
                      <option 
                        v-for="player in allPlayers" 
                        :key="player.id" 
                        :value="player.id"
                      >
                        {{ getPlayerName(player) }} ({{ formatAlliance(player.alliance) }})
                      </option>
                    </select>
                    
                    <div 
                      v-if="controllingPlayer"
                      class="player-color-indicator" 
                      :style="{ backgroundColor: controllingPlayer.color }"
                    />
                  </div>
                </div>
              </div>
              
              <div 
                v-if="controllingPlayer" 
                class="player-details"
              >
                <div class="detail-row">
                  <div class="detail-label">
                    Alliance:
                  </div>
                  <div class="detail-value">
                    {{ formatAlliance(controllingPlayer.alliance) }}
                  </div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">
                    Faction:
                  </div>
                  <div class="detail-value">
                    {{ formatFaction(controllingPlayer.faction) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="upgrades-section">
            <h3>Upgrades & Fortifications</h3>
            
            <div v-if="activeHex.upgrades && activeHex.upgrades.length > 0">
              <ul class="upgrade-list">
                <li 
                  v-for="(upgrade, index) in activeHex.upgrades" 
                  :key="index" 
                  class="upgrade-item"
                >
                  <span 
                    :class="getUpgradeIconClass(upgrade)" 
                    class="upgrade-icon"
                  />
                  <span class="upgrade-name">
                    {{ formatUpgradeName(upgrade) }}
                  </span>
                  <button 
                    :disabled="activeHex.isRazed"
                    class="remove-upgrade-btn" 
                    @click="removeUpgrade(upgrade, index)"
                  >
                    ✕
                  </button>
                </li>
              </ul>
            </div>
            
            <div 
              v-else-if="activeHex.isPowerBase" 
              class="power-base-info"
            >
              <span class="power-base-icon" />
              <span class="power-base-label">
                Power Base
              </span>
            </div>
            
            <div 
              v-else 
              class="no-upgrades"
            >
              No upgrades or fortifications
            </div>
            
            <div 
              v-if="!activeHex.isRazed" 
              class="add-upgrade-form"
            >
              <h4>Add Strategic Upgrade</h4>
              <div class="form-row">
                <select 
                  v-model="selectedUpgrade" 
                  :disabled="!controllingPlayer || activeHex.isRazed"
                  class="upgrade-dropdown"
                >
                  <option value="">
                    Select Upgrade
                  </option>
                  <option value="fortified">
                    Fortify District
                  </option>
                  <option value="comms">
                    Install Comms Augers
                  </option>
                  <option value="outpost">
                    Establish Outpost
                  </option>
                  <option value="razed">
                    Raze To The Ground
                  </option>
                </select>
                <button 
                  :disabled="!selectedUpgrade || !controllingPlayer || activeHex.isRazed"
                  class="apply-upgrade-btn" 
                  @click="applyUpgrade"
                >
                  Apply
                </button>
              </div>
              <div 
                v-if="selectedUpgrade" 
                class="upgrade-description"
              >
                <p>{{ getUpgradeDescription(selectedUpgrade) }}</p>
              </div>
            </div>
          </div>
          
          <div 
            v-if="activeHex.location.special" 
            class="special-location-details"
          >
            <h3>Special Location Effects</h3>
            <div class="special-location-effect">
              <p>{{ getSpecialLocationEffect(activeHex.location.type) }}</p>
            </div>
          </div>
        </div>
        
        <div 
          v-else 
          class="right-panel"
        >
          <div class="placeholder">
            Select a hex to view details
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useGridStore } from '@/stores/gridStore';
import { usePlayerStore } from '@/stores/playerStore';
import SingleHexObject from '@/components/map/SingleHexObject.vue';

// Props
const props = defineProps({
  hexId: {
    type: String,
    default: null
  },
  showModal: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['close', 'select-hex']);

// Store instances
const gridStore = useGridStore();
const playerStore = usePlayerStore();

// Local state
const selectedPlayerId = ref('');
const selectedUpgrade = ref('');

// Computed properties
const activeHex = computed(() => {
  if (!props.hexId) return null;
  return gridStore.getHexById(props.hexId);
});

const controllingPlayer = computed(() => {
  if (!activeHex.value || !activeHex.value.controlledBy) return null;
  return playerStore.getPlayerById(activeHex.value.controlledBy);
});

const allPlayers = computed(() => {
  return playerStore.getAllPlayers;
});

// Watch for changes in active hex
watch(activeHex, (newHex) => {
  if (newHex) {
    selectedPlayerId.value = newHex.controlledBy || '';
  } else {
    selectedPlayerId.value = '';
  }
  selectedUpgrade.value = '';
}, { immediate: true });

// Methods
const closeModal = () => {
  emit('close');
};

const updateHexControl = () => {
  if (!props.hexId) return;
  
  // Update hex control in the store
  gridStore.setHexControl(props.hexId, selectedPlayerId.value || null);
};

const applyUpgrade = () => {
  if (!props.hexId || !selectedUpgrade.value || !activeHex.value.controlledBy) return;
  
  // Handle Raze To The Ground separately
  if (selectedUpgrade.value === 'razed') {
    gridStore.razeLocation(props.hexId);
    selectedUpgrade.value = '';
    return;
  }
  
  // Check if this upgrade already exists
  const existingUpgrades = activeHex.value.upgrades || [];
  if (existingUpgrades.includes(selectedUpgrade.value)) {
    alert('This upgrade has already been applied to this location');
    return;
  }
  
  // Add the upgrade
  gridStore.addUpgradeToHex(props.hexId, selectedUpgrade.value);
  selectedUpgrade.value = '';
};

const removeUpgrade = (upgrade, index) => {
  if (!props.hexId || !activeHex.value) return;
  
  // Create a copy of current upgrades without the one to remove
  const newUpgrades = [...activeHex.value.upgrades];
  newUpgrades.splice(index, 1);
  
  // Update the hex with the new upgrades list
  gridStore.updateHex(props.hexId, { upgrades: newUpgrades });
};

const getPlayerName = (player) => {
  if (!player) return 'Unknown';
  return `Player ${player.id.replace('player-', '')}`;
};

const formatLocationType = (type) => {
  if (!type) return 'Unknown';
  
  // Format from kebab-case to Title Case
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatAlliance = (alliance) => {
  if (!alliance) return 'Unknown';
  
  // Capitalize first letter
  return alliance.charAt(0).toUpperCase() + alliance.slice(1);
};

const formatFaction = (faction) => {
  if (!faction) return 'Unknown';
  
  // Convert camelCase to words with spaces
  return faction
    // Insert a space before all caps
    .replace(/([A-Z])/g, ' $1')
    // Uppercase the first character
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const formatUpgradeName = (upgrade) => {
  switch (upgrade) {
    case 'fortified':
      return 'Fortified';
    case 'comms':
      return 'Comms Augers';
    case 'outpost':
      return 'Outpost';
    default:
      return upgrade.charAt(0).toUpperCase() + upgrade.slice(1);
  }
};

const getUpgradeIconClass = (upgrade) => {
  switch (upgrade) {
    case 'fortified':
      return 'fortified-icon';
    case 'comms':
      return 'comms-icon';
    case 'outpost':
      return 'outpost-icon';
    default:
      return 'generic-icon';
  }
};

const getUpgradeDescription = (upgrade) => {
  const strategicResources = gridStore.gameData?.['strategic-resources'] || [];
  let description = 'No description available.';
  
  switch (upgrade) {
    case 'fortified': {
      const fortifyCard = strategicResources.find(card => card.title === 'FORTIFY DISTRICT');
      description = fortifyCard?.description || 'Increases the defense of this location.';
      break;
    }
    case 'comms': {
      const commsCard = strategicResources.find(card => card.title === 'INSTALL COMMS AUGERS');
      description = commsCard?.description || 'Increases the Strategic Value of this location by 1.';
      break;
    }
    case 'outpost': {
      const outpostCard = strategicResources.find(card => card.title === 'ESTABLISH OUTPOST');
      description = outpostCard?.description || 'Increases the Resource Value of this location by 1.';
      break;
    }
    case 'razed': {
      const razeCard = strategicResources.find(card => card.title === 'RAZE TO THE GROUND');
      description = razeCard?.description || 'Location is destroyed and cannot be controlled by any player.';
      break;
    }
  }
  
  return description;
};

const getSpecialLocationEffect = (locationType) => {
  switch (locationType) {
    case 'shield-generator':
      return 'Nullifies the strategy point cost of the "FORTIFY DISTRICT" strategic resource card.';
    case 'fortified-palace':
      return 'Nullifies the strategy point cost of the "STRATEGIC INSIGHTS" strategic resource card.';
    case 'promethium-reactor':
      return 'Nullifies the strategy point cost of the "TOOLS OF WAR" strategic resource card.';
    case 'orbital-shuttleport':
      return 'Nullifies the strategy point cost of the "ORBITAL ASSAULT" strategic resource card.';
    case 'saints-basilicanum':
      return 'Nullifies the strategy point cost of the "INSPIRED LEADERSHIP" strategic resource card.';
    case 'snipers-alley':
      return 'Nullifies the strategy point cost of the "URBAN TACTICS" strategic resource card.';
    default:
      return 'No special effects.';
  }
};
</script>

<style scoped lang="scss">
</style>
