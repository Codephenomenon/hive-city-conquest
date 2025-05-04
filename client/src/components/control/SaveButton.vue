<template>
  <button 
    v-if="!showMenu && changesToSave" 
    class="save-button"
    @click="saveChanges"
  >
    Save Changes
  </button>
</template>

<script setup>
  const emit = defineEmits(['campaign-saved']);

  const { 
    showMenu,
    changesToSave,
    gridStore,
    playerStore,
  } = defineProps({
    showMenu: {
      type: Boolean,
      required: true
    },
    changesToSave: {
      type: Boolean,
      required: true
    },
    gridStore: {
      type: Object,
      required: true
    },
    playerStore: {
      type: Object,
      required: true
    }
  });

  const saveChanges = () => {
    if (gridStore.activeCampaign) {
      let campaigns = JSON.parse(localStorage.getItem('hivecityCampaigns') || '[]');

      const campaignIndex = campaigns.findIndex(c => c.id === gridStore.activeCampaign.id);
      if (campaignIndex !== -1) {
        // Update with the current state
        campaigns[campaignIndex] = {
          ...gridStore.activeCampaign,
          hexMap: gridStore.hexMap,
          players: playerStore.players,
          lastSaved: new Date().toISOString()
        };

        // Save back to localStorage
        localStorage.setItem('hivecityCampaigns', JSON.stringify(campaigns));
        emit('campaign-saved', campaigns[campaignIndex]);
      }
    }
  }
</script>
