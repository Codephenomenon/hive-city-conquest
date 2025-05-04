<template>
  <div
    v-if="selectedHex"
    class="hex-details"
  >
    <div class="hex-details__content">
      <h3>{{ selectedHex.location.title }}</h3>
      <div class="hex-properties">
        <div class="property-value">
          <p>Resource Value: {{ selectedHex.location.resourceValue }}</p>
        </div>
        <div class="property-value">
          <p>Strategic Value: {{ selectedHex.location.strategicValue }}</p>
        </div>
      </div>
    </div>
    <HexView />
  </div>
</template>

<script setup>
  import HexView from '@/components/map/HexView.vue';

  defineProps({
    selectedHex: {
      type: [Object, null],
      required: true
    }
  });
</script>

<style scoped>
</style>
