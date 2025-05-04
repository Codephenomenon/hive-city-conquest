<script setup>
  import { useGridStore } from '@/stores/gridStore';
  import { usePlayerStore } from '@/stores/playerStore';
  import { computed, ref, watch } from 'vue';
  import StartMenu from '@/components/StartMenu.vue';
  import HexGrid from '@/components/HexGrid.vue';
  import SaveButton from '@/components/control/SaveButton.vue';

  // Access the store
  const gridStore = useGridStore();
  const playerStore = usePlayerStore();

  const changesToSave = ref(false);

  // Computed property to check if there's an active campaign
  const showMenu = computed(() => !gridStore.activeCampaign);

  // Event handlers
  const onCampaignCreated = (campaign) => {
    console.log('Campaign created:', campaign.hivecityName);
    changesToSave.value = false;
  }

  const onCampaignLoaded = (campaign) => {
    console.log('Campaign loaded:', campaign.hivecityName);
    changesToSave.value = false;
  }

  const onCampaignSaved = (campaign) => {
    console.log('Campaign saved:', campaign.hivecityName);
    changesToSave.value = false;
  }

  watch(() => gridStore.hexMap.hexes, () => {
    if (gridStore.activeCampaign) {
      changesToSave.value = true;
    }
  }, { deep: true });

  // Watch player stats for changes
  watch(() => playerStore.players, () => {
    if (gridStore.activeCampaign) {
      changesToSave.value = true;
    }
  }, { deep: true });
</script>

<template>
  <main>
    <!-- Only show Menu when there's no active campaign -->
    <StartMenu 
      v-if="showMenu"
      @campaign-created="onCampaignCreated" 
      @campaign-loaded="onCampaignLoaded" 
    />
    
    <!-- Always show HexGrid, but it can handle displaying different content 
         based on whether there's an active campaign -->
    <HexGrid />
    <SaveButton
      :changes-to-save="changesToSave"
      :show-menu="showMenu"
      :grid-store="gridStore"
      :player-store="playerStore"
      @campaign-saved="onCampaignSaved" 
    />
  </main>
</template>

<style scoped>
</style>
