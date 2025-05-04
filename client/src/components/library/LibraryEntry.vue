<template>
  <li 
    class="entry-item"
    :class="{ active: isActive }"
    @click="$emit('select', entry)"
  >
    {{ entry.title }}
  </li>
</template>

<script setup>
  defineProps({
    entry: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  });

  // Define emits
  defineEmits(['select']);
</script>

<style scoped>
</style>
